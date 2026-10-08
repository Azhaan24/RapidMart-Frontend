import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { SubCategoryService } from '../../../core/services/subcategory.service';
import { SubCategory } from '../../../core/models/subcategory.model';
import { CategoryService } from '../../../core/services/category.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-subcategories',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './subcategories.html',
  styleUrl: './subcategories.css'
})
export class SubcategoriesComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private subCategoryService = inject(SubCategoryService);
  private categoryService = inject(CategoryService);

  subCategories = signal<SubCategory[]>([]);
  categoryName = signal('');

  isLoading = signal(true);
  errorMessage = signal('');

  readonly imageBaseUrl = `${environment.imageApi}`;

  categoryId!: number;


  ngOnInit(): void {

    console.log('SUBCATEGORIES COMPONENT INITIALIZED');

    this.categoryId = Number(
      this.route.snapshot.paramMap.get('categoryId')
    );

    console.log('CATEGORY ID:', this.categoryId);

    this.loadSubCategories();
    this.loadCategoryName();
  }


  private loadCategoryName(): void {

    console.log('CATEGORY API CALL STARTED');

    this.categoryService
      .getCategoryById(this.categoryId)
      .subscribe({

        next: (category) => {

          console.log('CATEGORY RESPONSE:', category);

          this.categoryName.set(category.name);
        },

        error: (error) => {

          console.error(
            'ERROR LOADING CATEGORY:',
            error
          );
        }

      });
  }


  private loadSubCategories(): void {

    console.log('SUBCATEGORY API CALL STARTED');

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.subCategoryService
      .getSubCategoriesByCategory(this.categoryId)
      .subscribe({

        next: (subCategories) => {

          console.log(
            'SUBCATEGORY RESPONSE:',
            subCategories
          );

          this.subCategories.set(subCategories);

          this.isLoading.set(false);

          console.log(
            'SUBCATEGORIES SIGNAL:',
            this.subCategories()
          );
        },

        error: (error) => {

          console.error(
            'ERROR LOADING SUBCATEGORIES:',
            error
          );

          this.errorMessage.set(
            'Unable to load subcategories. Please try again.'
          );

          this.isLoading.set(false);
        }

      });
  }
}