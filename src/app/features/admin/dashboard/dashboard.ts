import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminDashboardInterface,DashboardService } from '../../../core/services/admin-dashboard';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ CommonModule,RouterLink ],
  templateUrl: './dashboard.html'
})
export class AdminDashboard implements OnInit {

  private dashboardService = inject(DashboardService);

  dashboard = signal<AdminDashboardInterface | null>(null);

  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.dashboardService.getAdminDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load admin dashboard:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Failed to load dashboard data.'
        );

        this.isLoading.set(false);
      }
    });
  }
}