import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { ServerMetrics } from '../../models/server-metrics';

/**
 * ❌ ANTIPATRÓN: Polling con setInterval
 *
 * Problemas:
 * 1. setInterval dispara detección de cambios en TODA la app (Zone Pollution)
 * 2. Si el componente se destruye, el interval sigue ejecutándose (Memory Leak)
 * 3. Las peticiones HTTP se amontonan si la anterior no ha terminado
 * 4. No hay manejo de errores
 * 5. Lógica imperativa difícil de mantener
 */
@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, DecimalPipe, UpperCasePipe],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);

  metrics = signal<ServerMetrics | null>(null);
  isLoading = signal(false);
  pollingMethod = signal('setInterval (❌ Antipatrón)');

  ngOnInit() {
    // ❌ Petición inicial
    this.fetchData();

    // ❌ setInterval: cada tick dispara detección de cambios en TODA la app
    setInterval(() => {
      // ❌ Si la petición anterior no ha terminado, se amontona otra encima
      this.fetchData();
    }, 5000);
    // ❌ Si el componente se destruye, este interval SIGUE ejecutándose → Memory Leak
  }

  private fetchData() {
    this.isLoading.set(true);
    // ❌ subscribe sin cleanup: otra fuente de memory leaks
    this.http.get<ServerMetrics>('/api/metrics').subscribe((data) => {
      this.metrics.set(data);
      this.isLoading.set(false);
    });
    // ❌ Sin manejo de errores: si falla, isLoading queda en true para siempre
  }

  // --- UI Helpers ---
  protected statusClass = () => {
    const status = this.metrics()?.status;
    switch (status) {
      case 'healthy':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'degraded':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'critical':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  protected statusDotClass = () => {
    const status = this.metrics()?.status;
    switch (status) {
      case 'healthy':
        return 'bg-emerald-400';
      case 'degraded':
        return 'bg-amber-400';
      case 'critical':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };
}
