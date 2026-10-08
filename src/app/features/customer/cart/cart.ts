import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';

import { Cart,CartItem,CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CurrencyPipe
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);

  readonly imageBaseUrl = `${environment.imageApi}`;

  cart = signal<Cart | null>(null);

  isLoading = signal(false);
  errorMessage = signal('');

  isLoggedIn = signal(false);

  updatingItemId = signal<number | null>(null);
  removingItemId = signal<number | null>(null);

  isClearing = signal(false);

  ngOnInit(): void {
    this.checkAuthentication();
  }

  private checkAuthentication(): void {

    const loggedIn = this.authService.isLoggedIn();

    this.isLoggedIn.set(loggedIn);

    if (loggedIn) {
      this.loadCart();
    }
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  loadCart(): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.cartService.getCart().subscribe({

      next: (cart) => {

        this.cart.set(cart);
        this.isLoading.set(false);
      },

      error: (error) => {

        console.error('Failed to load cart:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to load your cart. Please try again.'
        );

        this.isLoading.set(false);
      }
    });
  }

  increaseQuantity(item: CartItem): void {

    if (!item.isAvailable) {
      return;
    }

    if (item.quantity >= item.availableQuantity) {
      return;
    }

    this.updateQuantity(
      item,
      item.quantity + 1
    );
  }

  decreaseQuantity(item: CartItem): void {

    if (item.quantity <= 1) {
      return;
    }

    this.updateQuantity(
      item,
      item.quantity - 1
    );
  }

  private updateQuantity(
    item: CartItem,
    quantity: number
  ): void {

    this.updatingItemId.set(item.id);

    this.cartService
      .updateCartItem(item.id, quantity)
      .subscribe({

        next: (updatedCart) => {

          this.cart.set(updatedCart);
          this.updatingItemId.set(null);
        },

        error: (error) => {

          console.error(
            'Failed to update cart item:',
            error
          );

          this.errorMessage.set(
            error?.error?.message ||
            'Unable to update the cart item.'
          );

          this.updatingItemId.set(null);
        }
      });
  }

  removeItem(item: CartItem): void {

    this.removingItemId.set(item.id);
    this.errorMessage.set('');

    this.cartService
      .removeCartItem(item.id)
      .subscribe({

        next: () => {

          this.removingItemId.set(null);

          this.loadCart();
        },

        error: (error) => {

          console.error(
            'Failed to remove cart item:',
            error
          );

          this.errorMessage.set(
            error?.error?.message ||
            'Unable to remove this item from your cart.'
          );

          this.removingItemId.set(null);
        }
      });
  }

  clearCart(): void {

    this.isClearing.set(true);
    this.errorMessage.set('');

    this.cartService
      .clearCart()
      .subscribe({

        next: () => {

          this.isClearing.set(false);

          this.loadCart();
        },

        error: (error) => {

          console.error(
            'Failed to clear cart:',
            error
          );

          this.errorMessage.set(
            error?.error?.message ||
            'Unable to clear your cart.'
          );

          this.isClearing.set(false);
        }
      });
  }

  goToCheckout(): void {
  this.router.navigate(['/checkout']);
}

}