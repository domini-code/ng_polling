import { Component, inject, NgZone, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, timer, tap } from 'rxjs';
import { ServerMetrics } from '../../models/server-metrics';
import { MetricsService } from '../../services/metrics.service';

/**
 * 🚀 OPTIMIZADO: runOutsideAngular para apps con Zone.js
 *
 * Cuando una app usa Zone.js, CADA tick de setInterval o timer
 * dispara un ciclo de detección de cambios en TODA la aplicación.
 * Con un polling de 5 segundos, eso son ciclos extras innecesarios.
 *
 * La solución:
 * 1. Ejecutar el timer FUERA de la zona Angular → no dispara Change Detection
 * 2. Solo volver a la zona para actualizar la UI con los datos nuevos
 *
 * Nota: Si tu app es Zoneless (Angular 19+), este paso NO es necesario.
 * Angular sin Zone.js no tiene este problema.
 */
@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, DecimalPipe, UpperCasePipe],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private metricsService = inject(MetricsService);
  private ngZone = inject(NgZone);

  metrics = signal<ServerMetrics | null>(null);
  isLoading = signal(false);
  pollingMethod = signal('runOutsideAngular + RxJS (🚀 Optimizado para Zone.js)');

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      timer(0, 5000)
        .pipe(
          tap(() => this.isLoading.set(true)),
          switchMap(() => this.metricsService.fetchMetrics()),
          takeUntilDestroyed()
        )
        .subscribe((data) => {
          // 🚀 Solo volvemos a la zona para actualizar la UI
          // Esto dispara UN SOLO ciclo de Change Detection, justo cuando hay datos nuevos
          this.ngZone.run(() => {
            this.metrics.set(data);
            this.isLoading.set(false);
          });
        });
    });
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
