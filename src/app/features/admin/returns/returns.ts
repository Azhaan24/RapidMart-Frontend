import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { ReturnRequest,ReturnService } from '../../../core/services/return.service';
import { AdminDashboardInterface, DashboardService } from '../../../core/services/admin-dashboard';

@Component({
  selector: 'app-admin-returns',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe
  ],
  templateUrl: './returns.html'
})
export class AdminReturns implements OnInit {

  private readonly returnService = inject(ReturnService);
  readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  returns = signal<ReturnRequest[]>([]);
  dashboard = signal<AdminDashboardInterface | null>(null);

  pageNumber = signal<number>(1);
  pageSize = signal<number>(10);
  totalPages = signal<number>(0);
  totalCount = signal<number>(0);

  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);

  filteredReturns = signal<ReturnRequest[]>([]);

  isLoading = signal(false);

  errorMessage = signal('');

  selectedStatus = signal<number | null>(null);

  showPendingOnly = signal(false);

  ngOnInit(): void {
    this.loadDashboard();
    this.loadReturns();
  }


  loadReturns(): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.returnService.getAllReturns(this.pageNumber(),this.pageSize(),this.selectedStatus()).subscribe({

      next: (data) => {

        this.returns.set(data.items);

        this.pageNumber.set(data.pageNumber);
        this.pageSize.set(data.pageSize);
        this.totalCount.set(data.totalCount);
        this.totalPages.set(data.totalPages);
        this.hasNextPage.set(data.hasNextPage);
        this.hasPreviousPage.set(data.hasPreviousPage);


        this.isLoading.set(false);
      },

      error: (error) => {

        console.error('Failed to load returns:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to load return requests.'
        );

        this.isLoading.set(false);
      }

    });
  }

  private loadDashboard(): void {
    this.dashboardService.getAdminDashboard().subscribe({
      next: data => {
        this.dashboard.set(data);
      },
      error: (error) => {

        console.error('Failed to load dashboard:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to load dashboard.'
        );

        this.isLoading.set(false);
      }
    });
  }


  viewDetails(returnId: number): void {

    this.router.navigate([
      '/admin/returns',
      returnId
    ]);

  }


  setStatusFilter(status: number | null): void {

    this.selectedStatus.set(status);

    this.pageNumber.set(1);
    this.pageSize.set(10);

    this.loadReturns();
  }


  togglePendingOnly(): void {

    this.showPendingOnly.update(
      value => !value
    );

      this.pageNumber.set(1);
      this.pageSize.set(10);

    if (this.showPendingOnly()) {

      this.selectedStatus.set(7);
    }

    else{

      this.selectedStatus.set(null);

    }

    this.loadReturns();
  }


  getStatusText(status: number): string {

    switch (status) {

      case 1:
        return 'Pending';

      case 2:
        return 'Confirmed';

      case 3:
        return 'Processing';

      case 4:
        return 'Out for Delivery';

      case 5:
        return 'Delivered';

      case 6:
        return 'Cancelled';

      case 7:
        return 'Return Requested';

      case 8:
        return 'Return Approved';

      case 9:
        return 'Return Rejected';

      case 10:
        return 'Returned';

      default:
        return 'Unknown';
    }
  }


  getStatusClass(status: number): string {

    switch (status) {

      case 7:
        return 'bg-amber-100 text-amber-700';

      case 8:
        return 'bg-blue-100 text-blue-700';

      case 9:
        return 'bg-red-100 text-red-700';

      case 10:
        return 'bg-green-100 text-green-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  goToPreviousPage(): void {
    this.pageNumber.update(page => page - 1);
        this.loadReturns();
  }

  goToNextPage(): void {
    this.pageNumber.update(page => page + 1);
    this.loadReturns();
  }
}