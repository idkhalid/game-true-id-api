import { getGameDefinition, GAMES, GameSlug } from './games';
import { callBackend } from './upstream';

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // CORS headers for all responses if needed, though not strictly requested.
  // We'll keep it simple and just use standard JSON headers.
  const baseHeaders = {
    'Content-Type': 'application/json',
  };

  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only GET requests are allowed.',
        },
      }),
      { status: 405, headers: baseHeaders }
    );
  }

  // Route: /games
  if (url.pathname === '/games' || url.pathname === '/games/') {
    const gamesList = GAMES.map((g) => ({
      game: g.slug,
      name: g.name,
      required_params: g.requiredParams,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: gamesList,
      }),
      { status: 200, headers: baseHeaders }
    );
  }

  // Route: /nickname/{game}
  const nicknameMatch = url.pathname.match(/^\/nickname\/([^/]+)\/?$/);
  if (nicknameMatch) {
    const gameSlug = nicknameMatch[1];
    const gameDef = getGameDefinition(gameSlug);

    if (!gameDef) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'UNSUPPORTED_GAME',
            message: `Game '${gameSlug}' is not supported.`,
          },
        }),
        { status: 400, headers: baseHeaders }
      );
    }

    const inputs: Record<string, string> = {};
    for (const param of gameDef.requiredParams) {
      const val = url.searchParams.get(param);
      if (!val || val.trim() === '') {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: `Missing or empty required parameter: ${param}`,
            },
          }),
          { status: 400, headers: baseHeaders }
        );
      }
      inputs[param] = val;
    }

    // Process upstream
    const result = await callBackend({
      game: gameDef.slug as GameSlug,
      inputs,
    });

    const statusCode = result.success ? 200 : getErrorStatusCode(result.error?.code);

    return new Response(JSON.stringify(result), {
      status: statusCode,
      headers: baseHeaders,
    });
  }

  // Not found
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found.',
      },
    }),
    { status: 404, headers: baseHeaders }
  );
}

function getErrorStatusCode(code?: string): number {
  switch (code) {
    case 'ACCOUNT_NOT_FOUND':
      return 404;
    case 'INVALID_REQUEST':
    case 'UNSUPPORTED_GAME':
      return 400;
    case 'UPSTREAM_RATE_LIMITED':
      return 429;
    case 'UPSTREAM_TIMEOUT':
      return 504;
    case 'UPSTREAM_UNAVAILABLE':
      return 502;
    default:
      return 500;
  }
}
