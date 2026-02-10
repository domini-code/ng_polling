const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Misma lógica de mocks que el interceptor (valores base + variación)
let baseValues = {
  cpu: 45,
  memory: 62,
  activeConnections: 150,
  responseTime: 25,
  uptime: 99.97,
  requestsPerSecond: 1240,
};

function randomDelta(range) {
  return (Math.random() - 0.5) * 2 * range;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, decimals = 1) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function getMetrics() {
  baseValues.cpu = clamp(baseValues.cpu + randomDelta(3), 5, 95);
  baseValues.memory = clamp(baseValues.memory + randomDelta(2), 30, 90);
  baseValues.activeConnections = clamp(baseValues.activeConnections + randomDelta(15), 50, 500);
  baseValues.responseTime = clamp(baseValues.responseTime + randomDelta(5), 5, 200);
  baseValues.requestsPerSecond = clamp(baseValues.requestsPerSecond + randomDelta(80), 200, 3000);

  const cpu = baseValues.cpu;
  const status = cpu > 85 ? 'critical' : cpu > 65 ? 'degraded' : 'healthy';

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

app.get('/api/metrics', (req, res) => {
  // Opcional: simular latencia (ej. 7s para pruebas) con query ?delay=7000
  const delayMs = Number(req.query.delay) || 0;
  const metrics = getMetrics();

  if (delayMs > 0) {
    return setTimeout(() => res.json(metrics), delayMs);
  }
  res.json(metrics);
});

app.listen(PORT, () => {
  console.log(`Backend de métricas en http://localhost:${PORT}`);
  console.log(`  GET /api/metrics  → métricas mock`);
  console.log(`  GET /api/metrics?delay=7000  → misma respuesta con 7s de delay`);
});
