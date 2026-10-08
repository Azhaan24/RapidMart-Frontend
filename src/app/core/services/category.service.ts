import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Category } from '../models/category.model';
import { environment } from '../../../environments/environment';
import { SortType } from '../models/sortType';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/categories`;

  getCategories(sortBy: SortType = SortType.productCountDesc): Observable<Category[]> {
    const params = new HttpParams().set('sortBy',sortBy);
    return this.http.get<Category[]>(this.apiUrl,{params});
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }
}