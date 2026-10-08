import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit {

  private categoryService = inject(CategoryService);


  categories = signal<Category[]>([]);

  isLoading = signal(true);
  errorMessage = signal('');


  readonly imageBaseUrl = `${environment.imageApi}`;


  ngOnInit(): void {
    this.loadCategories();
  }


  private loadCategories(): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.categoryService
      .getCategories()
      .subscribe({

        next: (categories) => {

          console.log('Categories:', categories);

          this.categories.set(categories);
          this.isLoading.set(false);

        },

        error: (error) => {

          console.error(
            'Error loading categories:',
            error
          );

          this.errorMessage.set(
            'Unable to load categories. Please try again.'
          );

          this.isLoading.set(false);

        }

      });

  }

}