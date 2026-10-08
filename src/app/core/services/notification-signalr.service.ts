import { Injectable,inject,signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel} from '@microsoft/signalr';
import { Notification,NotificationService } from './notifications.service';


@Injectable({
  providedIn: 'root'
})
export class NotificationSignalRService {

  private readonly notificationService = inject(NotificationService);

  private hubConnection?: HubConnection;

  private shouldBeConnected = false;


  readonly isConnected = signal(false);


  private readonly hubUrl = 'http://localhost:5051/hubs/notifications';


  connect(): void {

    this.shouldBeConnected = true;


    if (this.hubConnection && (this.hubConnection.state === HubConnectionState.Connected || this.hubConnection.state === HubConnectionState.Connecting)) {
      return;
    }


    const token = localStorage.getItem('rapidmart_token');


    if (!token) {

      console.warn('Cannot connect to NotificationHub: JWT token not found.');

      return;
    }


    this.hubConnection = new HubConnectionBuilder().withUrl(this.hubUrl,
      {
        accessTokenFactory: () => {
          return (localStorage.getItem('rapidmart_token') ?? '');
        }
      }).withAutomaticReconnect()
      .configureLogging(LogLevel.Information).build();


    this.hubConnection.on('ReceiveNotification',
      (
        notification: Notification
      ) => {

        console.log('🔔 New notification:',notification);


        this.notificationService.addRealtimeNotification(notification);
      }
    );


    this.hubConnection.onreconnecting(() => {

        console.log('🔄 NotificationHub reconnecting...');

        this.isConnected.set(false);

      }
    );


    this.hubConnection.onreconnected(() => {

        console.log('✅ NotificationHub reconnected');

        this.isConnected.set(true);

      }
    );


    this.hubConnection.onclose(() => {

        console.log('❌ NotificationHub disconnected');

        this.isConnected.set(false);

      }
    );


    this.startConnection();

  }


  private async startConnection(): Promise<void> {

    if (!this.hubConnection || !this.shouldBeConnected) {
      return;
    }


    try {

      await this.hubConnection.start();

      console.log('✅ NotificationHub connected');

      this.isConnected.set(true);

    }
    catch (error) {

      console.error('❌ NotificationHub connection failed:',error);

      this.isConnected.set(false);


      if (this.shouldBeConnected) {

        setTimeout(() => {

            if (this.shouldBeConnected) {
              this.startConnection();
            }

          },
          5000
        );
      }
    }
  }


  async disconnect(): Promise<void> {

    this.shouldBeConnected = false;

    if (!this.hubConnection) {
      return;
    }

    try {

      await this.hubConnection.stop();

    }
    catch (error) {

      console.error('Error disconnecting NotificationHub:',error);

    }

    this.isConnected.set(false);

    this.hubConnection = undefined;

  }
}