import { Component,effect,inject,OnInit,signal } from '@angular/core';
import { Router,RouterLink,RouterLinkActive } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { LocationService } from '../../../core/services/location.service';
import { DeliveryService } from '../../../core/services/delivery.service';

import { DashboardService,CustomerDashboard } from '../../../core/services/admin-dashboard';

import { NotificationService } from '../../../core/services/notifications.service';

import { NotificationSignalRService } from '../../../core/services/notification-signalr.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink,RouterLinkActive,FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {

  private readonly router = inject(Router);
  readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);
  readonly locationService = inject(LocationService);
  readonly deliveryService = inject(DeliveryService);
  readonly dashboardService = inject(DashboardService);
  readonly notificationService = inject(NotificationService);
  readonly notificationSignalR = inject(NotificationSignalRService);
  notificationPopupVisible = signal(false);

private notificationPopupTimer?: ReturnType<typeof setTimeout>;


  dashboard = signal<CustomerDashboard | null>(null);

  count = signal<any | undefined>(undefined);
  countToShow = signal<number>(0);

  isMenuOpen = false;

  searchText = '';


  constructor() {

    effect(() => {

      const location = this.locationService.location();

      if (!location) {
        return;
      }

      this.deliveryService.loadEstimate(location.latitude,location.longitude);

    });


    effect(() => {

      const loggedIn = this.authService.loggedIn();


      console.log('HEADER: authentication changed:',loggedIn);


      if (loggedIn) {

        this.loadDashboard();


        this.loadUnreadNotificationCount();


        this.notificationSignalR.connect();

      }
      else {

        this.dashboard.set(null);


        this.notificationService.setNotifications([]);

        this.notificationService.setUnreadCount(0);


        this.closeMenu();


        this.searchText = '';

      }

    });

    effect(() => {

  const notification =
    this.notificationService.latestNotification();

  console.log(
    'HEADER POPUP EFFECT:',
    notification
  );

  if (!notification) {
    return;
  }

  console.log(
    'HEADER: SHOWING POPUP'
  );

  this.notificationPopupVisible.set(true);

});

  }


  ngOnInit(): void {

    this.locationService.requestLocation();

  }


  private loadDashboard(): void {

    this.dashboardService.getCustomerDashboard().subscribe({

        next: data => {

          this.dashboard.set(data);

        },

        error: error => {

          console.error('Failed to load customer dashboard:',error);

          this.dashboard.set(null);

        }

      });

  }


  private loadUnreadNotificationCount(): void {

    this.notificationService.getUnreadCount().subscribe({

        next: count => {

          this.notificationService.setUnreadCount(count);

          this.count.set(this.notificationService.unreadCount());

          console.log('Notification:',this.notificationService.unreadCount());
          this.countToShow.set(this.count().count);

        },

        error: error => {

          console.error('Failed to load notification count:',error);

          this.notificationService.setUnreadCount(0);

        }

      });

  }


  toggleMenu(): void {

    this.isMenuOpen = !this.isMenuOpen;

  }


  closeMenu(): void {

    this.isMenuOpen = false;

  }


  searchProducts(): void {

    const keyword = this.searchText.trim();

    if (!keyword) {
      return;
    }

    this.closeMenu();

    this.router.navigate(['/products/search'],{queryParams: {keyword}});

  }


  getDeliveryTimeRange(minutes: number): string {

    if (minutes <= 30) {

      const upper = Math.ceil(minutes / 5) * 5;

      return `${Math.max(5, upper - 5)}-${upper}`;

    }


    if (minutes <= 60) {

      const lower = Math.floor(minutes / 10) * 10;

      const upper = lower + 10;

      return `${lower}-${upper}`;

    }


    const lower = Math.floor(minutes / 15) * 15;

    const upper = lower + 15;

    return `${lower}-${upper}`;

  }

}