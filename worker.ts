import { handleRequest } from './src/app';

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    if (typeof process === 'undefined') {
      (globalThis as any).process = { env: {} };
    } else if (!process.env) {
      (process as any).env = {};
    }
    if (env && env.GAME_TRUE_ID_WORKERS_URL) {
      process.env.GAME_TRUE_ID_WORKERS_URL = env.GAME_TRUE_ID_WORKERS_URL;
    }
    if (env && env.GAME_TRUE_ID_ADAPTER_URL) {
      process.env.GAME_TRUE_ID_ADAPTER_URL = env.GAME_TRUE_ID_ADAPTER_URL;
    }
    return handleRequest(request);
  }
};
