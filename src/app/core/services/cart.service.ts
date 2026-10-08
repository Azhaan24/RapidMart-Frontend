import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface CartItem {
  id: number;
  itemId: number;
  productName: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  isAvailable: boolean;
  availableQuantity: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

export interface AddToCartRequest {
  itemId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Cart`;
  private readonly cart = signal<Cart | null>(null);
  readonly cartState = this.cart.asReadonly();

  readonly cartItemCount = computed(() => {
    const currentCart = this.cart();

    if (!currentCart) {
      return 0;
    }

    return currentCart.items.reduce((total, item) => total + item.quantity,0);
  });

  getCart(): Observable<Cart> {

    return this.http.get<Cart>(this.apiUrl).pipe(

      tap((cart) => {this.cart.set(cart);})
    );
  }

  addToCart(request: AddToCartRequest): Observable<Cart> {

    return this.http.post<Cart>(`${this.apiUrl}/items`,request)
    .pipe(
      tap((cart) => {this.cart.set(cart);})
    );
  }

  updateCartItem(cartItemId: number,quantity: number): Observable<Cart> {

    return this.http.put<Cart>(`${this.apiUrl}/items/${cartItemId}`,{ quantity })
    .pipe(
      tap((cart) => {
        this.cart.set(cart);
      })
    );
  }

  removeCartItem(cartItemId: number): Observable<void> {

    return this.http.delete<void>(`${this.apiUrl}/items/${cartItemId}`)
    .pipe(
      tap(() => {

        const currentCart = this.cart();

        if (!currentCart) {
          return;
        }

        const updatedItems = currentCart.items.filter(item => item.id !== cartItemId);

        const updatedTotal = updatedItems.reduce((total, item) => total + item.totalPrice,0);

        this.cart.set({...currentCart,items: updatedItems,total: updatedTotal});
      })
    );
  }

  clearCart(): Observable<void> {

    return this.http.delete<void>(this.apiUrl)
    .pipe(
      tap(() => {

        const currentCart = this.cart();

        if (!currentCart) {
          return;
        }

        this.cart.set({...currentCart,items: [],total: 0});
      })
    );
  }

  clearLocalCart(): void {
    this.cart.set(null);
  }
}