import { createReducer, on } from '@ngrx/store';
import { uploadFile } from './files.uploaded.actions';


export interface UploadState {
  firstDocument: File | null;
  secondDocument: File | null;
}

const initialState: UploadState = {
  firstDocument: null,
  secondDocument: null
};

export const uploadReducer = createReducer(
  initialState,
  on(uploadFile, (state, { fileType, file }) => ({
    ...state,
    [fileType]: file
  }))
);