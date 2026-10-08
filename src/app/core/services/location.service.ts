import { Injectable, signal } from '@angular/core';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private readonly _location = signal<UserLocation | null>(null);
  readonly location = this._location.asReadonly();
  private readonly _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();
  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();
  private locationRequested = false;

  constructor() {}

requestLocation(): void {
  console.log('LocationService: requestLocation() called');

  if (this.locationRequested) {
    console.log('LocationService: already requested');
    return;
  }

  this.locationRequested = true;

  this._error.set(null);
  this._isLoading.set(true);

  console.log('LocationService: checking geolocation...');

  if (!navigator.geolocation) {
    console.log('LocationService: geolocation NOT supported');

    this._isLoading.set(false);
    this._error.set(
      'Location services are not supported by this browser.'
    );

    return;
  }

  console.log('LocationService: geolocation supported');

  navigator.geolocation.getCurrentPosition(

    (position) => {
      console.log('LocationService: SUCCESS', position);

      this._location.set({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });

      this._isLoading.set(false);
    },

    (error) => {
      console.log('LocationService: ERROR', error);

      this._isLoading.set(false);

      switch (error.code) {
        case error.PERMISSION_DENIED:
          this._error.set(
            'Location permission was denied. Please allow location access.'
          );
          break;

        case error.POSITION_UNAVAILABLE:
          this._error.set(
            'Your location is currently unavailable.'
          );
          break;

        case error.TIMEOUT:
          this._error.set(
            'Getting your location took too long. Please try again.'
          );
          break;

        default:
          this._error.set(
            'Unable to get your location.'
          );
      }
    },

    {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 5 * 60 * 1000
    }
  );
}

refreshLocation(): void {
    
    this.locationRequested = false;
    this._location.set(null);
    this._error.set(null);
    this.requestLocation();
  }
}