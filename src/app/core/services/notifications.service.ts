import { Injectable,inject,signal } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable,tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {

  id: number;
  userId: string;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: number | null;
}


export interface NotificationPagedResult {

  items: Notification[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface NotificationCount {
    count: number;
}


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Notification`;


  readonly notifications = signal<Notification[]>([]);

  readonly unreadCount =  signal<number>(0);

  readonly latestNotification = signal<Notification | null>(null);


  getNotifications(pageNumber: number = 1,pageSize: number = 10): Observable<NotificationPagedResult> {

    const params = new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize);

    return this.http.get<NotificationPagedResult>(this.apiUrl,{ params });
  }

  getUnreadCount(): Observable<number> {

    return this.http.get<number>(`${this.apiUrl}/unread-count`);
  }

  markAsRead(id: number): Observable<void> {
    
    return this.http.put<void>(`${this.apiUrl}/${id}/read`,
      {}).pipe(
        tap(() => {
          this.notifications.update(
            notifications => notifications.map(
              notification =>
                 notification.id === id ? {
                  ...notification,isRead: true
                  } : notification
        )
      );

      this.getUnreadCount().subscribe({

        next: count => {

          this.setUnreadCount(count);

        },

        error: error => {

          console.error('Failed to refresh unread notification count:',error);

        }
      });
    })
  );
}

  markAllAsRead(): Observable<void> {

    return this.http.put<void>(`${this.apiUrl}/read-all`,{}).pipe(
      tap(() => {
        this.notifications.update(notifications =>
            notifications.map(
              notification => ({
                ...notification,
                isRead: true
              })
            )
        );

        this.unreadCount.set(0);

      })
    );
  }


  addRealtimeNotification(notification: Notification): void {
    
    console.log('🔔 REALTIME NOTIFICATION RECEIVED:',notification);
    
    this.notifications.update(
      notifications => {
        
        const alreadyExists = notifications.some(
          existing =>
            existing.id === notification.id
        );
        
        if (alreadyExists) {
          
          return notifications;
        }
        
        return [
          notification,
          ...notifications
        ];
      }
    );

    if (!notification.isRead) {
    
      this.unreadCount.update(count => count + 1);
    }
    
    console.log('🔔 SETTING LATEST NOTIFICATION:',notification);
    
    this.latestNotification.set(notification);
    
    console.log('🔔 LATEST NOTIFICATION SIGNAL:',this.latestNotification());
  }

  setNotifications(notifications: Notification[]): void {

    this.notifications.set(notifications);
  }

  appendNotifications(notifications: Notification[]): void {

    this.notifications.update(
      current => {

        const existingIds = new Set(
           current.map(
              notification => notification.id
            )
          );

        const newNotifications = notifications.filter(
           notification =>
             !existingIds.has(notification.id)
          );

        return [
          ...current,
          ...newNotifications
        ];
      }
    );
  }

  setUnreadCount(count: number): void {

    this.unreadCount.set(count);
  }

  clear(): void {

    this.notifications.set([]);
    this.unreadCount.set(0);
    this.latestNotification.set(null);
  }
}