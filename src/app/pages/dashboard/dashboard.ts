import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, timer, tap, finalize } from 'rxjs';
import { ServerMetrics } from '../../models/server-metrics';
import { MetricsService } from '../../services/metrics.service';

/**
 * ✅ MEJOR: Polling declarativo con RxJS
 *
 * Mejoras respecto al antipatrón:
 * 1. timer(0, 5000) → emite inmediatamente y luego cada 5s
 * 2. switchMap → cancela la petición anterior si la nueva empieza (evita amontonamiento)
 * 3. takeUntilDestroyed() → limpieza automática al destruir el componente (sin memory leaks)
 * 4. Usa un servicio inyectado en vez de HttpClient directo
 * 5. Estilo declarativo: el flujo se lee de arriba a abajo
 */
@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, DecimalPipe, UpperCasePipe],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {
  private metricsService = inject(MetricsService);

  metrics = signal<ServerMetrics | null>(null);
  isLoading = signal(false);
  pollingMethod = signal('RxJS timer + switchMap (✅ Declarativo)');

  // ✅ El polling se define como un flujo reactivo declarativo
  private polling$ = timer(0, 5000)
    .pipe(
      // ✅ tap para activar el indicador de carga
      tap(() => this.isLoading.set(true)),
      // ✅ switchMap cancela la petición anterior si aún no ha terminado
      switchMap(() => this.metricsService.fetchMetrics()),
      // ✅ finalize se ejecuta cuando el observable se completa o se destruye
      finalize(() => this.isLoading.set(false)),
      // ✅ takeUntilDestroyed: limpieza automática al destruir el componente
      // No necesitamos OnDestroy ni Subject para desuscribirnos
      takeUntilDestroyed()
    )
    .subscribe((data) => {
      this.metrics.set(data);
      this.isLoading.set(false);
    });

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
