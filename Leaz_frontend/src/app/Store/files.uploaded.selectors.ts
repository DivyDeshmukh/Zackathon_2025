import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UploadState } from './files.uploaded.reducer';


export const selectUploadState = createFeatureSelector<UploadState>('upload');

export const selectFilefirstDocument = createSelector(
  selectUploadState,
  (state) => state.firstDocument
);

export const selectFilesecondDocument = createSelector(
  selectUploadState,
  (state) => state.secondDocument

);