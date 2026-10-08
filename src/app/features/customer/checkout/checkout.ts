import { Component, effect, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';

import { Cart,CartService } from '../../../core/services/cart.service';
import { CreateOrderRequest,CreateOrderResponse,Order,OrderService,PaymentMethod,VerifyRazorpayPaymentRequest } from '../../../core/services/order.service';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeliveryService } from '../../../core/services/delivery.service';
import { LocationService } from '../../../core/services/location.service';
import { environment } from '../../../../environments/environment';

declare const Razorpay: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class CheckoutComponent {

  readonly imageBaseUrl = `${environment.imageApi}`;

  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  readonly deliveryService = inject(DeliveryService);
  readonly locationService = inject(LocationService);

  cart = signal<Cart | null>(null);
  pendingPaymentResponse = signal<CreateOrderResponse | null>(null);

  buyNowItem = signal<Product | null>(null);
  buyNowQuantity = signal(1);
  isBuyNowCheckout = signal(false);
  constructor() {
  effect(() => {
    const location =
      this.locationService.location();

    if (!location) {
      return;
    }

    this.deliveryService.loadEstimate(
      location.latitude,
      location.longitude
    );
  });
}

  buyNowSubtotal = computed(() => {
    const product = this.buyNowItem();

    if (!product) {
      return 0;
    }

    return product.price * this.buyNowQuantity();
  });

  checkoutSubtotal = computed(() => {
    if (this.isBuyNowCheckout()) {
      return this.buyNowSubtotal();
    }

    return this.cart()?.total ?? 0;
  });

  deliveryFee = computed(() => {

    const estimate = this.deliveryService.estimate();
    
    if (!estimate || !estimate.isDeliverable) {
      return 0;
    }
    
    return estimate.deliveryFee;
  });

  checkoutTotal = computed(() => {
    return this.checkoutSubtotal() + this.deliveryFee();
  });

  isLoading = signal(true);
  isPlacingOrder = signal(false);
  isLoggedIn = signal(false);

  errorMessage = signal('');

  shippingAddress = signal('');
  customerNotes = signal('');

  selectedPaymentMethod = signal<PaymentMethod>(PaymentMethod.CashOnDelivery);

  placedOrder = signal<Order | null>(null);

  readonly PaymentMethod = PaymentMethod;

  ngOnInit(): void {

    this.checkAuthentication();
    
    /*const buyNowState = history.state?.['buyNow'];

  if (
    buyNowState &&
    buyNowState.itemId &&
    buyNowState.quantity
  ) {
    this.isBuyNowCheckout.set(true);

    this.buyNowQuantity.set(
      Number(buyNowState.quantity)
    );

    this.loadBuyNowProduct(
      Number(buyNowState.itemId)
    );

    return;
  }
    
    this.loadCart();*/
  }

  private checkAuthentication(): void {

    const loggedIn = this.authService.isLoggedIn();

    this.isLoggedIn.set(loggedIn);

    if (loggedIn) {

      const buyNowState = history.state?.['buyNow'];

  if (
    buyNowState &&
    buyNowState.itemId &&
    buyNowState.quantity
  ) {
    this.isBuyNowCheckout.set(true);

    this.buyNowQuantity.set(
      Number(buyNowState.quantity)
    );

    this.loadBuyNowProduct(
      Number(buyNowState.itemId)
    );

    return;
  }

      this.loadCart();
    }
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  private loadCart(): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.cartService.getCart().subscribe({

      next: (cart) => {

        this.cart.set(cart);
        this.isLoading.set(false);

      },

      error: (error) => {

        console.error(
          'Failed to load cart:',
          error
        );

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to load your cart.'
        );

        this.isLoading.set(false);
      }

    });
  }

  private loadBuyNowProduct(itemId: number): void {
  this.isLoading.set(true);
  this.errorMessage.set('');

  this.productService
    .getProductById(itemId)
    .subscribe({
      next: (product) => {
        this.buyNowItem.set(product);
        this.isLoading.set(false);
      },

      error: (error) => {
        console.error(
          'Failed to load Buy Now product:',
          error
        );

        this.errorMessage.set(
          'Unable to load the selected product. Please try again.'
        );

        this.isLoading.set(false);
      }
    });
}

  selectPaymentMethod(
    method: PaymentMethod
  ): void {

    this.selectedPaymentMethod.set(method);
  }

  placeOrder(): void {
  this.errorMessage.set('');

  const address = this.shippingAddress().trim();

  if (!address) {
    this.errorMessage.set(
      'Please enter your shipping address.'
    );
    return;
  }

  const location =
    this.locationService.location();

  if (!location) {
    this.errorMessage.set(
      'Please allow location access so we can calculate delivery.'
    );

    this.locationService.refreshLocation();

    return;
  }

  const deliveryEstimate =
  this.deliveryService.estimate();

if (!deliveryEstimate) {

  this.errorMessage.set(
    'Please wait while we calculate your delivery estimate.'
  );

  this.deliveryService.loadEstimate(
      location.latitude,
      location.longitude
    );

  return;
}

if (!deliveryEstimate.isDeliverable) {

  this.errorMessage.set(
    deliveryEstimate.message ||
    "We don't deliver to your location yet."
  );

  return;
}

  // =========================================================
  // BUY NOW CHECKOUT
  // =========================================================

  if (this.isBuyNowCheckout()) {
    const product = this.buyNowItem();

    if (!product) {
      this.errorMessage.set(
        'The selected product could not be loaded.'
      );
      return;
    }

    const quantity = this.buyNowQuantity();

    if (quantity <= 0) {
      this.errorMessage.set(
        'Invalid product quantity.'
      );
      return;
    }

    const request: CreateOrderRequest = {
      shippingAddress: address,

      customerNotes:
        this.customerNotes().trim() || undefined,

      paymentMethod:
        this.selectedPaymentMethod(),

      latitude: location.latitude,
      longitude: location.longitude,

      items: [
        {
          itemId: product.id,
          quantity: quantity
        }
      ]
    };

    this.createOrder(request);

    return;
  }

  // =========================================================
  // NORMAL CART CHECKOUT
  // =========================================================

  const currentCart = this.cart();

  if (
    !currentCart ||
    currentCart.items.length === 0
  ) {
    this.errorMessage.set(
      'Your cart is empty.'
    );
    return;
  }

  const request: CreateOrderRequest = {
    shippingAddress: address,

    customerNotes:
      this.customerNotes().trim() || undefined,

    paymentMethod:
      this.selectedPaymentMethod(),

    latitude: location.latitude,
    longitude: location.longitude,
  };

  this.createOrder(request);
}

private createOrder(
  request: CreateOrderRequest
): void {
  this.isPlacingOrder.set(true);

  this.orderService
    .createOrder(request)
    .subscribe({
      next: (response: CreateOrderResponse) => {

        if (
          this.selectedPaymentMethod() ===
          PaymentMethod.CashOnDelivery
        ) {
          this.handleOrderCreated(
            response.order
          );

          return;
        }

        if (!response.razorpayPayment) {
          this.isPlacingOrder.set(false);

          this.errorMessage.set(
            'Payment information could not be created. Please try again.'
          );

          return;
        }

        this.pendingPaymentResponse.set(
          response
        );

        this.openRazorpayCheckout(
          response
        );
      },

      error: (error) => {
        console.error(
          'Failed to place order:',
          error
        );

        this.isPlacingOrder.set(false);

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to place your order. Please try again.'
        );
      }
    });
}

  private openRazorpayCheckout(
    response: CreateOrderResponse
  ): void {

    const payment =
      response.razorpayPayment;

    if (!payment) {
      this.isPlacingOrder.set(false);

      this.errorMessage.set(
        'Payment information is missing.'
      );

      return;
    }

    if (typeof Razorpay === 'undefined') {

      this.isPlacingOrder.set(false);

      this.errorMessage.set(
        'Payment gateway could not be loaded. Please refresh the page and try again.'
      );

      return;
    }

    const options = {

      key: payment.keyId,

      amount: Math.round(
        payment.amount * 100
      ),

      currency: payment.currency,

      name: 'RapidMart',

      description:
        `Order ${response.order.orderNumber}`,

      order_id:
        payment.orderId,

      handler: (razorpayResponse: any) => {

        this.verifyPayment(
          response.order,
          razorpayResponse
        );

      },

      modal: {

        ondismiss: () => {

          this.isPlacingOrder.set(false);

          this.errorMessage.set(
            'Payment was not completed. Your order is still pending payment. You can retry the payment or cancel the order.'
          );

        }

      },

      theme: {
        color: '#0B2A4A'
      }
    };

    try {

      const razorpay =
        new Razorpay(options);

      razorpay.on(
  'payment.failed',
  (response: any) => {
    console.error(
      'Razorpay payment failed:',
      response
    );

    this.isPlacingOrder.set(false);

    this.errorMessage.set(
      response?.error?.description ||
      'Payment failed. You can retry the payment or cancel the order.'
    );
  }
);

      razorpay.open();

    } catch (error) {

      console.error(
        'Unable to open Razorpay:',
        error
      );

      this.isPlacingOrder.set(false);

      this.errorMessage.set(
        'Unable to open the payment gateway. Please try again.'
      );
    }
  }

  private verifyPayment(
    order: Order,
    razorpayResponse: any
  ): void {

    const request: VerifyRazorpayPaymentRequest = {

      orderId: order.id,

      razorpayOrderId:
        razorpayResponse.razorpay_order_id,

      razorpayPaymentId:
        razorpayResponse.razorpay_payment_id,

      razorpaySignature:
        razorpayResponse.razorpay_signature
    };

    this.errorMessage.set('');

    this.orderService
      .verifyRazorpayPayment(request)
      .subscribe({

        next: (verifiedOrder) => {

          this.isPlacingOrder.set(false);

          this.handleOrderCreated(
            verifiedOrder
          );

        },

        error: (error) => {

          console.error(
            'Payment verification failed:',
            error
          );

          this.isPlacingOrder.set(false);

          this.errorMessage.set(
            error?.error?.message ||
            'Payment could not be verified. Please contact support.'
          );

        }

      });
  }

  retryPayment(): void {
  const response =
    this.pendingPaymentResponse();

  if (!response) {
    this.errorMessage.set(
      'Payment information is no longer available. Please place the order again.'
    );

    return;
  }

  this.errorMessage.set('');
  this.isPlacingOrder.set(true);

  this.openRazorpayCheckout(response);
}

 private handleOrderCreated(
  order: Order
): void {
  this.pendingPaymentResponse.set(null);
  this.placedOrder.set(order);

  // Only clear the cart after normal cart checkout.
  if (!this.isBuyNowCheckout()) {
    this.cartService.clearLocalCart();
  }
}

  viewOrder(): void {

    const order = this.placedOrder();

    if (!order) {
      return;
    }

    this.router.navigate([
      '/orders',
      order.id
    ]);
  }

  continueShopping(): void {

    this.router.navigate(['/']);
  }

  goToCart(): void {

    this.router.navigate(['/cart']);
  }

  cancelPendingPaymentOrder(): void {
  const response =
    this.pendingPaymentResponse();

  if (!response) {
    return;
  }

  this.isPlacingOrder.set(true);
  this.errorMessage.set('');

  this.orderService
    .cancelOrder(response.order.id)
    .subscribe({
      next: () => {
        this.isPlacingOrder.set(false);

        this.pendingPaymentResponse.set(null);

        this.errorMessage.set(
          'Your order has been cancelled and the reserved stock has been released.'
        );
      },

      error: (error) => {
        console.error(
          'Failed to cancel order:',
          error
        );

        this.isPlacingOrder.set(false);

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to cancel the order. Please try again.'
        );
      }
    });
}
}