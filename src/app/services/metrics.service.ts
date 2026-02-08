import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServerMetrics } from '../models/server-metrics';

@Injectable({ providedIn: 'root' })
export class MetricsService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = 'http://localhost:3001/api/metrics';

  fetchMetrics(): Observable<ServerMetrics> {
  return this._http.get<ServerMetrics>(this._apiUrl);
  }
}
