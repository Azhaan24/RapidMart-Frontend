import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface DeliveryEstimate {
  isDeliverable: boolean;
  distanceKm: number;
  deliveryFee: number;
  estimatedMinutes: number;
  message: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Delivery`;

  private readonly _estimate = signal<DeliveryEstimate | null>(null);

  readonly estimate = this._estimate.asReadonly();

  private readonly _isLoading = signal(false);

  readonly isLoading = this._isLoading.asReadonly();

  private readonly _error = signal<string | null>(null);

  readonly error = this._error.asReadonly();

  private lastLatitude: number | null = null;
  private lastLongitude: number | null = null;

  loadEstimate(latitude: number,longitude: number): void {
  
    if (this.lastLatitude === latitude && this.lastLongitude === longitude && this._estimate() !== null) {
      return;
    }

    this.lastLatitude = latitude;
    this.lastLongitude = longitude;

    this._isLoading.set(true);
    this._error.set(null);

    this.http.get<DeliveryEstimate>(`${this.apiUrl}/estimate`,
      {
        params: {
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }
      }
    ).subscribe({

      next: (estimate) => {

        this._estimate.set(estimate);

        this._isLoading.set(false);
      },

      error: (error) => {

        console.error('Failed to load delivery estimate:',error);

        this.lastLatitude = null;
        this.lastLongitude = null;

        this._estimate.set(null);

        this._error.set(error?.error?.message || 'Unable to calculate delivery estimate.');

        this._isLoading.set(false);
      }
    });
  }

  clearEstimate(): void {

    this.lastLatitude = null;
    this.lastLongitude = null;

    this._estimate.set(null);
    this._error.set(null);
    this._isLoading.set(false);
  }
}