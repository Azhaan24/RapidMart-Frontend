import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { Order,OrderService,OrderStatus } from '../../../core/services/order.service';
import { DashboardService,CustomerDashboard } from '../../../core/services/admin-dashboard';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class OrdersComponent {

  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly dashboardService = inject(DashboardService);

  currentOrders = signal<Order[]>([]);
  pastOrders = signal<Order[]>([]);
  dashboard = signal<CustomerDashboard | null>(null);

  currentOrdersCount = signal<number|undefined>(0);
  pastOrdersCount = signal<number|undefined>(0);
  

  currentOrdersPageNumber = signal<number>(1);
  currentOrdersPageSize = signal<number>(5);

  currentOrdersTotalCount = signal<number>(0);
  currentOrdersTotalPages = signal<number>(0);

  currentOrdersHasPreviousPage = signal<boolean>(false);
  currentOrdersHasNextPage = signal<boolean>(false);

  pastOrdersPageNumber = signal<number>(1);
  pastOrdersPageSize = signal<number>(5);

  pastOrdersTotalCount = signal<number>(0);
  pastOrdersTotalPages = signal<number>(0);

  pastOrdersHasPreviousPage = signal<boolean>(false);
  pastOrdersHasNextPage = signal<boolean>(false);

  isLoading = signal(true);
  errorMessage = signal('');

  readonly OrderStatus = OrderStatus;

  ngOnInit(): void {
    this.loadCurrentOrders();
    this.loadPastOrders();
    this.loadDashboard();
  }

  private loadCurrentOrders(): void {

  this.isLoading.set(true);
  this.errorMessage.set('');

  this.orderService
    .getMyCurrentOrders(this.currentOrdersPageNumber(), this.currentOrdersPageSize())
    .subscribe({

      next: (result) => {

        this.currentOrders.set(result.items);

        this.currentOrdersPageNumber.set(result.pageNumber);
        this.currentOrdersPageSize.set(result.pageSize);
        this.currentOrdersTotalCount.set(result.totalCount);
        this.currentOrdersTotalPages.set(result.totalPages);
        this.currentOrdersHasPreviousPage.set(result.hasPreviousPage);
        this.currentOrdersHasNextPage.set(result.hasNextPage);

        this.isLoading.set(false);
      },

      error: (error) => {

        console.error(
          'Failed to load orders:',
          error
        );

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to load your orders.'
        );

        this.isLoading.set(false);
      }
    });
  }

  private loadPastOrders(): void {

  this.isLoading.set(true);
  this.errorMessage.set('');

  this.orderService
    .getMyPastOrders(this.pastOrdersPageNumber(), this.pastOrdersPageSize())
    .subscribe({

      next: (result) => {

        this.pastOrders.set(result.items);

        this.pastOrdersPageNumber.set(result.pageNumber);
        this.pastOrdersPageSize.set(result.pageSize);
        this.pastOrdersTotalCount.set(result.totalCount);
        this.pastOrdersTotalPages.set(result.totalPages);
        this.pastOrdersHasPreviousPage.set(result.hasPreviousPage);
        this.pastOrdersHasNextPage.set(result.hasNextPage);

        this.isLoading.set(false);
      },

      error: (error) => {

        console.error(
          'Failed to load orders:',
          error
        );

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to load your orders.'
        );

        this.isLoading.set(false);
      }
    });
  }

 
  getDisplayStatus(order: Order): OrderStatus {

    return order.status;
  }

  getStatusLabel(status: OrderStatus): string {

    switch (status) {

      case OrderStatus.Pending:
        return 'Pending';

      case OrderStatus.Confirmed:
        return 'Confirmed';

      case OrderStatus.Processing:
        return 'Processing';

      case OrderStatus.OutForDelivery:
        return 'Out for Delivery';

      case OrderStatus.Delivered:
        return 'Delivered';

      case OrderStatus.Cancelled:
        return 'Cancelled';

      case OrderStatus.ReturnRequested:
        return 'Return Requested';

      case OrderStatus.ReturnApproved:
        return 'Return Approved';

      case OrderStatus.ReturnRejected:
        return 'Return Rejected';

      case OrderStatus.Returned:
        return 'Returned';

      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: OrderStatus): string {

    switch (status) {

      case OrderStatus.Pending:
        return 'bg-orange-50 text-orange-700';

      case OrderStatus.Confirmed:
        return 'bg-blue-50 text-blue-700';

      case OrderStatus.Processing:
        return 'bg-purple-50 text-purple-700';

      case OrderStatus.OutForDelivery:
        return 'bg-indigo-50 text-indigo-700';

      case OrderStatus.Delivered:
        return 'bg-green-50 text-green-700';

      case OrderStatus.Cancelled:
        return 'bg-red-50 text-red-700';

      case OrderStatus.ReturnRequested:
        return 'bg-yellow-50 text-yellow-700';

      case OrderStatus.ReturnApproved:
        return 'bg-green-50 text-green-700';

      case OrderStatus.ReturnRejected:
        return 'bg-red-50 text-red-700';

      case OrderStatus.Returned:
        return 'bg-gray-100 text-gray-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getCurrentOrders(): Order[] {

   return this.currentOrders();
  }

  getPastOrders(): Order[] {

    return this.pastOrders();
  }

  viewOrder(orderId: number): void {

    this.router.navigate([
      '/orders',
      orderId
    ]);
  }

  goToHome(): void {

    this.router.navigate(['/']);
  }

  goToCurrentOrdersPreviousPage(): void {
    
    if (!this.currentOrdersHasPreviousPage()) {
      return;
    }
    
    this.currentOrdersPageNumber.update(page => page - 1);
    
    this.loadCurrentOrders();
  }
  
  goToCurrentOrdersNextPage(): void {
    
    if (!this.currentOrdersHasNextPage()) {
      return;
    }
    
    this.currentOrdersPageNumber.update(page => page + 1);
    
    this.loadCurrentOrders();
  }

  goToCurrentOrdersPage(page: number): void {
    
    if (page < 1 || page > this.currentOrdersTotalPages() || page === this.currentOrdersPageNumber()) {
      
      return;
    }
    
    this.currentOrdersPageNumber.set(page);
    
    this.loadCurrentOrders();

  }

  goToPastOrdersPreviousPage(): void {
    
    if (!this.pastOrdersHasPreviousPage()) {
      return;
    }
    
    this.pastOrdersPageNumber.update(page => page - 1);
    
    this.loadPastOrders();
  }
  
  goToPastOrdersNextPage(): void {
    
    if (!this.pastOrdersHasNextPage()) {
      return;
    }
    
    this.pastOrdersPageNumber.update(page => page + 1);
    
    this.loadPastOrders();
  }

  goToPastOrdersPage(page: number): void {
    
    if (page < 1 || page > this.pastOrdersTotalPages() || page === this.pastOrdersPageNumber()) {
      
      return;
    }
    
    this.pastOrdersPageNumber.set(page);
    
    this.loadPastOrders();

  }

  private loadDashboard(): void {

    this.dashboardService.getCustomerDashboard().subscribe({
      next: data => {
        this.dashboard.set(data);

        this.currentOrdersCount.set(this.dashboard()?.myActiveOrders);
        this.pastOrdersCount.set(this.dashboard()?.myPastOrders);
      }
    });
  }
}