import sql from 'mssql';

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
  public static _pool: sql.ConnectionPool;

  public static async getPool(): Promise<sql.ConnectionPool | undefined> {
    try {
      if (!this._pool) {
        this._pool = await new sql.ConnectionPool(config).connect();
        console.log(this._pool);
      }
      return this._pool;
    } catch (error) {
      console.log(error);
    }
  }

  public static async query(query: string, params?: Object): Promise<any> {
    try {
      const pool = await this.getPool();
      const ps = new sql.PreparedStatement(pool);

      Object.entries(params || {}).forEach(([key, value]) => {
        ps.input(key, value);
      });

      await ps.prepare(query);
      const result = await ps.execute(params || {});
      await ps.unprepare();

      return result.recordsets;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default Database;
