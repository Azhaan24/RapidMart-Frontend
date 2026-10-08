import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResult } from './order.service';
import { SortType } from '../models/sortType';


export interface AdminProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;

  categoryId: number;
  categoryName: string;

  subcategoryId: number;
  subcategoryName: string;

  stockQuantity: number;
  isAvailable: boolean;

  returnEligible: boolean;
}

export interface AdminCategory {
  id: number;
  name: string;
  productCount: number;
  imageUrl?: string | null;
}

export interface AdminSubCategory {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  imageUrl?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AdminCatalogService {

  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}`;


  getProducts(pageNumber : number = 1,pageSize: number = 10,sortBy: SortType = SortType.alphabeticalAsc,available: boolean | null,returnAllowed: boolean | null,search: string): Observable<PagedResult<AdminProduct>> {
    let params = new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize).set('sortBy',sortBy).set('search',search);

    if(available !== null){
      params = params.set('available',available);
    }

    if(returnAllowed !== null){
      params = params.set('returnable',returnAllowed);
    }

    return this.http.get<PagedResult<AdminProduct>>(
      `${this.apiUrl}/Item`,{ params }
    );
  }


  getProductById(id: number): Observable<AdminProduct> {
    return this.http.get<AdminProduct>(
      `${this.apiUrl}/Item/${id}`
    );
  }


  createProduct(formData: FormData): Observable<AdminProduct> {
    return this.http.post<AdminProduct>(
      `${this.apiUrl}/Item`,
      formData
    );
  }


  updateProduct(
    id: number,
    formData: FormData
  ): Observable<AdminProduct> {
    return this.http.put<AdminProduct>(
      `${this.apiUrl}/Item/${id}`,
      formData
    );
  }


  deactivateProduct(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/Item/${id}`
    );
  }

  updateStock(
    id: number,
    quantity: number
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/Item/${id}/stock`,
      {
        quantity: quantity
      }
    );
  }

  getCategories(sortBy: SortType,search: string): Observable<AdminCategory[]> {

    const params = new HttpParams().set('sortBy',sortBy).set('search',search);
    
    return this.http.get<AdminCategory[]>(
      `${this.apiUrl}/categories`,{params}
    );
  }


  createCategory(
    formData: FormData
  ): Observable<AdminCategory> {

    return this.http.post<AdminCategory>(
      `${this.apiUrl}/categories`,
      formData
    );
  }


  updateCategory(
    id: number,
    formData: FormData
  ): Observable<AdminCategory> {

    return this.http.put<AdminCategory>(
      `${this.apiUrl}/categories/${id}`,
      formData
    );
  }


  deleteCategory(
    id: number
  ): Observable<any> {

    return this.http.delete<any>(
      `${this.apiUrl}/categories/${id}`
    );
  }

  getSubCategories(): Observable<AdminSubCategory[]> {
    return this.http.get<AdminSubCategory[]>(
      `${this.apiUrl}/subcategories`
    );
  }


  getSubCategoriesByCategory(
    categoryId: number
  ): Observable<AdminSubCategory[]> {

    return this.http.get<AdminSubCategory[]>(
      `${this.apiUrl}/subcategories/category/${categoryId}`
    );
  }


  createSubCategory(
    formData: FormData
  ): Observable<AdminSubCategory> {

    return this.http.post<AdminSubCategory>(
      `${this.apiUrl}/subcategories`,
      formData
    );
  }


  updateSubCategory(
    id: number,
    formData: FormData
  ): Observable<AdminSubCategory> {

    return this.http.put<AdminSubCategory>(
      `${this.apiUrl}/subcategories/${id}`,
      formData
    );
  }


  deleteSubCategory(
    id: number
  ): Observable<any> {

    return this.http.delete<any>(
      `${this.apiUrl}/subcategories/${id}`
    );
  }
  
}