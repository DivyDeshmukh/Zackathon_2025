import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, map, Observable } from 'rxjs';
import { ApiService, Document, Binder } from '../api.service';
import { Router, RouterLink } from '@angular/router';
import { ActionMenuComponent } from '../shared/action-menu/action-menu.component';
import { ConfirmationModalComponent } from '../shared/confirmation-modal/confirmation-modal.component';
import { MoveItemModalComponent } from '../shared/move-item-modal/move-item-modal.component';
import { Store } from '@ngrx/store';
import { uploadFile } from '../Store/files.uploaded.actions';
import { selectFilefirstDocument, selectFilesecondDocument } from '../Store/files.uploaded.selectors';
import { SafeResourceUrl,DomSanitizer } from '@angular/platform-browser';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
/**
 * The main dashboard component, showing recent documents and binders.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  styleUrl:'./dashboard.component.scss',
  imports: [CommonModule, RouterLink, ActionMenuComponent, ConfirmationModalComponent, MoveItemModalComponent,MatExpansionModule,MatProgressBarModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {

  private apiService = inject(ApiService);
  private router = inject(Router);
   // Anjalee's Code Starts Here
   private store = inject(Store);
  firstDocument: File | null = null;
  secondDocument:File | null = null;
  comparisonResult: any;
   ngOnInit() {  }
 
onFileSelected(type:'firstDocument'|'secondDocument',event:any){
const file = event.target.files[0];
if(type == 'firstDocument'){
  this.firstDocument = file
}else if(type == 'secondDocument'){
  this.secondDocument = file
}
if(file){
     this.store.dispatch(uploadFile({ fileType: type, file }));
}
}
removeFile(type: 'firstDocument' | 'secondDocument') {
  if (type === 'firstDocument') {
    this.firstDocument = null;
  }else if(type =='secondDocument'){
  this.secondDocument = null
  }
}
onSubmit() {
  if (this.firstDocument && this.secondDocument) {
    const formData = new FormData();
    formData.append('firstDocument', this.firstDocument);
    formData.append('secondDocument', this.secondDocument);

    this.apiService.compareDocuments(formData).subscribe({
      next: (res:any) => {
        console.log('Comparison Success:', res);
        this.comparisonResult = res;
      },
      error: (err:Error) => {
        console.error('Comparison Failed:', err);
        alert('Something went wrong during file comparison.');
      }
    });
  } else {
    alert("Please upload both files before submitting.");
  }
}

}