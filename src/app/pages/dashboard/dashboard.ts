import { Component, linkedSignal, signal } from '@angular/core';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { httpResource } from '@angular/common/http';
import { interval } from 'rxjs';
import { ServerMetrics } from '../../models/server-metrics';

/**
 * 🏆 EXCELENCIA: Resource API + Signals (Angular moderno)
 *
 * Este es el enfoque recomendado en Angular 20+:
 *
 * 1. toSignal(interval(5000)) → Convierte el intervalo RxJS en un Signal
 *    que se incrementa cada 5 segundos.
 *
 * 2. httpResource(() => { ... }) → Define un recurso HTTP reactivo.
 *    Cada vez que una dependencia (signal) cambia, se recarga automáticamente.
 *    La limpieza es automática: cuando el componente se destruye, el recurso se cancela.
 *
 * 3. linkedSignal → Evita el "flickering" (parpadeo) manteniendo el valor
 *    anterior mientras carga el nuevo. Sin esto, el recurso pondría el valor
 *    a undefined durante cada recarga.
 *
 * Ventajas:
 * - Zero RxJS boilerplate: no necesitas switchMap, takeUntilDestroyed, etc.
 * - Zoneless-ready: funciona perfecto sin Zone.js
 * - Estados integrados: isLoading(), error(), value() vienen gratis
 * - Cancelación automática: al destruir el componente, se cancela todo
 */
@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, DecimalPipe, UpperCasePipe],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {
  pollingMethod = signal('httpResource + linkedSignal (🏆 Angular Moderno)');

  // 1️⃣ Trigger de polling: un Signal que cambia cada 5 segundos
  //    toSignal convierte el Observable interval en un Signal
  private pollTrigger = toSignal(interval(5000), { initialValue: 0 });

  // 2️⃣ Recurso HTTP reactivo: se recarga cuando pollTrigger cambia
  private rawResource = httpResource<ServerMetrics>(() => {
    this.pollTrigger(); // Leer el signal crea la dependencia reactiva
    return '/api/metrics';
  });

  // 3️⃣ linkedSignal: mantiene el valor anterior mientras carga el nuevo
  //    Esto evita el "flickering" → la UI no parpadea entre actualizaciones
  metrics = linkedSignal<ServerMetrics | undefined, ServerMetrics | null>({
    source: () => this.rawResource.value(),
    computation: (newVal, previous) => newVal ?? previous?.value ?? null,
  });

  // 4️⃣ Estado de carga discreto: viene gratis del recurso
  isLoading = this.rawResource.isLoading;

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
