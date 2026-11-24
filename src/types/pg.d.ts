declare module "pg" {
  export interface QueryResult<Row = Record<string, unknown>> {
    rows: Row[];
    rowCount: number | null;
  }

  export interface PoolConfig {
    connectionString?: string;
    max?: number;
    ssl?: boolean | Record<string, unknown>;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<Row = Record<string, unknown>>(
      text: string,
      values?: unknown[],
    ): Promise<QueryResult<Row>>;
    end(): Promise<void>;
  }

  export const types: {
    setTypeParser<T>(oid: number, parseFn: (value: string) => T): void;
  };
}
