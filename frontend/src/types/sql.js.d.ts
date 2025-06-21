declare module 'sql.js' {
  export interface Database {
    exec(sql: string, params?: any[]): any[];
    run(sql: string, params?: any[]): void;
    prepare(sql: string): Statement;
    close(): void;
    export(): Uint8Array;
  }

  export interface Statement {
    step(): boolean;
    getAsObject(): any;
    bind(params: any[]): void;
    free(): void;
  }

  export interface SQLJsStatic {
    Database: new (data?: Uint8Array) => Database;
  }

  export default function initSqlJs(config?: { locateFile: (file: string) => string }): Promise<SQLJsStatic>;
} 