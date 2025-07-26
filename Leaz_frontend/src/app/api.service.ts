import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Data Interfaces ---
// Defines the structure of a Document object, matching the backend model.
export interface Document {
  id: number;
  title: string;
  content: string;
  status: string;
  dateCreated: string;
  lastModified: string;
  binderId: number | null;
}

// Defines the structure of a Binder object.
export interface Binder {
  id: number;
  name: string;
  dateCreated: string;
  parentId: number | null;
}

// A helper type for creating a new document, omitting server-generated fields.
export type NewDocument = Omit<Document, 'id' | 'status' | 'dateCreated' | 'lastModified'>;
// A helper type for creating a new binder.
export type NewBinder = Omit<Binder, 'id' | 'dateCreated'>;

/**
 * A dedicated service to handle all HTTP communication with the backend API.
 * This centralizes all API logic in one place.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private documentsUrl = 'http://localhost:8080/documents';
  private bindersUrl = 'http://localhost:8080/binders';

  // --- Document Methods ---
  getDocuments(): Observable<Document[]> { return this.http.get<Document[]>(this.documentsUrl); }
  getDocumentById(id: number): Observable<Document> { return this.http.get<Document>(`${this.documentsUrl}/${id}`); }
  updateDocument(id: number, document: Document): Observable<Document> { return this.http.put<Document>(`${this.documentsUrl}/${id}`, document); }
  createDocument(document: NewDocument): Observable<Document> { return this.http.post<Document>(this.documentsUrl, document); }
  deleteDocument(id: number): Observable<void> { return this.http.delete<void>(`${this.documentsUrl}/${id}`); }
  updateDocumentBinder(id: number, binderId: number | null): Observable<Document> { return this.http.put<Document>(`${this.documentsUrl}/${id}/move`, { binderId }); }
  updateDocumentStatus(id: number, status: string): Observable<Document> { return this.http.put<Document>(`${this.documentsUrl}/${id}/status`, { status }); }
  copyDocument(id: number): Observable<Document> { return this.http.post<Document>(`${this.documentsUrl}/${id}/copy`, {}); }
  
  // --- Binder Methods ---
  getBinders(parentId?: number): Observable<Binder[]> {
    let params = new HttpParams();
    if (parentId) {
      params = params.append('parentId', parentId.toString());
    }
    return this.http.get<Binder[]>(this.bindersUrl, { params });
  }
  getAllBindersForDropdown(): Observable<Binder[]> { return this.http.get<Binder[]>(`${this.bindersUrl}/all`); }
  getBinderById(id: number): Observable<Binder> { return this.http.get<Binder>(`${this.bindersUrl}/${id}`); }
  getDocumentsByBinderId(binderId: number): Observable<Document[]> { return this.http.get<Document[]>(`${this.bindersUrl}/${binderId}/documents`); }
  createBinder(binder: NewBinder): Observable<Binder> { return this.http.post<Binder>(this.bindersUrl, binder); }
  deleteBinder(id: number): Observable<void> { return this.http.delete<void>(`${this.bindersUrl}/${id}`); }
  updateBinderParent(id: number, parentId: number | null): Observable<Binder> { return this.http.put<Binder>(`${this.bindersUrl}/${id}/move`, { parentId }); }
compareDocuments(formdata:any):Observable<any>{
   return this.http.post<any>('http://localhost:8080/api/contracts/compare-contracts', formdata); 
}
}
