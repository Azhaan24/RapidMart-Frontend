import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Order,OrderService,OrderStatus,PaymentMethod,PaymentStatus } from '../../../core/services/order.service';
import { CreateReturnRequest, ReturnRequest,ReturnService } from '../../../core/services/return.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css'
})
export class OrderDetailsComponent {

  readonly imageBaseUrl = `${environment.imageApi}`;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly returnService = inject(ReturnService);

  order = signal<Order | null>(null);
  returnRequest = signal<ReturnRequest | null>(null);

  isLoading = signal(true);
  errorMessage = signal('');

  isCancelling = signal(false);

  isReturnFormOpen = signal(false);
  isSubmittingReturn = signal(false);

  returnReason = signal('');
  returnStatus = signal<number>(0);
  refundStatus = signal<number>(0);

  returnErrorMessage = signal('');
  returnSuccessMessage = signal('');

  selectedReturnItems = signal<number[]>([]);
  returnQuantities = signal<Record<number, number>>({});


  readonly OrderStatus = OrderStatus;
  readonly PaymentMethod = PaymentMethod;
  readonly PaymentStatus = PaymentStatus;

  ngOnInit(): void {

    const orderId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!orderId || orderId <= 0) {

      this.errorMessage.set(
        'Invalid order information.'
      );

      this.isLoading.set(false);

      return;
    }

    this.loadOrder(orderId);
  }

  private loadOrder(orderId: number): void {
  this.isLoading.set(true);
  this.errorMessage.set('');

  this.orderService.getOrderById(orderId).subscribe({
    next: order => {
      this.order.set(order);

      if(order.status === OrderStatus.ReturnRequested || order.status === OrderStatus.ReturnApproved || order.status === OrderStatus.ReturnRejected || order.status === OrderStatus.Returned){
        this.loadReturnRequest(orderId);
      }

      this.isLoading.set(false);
    },

    error: error => {
      console.error('Failed to load order:', error);

      this.errorMessage.set(error?.error?.message || 'Unable to load this order.');

      this.isLoading.set(false);
    }
  });
}

  private loadReturnRequest(orderId: number): void {
  this.returnService.getReturnByOrderId(orderId).subscribe({
    next: returns => {
      this.returnRequest.set(returns);

    },

    error: error => {
      console.error('Failed to load return request:', error);
      this.returnRequest.set(null);
    }
  });
}

  getStatusLabel(status: OrderStatus ): string {

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

  getPaymentMethodLabel(method: PaymentMethod): string {

    switch (method) {

      case PaymentMethod.CreditCard:
        return 'Credit Card';

      case PaymentMethod.DebitCard:
        return 'Debit Card';

      case PaymentMethod.UPI:
        return 'UPI';

      case PaymentMethod.CashOnDelivery:
        return 'Cash on Delivery';

      default:
        return 'Unknown';
    }
  }

  getPaymentStatusLabel(status: PaymentStatus): string {

    switch (status) {

      case PaymentStatus.Pending:
        return 'Pending';

      case PaymentStatus.Paid:
        return 'Paid';

      case PaymentStatus.Failed:
        return 'Failed';

      case PaymentStatus.Refund_Initiated:
        return 'Refund Initiated';

      case PaymentStatus.Refund_Completed:
        return 'Refund Completed';

      case PaymentStatus.Refund_Canceled:
        return 'Refund Cancelled';

      default:
        return 'Unknown';
    }
  }

  goBackToOrders(): void {

    this.router.navigate(['/orders']);
  }

  goToHome(): void {

    this.router.navigate(['/']);
  }

  cancelOrder(): void {

  const currentOrder = this.order();

  if (!currentOrder) {
    return;
  }

  const confirmed = window.confirm('Are you sure you want to cancel this order?');

  if (!confirmed) {
    return;
  }

  this.isCancelling.set(true);
  this.errorMessage.set('');

  this.orderService
    .cancelOrder(currentOrder.id)
    .subscribe({

      next: () => {

        this.isCancelling.set(false);

        // Reload the order so the UI gets the
        // latest status and payment information.
        this.loadOrder(currentOrder.id);

      },

      error: (error) => {

        console.error(
          'Failed to cancel order:',
          error
        );

        this.isCancelling.set(false);

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to cancel this order. Please try again.'
        );

      }

    });
}

isStatusCompleted(
  status: OrderStatus,
  currentStatus: OrderStatus
): boolean {
  const statusOrder = [
    OrderStatus.Pending,
    OrderStatus.Confirmed,
    OrderStatus.Processing,
    OrderStatus.OutForDelivery,
    OrderStatus.Delivered
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);
  const statusIndex = statusOrder.indexOf(status);

  if (currentIndex === -1 || statusIndex === -1) {
    return false;
  }

  return statusIndex < currentIndex;
}

isCurrentStatus(
  status: OrderStatus,
  currentStatus: OrderStatus
): boolean {
  return status === currentStatus;
}

isCancelledOrder(): boolean {
  return this.order()?.status === OrderStatus.Cancelled;
}

isReturnStatus(): boolean {
  return this.order()?.status === (OrderStatus.ReturnRequested || OrderStatus.ReturnApproved || OrderStatus.ReturnRejected || OrderStatus.Returned);
}

getReturnStatusLabel(): string {
  const returnRequest = this.returnRequest();

  if (!returnRequest) {
    return '';
  }

  switch (returnRequest.status) {
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

getReturnStatusClass(): string {
  const returnRequest = this.returnRequest();

  if (!returnRequest) {
    return '';
  }

  switch (returnRequest.status) {
    case OrderStatus.ReturnRequested:
      return 'bg-orange-100 text-orange-700';

    case OrderStatus.ReturnApproved:
      return 'bg-green-100 text-green-700';

    case OrderStatus.ReturnRejected:
      return 'bg-red-100 text-red-700';

    case OrderStatus.Returned:
      return 'bg-green-100 text-green-700';

    default:
      return 'bg-gray-100 text-gray-700';
  }
}

openReturnForm(): void {

  this.returnReason.set('');
  this.returnErrorMessage.set('');
  this.returnSuccessMessage.set('');

  this.selectedReturnItems.set([]);
  this.returnQuantities.set({});

  this.isReturnFormOpen.set(true);
}


closeReturnForm(): void {
  if (this.isSubmittingReturn()) {
    return;
  }

  this.isReturnFormOpen.set(false);
  this.returnReason.set('');
  this.returnErrorMessage.set('');
}

submitReturnRequest(): void {

  const currentOrder = this.order();

  if (!currentOrder) {
    return;
  }

  const reason = this.returnReason().trim();

  if (!reason) {

    this.returnErrorMessage.set(
      'Please enter a reason for the return.'
    );

    return;
  }

  const selectedItems =
    this.selectedReturnItems();

  if (selectedItems.length === 0) {

    this.returnErrorMessage.set(
      'Please select at least one item to return.'
    );

    return;
  }

  const returnItems = selectedItems.map(
    orderItemId => ({
      orderItemId,
      quantity: this.getReturnQuantity(orderItemId)
    })
  );

  this.isSubmittingReturn.set(true);
  this.returnErrorMessage.set('');
  this.returnSuccessMessage.set('');

  const request: CreateReturnRequest = {
    orderId: currentOrder.id,
    items: returnItems,
    reason
  };

  this.returnService
    .createReturnRequest(request)
    .subscribe({

      next: () => {

        this.isSubmittingReturn.set(false);

        this.isReturnFormOpen.set(false);

        this.returnSuccessMessage.set(
          'Your return request has been submitted successfully.'
        );

        this.selectedReturnItems.set([]);
        this.returnQuantities.set({});
        this.returnReason.set('');

        this.loadReturnRequest(currentOrder.id);
      },

      error: (error) => {

        console.error(
          'Failed to submit return request:',
          error
        );

        this.isSubmittingReturn.set(false);

        this.returnErrorMessage.set(
          error?.error?.message ||
          'Unable to submit return request.'
        );
      }
    });
}

toggleReturnItem(itemId: number): void {

  const selected = [...this.selectedReturnItems()];

  if (selected.includes(itemId)) {

    this.selectedReturnItems.set(
      selected.filter(id => id !== itemId)
    );

    const quantities = {
      ...this.returnQuantities()
    };

    delete quantities[itemId];

    this.returnQuantities.set(quantities);

    return;
  }

  const currentOrder = this.order();

  if (!currentOrder) {
    return;
  }

  const item = currentOrder.items.find(
    orderItem => orderItem.id === itemId
  );

  if (!item) {
    return;
  }

  this.selectedReturnItems.set([
    ...selected,
    itemId
  ]);

  this.returnQuantities.set({
    ...this.returnQuantities(),
    [itemId]: 1
  });
}


isReturnItemSelected(itemId: number): boolean {

  return this.selectedReturnItems().includes(itemId);
}


getReturnQuantity(itemId: number): number {

  return this.returnQuantities()[itemId] ?? 1;
}


setReturnQuantity(
  itemId: number,
  quantity: number
): void {

  const currentOrder = this.order();

  if (!currentOrder) {
    return;
  }

  const item = currentOrder.items.find(
    orderItem => orderItem.id === itemId
  );

  if (!item) {
    return;
  }

  const safeQuantity = Math.max(
    1,
    Math.min(quantity, item.quantity)
  );

  this.returnQuantities.set({
    ...this.returnQuantities(),
    [itemId]: safeQuantity
  });
}


increaseReturnQuantity(itemId: number): void {

  const currentQuantity =
    this.getReturnQuantity(itemId);

  this.setReturnQuantity(
    itemId,
    currentQuantity + 1
  );
}


decreaseReturnQuantity(itemId: number): void {

  const currentQuantity =
    this.getReturnQuantity(itemId);

  this.setReturnQuantity(
    itemId,
    currentQuantity - 1
  );
}


}