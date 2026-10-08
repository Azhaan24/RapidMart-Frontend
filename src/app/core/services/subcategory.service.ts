import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SubCategory } from '../models/subcategory.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubCategoryService {

  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/subcategories`;

  getSubCategoriesByCategory(categoryId: number): Observable<SubCategory[]> {

    return this.http.get<SubCategory[]>(`${this.apiUrl}/category/${categoryId}`);
  }

  getSubCategoryById(id: number): Observable<SubCategory> {

    return this.http.get<SubCategory>(`${this.apiUrl}/${id}`);
  }
}