import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  AdminOrder,
  AdminOrderService
} from '../../../core/services/admin-order.service';

import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-sales-order-details',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink
  ],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css'
})
export class SalesOrderDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private orderService = inject(AdminOrderService);
  private authService = inject(AuthService);

  order = signal<AdminOrder | null>(null);

  currentUserId = signal<string | null>(null);

  isLoading = signal(false);
  errorMessage = signal('');

  selectedStatus = signal<number | null>(null);

  isUpdatingStatus = signal(false);

  statusUpdateError = signal('');
  statusUpdateSuccess = signal('');

  isSelfAssigning = signal(false);

  selfAssignError = signal('');
  selfAssignSuccess = signal('');

  ngOnInit(): void {

    // First get the logged-in user
    this.loadCurrentUser();

    const orderId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!orderId || Number.isNaN(orderId)) {
      this.errorMessage.set(
        'Invalid order ID.'
      );
      return;
    }

    this.loadOrder(orderId);
  }

  loadCurrentUser(): void {

    this.authService.getCurrentUser().subscribe({
      next: (user) => {

        console.log('Current logged-in user:', user);

        this.currentUserId.set(user.id);
      },

      error: (error) => {

        console.error(
          'Failed to load current user:',
          error
        );

        this.currentUserId.set(null);
      }
    });
  }

  loadOrder(orderId: number): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.orderService.getOrderById(orderId).subscribe({

      next: (data) => {

        this.order.set(data);

        this.selectedStatus.set(
          data.status
        );

        this.isLoading.set(false);
      },

      error: (error) => {

        console.error(
          'Failed to load order:',
          error
        );

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to load order details.'
        );

        this.isLoading.set(false);
      }
    });
  }

 
  isAssignedToMe(): boolean {

    const currentOrder = this.order();
    const userId = this.currentUserId();

    if (!currentOrder || !userId) {
      return false;
    }

    return currentOrder.assignedStaffId === userId;
  }

  
  canSelfAssign(): boolean {

    const currentOrder = this.order();

    if (!currentOrder) {
      return false;
    }

    return (
      !currentOrder.assignedStaffId &&
      currentOrder.status !== 5 &&
      currentOrder.status !== 6
    );
  }

  
  canUpdateStatus(): boolean {

    const currentOrder = this.order();

    if (!currentOrder) {
      return false;
    }

    return (
      this.isAssignedToMe() &&
      currentOrder.status !== 5 &&
      currentOrder.status !== 6
    );
  }

  selfAssign(): void {

  const currentOrder = this.order();

  if (
    !currentOrder ||
    !this.canSelfAssign()
  ) {
    return;
  }

  this.isSelfAssigning.set(true);

  this.selfAssignError.set('');
  this.selfAssignSuccess.set('');

  this.orderService
    .selfAssignOrder(currentOrder.id)
    .subscribe({

      next: (updatedOrder) => {

        // Update the order with the response from the backend
        this.order.set(updatedOrder);

        this.selectedStatus.set(
          updatedOrder.status
        );

        
        if (updatedOrder.assignedStaffId) {
          this.currentUserId.set(
            updatedOrder.assignedStaffId
          );
        }

        this.isSelfAssigning.set(false);

        this.selfAssignSuccess.set(
          'Order assigned to you successfully.'
        );
      },

      error: (error) => {

        console.error(
          'Failed to self assign order:',
          error
        );

        this.isSelfAssigning.set(false);

        this.selfAssignError.set(
          error?.error?.message ||
          'Unable to assign this order to you.'
        );
      }
    });
}

  getStatusOptions(): { value: number; label: string }[] {

    return [
      { value: 1, label: 'Pending' },
      { value: 2, label: 'Confirmed' },
      { value: 3, label: 'Processing' },
      { value: 4, label: 'Out for Delivery' },
      { value: 5, label: 'Delivered' },
      { value: 6, label: 'Cancelled' }
    ];
  }

  setSelectedStatus(status: number): void {

    if (!this.canUpdateStatus()) {
      return;
    }

    this.selectedStatus.set(status);

    this.statusUpdateError.set('');
    this.statusUpdateSuccess.set('');
  }

  updateStatus(): void {

    const currentOrder = this.order();
    const status = this.selectedStatus();

   
    if (
      !currentOrder ||
      status === null ||
      !this.canUpdateStatus()
    ) {
      return;
    }

    if (status === currentOrder.status) {

      this.statusUpdateError.set(
        'Please select a different status.'
      );

      return;
    }

    this.isUpdatingStatus.set(true);

    this.statusUpdateError.set('');
    this.statusUpdateSuccess.set('');

    this.orderService
      .updateOrderStatus(
        currentOrder.id,
        status
      )
      .subscribe({

        next: (updatedOrder) => {

          this.order.set(updatedOrder);

          this.selectedStatus.set(
            updatedOrder.status
          );

          this.isUpdatingStatus.set(false);

          this.statusUpdateSuccess.set(
            'Order status updated successfully.'
          );
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

      case 1: return 'Pending';
      case 2: return 'Confirmed';
      case 3: return 'Processing';
      case 4: return 'Out for Delivery';
      case 5: return 'Delivered';
      case 6: return 'Cancelled';

      case 7: return 'Return Requested';
      case 8: return 'Return Approved';
      case 9: return 'Return Rejected';
      case 10: return 'Returned';

      default: return 'Unknown';
    }
  }

  getStatusClass(status: number): string {

    switch (status) {

      case 1: return 'bg-amber-100 text-amber-700';
      case 2: return 'bg-blue-100 text-blue-700';
      case 3: return 'bg-indigo-100 text-indigo-700';
      case 4: return 'bg-orange-100 text-orange-700';
      case 5: return 'bg-green-100 text-green-700';
      case 6: return 'bg-red-100 text-red-700';

      case 7: return 'bg-amber-100 text-amber-700';
      case 8: return 'bg-blue-100 text-blue-700';
      case 9: return 'bg-red-100 text-red-700';
      case 10: return 'bg-green-100 text-green-700';

      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getPaymentMethodText(method: number): string {

    switch (method) {

      case 1: return 'Credit Card';
      case 2: return 'Debit Card';
      case 3: return 'UPI';
      case 4: return 'Cash on Delivery';

      default: return 'Unknown';
    }
  }

  getPaymentStatusText(status: number): string {

    switch (status) {

      case 1: return 'Pending';
      case 2: return 'Paid';
      case 3: return 'Failed';

      case 4: return 'Refund Initiated';
      case 5: return 'Refund Completed';
      case 6: return 'Refund Cancelled';

      default: return 'Unknown';
    }
  }

  getPaymentStatusClass(status: number): string {

    switch (status) {

      case 1: return 'bg-amber-100 text-amber-700';
      case 2: return 'bg-green-100 text-green-700';
      case 3: return 'bg-red-100 text-red-700';

      case 4: return 'bg-blue-100 text-blue-700';
      case 5: return 'bg-green-100 text-green-700';
      case 6: return 'bg-gray-100 text-gray-700';

      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getImageUrl(imageUrl?: string | null): string {

    if (!imageUrl) {
      return 'assets/images/product-placeholder.png';
    }

    if (
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://')
    ) {
      return imageUrl;
    }

    return `${environment.imageApi}/${imageUrl}`;
  }
}