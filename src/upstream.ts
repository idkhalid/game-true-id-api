import { GameSlug } from './games';

export interface ResolveInput {
  game: GameSlug;
  inputs: Record<string, string>;
}

export interface PublicResponse {
  success: boolean;
  data?: Record<string, any>;
  error?: {
    code: string;
    message: string;
  };
}

export async function callBackend(input: ResolveInput): Promise<PublicResponse> {
  const workersUrl = process.env.GAME_TRUE_ID_WORKERS_URL || 'https://workers.game-true-id.eu.cc';
  const adapterUrl = process.env.GAME_TRUE_ID_ADAPTER_URL || 'https://adapter.game-true-id.eu.cc';
  
  const baseUrl = (input.game === 'honkai-star-rail' || input.game === 'zenless-zone-zero' || input.game === 'free-fire-global' || input.game === 'wuthering-waves') ? adapterUrl : workersUrl;
  const resolveEndpoint = `${baseUrl}/v1/resolve`;

  const requestPayload: any = {
    game: input.game,
    inputs: { ...input.inputs }
  };

  const WUWA_SERVER_MAPPING: Record<string, string> = {
    'sea': 'os_sea',
    'asia': 'os_asia',
    'tw-hk-mo': 'os_cht',
    'america': 'os_usa',
    'europe': 'os_euro'
  };

  if (input.game === 'wuthering-waves' && input.inputs.server) {
    const internalServer = WUWA_SERVER_MAPPING[input.inputs.server];
    if (internalServer) {
      requestPayload.inputs.server = internalServer;
    }
  }

  // Standard 5 second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(resolveEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Account not found.',
          },
        };
      }
      
      if (response.status === 400) {
        try {
          const errBody = await response.clone().json() as any;
          if (errBody && errBody.error && errBody.error.code === 'ACCOUNT_NOT_FOUND') {
            return {
              success: false,
              error: {
                code: 'ACCOUNT_NOT_FOUND',
                message: 'Account not found.',
              },
            };
          }
        } catch (e) {
          // ignore
        }
      }
      
      if (response.status === 429) {
        return {
          success: false,
          error: {
            code: 'UPSTREAM_RATE_LIMITED',
            message: 'Upstream service rate limited. Please try again later.',
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'UPSTREAM_UNAVAILABLE',
          message: 'Upstream service is currently unavailable.',
        },
      };
    }

    const result = await response.json() as any;

    // The backend should return { success: true, data: { ... } } or similar based on public contract example
    // We rebuild the public response to avoid leaking internal fields
    if (result && result.ok && result.data) {
      // Re-construct exactly what we want to expose
      // The public example expects game, user_id, nickname, region, and optionally zone_id
      const publicData: Record<string, any> = {
        game: input.game,
        ...input.inputs, // user_id, zone_id
        nickname: result.data.account?.nickname || result.data.account?.username || '',
      };

      if (result.data.attributes?.region) {
        publicData.region = result.data.attributes.region;
      }

      if (input.game === 'wuthering-waves') {
        const adapterServer = result.data.attributes?.server;
        const expectedAdapterServer = WUWA_SERVER_MAPPING[input.inputs.server];
        
        if (adapterServer !== expectedAdapterServer) {
          return {
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Invalid response from upstream service.',
            }
          };
        }
      }
      
      // Some games may return it directly in result.data.nickname, let's be safe
      if (!publicData.nickname && result.data.nickname) {
        publicData.nickname = result.data.nickname;
      }

      return {
        success: true,
        data: publicData,
      };
    }

    // Unrecognized format from backend
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Invalid response from upstream service.',
      },
    };

  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      return {
        success: false,
        error: {
          code: 'UPSTREAM_TIMEOUT',
          message: 'Request to upstream service timed out.',
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal server error occurred.',
      },
    };
  }
}
