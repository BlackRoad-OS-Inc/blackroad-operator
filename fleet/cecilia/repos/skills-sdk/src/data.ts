import { BlackRoadClient } from './client';

export interface QueryResult {
  rows: Record<string, any>[];
  columns: string[];
  row_count: number;
  execution_time_ms: number;
}

export interface AggregationResult {
  groups: Array<{
    key: Record<string, any>;
    aggregations: Record<string, number>;
    count: number;
  }>;
  total_groups: number;
}

export interface TimeSeriesResult {
  points: Array<{
    timestamp: string;
    value: number;
    labels?: Record<string, string>;
  }>;
  metadata: {
    start: string;
    end: string;
    interval: string;
    point_count: number;
  };
}

export interface StatisticsResult {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  std: number;
  variance: number;
  p25: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface TransformResult {
  data: Record<string, any>[];
  transformed_count: number;
  schema: Record<string, string>;
}

export class DataTools {
  constructor(private client: BlackRoadClient) {}

  /**
   * Execute a SQL query
   */
  async query(
    sql: string,
    options?: {
      database?: string;
      params?: any[];
      timeout_ms?: number;
    }
  ): Promise<QueryResult> {
    return this.client.fetch('/tools/data/query', {
      method: 'POST',
      body: JSON.stringify({
        sql,
        database: options?.database || 'default',
        params: options?.params,
        timeout_ms: options?.timeout_ms || 30000
      })
    });
  }

  /**
   * Insert data into a table
   */
  async insert(
    table: string,
    data: Record<string, any> | Record<string, any>[],
    options?: { database?: string; on_conflict?: 'ignore' | 'update' | 'error' }
  ): Promise<{ inserted: number; table: string }> {
    return this.client.fetch('/tools/data/insert', {
      method: 'POST',
      body: JSON.stringify({
        table,
        data: Array.isArray(data) ? data : [data],
        database: options?.database || 'default',
        on_conflict: options?.on_conflict || 'error'
      })
    });
  }

  /**
   * Update data in a table
   */
  async update(
    table: string,
    data: Record<string, any>,
    where: Record<string, any>,
    options?: { database?: string }
  ): Promise<{ updated: number; table: string }> {
    return this.client.fetch('/tools/data/update', {
      method: 'POST',
      body: JSON.stringify({
        table,
        data,
        where,
        database: options?.database || 'default'
      })
    });
  }

  /**
   * Delete data from a table
   */
  async delete(
    table: string,
    where: Record<string, any>,
    options?: { database?: string; limit?: number }
  ): Promise<{ deleted: number; table: string }> {
    return this.client.fetch('/tools/data/delete', {
      method: 'DELETE',
      body: JSON.stringify({
        table,
        where,
        database: options?.database || 'default',
        limit: options?.limit
      })
    });
  }

  /**
   * Aggregate data with grouping
   */
  async aggregate(
    table: string,
    options: {
      group_by: string[];
      aggregations: Record<string, { column: string; function: 'sum' | 'avg' | 'min' | 'max' | 'count' }>;
      where?: Record<string, any>;
      having?: Record<string, any>;
      database?: string;
    }
  ): Promise<AggregationResult> {
    return this.client.fetch('/tools/data/aggregate', {
      method: 'POST',
      body: JSON.stringify({
        table,
        ...options,
        database: options.database || 'default'
      })
    });
  }

  /**
   * Get time series data
   */
  async timeSeries(
    options: {
      metric: string;
      start: string;
      end: string;
      interval: '1m' | '5m' | '15m' | '1h' | '1d';
      aggregation?: 'avg' | 'sum' | 'min' | 'max';
      filters?: Record<string, any>;
      database?: string;
    }
  ): Promise<TimeSeriesResult> {
    return this.client.fetch('/tools/data/timeseries', {
      method: 'POST',
      body: JSON.stringify({
        ...options,
        aggregation: options.aggregation || 'avg',
        database: options.database || 'default'
      })
    });
  }

  /**
   * Calculate statistics for a column
   */
  async statistics(
    table: string,
    column: string,
    options?: {
      where?: Record<string, any>;
      database?: string;
    }
  ): Promise<StatisticsResult> {
    return this.client.fetch('/tools/data/statistics', {
      method: 'POST',
      body: JSON.stringify({
        table,
        column,
        where: options?.where,
        database: options?.database || 'default'
      })
    });
  }

  /**
   * Transform data with operations
   */
  async transform(
    data: Record<string, any>[],
    operations: Array<{
      type: 'rename' | 'drop' | 'cast' | 'compute' | 'filter' | 'sort';
      config: Record<string, any>;
    }>
  ): Promise<TransformResult> {
    return this.client.fetch('/tools/data/transform', {
      method: 'POST',
      body: JSON.stringify({ data, operations })
    });
  }

  /**
   * Parse CSV data
   */
  async parseCSV(
    content: string,
    options?: {
      delimiter?: string;
      has_header?: boolean;
      columns?: string[];
    }
  ): Promise<{ data: Record<string, any>[]; columns: string[]; row_count: number }> {
    return this.client.fetch('/tools/data/parse/csv', {
      method: 'POST',
      body: JSON.stringify({
        content,
        delimiter: options?.delimiter || ',',
        has_header: options?.has_header !== false,
        columns: options?.columns
      })
    });
  }

  /**
   * Export data to CSV
   */
  async toCSV(
    data: Record<string, any>[],
    options?: { columns?: string[]; delimiter?: string }
  ): Promise<{ csv: string; row_count: number }> {
    return this.client.fetch('/tools/data/export/csv', {
      method: 'POST',
      body: JSON.stringify({
        data,
        columns: options?.columns,
        delimiter: options?.delimiter || ','
      })
    });
  }

  /**
   * Flatten nested JSON
   */
  async flatten(
    data: Record<string, any>,
    options?: { separator?: string; max_depth?: number }
  ): Promise<{ data: Record<string, any> }> {
    return this.client.fetch('/tools/data/flatten', {
      method: 'POST',
      body: JSON.stringify({
        data,
        separator: options?.separator || '.',
        max_depth: options?.max_depth || 10
      })
    });
  }

  /**
   * Detect anomalies in a time series
   */
  async detectAnomalies(
    values: number[],
    options?: {
      method?: 'zscore' | 'iqr' | 'mad';
      threshold?: number;
      timestamps?: string[];
    }
  ): Promise<{
    anomalies: Array<{
      index: number;
      value: number;
      score: number;
      timestamp?: string;
    }>;
    total_anomalies: number;
  }> {
    return this.client.fetch('/tools/data/anomalies', {
      method: 'POST',
      body: JSON.stringify({
        values,
        method: options?.method || 'zscore',
        threshold: options?.threshold || 3.0,
        timestamps: options?.timestamps
      })
    });
  }

  /**
   * Calculate correlation between columns
   */
  async correlation(
    data: Record<string, any>[],
    columns: string[]
  ): Promise<{
    matrix: Record<string, Record<string, number>>;
    columns: string[];
  }> {
    return this.client.fetch('/tools/data/correlation', {
      method: 'POST',
      body: JSON.stringify({ data, columns })
    });
  }

  /**
   * Create histogram bins
   */
  async histogram(
    values: number[],
    options?: { bins?: number; range?: [number, number] }
  ): Promise<{
    counts: number[];
    edges: number[];
    bin_width: number;
  }> {
    return this.client.fetch('/tools/data/histogram', {
      method: 'POST',
      body: JSON.stringify({
        values,
        bins: options?.bins || 10,
        range: options?.range
      })
    });
  }
}
