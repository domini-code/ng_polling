export interface ServerMetrics {
  cpu: number;
  memory: number;
  activeConnections: number;
  responseTime: number;
  uptime: number;
  requestsPerSecond: number;
  timestamp: string;
  status: 'healthy' | 'degraded' | 'critical';
}
