
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private http = inject(HttpClient);
  // This URL points to the Netlify function, using the redirect from netlify.toml
  private readonly apiUrl = '/api/ask-ai';

  async getHiveExplanation(prompt: string): Promise<string> {
    try {
      // The service now sends a simple HTTP request to our own backend
      const response$ = this.http.post<{ answer: string }>(this.apiUrl, { prompt }).pipe(
        map(response => response.answer)
      );
      // Convert the Observable to a Promise for the component
      return await firstValueFrom(response$);
    } catch (error) {
      console.error('Error calling backend proxy:', error);

      // Try to extract a more specific error message from the proxy's response
      if (error instanceof HttpErrorResponse && error.error?.error) {
         throw new Error(error.error.error);
      }
      
      // Fallback generic error
      throw new Error('The AI assistant is currently unavailable. Please try again later.');
    }
  }
}
