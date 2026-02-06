import { Component, linkedSignal, signal } from '@angular/core';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, interval, of, retry, timer } from 'rxjs';
import { ServerMetrics } from '../../models/server-metrics';

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
  private http = inject(HttpClient);

  pollingMethod = signal('rxResource + Backoff Exponencial (🛡️ Resiliente)');

  // 1️⃣ Trigger de polling
  private pollTrigger = toSignal(interval(5000), { initialValue: 0 });

  // 2️⃣ rxResource: control total de RxJS para resiliencia
  private rawResource = rxResource<ServerMetrics | null, { poll: number }>({
    request: () => ({ poll: this.pollTrigger() }),
    loader: ({ request }) => {
      return this.http.get<ServerMetrics>('/api/metrics').pipe(
        // 🛡️ Backoff Exponencial: reintentos inteligentes
        retry({
          count: 5, // Máximo 5 reintentos
          delay: (error, retryCount) => {
            // Fórmula: 1s, 2s, 4s, 8s, 16s
            const delayTime = Math.pow(2, retryCount) * 1000;
            console.warn(
              `⚠️ Error en petición (intento ${retryCount}/5). Reintentando en ${delayTime}ms...`,
              error.message
            );
            return timer(delayTime);
          },
        }),
        // 🛡️ Si falla tras todos los reintentos, no rompemos el flujo
        catchError((err) => {
          console.error('❌ Error definitivo tras 5 reintentos:', err.message);
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
