import { handleRequest } from '../src/app';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request): Promise<Response> {
  return handleRequest(request);
}
