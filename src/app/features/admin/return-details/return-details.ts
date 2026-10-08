import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ReturnRequest, ReturnService } from '../../../core/services/return.service';
import { OrderStatus } from '../../../core/services/order.service';

@Component({
  selector: 'app-admin-return-details',
  standalone: true,
  imports: [ DatePipe, DecimalPipe ],
  templateUrl: './return-details.html'
})
export class AdminReturnDetails implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly returnService = inject(ReturnService);

  returnRequest = signal<ReturnRequest | null>(null);

  isLoading = signal(false);
  isProcessing = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  showActionForm = signal(false);

  actionType = signal<'approve' | 'reject' | 'receive' | 'refund' | null>(null);

  actionNotes = signal('');

  restockable = signal(true);

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id || Number.isNaN(id)) {
      this.errorMessage.set(
        'Invalid return request ID.'
      );
      return;
    }

    this.loadReturn(id);
  }

  loadReturn(id: number): void {

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.returnService.getReturnById(id).subscribe({

      next: (data) => {

        this.returnRequest.set(data);

        this.isLoading.set(false);
      },

      error: (error) => {

        console.error(
          'Failed to load return request:',
          error
        );

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to load return request.'
        );

        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate([
      '/admin/returns'
    ]);
  }

  openApproveForm(): void {
    this.actionType.set('approve');
    this.actionNotes.set('');
    this.showActionForm.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  openRejectForm(): void {
    this.actionType.set('reject');
    this.actionNotes.set('');
    this.showActionForm.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  openReceiveForm(): void {
    this.actionType.set('receive');
    this.actionNotes.set('');
    this.restockable.set(true);
    this.showActionForm.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  closeActionForm(): void {
    if (this.isProcessing()) {
      return;
    }

    this.showActionForm.set(false);
    this.actionType.set(null);
    this.actionNotes.set('');
  }

  setActionNotes(value: string): void {
    this.actionNotes.set(value);
  }

  setRestockable(value: boolean): void {
    this.restockable.set(value);
  }

  submitAction(): void {

    const currentReturn = this.returnRequest();

    if (!currentReturn) {
      return;
    }

    if (this.isProcessing()) {
      return;
    }

    const action = this.actionType();

    if (!action) {
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const notes = this.actionNotes().trim();

    if (action === 'approve') {

      this.returnService.approveReturn(currentReturn.id,notes || undefined)
        .subscribe({
          next: () => {
            this.handleActionSuccess(
              'Return request approved successfully.'
            );
          },

          error: (error) => {
            this.handleActionError(
              error,
              'Unable to approve return request.'
            );
          }
        });

      return;
    }

    if (action === 'reject') {

      this.returnService
        .rejectReturn(
          currentReturn.id,
          notes || undefined
        )
        .subscribe({

          next: () => {
            this.handleActionSuccess(
              'Return request rejected successfully.'
            );
          },

          error: (error) => {
            this.handleActionError(
              error,
              'Unable to reject return request.'
            );
          }
        });

      return;
    }

    if (action === 'receive') {

      this.returnService
        .receiveReturn(
          currentReturn.id,
          this.restockable(),
          notes || undefined
        )
        .subscribe({

          next: () => {
            this.handleActionSuccess(
              'Return has been received successfully.'
            );
          },

          error: (error) => {
            this.handleActionError(
              error,
              'Unable to receive return.'
            );
          }
        });

      return;
    }

    if (action === 'refund') {

      this.returnService
        .processRefund(currentReturn.id)
        .subscribe({

          next: () => {
            this.handleActionSuccess(
              'Refund processed successfully.'
            );
          },

          error: (error) => {
            this.handleActionError(
              error,
              'Unable to process refund.'
            );
          }
        });
    }
  }
  
  private handleActionSuccess(message: string): void {
    const currentReturn = this.returnRequest();
    
    this.isProcessing.set(false);
    this.showActionForm.set(false);
    this.actionType.set(null);
    this.actionNotes.set('');
    
    this.successMessage.set(message);
    
    if (currentReturn) {
      this.loadReturn(currentReturn.id);
    }
  }


  private handleActionError(
    error: any,
    fallbackMessage: string
  ): void {

    console.error(
      'Return action failed:',
      error
    );

    this.isProcessing.set(false);

    this.errorMessage.set(
      error?.error?.message ||
      fallbackMessage
    );
  }

  getStatusText(status: number): string {

    switch (status) {

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

  getRefundStatusText(status: number): string {

    switch (status) {

      case 4:
        return 'Refund Initiated';

      case 5:
        return 'Refund Completed';

      case 6:
        return 'Refund Failed';

      default:
        return 'Unknown';
    }
  }

  canApprove(): boolean {

    return this.returnRequest()?.status === OrderStatus.ReturnRequested;
  }

  canReject(): boolean {

    return this.returnRequest()?.status === OrderStatus.ReturnRequested;
  }

  canReceive(): boolean {

    return this.returnRequest()?.status === OrderStatus.ReturnApproved;
  }

  canRefund(): boolean {

    const currentReturn = this.returnRequest();

    if (!currentReturn) {
      return false;
    }

    return (
      currentReturn.status === OrderStatus.Returned &&
      !currentReturn.refund
    );
  }

  getActionTitle(): string {

    switch (this.actionType()) {

      case 'approve':
        return 'Approve Return';

      case 'reject':
        return 'Reject Return';

      case 'receive':
        return 'Receive Return';

      default:
        return '';
    }
  }

  getActionButtonText(): string {

    switch (this.actionType()) {

      case 'approve':
        return 'Approve Return';

      case 'reject':
        return 'Reject Return';

      case 'receive':
        return 'Confirm Received';

      default:
        return 'Confirm';
    }
  }
  
  processRefundImmediately(): void {
    
    const currentReturn = this.returnRequest();
    
    if (!currentReturn || this.isProcessing()) {
      return;
    }
    
    this.isProcessing.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    
    this.returnService.processRefund(currentReturn.id)
    .subscribe({

      next: () => {

        this.handleActionSuccess(
          'Refund processed successfully.'
        );

      },

      error: (error) => {

        this.handleActionError(
          error,
          'Unable to process refund.'
        );

      }

    });
  }
}