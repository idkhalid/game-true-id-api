import * as http from 'node:http';
import { handleRequest } from './app';

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || `localhost:${PORT}`;
    const url = new URL(req.url || '/', `${protocol}://${host}`);

    // Create a Web Standard Request from the Node.js Request
    const webReq = new Request(url.toString(), {
      method: req.method,
      headers: req.headers as Record<string, string>,
    });

    // Call the portable core handler
    const webRes = await handleRequest(webReq);

    // Map Web Standard Response back to Node.js Response
    res.statusCode = webRes.status;
    webRes.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (webRes.body) {
      const text = await webRes.text();
      res.end(text);
    } else {
      res.end();
    }
  } catch (err) {
    console.error('Gateway Error:', err);
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' },
      })
    );
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
