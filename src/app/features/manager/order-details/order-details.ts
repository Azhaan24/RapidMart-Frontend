import { Component,OnInit,inject,signal } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { AdminOrder,AdminOrderService } from '../../../core/services/admin-order.service';


@Component({
  selector: 'app-manager-order-details',
  standalone: true,
  imports: [
    DecimalPipe
  ],
  templateUrl: './order-details.html'
})
export class ManagerOrderDetails implements OnInit {

  private orderService = inject(AdminOrderService);

  private route = inject(ActivatedRoute);

  private router = inject(Router);


  order = signal<AdminOrder | null>(null);


  isLoading = signal(false);

  errorMessage = signal('');

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

  readonly paymentMethods = [
    { value: 1, label: 'Credit Card' },
    { value: 2, label: 'Debit Card' },
    { value: 3, label: 'UPI' },
    { value: 4, label: 'Cash on Delivery' }
  ];


  readonly paymentStatuses = [
    { value: 1, label: 'Pending' },
    { value: 2, label: 'Paid' },
    { value: 3, label: 'Failed' },
    { value: 4, label: 'Refund Initiated' },
    { value: 5, label: 'Refund Completed' },
    { value: 6, label: 'Refund Cancelled' }
  ];


  ngOnInit(): void {

    const orderId =
      Number(this.route.snapshot.paramMap.get('id'));


    if (!orderId || Number.isNaN(orderId)) {

      this.errorMessage.set(
        'Invalid order ID.'
      );

      return;

    }


    this.loadOrder(orderId);

  }



  loadOrder(id: number): void {

    this.isLoading.set(true);

    this.errorMessage.set('');


    this.orderService
      .getOrderById(id)
      .subscribe({

        next: (order) => {

          this.order.set(order);

          this.isLoading.set(false);

        },

        error: (error) => {

          console.error(
            'Failed to load Manager order details:',
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


  goBack(): void {

    this.router.navigate([
      '/manager/orders'
    ]);

  }



  getStatusLabel(status: number): string {

    return this.orderStatuses.find(
      item => item.value === status
    )?.label || 'Unknown';

  }


  getPaymentMethodLabel(
    paymentMethod: number
  ): string {

    return this.paymentMethods.find(
      item => item.value === paymentMethod
    )?.label || 'Unknown';

  }


  getPaymentStatusLabel(
    paymentStatus: number
  ): string {

    return this.paymentStatuses.find(
      item => item.value === paymentStatus
    )?.label || 'Unknown';

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



  formatDateTime(
    date: string | null | undefined
  ): string {

    if (!date) {
      return '-';
    }


    return new Date(date).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  }

}