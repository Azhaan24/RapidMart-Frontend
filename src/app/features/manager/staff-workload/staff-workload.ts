import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  AdminStaffWorkloadService,
  StaffWorkload
} from '../../../core/services/admin-staffWorkload.service';
import { DashboardService, ManagerDashboard } from '../../../core/services/admin-dashboard';

@Component({
  selector: 'app-manager-staff-workload',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './staff-workload.html',
  styleUrl: './staff-workload.css'
})
export class ManagerStaffWorkload implements OnInit {

  private workloadService = inject(AdminStaffWorkloadService);
  private readonly dashboardService = inject(DashboardService);

  staffWorkload = signal<StaffWorkload[]>([]);
  dashboard = signal<ManagerDashboard | null>(null);

  isLoading = signal(false);
  errorMessage = signal('');

  pageNumber = signal<number>(1);
  pageSize = signal<number>(10);
  totalCount = signal<number>(0);
  totalPages = signal<number>(0);

  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);


  ngOnInit(): void {
    this.loadDashboard();
    this.loadStaffWorkload();
  }

  loadStaffWorkload(): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.workloadService.getStaffWorkload(this.pageNumber(),this.pageSize()).subscribe({

      next: (data) => {

        this.staffWorkload.set(data.items);

        this.pageNumber.set(data.pageNumber);
        this.pageSize.set(data.pageSize);
        this.totalCount.set(data.totalCount);
        this.totalPages.set(data.totalPages);
        this.hasNextPage.set(data.hasNextPage);
        this.hasPreviousPage.set(data.hasPreviousPage);

        this.isLoading.set(false);
      },

      error: (error) => {

        console.error(
          'Error loading staff workload:',
          error
        );

        this.errorMessage.set(
          'Unable to load staff workload. Please try again.'
        );

        this.isLoading.set(false);
      }

    });
  }

  private loadDashboard(): void{
    this.dashboardService.getManagerDashboard().subscribe({
      next: data => {
        this.dashboard.set(data);
      },
      error: (error) => {
        console.error(
          'Error loading dashboard:',
          error
        );
      }
    });
  }


  refreshWorkload(): void {
    this.loadStaffWorkload();
  }


  getCompletionRate(staff: StaffWorkload): number {

    if (staff.totalOrders === 0) {
      return 0;
    }

    return Math.round(
      (staff.completedOrders / staff.totalOrders) * 100
    );
  }


  getPerformanceLabel(staff: StaffWorkload): string {

    const rate = this.getCompletionRate(staff);

    if (rate >= 80) {
      return 'Excellent';
    }

    if (rate >= 60) {
      return 'Good';
    }

    if (rate >= 40) {
      return 'Average';
    }

    return 'Needs Attention';
  }


  getPerformanceClass(staff: StaffWorkload): string {

    const rate = this.getCompletionRate(staff);

    if (rate >= 80) {
      return 'bg-green-50 text-green-700';
    }

    if (rate >= 60) {
      return 'bg-blue-50 text-blue-700';
    }

    if (rate >= 40) {
      return 'bg-amber-50 text-amber-700';
    }

    return 'bg-red-50 text-red-700';
  }

  goToNextPage(): void {
    this.pageNumber.update(page => page + 1);
    this.loadStaffWorkload();
  }

  goToPreviousPage(): void {
    this.pageNumber.update(page => page - 1);
    this.loadStaffWorkload();
  }
}