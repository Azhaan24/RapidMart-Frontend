import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';
import { PagedResult } from './order.service';
import { SortType } from '../models/sortType';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}`;

  getProductsBySubCategory(
    subCategoryId: number, pageNumber: number = 1,pageSize: number = 10,sortBy: SortType = SortType.alphabeticalAsc,available: boolean | null,returnAllowed: boolean | null): Observable<PagedResult<Product>> {
    let params = new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize).set('sortBy',sortBy);

    if(available !== null){
      params = params.set('available',available);
    }

    if(returnAllowed !==null)
    {
     params = params.set('returnable',returnAllowed);
    }

    return this.http.get<PagedResult<Product>>(`${this.apiUrl}/Item/subcategory/${subCategoryId}`,{params});
  }

  getProductById(id: number): Observable<Product> {

    return this.http.get<Product>(`${this.apiUrl}/Item/${id}`);
  }

  searchProducts(keyword: string,pageNumber: number = 1,pageSize: number = 10,sortBy: SortType = SortType.alphabeticalAsc,available: boolean | null,returnAllowed: boolean | null ): Observable<PagedResult<any[]>> {

    let params = new HttpParams().set('keyword',keyword).set('pageNumber',pageNumber).set('pageSize',pageSize).set('sortBy',sortBy);

    if(available !== null)
    {
      params = params.set('available',available);
    }

    if(returnAllowed !== null)
    {
      params = params.set('returnable',returnAllowed);
    }
    
    return this.http.get<PagedResult<any[]>>(`${this.apiUrl}/Item/search`,{params});
  }
}