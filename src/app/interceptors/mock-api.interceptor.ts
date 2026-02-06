import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';
import { ServerMetrics } from '../models/server-metrics';

/**
 * Interceptor que simula una API REST de métricas de servidor.
 * Genera datos aleatorios con variaciones realistas para demostrar
 * el comportamiento del polling en tiempo real.
 */

let baseValues = {
  cpu: 45,
  memory: 62,
  activeConnections: 150,
  responseTime: 25,
  uptime: 99.97,
  requestsPerSecond: 1240,
};

function generateMetrics(): ServerMetrics {
  // Variaciones realistas sobre la base
  baseValues.cpu = clamp(baseValues.cpu + randomDelta(3), 5, 95);
  baseValues.memory = clamp(baseValues.memory + randomDelta(2), 30, 90);
  baseValues.activeConnections = clamp(baseValues.activeConnections + randomDelta(15), 50, 500);
  baseValues.responseTime = clamp(baseValues.responseTime + randomDelta(5), 5, 200);
  baseValues.requestsPerSecond = clamp(baseValues.requestsPerSecond + randomDelta(80), 200, 3000);

  const cpu = baseValues.cpu;
  const status: ServerMetrics['status'] =
    cpu > 85 ? 'critical' : cpu > 65 ? 'degraded' : 'healthy';

  return {
    cpu: round(baseValues.cpu),
    memory: round(baseValues.memory),
    activeConnections: Math.round(baseValues.activeConnections),
    responseTime: Math.round(baseValues.responseTime),
    uptime: round(baseValues.uptime),
    requestsPerSecond: Math.round(baseValues.requestsPerSecond),
    timestamp: new Date().toISOString(),
    status,
  };
}

function randomDelta(range: number): number {
  return (Math.random() - 0.5) * 2 * range;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.endsWith('/api/metrics')) {
    const metrics = generateMetrics();
    // Simula latencia de red realista (100-400ms)
    const networkDelay = 100 + Math.random() * 300;

    return of(
      new HttpResponse({
        status: 200,
        body: metrics,
      })
    ).pipe(delay(networkDelay));
  }

  return next(req);
};
