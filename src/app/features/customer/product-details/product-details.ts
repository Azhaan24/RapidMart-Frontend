import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';
import { AuthService } from '../../../core/services/auth.service';
import { StoreSettingsService } from '../../../core/services/store-settings.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  readonly storesetting = inject(StoreSettingsService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  product = signal<Product | null>(null);

  categoryId!: number;
  subcategoryId!: number;
  productId!: number;

  cartQuantity = signal(1);
  isAddingToCart = signal(false);
  cartSuccessMessage = signal('');
  cartErrorMessage = signal('');

  returnDays = signal<number>(0);
  returnAvailable = signal<boolean>(false);

  isLoading = signal(true);
  errorMessage = signal('');
  isLoggedIn = signal(false);

  readonly imageBaseUrl = `${environment.imageApi}`;

  ngOnInit(): void {

    this.categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
    this.subcategoryId = Number(this.route.snapshot.paramMap.get('subcategoryId'));
    this.productId = Number(this.route.snapshot.paramMap.get('productId'));

    console.log('Category ID:', this.categoryId);
    console.log('Subcategory ID:', this.subcategoryId);
    console.log('Product ID:', this.productId);

    this.checkAuthentication();
    this.loadProduct();
  }

  private checkAuthentication(): void {
    const loggedIn = this.authService.isLoggedIn();

    this.isLoggedIn.set(loggedIn);
  }

  private getReturnDays(): void {
    this.storesetting.getSettings().subscribe({
      next: data => {
        this.returnDays.set(data.returnDaysWindow);
      }
    });
  }

  private loadProduct(): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.productService.getProductById(this.productId)
    .subscribe({
      next: (product) => {
        console.log('Product:', product);

        this.product.set(product);
        this.isLoading.set(false);

        if(product.returnEligible){
          
          this.getReturnDays();

          this.returnAvailable.set(true);
          
        }
      },

        error: (error) => {
          console.error('Error loading product:',error);

          this.errorMessage.set('Unable to load product. Please try again.');

          this.isLoading.set(false);
        }

    });
  }

  buyNow(): void {
    
    const currentProduct = this.product();

  if (!currentProduct) {
    return;
  }

  if (!currentProduct.isAvailable) {
    this.cartErrorMessage.set(
      'This product is currently unavailable.'
    );
    return;
  }

  if (currentProduct.stockQuantity <= 0) {
    this.cartErrorMessage.set(
      'This product is currently out of stock.'
    );
    return;
  }

  const selectedQuantity = this.cartQuantity();

  if (selectedQuantity > currentProduct.stockQuantity) {
    this.cartErrorMessage.set(
      'Requested quantity exceeds available stock.'
    );
    return;
  }

  if (!this.isLoggedIn()) {
    this.cartErrorMessage.set('Login to your account to place order.');
    return;
  }

  this.cartErrorMessage.set('');
  this.cartSuccessMessage.set('');

  this.router.navigate(
    ['/checkout'],
    {
      state: {
        buyNow: {
          itemId: currentProduct.id,
          quantity: selectedQuantity
        }
      }
    }
  );
  }

  addToCart(): void {
    
    const currentProduct = this.product();
    
    if (!currentProduct) {
      return;
    }
    
    if (!currentProduct.isAvailable) {

      this.cartErrorMessage.set('This product is currently unavailable.');
      
      return;
    }
    
    if (currentProduct.stockQuantity <= 0) {

      this.cartErrorMessage.set('This product is currently out of stock.');
      
      return;
    }
    
    const quantity = this.cartQuantity();
    
    if (quantity > currentProduct.stockQuantity) {
      
      this.cartErrorMessage.set('Requested quantity exceeds available stock.');
      
      return;
    }
    
    this.isAddingToCart.set(true);
    this.cartErrorMessage.set('');
    this.cartSuccessMessage.set('');
    
    this.cartService.addToCart({itemId: currentProduct.id,quantity: quantity})
    .subscribe({
      next: () => {
        this.isAddingToCart.set(false);
        this.cartSuccessMessage.set('Product added to your cart successfully.');
      },
      
      error: (error) => {
        console.error('Failed to add item to cart:',error);
        
        this.isAddingToCart.set(false);
        this.cartErrorMessage.set(error?.error?.message || 'Unable to add this product to your cart.');
      }
    });
  }
  
  increaseCartQuantity(): void {
    
    const currentProduct = this.product();
    
    if (!currentProduct) {
      return;
    }
    
    if (this.cartQuantity() < currentProduct.stockQuantity) {
      this.cartQuantity.update(quantity => quantity + 1);
    }
  }
  
  decreaseCartQuantity(): void {
    if (this.cartQuantity() > 1) {
      this.cartQuantity.update(quantity => quantity - 1);
    }
  }

}