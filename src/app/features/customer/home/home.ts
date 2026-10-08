import { Component, OnInit, inject, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { SortType } from '../../../core/models/sortType';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,RouterLink,FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})

export class HomeComponent implements OnInit {

  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  categories = signal<Category[]>([]);

  isLoading = signal(true);
  errorMessage = signal('');

  searchText='';

  readonly categoryDisplayLimit = 12;
  readonly imageBaseUrl = `${environment.imageApi}`;

  ngOnInit(): void {
    console.log('COMPONENT INITIALIZED');


    this.loadCategories();
  }

  private loadCategories(): void {
    console.log('API CALL STARTED');

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.categoryService.getCategories(SortType.productCountDesc).subscribe({
      next: (categories) => {
        console.log('API RESPONSE:', categories);

        this.categories.set(categories);
        this.isLoading.set(false);

        //this.cdr.detectChanges();

        console.log('CATEGORIES PROPERTY:', this.categories);
      },

      error: (error) => {
        console.error('Error loading categories:', error);
        console.error('🔥 API ERROR:', error);

        this.errorMessage.set('Unable to load categories. Please try again.');

        this.isLoading.set(false);
      }
    });
  }

  get displayedCategories(): Category[] {
    return this.categories().slice(0, this.categoryDisplayLimit);
  }

  get hasMoreCategories(): boolean {
    return this.categories().length > this.categoryDisplayLimit;
  }

  searchProducts(): void {

    const keyword = this.searchText.trim();

    // Don't search if the box is empty
    if (!keyword) {
      return;
    }

    // Go to products page with search keyword
    this.router.navigate(['/products/search'], {
      queryParams: {
        keyword: keyword
      }
      
    });
  }
}