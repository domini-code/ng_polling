import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { catchError, interval, of, retry, timer } from 'rxjs';
import { ServerMetrics } from '../../models/server-metrics';
import { MetricsService } from '../../services/metrics.service';

/** Clases CSS por estado para badge y dot (evita repetir lógica y mejora tree-shaking). */
const STATUS_BADGE_CLASS: Record<ServerMetrics['status'] | 'unknown', string> = {
  healthy: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  degraded: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  critical: 'bg-red-500/10 text-red-400 border border-red-500/20',
  unknown: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
};
const STATUS_DOT_CLASS: Record<ServerMetrics['status'] | 'unknown', string> = {
  healthy: 'bg-emerald-400',
  degraded: 'bg-amber-400',
  critical: 'bg-red-400',
  unknown: 'bg-gray-400',
};

/**
 * 🛡️ NIVEL EXPERTO: Resiliencia con rxResource + Backoff Exponencial
 *
 * Este nivel añade manejo inteligente de errores al polling:
 *
 * 1. rxResource → Como httpResource, pero con control total de RxJS en el loader.
 *    Permite usar operadores como retry, catchError, timeout, etc.
 *
 * 2. retry con Backoff Exponencial → Si una petición falla, no reintenta
 *    inmediatamente. Espera 1s, luego 2s, luego 4s, luego 8s...
 *    Esto evita saturar un servidor que ya está caído.
 *
 * 3. catchError → Si tras 5 reintentos sigue fallando, captura el error
 *    y devuelve un objeto de fallback. El polling principal NO se rompe.
 *
 * 4. linkedSignal → Sigue evitando el flickering como en la rama anterior.
 *
 * Este patrón es esencial para aplicaciones en producción donde
 * la red puede ser inestable o los servidores pueden tener caídas temporales.
 */
@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, DecimalPipe, UpperCasePipe],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {
  
  pollingMethod = signal('rxResource + Backoff Exponencial (🛡️ Resiliente)');
 
  private readonly _metricsService = inject(MetricsService);

  // 1️⃣ Trigger de polling
  private pollTrigger = toSignal(interval(5000), { initialValue: 0 });

  // 2️⃣ rxResource: control total de RxJS para resiliencia
  private rawResource = rxResource<ServerMetrics | null, { poll: number }>({
    params: () => ({ poll: this.pollTrigger() }),
    stream: () => {
      return this._metricsService.fetchMetrics().pipe(
        // 🛡️ Backoff Exponencial: reintentos inteligentes
        retry({
          count: 5,
          delay: (_error: unknown, retryCount: number) =>
            timer(Math.pow(2, retryCount) * 1000),
        }),
        catchError((err: unknown) => {
          console.error('❌ Error definitivo tras 5 reintentos:', err instanceof Error ? err.message : err);
          return of(null);
        })
      );
    },
  }); 

  // 3️⃣ linkedSignal: anti-flickering
  metrics = linkedSignal<ServerMetrics | null | undefined, ServerMetrics | null>({
    source: () => this.rawResource.value(),
    computation: (newVal, previous) => newVal ?? previous?.value ?? null,
  });

  // 4️⃣ Estados del recurso
  isLoading = this.rawResource.isLoading;
  hasError = this.rawResource.error;

  // --- UI Helpers: computed evita re-ejecución en cada change detection ---
  protected statusClass = computed(() =>
    STATUS_BADGE_CLASS[this.metrics()?.status ?? 'unknown']
  );
  protected statusDotClass = computed(() =>
    STATUS_DOT_CLASS[this.metrics()?.status ?? 'unknown']
  );
}
