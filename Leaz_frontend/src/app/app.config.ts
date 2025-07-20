import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http'; 
import { routes } from './app.routes';
import { uploadReducer } from '../app/Store/files.uploaded.reducer';
import { provideStore } from '@ngrx/store';
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
     provideStore({ upload: uploadReducer })
  ]
};
