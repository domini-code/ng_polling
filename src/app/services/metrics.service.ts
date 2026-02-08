import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerMetrics } from '../models/server-metrics';

@Injectable({ providedIn: 'root' })
export class MetricsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4200/api/metrics';

  fetchMetrics(): Observable<ServerMetrics> {
    return this.http.get<ServerMetrics>(this.apiUrl);
  }
}
