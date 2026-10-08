import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../../core/services/product.service';
import { SortType } from '../../../core/models/sortType';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './product-search.html',
  styleUrl: './product-search.css'
})
export class ProductSearch implements OnInit {

  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  readonly SortType = SortType;


  products = signal<any[]>([]);

  keyword = signal('');

  sortBy = signal<SortType>(SortType.alphabeticalAsc);
  available = signal<boolean | null>(null);
  returnAllowed = signal<boolean | null>(null);

  showFilters = signal(false);
  showSort = signal(false);

  filterSortBy = signal<SortType>(SortType.alphabeticalAsc);
  filterAvailable = signal<boolean | null>(null);
  filterReturnAllowed = signal<boolean | null>(null);

  isLoading = signal(false);
  errorMessage = signal('');

  pageNumber = signal<number>(1);
  pageSize = signal<number>(10);
  totalCount = signal<number>(0);
  totalPages = signal<number>(0);

  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);

  readonly imageBaseUrl = `${environment.imageApi}`;


  ngOnInit(): void {

    console.log('PRODUCT SEARCH COMPONENT IS RUNNING');

    this.route.queryParamMap.subscribe(params => {

      const keywordFromUrl = params.get('keyword') || '';

      console.log('Keyword from URL:', keywordFromUrl);

      const cleanedKeyword = keywordFromUrl.trim();

      this.keyword.set(cleanedKeyword);

      console.log('Component keyword:', cleanedKeyword);

      if (cleanedKeyword) {

        this.pageNumber.set(1);
        this.searchProducts(cleanedKeyword);

      } else {

        this.products.set([]);

      }

    });

  }



  toggleFilters(): void {

    if (!this.showFilters()) {

      this.filterSortBy.set(this.sortBy());
      this.filterAvailable.set(this.available());
      this.filterReturnAllowed.set(this.returnAllowed());

    }

    this.showFilters.update(value => !value);

  }


  applyFilters(): void {

    this.sortBy.set(this.filterSortBy());
    this.available.set(this.filterAvailable());
    this.returnAllowed.set(this.filterReturnAllowed());

    this.pageNumber.set(1);
    this.pageSize.set(10);

    this.showFilters.set(false);

    this.searchProducts(this.keyword());

  }


  clearFilters(): void {

    this.sortBy.set(SortType.alphabeticalAsc);
    this.available.set(null);
    this.returnAllowed.set(null);

    this.filterSortBy.set(SortType.alphabeticalAsc);
    this.filterAvailable.set(null);
    this.filterReturnAllowed.set(null);

    this.pageNumber.set(1);
    this.pageSize.set(10);

    this.showFilters.set(false);

    this.searchProducts(this.keyword());

  }


  searchProducts(
    keyword: string,
    append: boolean = false
  ): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    if (!append) {
      this.products.set([]);
    }

    this.productService
      .searchProducts(
        keyword,
        this.pageNumber(),
        this.pageSize(),
        this.sortBy(),
        this.available(),
        this.returnAllowed()
      )
      .subscribe({

        next: (response) => {

          console.log('Search results:', response);

          if (append) {

            this.products.update(current => [
              ...current,
              ...response.items
            ]);

          } else {

            this.products.set(response.items);

          }

          this.isLoading.set(false);

          this.pageNumber.set(response.pageNumber);
          this.pageSize.set(response.pageSize);
          this.totalCount.set(response.totalCount);
          this.totalPages.set(response.totalPages);
          this.hasNextPage.set(response.hasNextPage);
          this.hasPreviousPage.set(response.hasPreviousPage);

        },

        error: (error) => {

          console.error('Product search error:', error);

          this.isLoading.set(false);

          this.errorMessage.set(
            error?.error?.message ||
            'Unable to search products.'
          );

        }

      });

  }


  loadMore(): void {

    this.pageNumber.update(page => page + 1);

    this.searchProducts(
      this.keyword(),
      true
    );

  }


  getImageUrl(imageUrl: string): string {

    if (!imageUrl) {
      return 'assets/product-placeholder.png';
    }

    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    return `${this.imageBaseUrl}${imageUrl}`;

  }

}