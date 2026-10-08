import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { EmployeeService, EmployeeProfile } from '../../../core/services/employee.service';
import { Order, OrderService } from '../../../core/services/order.service';
import { DashboardService, ManagerDashboard } from '../../../core/services/admin-dashboard';

@Component({
  selector: 'app-manager-orders',
  standalone: true,
  imports: [ DecimalPipe,RouterLink ],
  templateUrl: './orders.html'
})
export class ManagerOrders implements OnInit {

  private orderService = inject(OrderService);
  private employeeService = inject(EmployeeService);
  private dashboardService = inject(DashboardService);

  orders = signal<Order[]>([]);

  pageNumber = signal<number>(1);
  pageSize = signal<number>(10);
  totalPages = signal<number>(0);
  totalCount = signal<number>(0);

  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);

  staffPageNumber = signal<number>(1);
  staffPageSize = signal<number>(10);
  staffTotalPages = signal<number>(0);
  staffTotalCount = signal<number>(0);

  staffHasNextPage = signal<boolean>(false);
  staffHasPreviousPage = signal<boolean>(false);

  dashboard = signal<ManagerDashboard | null>(null);
  
  filteredOrders = signal<Order[]>([]);

  salesStaff = signal<EmployeeProfile[]>([]);

  isLoading = signal(false);

  isLoadingStaff = signal(false);

  errorMessage = signal('');

  staffErrorMessage = signal('');

  selectedOrder = signal<Order | null>(null);

  selectedStaffId = signal('');

  isAssigning = signal(false);

  assignErrorMessage = signal('');

  assignSuccessMessage = signal('');

  selectedStatus = signal<number | null>(null);

  showUnassignedOnly = signal(false);

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

selectedStatusOrder = signal<Order | null>(null);

newOrderStatus = signal<number | null>(null);

isUpdatingStatus = signal(false);

statusUpdateError = signal('');

statusUpdateSuccess = signal('');

  ngOnInit(): void {

    this.loadDashboard();

    this.loadOrders();

    this.loadSalesStaff();
  }

  private loadDashboard(): void {
    this.dashboardService.getManagerDashboard().subscribe({
      next: data => {
        this.dashboard.set(data);
      }
    });
  }

  loadOrders(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');

    if(this.showUnassignedOnly()){
      this.loadOnlyUnassignedOrders();
    }

   else{
     this.orderService.getAllOrders(this.pageNumber(),this.pageSize(),this.selectedStatus(),null).subscribe({

      next: (orders) => {

        this.orders.set(orders.items);

        this.isLoading.set(false);

        this.pageNumber.set(orders.pageNumber);
        this.pageSize.set(orders.pageSize);
        this.totalCount.set(orders.totalCount);
        this.totalPages.set(orders.totalPages);
        this.hasNextPage.set(orders.hasNextPage);
        this.hasPreviousPage.set(orders.hasPreviousPage);

      },

      error: (error) => {

        console.error(
          'Failed to load Manager orders:',
          error
        );

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to load orders. Please try again.'
        );

        this.isLoading.set(false);

      }

    });
   }

  }

  loadOnlyUnassignedOrders(): void {
    this.isLoading.set(true);

    this.errorMessage.set('');

    this.orderService.getAllUnassignedOrders(this.pageNumber(),this.pageSize(),this.selectedStatus()).subscribe({

      next: (orders) => {

        this.orders.set(orders.items);

        this.isLoading.set(false);

        this.pageNumber.set(orders.pageNumber);
        this.pageSize.set(orders.pageSize);
        this.totalCount.set(orders.totalCount);
        this.totalPages.set(orders.totalPages);
        this.hasNextPage.set(orders.hasNextPage);
        this.hasPreviousPage.set(orders.hasPreviousPage);

      },

      error: (error) => {

        console.error(
          'Failed to load Manager orders:',
          error
        );

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to load orders. Please try again.'
        );

        this.isLoading.set(false);

      }

    });
  }

  loadSalesStaff(): void {

    this.isLoadingStaff.set(true);

    this.staffErrorMessage.set('');

    this.employeeService.getSalesStaff().subscribe({

      next: (staff) => {

        this.salesStaff.set(staff.items);

        this.pageNumber.set(staff.pageNumber);
        this.pageSize.set(staff.pageSize);
        this.totalCount.set(staff.totalCount);
        this.totalPages.set(staff.totalPages);
        this.hasNextPage.set(staff.hasNextPage);
        this.hasPreviousPage.set(staff.hasPreviousPage);

        this.isLoadingStaff.set(false);

      },

      error: (error) => {

        console.error(
          'Failed to load SalesStaff:',
          error
        );

        this.staffErrorMessage.set(
          error?.error?.message ||
          'Unable to load SalesStaff.'
        );

        this.isLoadingStaff.set(false);

      }

    });

  }

  onStatusFilterChange(): void {

    this.pageNumber.set(1);
    this.pageSize.set(10);

    this.loadOrders();

  }

  toggleUnassignedFilter(): void {

    this.showUnassignedOnly.update(
      value => !value
    );

    this.pageNumber.set(1);
    this.pageSize.set(10);

    this.loadOrders();

  }

  clearFilters(): void {

    this.selectedStatus.set(null);

    this.showUnassignedOnly.set(false);

    this.pageNumber.set(1);
    this.pageSize.set(10);

    this.loadOrders();

  }

  openAssignModal(order: Order): void {

    this.selectedOrder.set(order);

    this.selectedStaffId.set('');

    this.assignErrorMessage.set('');

    this.assignSuccessMessage.set('');

  }

  closeAssignModal(): void {

    if (this.isAssigning()) {
      return;
    }

    this.selectedOrder.set(null);

    this.selectedStaffId.set('');

    this.assignErrorMessage.set('');

    this.assignSuccessMessage.set('');

  }

  assignOrder(): void {

    const order = this.selectedOrder();

    const staffId = this.selectedStaffId();


    if (!order) {
      return;
    }


    if (!staffId) {

      this.assignErrorMessage.set(
        'Please select a SalesStaff member.'
      );

      return;

    }


    this.isAssigning.set(true);

    this.assignErrorMessage.set('');

    this.assignSuccessMessage.set('');


    this.orderService
      .assignStaff(order.id, staffId)
      .subscribe({

        next: (updatedOrder) => {

          this.assignSuccessMessage.set(
            'Order assigned successfully.'
          );


          // Update the order inside the main list
          const updatedOrders =
            this.orders().map(existingOrder =>
              existingOrder.id === updatedOrder.id
                ? updatedOrder
                : existingOrder
            );

          this.orders.set(updatedOrders);
          this.loadOrders();


          this.isAssigning.set(false);

          setTimeout(() => {

            this.closeAssignModal();

          }, 700);

        },

        error: (error) => {

          console.error(
            'Failed to assign order:',
            error
          );

          this.assignErrorMessage.set(
            error?.error?.message ||
            'Unable to assign this order.'
          );

          this.isAssigning.set(false);

        }

      });

  }

  getStatusLabel(status: number): string {

    const statusItem =
      this.orderStatuses.find(
        item => item.value === status
      );

    return statusItem?.label || 'Unknown';

  }

  formatDate(date: string): string {

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

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

        this.statusUpdateSuccess.set(
          'Order status updated successfully.'
        );

        const updatedOrders =
          this.orders().map(existingOrder =>
            existingOrder.id === updatedOrder.id
              ? updatedOrder
              : existingOrder
          );


        this.orders.set(updatedOrders);
        this.loadOrders();

        this.isUpdatingStatus.set(false);

        setTimeout(() => {

          this.closeStatusModal();

        }, 700);
      },

      error: (error) => {

        console.error(
          'Failed to update order status:',
          error
        );

        this.statusUpdateError.set(
          error?.error?.message ||
          'Unable to update order status.'
        );

        this.isUpdatingStatus.set(false);

      }
    });
  }

  goToPreviousPage(): void {
    this.pageNumber.update(page => page - 1);
        this.loadOrders();
  }

  goToNextPage(): void {
    this.pageNumber.update(page => page + 1);
    this.loadOrders();
  }
}