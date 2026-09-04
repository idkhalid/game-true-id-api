import { handleRequest } from './src/app';

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    return handleRequest(request);
  }
};
