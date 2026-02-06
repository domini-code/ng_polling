import { Component, computed, signal } from '@angular/core';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { ServerMetrics } from '../../models/server-metrics';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, DecimalPipe, UpperCasePipe],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {
  // --- Estos valores serán implementados de forma diferente en cada rama ---
  metrics = signal<ServerMetrics | null>(null);
  isLoading = signal(false);
  pollingMethod = signal('Sin implementar');

  // --- UI Helpers ---
  protected statusClass = computed(() => {
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
  });

  protected statusDotClass = computed(() => {
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
  });
}
