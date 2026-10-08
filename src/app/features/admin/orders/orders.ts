import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ReturnRequest, ReturnService } from '../../../core/services/return.service';
import { Order, OrderService, OrderStatus } from '../../../core/services/order.service';
import { AdminDashboardInterface, DashboardService } from '../../../core/services/admin-dashboard';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class AdminOrders implements OnInit {

  private orderService = inject(OrderService);
  readonly dashboardService = inject(DashboardService);

  orders = signal<Order[]>([]);
  filteredOrders = signal<Order[]>([]);
  returns = signal<ReturnRequest[]>([]);
  dashboard = signal<AdminDashboardInterface | null>(null);

  status = signal<OrderStatus | null>(null);

  returnStatus = signal<number>(0);

  pageNumber = signal<number>(1);
  pageSize = signal<number>(10);
  totalCount = signal<number>(0);
  totalPages = signal<number>(0);

  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);

  isLoading = signal(false);

  errorMessage = signal('');

  searchTerm = signal<string| null>(null);

  selectedStatus = signal<number | null>(null);


  readonly orderStatuses = [
    { value: 1, label: 'Pending' },
    { value: 2, label: 'Confirmed' },
    { value: 3, label: 'Processing' },
    { value: 4, label: 'Out for Delivery' },
    { value: 5, label: 'Delivered' },
    { value: 6, label: 'Cancelled' },
    { value: 7, label: 'Return Requested' },
    { value: 8, label: 'Return Approved' },
    { value: 9, label: 'Return Rejected' },
    { value: 10, label: 'Returned' }
  ];


  ngOnInit(): void {
    this.loadDashboard();
    this.loadOrders();
  }

  loadOrders(): void {

    console.log('Order Called');

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.orderService.getAllOrders(this.pageNumber(),this.pageSize(),this.selectedStatus(),this.searchTerm()).subscribe({

      next: (orders) => {

        this.orders.set(orders.items);

        this.pageNumber.set(orders.pageNumber);
        this.pageSize.set(orders.pageSize);
        this.totalCount.set(orders.totalCount);
        this.totalPages.set(orders.totalPages);
        this.hasNextPage.set(orders.hasNextPage);
        this.hasPreviousPage.set(orders.hasPreviousPage);

        console.log('Order Details',this.pageNumber(),this.pageSize(),this.searchTerm(),this.selectedStatus(),this.totalCount(),this.totalPages());


        this.isLoading.set(false);
      },

      error: (error) => {

        console.error('Error loading admin orders:', error);

        this.errorMessage.set(
          'Unable to load orders. Please try again.'
        );

        this.isLoading.set(false);
      }

    });
  }


  loadDashboard(): void {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
      },
      error: (error) => {
        console.error('Unable to fetch dashboard data:',error);
      }
    });
  }

  getDisplayStatus(order: Order): OrderStatus {
  
      if (order.status !== OrderStatus.Delivered) {
        return order.status;
      }
  
      const returnRequest = this.returns()?.find(
        returnRequest => returnRequest.orderId === order.id
      );
  
      if (!returnRequest) {
        return order.status;
      }
  
      return returnRequest.status;
    }


  onSearchChange(value: string): void {

    console.log('Search Change:',value);

    this.searchTerm.set(value);

    console.log('Search Signal:',this.searchTerm());

    this.loadOrders();
  }

  onStatusChange(value: number | null): void {

    console.log('Status Change', value);

    this.selectedStatus.set(value);

    console.log('Status Signal',this.selectedStatus())

    this.loadOrders();
  }

  getOrderStatusLabel(status: number): string {

    const statusItem = this.orderStatuses.find(
      item => item.value === status
    );

    return statusItem?.label ?? 'Unknown';
  }

  getOrderStatusClass(status: number): string {

    switch (status) {

      case 1:
        return 'status-pending';

      case 2:
        return 'status-confirmed';

      case 3:
        return 'status-processing';

      case 4:
        return 'status-delivery';

      case 5:
        return 'status-delivered';

      case 6:
        return 'status-cancelled';

      case 7:
        return 'status-return';

      case 8:
        return 'status-return';

      case 9:
        return 'status-cancelled';

      case 10:
        return 'status-return';

      default:
        return 'status-default';
    }
  }


  getPaymentMethodLabel(method: number): string {

    switch (method) {

      case 1:
        return 'Credit Card';

      case 2:
        return 'Debit Card';

      case 3:
        return 'UPI';

      case 4:
        return 'Cash on Delivery';

      default:
        return 'Unknown';
    }
  }


  getPaymentStatusLabel(status: number): string {

    switch (status) {

      case 1:
        return 'Pending';

      case 2:
        return 'Paid';

      case 3:
        return 'Failed';

      case 4:
        return 'Refund Initiated';

      case 5:
        return 'Refund Completed';

      case 6:
        return 'Refund Cancelled';

      default:
        return 'Unknown';
    }
  }

  getPaymentStatusClass(status: number): string {

    switch (status) {

      case 1:
        return 'payment-pending';

      case 2:
        return 'payment-paid';

      case 3:
        return 'payment-failed';

      case 4:
        return 'payment-refund';

      case 5:
        return 'payment-refund';

      case 6:
        return 'payment-cancelled';

      default:
        return 'payment-default';
    }
  }


  formatDate(date: string): string {

    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }


  formatTime(date: string): string {

    if (!date) {
      return '';
    }

    return new Date(date).toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }


  getStatusCount(status: number): number {

    const orderByStatus = this.orders().filter(
      order => order.status === status
    ).length;

    const returnsByStatus = this.returns().filter(
      returnOrders => returnOrders.status === status
    ).length;

    return orderByStatus + returnsByStatus;
  }


  clearFilters(): void {

    this.searchTerm.set(null);
    this.selectedStatus.set(null);

    this.loadOrders();
  }


  refreshOrders(): void {

    this.loadOrders();
  }

  goToNextPage() {
    this.pageNumber.update(page => page + 1);
    this.loadOrders();
  }

  goToPreviousPage() {
    this.pageNumber.update(page => page - 1);
    this.loadOrders();
  }
}