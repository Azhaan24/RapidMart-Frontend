import { CommonModule } from '@angular/common';
import { Component,OnInit,inject,signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Notification,NotificationService } from '../../../core/services/notifications.service';


@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './notifications.html'
})
export class NotificationsComponent implements OnInit {

  private readonly notificationService = inject(NotificationService);

  readonly notifications = this.notificationService.notifications;

  readonly unreadCount = this.notificationService.unreadCount;

  readonly isLoading = signal<boolean>(false);

  readonly isMarkingAllRead = signal<boolean>(false);

  readonly errorMessage = signal<string>('');

  readonly pageNumber = signal<number>(1);

  readonly pageSize = signal<number>(10);

  readonly hasNextPage = signal<boolean>(false);



  ngOnInit(): void {

    this.loadNotifications();

    this.loadUnreadCount();
  }


  loadNotifications(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');

    this.notificationService
      .getNotifications(
        this.pageNumber(),
        this.pageSize()
      )
      .subscribe({

        next: result => {

            if (this.pageNumber() === 1){

             this.notificationService.setNotifications( result.items );

            }

            else {

                this.notificationService.notifications.update( current => [ ...current, ...result.items ] );

            }
            
            this.hasNextPage.set( result.hasNextPage );
            this.isLoading.set(false);
        },


        error: error => {

          console.error(
            'Failed to load notifications',
            error
          );

          this.errorMessage.set(
            'Unable to load notifications. Please try again.'
          );

          this.isLoading.set(false);
        }

      });
  }


  loadUnreadCount(): void {

    this.notificationService
      .getUnreadCount()
      .subscribe({

        next: count => {

          this.notificationService
            .setUnreadCount(count);
        },

        error: error => {

          console.error(
            'Failed to load unread notification count',
            error
          );
        }

      });
  }

  loadMore(): void {

    if (
      this.isLoading() ||
      !this.hasNextPage()
    ) {
      return;
    }

    this.pageNumber.update(
      page => page + 1
    );

    this.loadNotifications();
  }


  refresh(): void {

    this.pageNumber.set(1);

    this.loadNotifications();

    this.loadUnreadCount();
  }


  markAsRead(
    notification: Notification
  ): void {

    if (notification.isRead) {
      return;
    }

    this.notificationService
      .markAsRead(
        notification.id
      )
      .subscribe({

        error: error => {

          console.error(
            'Failed to mark notification as read',
            error
          );

        }

      });
  }



  markAllAsRead(): void {

    if (
      this.isMarkingAllRead() ||
      this.unreadCount() === 0
    ) {
      return;
    }

    this.isMarkingAllRead.set(true);

    this.notificationService
      .markAllAsRead()
      .subscribe({

        next: () => {

          this.isMarkingAllRead.set(false);

        },

        error: error => {

          console.error(
            'Failed to mark all notifications as read',
            error
          );

          this.isMarkingAllRead.set(false);
        }

      });
  }

  getNotificationIcon(
    notificationType: string
  ): string {

    const type =
      notificationType?.toLowerCase();

    if (type?.includes('order')) {
      return 'shopping-bag';
    }

    if (type?.includes('return')) {
      return 'return';
    }

    if (type?.includes('refund')) {
      return 'refund';
    }

    if (type?.includes('role')) {
      return 'user';
    }

    if (type?.includes('stock')) {
      return 'stock';
    }

    if (type?.includes('security')) {
      return 'security';
    }

    return 'notification';
  }

  getNotificationIconClass(
    notification: Notification
  ): string {

    if (notification.isRead) {
      return 'bg-gray-100 text-gray-500';
    }

    const type =
      notification.notificationType?.toLowerCase();

    if (type?.includes('order')) {
      return 'bg-blue-50 text-blue-600';
    }

    if (type?.includes('return')) {
      return 'bg-orange-50 text-orange-600';
    }

    if (type?.includes('refund')) {
      return 'bg-green-50 text-green-600';
    }

    if (type?.includes('stock')) {
      return 'bg-red-50 text-red-600';
    }

    if (type?.includes('role')) {
      return 'bg-purple-50 text-purple-600';
    }

    return 'bg-gray-100 text-gray-600';
  }

  formatDate(
    date: string
  ): string {

    return new Date(date)
      .toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      );
  }


  formatTime(
    date: string
  ): string {

    return new Date(date)
      .toLocaleTimeString(
        'en-IN',
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );
  }

}