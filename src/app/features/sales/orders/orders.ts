import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe, DatePipe, CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Order, OrderService } from '../../../core/services/order.service';
import { DashboardService, SalesDashboard } from '../../../core/services/admin-dashboard';

@Component({
  selector: 'app-sales-orders',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    RouterLink,
    CommonModule
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class SalesOrders implements OnInit {

  private orderService = inject(OrderService);
  private dashboardService = inject(DashboardService);
  private route = inject(ActivatedRoute);


  orders = signal<Order[]>([]);
  filteredOrders = signal<Order[]>([]);
  dashboard = signal<SalesDashboard | null>(null);

  assignedOrders = signal<Order[]>([]);
  unassignedOrders = signal<Order[]>([]);
  activeOrders = signal<Order[]>([]);

  allOrdersPageNumber = signal<number>(1);
  allOrdersPageSize = signal<number>(10);
  allOrdersTotalCount = signal<number>(0);
  allOrdersTotalPages = signal<number>(0);
  allOrdersHasPreviousPage = signal<boolean>(false);
  allOrdersHasNextPage = signal<boolean>(false);

  assignedOrdersPageNumber = signal<number>(1);
  assignedOrdersPageSize = signal<number>(10);
  assignedOrdersTotalCount = signal<number>(0);
  assignedOrdersTotalPages = signal<number>(0);
  assignedOrdersHasPreviousPage = signal<boolean>(false);
  assignedOrdersHasNextPage = signal<boolean>(false);

  unassignedOrdersPageNumber = signal<number>(1);
  unassignedOrdersPageSize = signal<number>(10);
  unassignedOrdersTotalCount = signal<number>(0);
  unassignedOrdersTotalPages = signal<number>(0);
  unassignedOrdersHasPreviousPage = signal<boolean>(false);
  unassignedOrdersHasNextPage = signal<boolean>(false);

  activeOrdersPageNumber = signal<number>(1);
  activeOrdersPageSize = signal<number>(10);
  activeOrdersTotalCount = signal<number>(0);
  activeOrdersTotalPages = signal<number>(0);
  activeOrdersHasPreviousPage = signal<boolean>(false);
  activeOrdersHasNextPage = signal<boolean>(false);

  activeTab = signal<'all' | 'assigned' | 'unassigned' | 'active'>('active');

  selectedStatus = signal<number | null>(null);

  searchTerm = signal('');

  isLoading = signal(false);

  errorMessage = signal('');

  selfAssigningOrderId = signal<number | null>(null);

  selfAssignError = signal('');

  selfAssignSuccess = signal('');

  selectedStatusOrder = signal<Order | null>(null);

  newOrderStatus = signal<number | null>(null);

  isUpdatingStatus = signal(false);

  statusUpdateError = signal('');

  statusUpdateSuccess = signal('');

  ngOnInit(): void {

    const tab =
      this.route.snapshot.queryParamMap.get('tab');

    if (
      tab === 'assigned' ||
      tab === 'unassigned' ||
      tab === 'all' ||
      tab === 'active'
    ) {
      this.activeTab.set(tab);
    }

    this.loadOrders();
  }

  loadOrders(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');

    this.orderService.getAllForSalesStaff(this.allOrdersPageNumber(),this.allOrdersPageSize()).subscribe({

      next: (data) => {

        this.orders.set(data.items);

        this.allOrdersPageNumber.set(data.pageNumber);
        this.allOrdersPageSize.set(data.pageSize);
        this.allOrdersTotalCount.set(data.totalCount);
        this.allOrdersTotalPages.set(data.totalPages);
        this.allOrdersHasPreviousPage.set(data.hasPreviousPage);
        this.allOrdersHasNextPage.set(data.hasNextPage);

        this.loadAssignedOrders();
        this.loadUnassignedOrders();
        this.loadActiveOrders();

        this.isLoading.set(false);

        this.applyFilters();
      },

      error: (error) => {

        console.error(
          'Failed to load Sales Staff orders:',
          error
        );

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to load orders.'
        );

        this.isLoading.set(false);
      }

    });
  }


  loadAssignedOrders(): void {

    this.orderService.getMyAssignedOrders(this.assignedOrdersPageNumber(),this.assignedOrdersPageSize()).subscribe({

      next: (data) => {

        this.assignedOrders.set(data.items);

        this.assignedOrdersPageNumber.set(data.pageNumber);
        this.assignedOrdersPageSize.set(data.pageSize);
        this.assignedOrdersTotalCount.set(data.totalCount);
        this.assignedOrdersTotalPages.set(data.totalPages);
        this.assignedOrdersHasPreviousPage.set(data.hasPreviousPage);
        this.assignedOrdersHasNextPage.set(data.hasNextPage);

        this.applyFilters();

      },

      error: (error) => {

        console.error(
          'Failed to load assigned orders:',
          error
        );

      }

    });
  }


  loadUnassignedOrders(): void {

    this.loadDashboard();

    this.orderService.getUnassignedOrders(this.unassignedOrdersPageNumber(),this.unassignedOrdersPageSize()).subscribe({

      next: (data) => {

        this.unassignedOrders.set(data.items);

        this.unassignedOrdersPageNumber.set(data.pageNumber);
        this.unassignedOrdersPageSize.set(data.pageSize);
        this.unassignedOrdersTotalCount.set(data.totalCount);
        this.unassignedOrdersTotalPages.set(data.totalPages);
        this.unassignedOrdersHasPreviousPage.set(data.hasPreviousPage);
        this.unassignedOrdersHasNextPage.set(data.hasNextPage);

        this.applyFilters();

      },

      error: (error) => {

        console.error(
          'Failed to load unassigned orders:',
          error
        );

      }

    });
  }

  loadActiveOrders(): void {

    this.orderService.getActiveAssignedOrders(this.activeOrdersPageNumber(),this.activeOrdersPageSize()).subscribe({

      next: (data) => {

        this.activeOrders.set(data.items);

        this.activeOrdersPageNumber.set(data.pageNumber);
        this.activeOrdersPageSize.set(data.pageSize);
        this.activeOrdersTotalCount.set(data.totalCount);
        this.activeOrdersTotalPages.set(data.totalPages);
        this.activeOrdersHasPreviousPage.set(data.hasPreviousPage);
        this.activeOrdersHasNextPage.set(data.hasNextPage);

        this.applyFilters();

      },

      error: (error) => {

        console.error(
          'Failed to load unassigned orders:',
          error
        );

      }

    });
  }

  loadDashboard(): void {
    this.dashboardService.getSalesDashboard().subscribe({
      next: data => {
        this.dashboard.set(data);
      }
    });
  }


  setActiveTab(
    tab: 'all' | 'assigned' | 'unassigned' | 'active'
  ): void {

    this.activeTab.set(tab);

    this.applyFilters();

  }


  setStatusFilter(status: number | null): void {

    this.selectedStatus.set(status);

    this.applyFilters();

  }

  setSearchTerm(value: string): void {

    this.searchTerm.set(value);

    this.applyFilters();

  }

  applyFilters(): void {

    let result: Order[] = [];

    switch (this.activeTab()) {

      case 'active':
        result = [...this.activeOrders()];
        break;

      case 'assigned':
        result = [...this.assignedOrders()];
        break;

      case 'unassigned':
        result = [...this.unassignedOrders()];
        break;

      case 'all':
        result = [...this.orders()];
        break;

    }

    const search = this.searchTerm().trim().toLowerCase();

    if (search) {

      result = result.filter(order =>

        order.orderNumber
          ?.toLowerCase()
          .includes(search)

        ||

        (order.customerName ?? '')
          .toLowerCase()
          .includes(search)

        ||

        (order.shippingAddress ?? '')
          .toLowerCase()
          .includes(search)

      );

    }

    const status = this.selectedStatus();

    if (status !== null) {

      result = result.filter(
        order => order.status === status
      );

    }

    this.filteredOrders.set(result);

  }


  selfAssign(order: Order): void {

    if (this.selfAssigningOrderId() !== null) {
      return;
    }

    this.selfAssigningOrderId.set(order.id);

    this.selfAssignError.set('');
    this.selfAssignSuccess.set('');

    this.orderService.selfAssignOrder(order.id).subscribe({

      next: (updatedOrder) => {

        this.selfAssigningOrderId.set(null);

        this.selfAssignSuccess.set(
          `Order ${updatedOrder.orderNumber} has been assigned to you.`
        );

        this.loadOrders();

      },

      error: (error) => {

        console.error(
          'Failed to self-assign order:',
          error
        );

        this.selfAssigningOrderId.set(null);

        this.selfAssignError.set(
          error?.error?.message ||
          'Unable to self-assign this order.'
        );

      }

    });

  }


  openStatusModal(order: Order): void {

    this.selectedStatusOrder.set(order);

    this.newOrderStatus.set(order.status);

    this.statusUpdateError.set('');
    this.statusUpdateSuccess.set('');

  }

  closeStatusModal(): void {

    if (this.isUpdatingStatus()) {
      return;
    }

    this.selectedStatusOrder.set(null);

    this.newOrderStatus.set(null);

    this.statusUpdateError.set('');
    this.statusUpdateSuccess.set('');

  }

  setNewOrderStatus(status: number): void {

    this.newOrderStatus.set(status);

  }

  updateOrderStatus(): void {

    const order = this.selectedStatusOrder();

    const status = this.newOrderStatus();

    if (!order || status === null) {
      return;
    }

    if (status === order.status) {

      this.statusUpdateError.set(
        'Please select a different status.'
      );

      return;

    }

    this.isUpdatingStatus.set(true);

    this.statusUpdateError.set('');
    this.statusUpdateSuccess.set('');

    this.orderService
      .updateOrderStatus(order.id, status)
      .subscribe({

        next: (updatedOrder) => {

          this.isUpdatingStatus.set(false);

          this.orders.update(current =>
            current.map(item =>
              item.id === updatedOrder.id
                ? updatedOrder
                : item
            )
          );

          this.assignedOrders.update(current =>
            current.map(item =>
              item.id === updatedOrder.id
                ? updatedOrder
                : item
            )
          );

          this.unassignedOrders.update(current =>
            current.map(item =>
              item.id === updatedOrder.id
                ? updatedOrder
                : item
            )
          );

          this.applyFilters();

          this.statusUpdateSuccess.set(
            'Order status updated successfully.'
          );

          this.selectedStatusOrder.set(updatedOrder);

        },

        error: (error) => {

          console.error(
            'Failed to update order status:',
            error
          );

          this.isUpdatingStatus.set(false);

          this.statusUpdateError.set(
            error?.error?.message ||
            'Unable to update order status.'
          );

        }

      });

  }


  getStatusText(status: number): string {

    switch (status) {

      case 1:
        return 'Pending';

      case 2:
        return 'Confirmed';

      case 3:
        return 'Processing';

      case 4:
        return 'Out for Delivery';

      case 5:
        return 'Delivered';

      case 6:
        return 'Cancelled';

      case 7:
        return 'Return Requested';

      case 8:
        return 'Return Approved';

      case 9:
        return 'Return Rejected';

      case 10:
        return 'Returned';

      default:
        return 'Unknown';

    }

  }


  getStatusClass(status: number): string {

    switch (status) {

      case 1:
        return 'bg-amber-100 text-amber-700';

      case 2:
        return 'bg-blue-100 text-blue-700';

      case 3:
        return 'bg-indigo-100 text-indigo-700';

      case 4:
        return 'bg-orange-100 text-orange-700';

      case 5:
        return 'bg-green-100 text-green-700';

      case 6:
        return 'bg-red-100 text-red-700';

      case 7:
        return 'bg-amber-100 text-amber-700';

      case 8:
        return 'bg-blue-100 text-blue-700';

      case 9:
        return 'bg-red-100 text-red-700';

      case 10:
        return 'bg-green-100 text-green-700';

      default:
        return 'bg-gray-100 text-gray-700';

    }

  }


  getStatusOptions(): { value: number; label: string }[] {

    return [
      {
        value: 1,
        label: 'Pending'
      },
      {
        value: 2,
        label: 'Confirmed'
      },
      {
        value: 3,
        label: 'Processing'
      },
      {
        value: 4,
        label: 'Out for Delivery'
      },
      {
        value: 5,
        label: 'Delivered'
      },
      {
        value: 6,
        label: 'Cancelled'
      }
    ];

  }

  getPaymentMethodText(method: number): string {

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

goToPreviousPage(): void {

  switch (this.activeTab()) {

    case 'active':
      if (this.activeOrdersHasPreviousPage()) {
        this.activeOrdersPageNumber.update(page => page - 1);
        this.loadActiveOrders();
      }
      break;

    case 'assigned':
      if (this.assignedOrdersHasPreviousPage()) {
        this.assignedOrdersPageNumber.update(page => page - 1);
        this.loadAssignedOrders();
      }
      break;

    case 'unassigned':
      if (this.unassignedOrdersHasPreviousPage()) {
        this.unassignedOrdersPageNumber.update(page => page - 1);
        this.loadUnassignedOrders();
      }
      break;

    case 'all':
      if (this.allOrdersHasPreviousPage()) {
        this.allOrdersPageNumber.update(page => page - 1);
        this.loadOrders();
      }
      break;
  }

}

goToNextPage(): void {

  switch (this.activeTab()) {

    case 'active':
      if (this.activeOrdersHasNextPage()) {
        this.activeOrdersPageNumber.update(page => page + 1);
        this.loadActiveOrders();
      }
      break;

    case 'assigned':
      if (this.assignedOrdersHasNextPage()) {
        this.assignedOrdersPageNumber.update(page => page + 1);
        this.loadAssignedOrders();
      }
      break;

    case 'unassigned':
      if (this.unassignedOrdersHasNextPage()) {
        this.unassignedOrdersPageNumber.update(page => page + 1);
        this.loadUnassignedOrders();
      }
      break;

    case 'all':
      if (this.allOrdersHasNextPage()) {
        this.allOrdersPageNumber.update(page => page + 1);
        this.loadOrders();
      }
      break;
  }

}

}