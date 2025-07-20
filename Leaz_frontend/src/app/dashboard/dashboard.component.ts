import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiService, Document, Binder } from '../api.service';
import { Router, RouterLink } from '@angular/router';
import { ActionMenuComponent } from '../shared/action-menu/action-menu.component';
import { ConfirmationModalComponent } from '../shared/confirmation-modal/confirmation-modal.component';
import { MoveItemModalComponent } from '../shared/move-item-modal/move-item-modal.component';

/**
 * The main dashboard component, showing recent documents and binders.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ActionMenuComponent, ConfirmationModalComponent, MoveItemModalComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  allBinders: Binder[] = [];
  recentDocuments: Document[] = [];
  recentBinders: Binder[] = [];
  isLoading = true;
  error: string | null = null;

  showDeleteModal = false;
  showMoveModal = false;
  selectedItem: Document | Binder | null = null;
  selectedItemType: 'document' | 'binder' = 'document';
  modalCurrentItemId: number | null = null;
  modalCurrentParentId: number | null = null;

  ngOnInit() { this.fetchDashboardData(); }

  /** Fetches all the data needed for the dashboard view in parallel. */
  fetchDashboardData() {
    this.isLoading = true;
    this.error = null;
    forkJoin({
      documents: this.apiService.getDocuments(),
      binders: this.apiService.getAllBindersForDropdown()
    }).subscribe({
      next: (response) => {
        this.allBinders = response.binders;
        this.recentDocuments = response.documents
          .sort((a: Document, b: Document) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
          .slice(0, 10);
        this.recentBinders = response.binders
          .filter(b => b.parentId === null)
          .sort((a: Binder, b: Binder) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
          .slice(0, 10);
        this.isLoading = false;
      },
      error: (err) => { this.error = 'Could not load dashboard data.'; this.isLoading = false; }
    });
  }

  /** Looks up a binder's name from its ID for display purposes. */
  getBinderName(binderId: number | null): string {
    if (binderId === null) return '—';
    const binder = this.allBinders.find(b => b.id === binderId);
    return binder ? binder.name : 'Unknown';
  }

  // --- Action Handlers ---
  onDelete(item: Document | Binder, type: 'document' | 'binder') {
    this.selectedItem = item;
    this.selectedItemType = type;
    this.showDeleteModal = true;
  }

  onMove(item: Document | Binder, type: 'document' | 'binder') {
    this.selectedItem = item;
    this.selectedItemType = type;
    this.modalCurrentItemId = item.id;
    this.modalCurrentParentId = type === 'document' ? (item as Document).binderId : (item as Binder).parentId;
    this.showMoveModal = true;
  }

  onCopy(doc: Document) { 
    this.apiService.copyDocument(doc.id).subscribe((newDoc) => {
      this.router.navigate(['/documents', newDoc.id]);
    });
  }

  onMarkAsFinal(doc: Document) {
    this.apiService.updateDocumentStatus(doc.id, 'Final').subscribe(() => this.fetchDashboardData());
  }

  // --- Modal Confirmation Handlers ---
  confirmDelete() {
    if (!this.selectedItem) return;
    const deleteObs = this.selectedItemType === 'document' 
      ? this.apiService.deleteDocument(this.selectedItem.id)
      : this.apiService.deleteBinder(this.selectedItem.id);

    deleteObs.subscribe(() => {
      this.closeModals();
      this.fetchDashboardData();
    });
  }

  confirmMove(newParentId: number | null) {
    if (!this.selectedItem) return;
    
    if (this.selectedItemType === 'document') {
      this.apiService.updateDocumentBinder(this.selectedItem.id, newParentId).subscribe(() => {
        this.closeModals();
        this.fetchDashboardData();
      });
    } else { // It's a binder
      this.apiService.updateBinderParent(this.selectedItem.id, newParentId).subscribe(() => {
        this.closeModals();
        this.fetchDashboardData();
      });
    }
  }

  closeModals() {
    this.showDeleteModal = false;
    this.showMoveModal = false;
    this.selectedItem = null;
    this.modalCurrentItemId = null;
    this.modalCurrentParentId = null;
  }
}