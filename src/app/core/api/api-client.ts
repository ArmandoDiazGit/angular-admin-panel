import { inject, Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '@env/environment';
import { toApiError } from './api-error';

/**
 * The single place that knows about the API base URL, headers and error mapping.
 * Feature code must go through this instead of injecting HttpClient directly.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly zone = inject(NgZone);
  private readonly baseUrl = environment.apiUrl.replace(/\/$/, '');

  get<T>(path: string): Observable<T> {
    return this.withErrorMapping(this.http.get<T>(this.url(path)));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.withErrorMapping(this.http.put<T>(this.url(path), body));
  }

  delete<T>(path: string): Observable<T> {
    return this.withErrorMapping(this.http.delete<T>(this.url(path)));
  }

  /**
   * Wraps a server-sent event endpoint as a stream of "something changed" ticks.
   * zone.js does not patch EventSource, so the emit is re-entered into Angular's
   * zone here — at the framework boundary — instead of leaking NgZone into features.
   */
  eventStream(path: string): Observable<void> {
    return new Observable<void>((subscriber) => {
      const source = new EventSource(this.url(path));

      source.onmessage = () => this.zone.run(() => subscriber.next());
      source.onerror = () => {
        // The browser reconnects on its own; surface nothing and keep the stream open.
      };

      return () => source.close();
    });
  }

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private withErrorMapping<T>(request: Observable<T>): Observable<T> {
    return request.pipe(catchError((error: unknown) => throwError(() => toApiError(error))));
  }
}
