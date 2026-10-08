import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  AdminOrder,
  AdminOrderService
} from '../../../core/services/admin-order.service';

import { EmployeeProfile, EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-admin-order-details',
  standalone: true,
  imports: [ CommonModule,RouterLink,FormsModule ],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css'
})
export class AdminOrderDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private orderService = inject(AdminOrderService);
  private employeeService = inject(EmployeeService);


  order = signal<AdminOrder | null>(null);
  salesStaff = signal<EmployeeProfile[]>([]);
  currentSalesStaff = signal<EmployeeProfile[]>([]);


  isLoading = signal(false);

  errorMessage = signal('');

  orderId = signal<number | null>(null);


  selectedStaffId = signal<string | null>(null);

  isUpdatingStatus = signal(false);

  isAssigningStaff = signal(false);

  isLoadingSalesStaff = signal<boolean>(false);


  actionSuccessMessage = signal('');

  actionErrorMessage = signal('');

  actionMessage = signal('');

  actionError = signal('');

  pageNumber = signal<number>(1);
  pageSize = signal<number>(10);
  totalCount = signal<number>(0);
  totalPages = signal<number>(0);

  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);

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

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id || id <= 0) {

      this.errorMessage.set('Invalid order ID.');

      return;
    }

    this.orderId.set(id);

    this.loadOrder(id);

    this.loadSalesStaff();
  }

  loadOrder(id: number): void {

    this.isLoading.set(true);

    this.errorMessage.set('');

    this.orderService.getOrderById(id).subscribe({

      next: (order) => {

        this.order.set(order);

        this.isLoading.set(false);
      },

      error: (error) => {

        console.error(
          'Error loading order details:',
          error
        );

        this.errorMessage.set(
          'Unable to load this order. Please try again.'
        );

        this.isLoading.set(false);
      }

    });
  }


  loadSalesStaff(): void {

    this.isLoadingSalesStaff.set(true);

    this.employeeService.getSalesStaff().subscribe({

      next: (staff) => {

        if(this.currentSalesStaff().length > 0){

          this.salesStaff.set([...this.currentSalesStaff(),...(staff.items)]);

          this.pageNumber.set(staff.pageNumber);
          this.pageSize.set(staff.pageSize);
          this.totalCount.set(staff.totalCount);
          this.totalPages.set(staff.totalPages);
          this.hasNextPage.set(staff.hasNextPage);
          this.hasPreviousPage.set(staff.hasPreviousPage);

          this.isLoadingSalesStaff.set(false);

        }
        

        else{

          this.salesStaff.set(staff.items);

          this.pageNumber.set(staff.pageNumber);
          this.pageSize.set(staff.pageSize);
          this.totalCount.set(staff.totalCount);
          this.totalPages.set(staff.totalPages);
          this.hasNextPage.set(staff.hasNextPage);
          this.hasPreviousPage.set(staff.hasPreviousPage);

          this.isLoadingSalesStaff.set(false);
        }

      },

      error: (error) => {

        console.error(
          'Error loading sales staff:',
          error
        );

        this.isLoadingSalesStaff.set(false);

      }

    });
  }


  refreshOrder(): void {

    const id = this.orderId();

    if (!id) {
      return;
    }

    this.loadOrder(id);
  }


  getOrderStatusLabel(status: number): string {

    const statusItem =
      this.orderStatuses.find(
        item => item.value === status
      );

    return statusItem?.label ?? 'Unknown';
  }


  getOrderStatusClass(status: number): string {

    switch (status) {

      case 1:
        return 'bg-amber-50 text-amber-700 border-amber-100';

      case 2:
        return 'bg-blue-50 text-blue-700 border-blue-100';

      case 3:
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';

      case 4:
        return 'bg-purple-50 text-purple-700 border-purple-100';

      case 5:
        return 'bg-green-50 text-green-700 border-green-100';

      case 6:
        return 'bg-red-50 text-red-700 border-red-100';

      case 7:
        return 'bg-orange-50 text-orange-700 border-orange-100';

      case 8:
        return 'bg-orange-50 text-orange-700 border-orange-100';

      case 9:
        return 'bg-red-50 text-red-700 border-red-100';

      case 10:
        return 'bg-orange-50 text-orange-700 border-orange-100';

      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
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
        return 'bg-amber-50 text-amber-700';

      case 2:
        return 'bg-green-50 text-green-700';

      case 3:
        return 'bg-red-50 text-red-700';

      case 4:
        return 'bg-purple-50 text-purple-700';

      case 5:
        return 'bg-purple-50 text-purple-700';

      case 6:
        return 'bg-gray-100 text-gray-600';

      default:
        return 'bg-gray-100 text-gray-600';
    }
  }


  formatDate(date: string | null | undefined): string {

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


  formatTime(date: string | null | undefined): string {

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


  getImageUrl(
    imageUrl: string | null | undefined
  ): string {

    if (!imageUrl) {
      return '';
    }

    if (
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://')
    ) {
      return imageUrl;
    }

    return `http://localhost:5051${imageUrl}`;
  }


  getNextStatus(status: number): {
    value: number;
    label: string;
  } | null {

    switch (status) {

      case 1:
        return {
          value: 2,
          label: 'Confirm Order'
        };

      case 2:
        return {
          value: 3,
          label: 'Start Processing'
        };

      case 3:
        return {
          value: 4,
          label: 'Mark Out for Delivery'
        };

      case 4:
        return {
          value: 5,
          label: 'Mark as Delivered'
        };

      default:
        return null;
    }
  }


  updateStatus(): void {

    const currentOrder = this.order();

    if (!currentOrder) {
      return;
    }

    const nextStatus = this.getNextStatus(
      currentOrder.status
    );

    if (!nextStatus) {
      return;
    }

    this.isUpdatingStatus.set(true);

    this.actionSuccessMessage.set('');

    this.actionErrorMessage.set('');

    this.orderService.updateOrderStatus(
      currentOrder.id,
      nextStatus.value
    ).subscribe({

      next: (updatedOrder) => {

        this.order.set(updatedOrder);

        this.isUpdatingStatus.set(false);

        this.actionSuccessMessage.set(
          `Order status updated to ${nextStatus.label.replace(
            'Mark as ',
            ''
          )}.`
        );

      },

      error: (error) => {

        console.error(
          'Error updating order status:',
          error
        );

        this.isUpdatingStatus.set(false);

        this.actionErrorMessage.set(
          error?.error?.message ||
          'Unable to update the order status.'
        );

      }

    });
  }


  assignStaff(): void {

    const currentOrder = this.order();

    if (!currentOrder) {
      return;
    }

    if (currentOrder.assignedStaffId) {

      this.actionError.set('A Sales Staff member is already assigned to this order.');

      return;
    }

    const staffId = this.selectedStaffId();

    if (!staffId) {

      this.actionError.set('Please select a Sales Staff member.');

      return;
    }

    this.isAssigningStaff.set(true);

    this.actionSuccessMessage.set('');

    this.actionErrorMessage.set('');

    this.actionError.set('');

    this.orderService.assignStaff(currentOrder.id,staffId).subscribe({

      next: (updatedOrder) => {

        this.order.set(updatedOrder);

        this.selectedStaffId.set(null);

        this.isAssigningStaff.set(false);

        this.actionSuccessMessage.set('Sales Staff assigned successfully.');

      },

      error: (error) => {

        console.error('Error assigning staff:',error);

        this.isAssigningStaff.set(false);

        this.actionErrorMessage.set(error?.error?.message ||'Unable to assign Sales Staff.');

      }

    });
  }

  unassignStaff(): void {

    const currentOrder = this.order();

    if (!currentOrder) {
      return;
    }

    // Nothing to unassign
    if (!currentOrder.assignedStaffId) {
      return;
    }

    this.isAssigningStaff.set(true);

    this.actionMessage.set('');

    this.actionError.set('');

    this.orderService
      .assignStaff(
        currentOrder.id,
        null
      )
      .subscribe({

        next: (updatedOrder) => {

          this.order.set(updatedOrder);

          this.selectedStaffId.set(null);

          this.isAssigningStaff.set(false);

          this.actionMessage.set(
            'Sales Staff unassigned successfully.'
          );

        },

        error: (error) => {

          this.isAssigningStaff.set(false);

          this.actionError.set(
            error?.error?.message ||
            'Failed to unassign Sales Staff.'
          );

        }

      });
  }

  loadMore() {
    if (this.isLoadingSalesStaff() || !this.hasNextPage())
      {
        return;
      }

      this.currentSalesStaff.set(this.salesStaff());

    this.pageNumber.update(page => page + 1);
    this.loadSalesStaff();
  }
}