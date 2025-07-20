import { createAction, props } from '@ngrx/store';

export const uploadFile = createAction(
  'Upload File',
  props<{ fileType: 'firstDocument'|'secondDocument'; file: File }>()
);