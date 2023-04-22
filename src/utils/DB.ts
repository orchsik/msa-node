import sql, { IRecordSet } from 'mssql';

type QueryResponse<T> = {
  data?: IRecordSet<T>[];
  error?: any;
};

const config: sql.config = {
  server: '127.0.0.1',
  port: 1401,
  database: 'test',
  user: 'sa',
  password: 'A!123456',
  connectionTimeout: 60_000,
  requestTimeout: 60_000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 180_000,
  },
  options: {
    encrypt: false,
    enableArithAbort: false,
  },
};

class Database {
  private static _pool: sql.ConnectionPool;

  public static async getPool(): Promise<sql.ConnectionPool> {
    if (!this._pool) {
      this._pool = await new sql.ConnectionPool(config).connect();
      console.log('Connected to MSSQL');
    }
    return this._pool;
  }

  public static async query<T = any>(
    query: string,
    params?: Object
  ): Promise<QueryResponse<T>> {
    try {
      const pool = await this.getPool();
      const request = pool.request();

      Object.entries(params || {}).forEach(([key, value]) => {
        request.input(key, value);
      });

      const result = await request.query(query);
      const recordsets = result.recordsets as IRecordSet<T>[];
      return { data: recordsets };
    } catch (error) {
      console.error('[FAILURE] QUERY', error);
      return { error };
    }
  }

  public static async ps<T = any>(
    query: string,
    params?: Object
  ): Promise<QueryResponse<T>> {
    try {
      const pool = await this.getPool();
      const ps = new sql.PreparedStatement(pool);

      Object.entries(params || {}).forEach(([key, value]) => {
        ps.input(key, value);
      });

      await ps.prepare(query);
      const result = await ps.execute(params || {});
      const recordsets = result.recordsets as IRecordSet<T>[];
      await ps.unprepare();

      return { data: recordsets };
    } catch (error) {
      console.error('[FAILURE] preparedStatement', error);
      return { error };
    }
  }
}

Database.getPool();
export default Database;
