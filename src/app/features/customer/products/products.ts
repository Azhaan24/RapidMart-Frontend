import { Component, OnInit, inject,signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SubCategoryService } from '../../../core/services/subcategory.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { SubCategory } from '../../../core/models/subcategory.model';
import { SortType } from '../../../core/models/sortType';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private subCategoryService = inject(SubCategoryService);

  readonly SortType = SortType;

  products = signal<Product[]>([]);
  curentProducts = signal<Product[]>([]);

  isLoading = signal(true);
  errorMessage = signal('');

  subCategoryId!: number;
  categoryId!: number;
  subCategory!: SubCategory;
  

  pageNumber = signal<number>(1);
  pageSize = signal<number>(15);
  totalPages = signal<number>(0);
  totalCount = signal<number>(0);

  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);

  sortBy = signal<SortType>(SortType.alphabeticalAsc);
  available = signal<boolean | null>(null);
  returnable = signal<boolean | null>(null);

  showSort = signal(false);
  showFilters = signal(false);

  filterSortBy = signal<SortType>(SortType.alphabeticalAsc);
  filterAvailable = signal<boolean | null>(null);
  filterReturnable = signal<boolean | null>(null);

  readonly imageBaseUrl = `${environment.imageApi}`;

  ngOnInit(): void {

    this.categoryId = Number(
      this.route.snapshot.paramMap.get('categoryId')
    );

    this.subCategoryId = Number(
      this.route.snapshot.paramMap.get('subcategoryId')
    );

    console.log('Category ID:', this.categoryId);
    console.log('Subcategory ID:', this.subCategoryId);

    this.loadSubCategory();
    this.loadProducts();

  }

  private loadSubCategory(): void {

    this.subCategoryService
      .getSubCategoryById(this.subCategoryId)
      .subscribe({
        next: (subCategory) => {
          this.subCategory = subCategory;
        },
        error: (error) => {
          console.error('Error loading subcategory:', error);
        }
      });
  }

  private loadProducts(): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.productService
      .getProductsBySubCategory(
        this.subCategoryId,
        this.pageNumber(),
        this.pageSize(),
        this.sortBy(),
        this.available(),
        this.returnable()
      )
      .subscribe({

        next: (products) => {

          if(products.pageNumber === 1){

            this.products.set([...this.curentProducts(),...products.items]);

            this.pageNumber.set(products.pageNumber);
            this.pageSize.set(products.pageSize);
            this.totalPages.set(products.totalPages);
            this.totalCount.set(products.totalCount);
            this.hasNextPage.set(products.hasNextPage);
            this.hasPreviousPage.set(products.hasPreviousPage);

            this.isLoading.set(false);
          }

          else{
            this.products.set(products.items);

            this.pageNumber.set(products.pageNumber);
            this.pageSize.set(products.pageSize);
            this.totalPages.set(products.totalPages);
            this.totalCount.set(products.totalCount);
            this.hasNextPage.set(products.hasNextPage);
            this.hasPreviousPage.set(products.hasPreviousPage);

          this.isLoading.set(false);
          }

          
        },

        error: (error) => {

          console.error('Error loading products:', error);

          this.errorMessage
            .set('Unable to load products. Please try again.');

          this.isLoading.set(false);
        }
      });
  }

  toggleSort(): void {
    this.showSort.update(value => !value);
    this.showFilters.set(false);
  }

  selectSort(sort: SortType): void {

    this.sortBy.set(sort);

    this.pageNumber.set(1);
    this.pageSize.set(15);

    this.showSort.set(false);

    this.loadProducts();
  }

  toggleFilters(): void {

    if (!this.showFilters()) {
      this.filterSortBy.set(this.sortBy());
      this.filterAvailable.set(this.available());
      this.filterReturnable.set(this.returnable());
    }

    this.showFilters.update(value => !value);
    this.showSort.set(false);
  }

  applyFilters(): void {

    this.sortBy.set(this.filterSortBy());
    this.available.set(this.filterAvailable());
    this.returnable.set(this.filterReturnable());

    this.pageNumber.set(1);
    this.pageSize.set(15);

    this.showFilters.set(false);

    this.loadProducts();
  }

  clearFilters(): void {

    this.sortBy.set(SortType.alphabeticalAsc);
    this.available.set(null);
    this.returnable.set(null);

    this.filterSortBy.set(SortType.alphabeticalAsc);
    this.filterAvailable.set(null);
    this.filterReturnable.set(null);

    this.pageNumber.set(1);
    this.pageSize.set(15);

    this.showFilters.set(false);

    this.loadProducts();
  }

  get hasMoreProducts(): boolean {

    return this.hasNextPage();
  }

  loadMore(): void {

    if(this.hasMoreProducts){

       this.curentProducts.set(this.products());

      this.pageNumber.update(page => page + 1);
      this.loadProducts();
    }
  }
}