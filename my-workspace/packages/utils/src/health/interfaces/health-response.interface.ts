export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
}

export interface DbHealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  database: 'up' | 'down';
  latencyMs: number;
  error?: string;
}
