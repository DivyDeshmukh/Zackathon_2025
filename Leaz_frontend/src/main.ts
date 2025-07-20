import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

/**
 * This is the main entry point that bootstraps (starts) the Angular application.
 */
bootstrapApplication(AppComponent, {
  // Application-level providers are configured here.
  providers: [
    provideRouter(routes),          // Sets up the application's routing.
    provideHttpClient(withFetch())  // Enables HttpClient and configures it to use the modern `fetch` API.
  ]
}).catch(err => console.error(err));