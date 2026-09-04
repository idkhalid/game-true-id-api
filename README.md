# Game True ID API

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/idkhalid/game-true-id-api&env=GAME_TRUE_ID_WORKERS_URL)
[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/idkhalid/game-true-id-api)

A lightweight, runtime-portable API gateway for resolving game identities. Requests are normalized across multiple upstream providers.

Base URL:
`https://api.game-true-id.eu.cc`

## Endpoints

### `GET /games`
Lists all currently supported games and their required query parameters.

Example Request:
```
GET https://api.game-true-id.eu.cc/games
```

### `GET /nickname/{game}`
Resolves an account identity for a supported game.

Example Request:
```
GET https://api.game-true-id.eu.cc/nickname/mobile-legends?user_id=1114917746&zone_id=13486
```

## Supported Games

| Game | Slug | Required Parameters |
| --- | --- | --- |
| Free Fire | `free-fire` | `user_id` |
| Mobile Legends | `mobile-legends` | `user_id`, `zone_id` |
| Honor of Kings | `honor-of-kings` | `user_id` |
| PUBG Mobile | `pubg-mobile` | `user_id` |
| Magic Chess | `magic-chess` | `user_id`, `zone_id` |
| Call of Duty Mobile | `call-of-duty-mobile` | `user_id` |
| Arena of Valor | `arena-of-valor` | `user_id` |
| Genshin Impact | `genshin-impact` | `user_id` |
| Honkai: Star Rail | `honkai-star-rail` | `user_id` |
| Zenless Zone Zero | `zenless-zone-zero` | `user_id` |
| Free Fire Global (multi-region resolution) | `free-fire-global` | `user_id` |
| Wuthering Waves | `wuthering-waves` | `user_id`, `server` |

Canonical public server values for Wuthering Waves:
- `sea` — Southeast Asia
- `asia` — Asia
- `tw-hk-mo` — Taiwan / Hong Kong / Macau
- `america` — America
- `europe` — Europe

Example: `GET /nickname/wuthering-waves?user_id=600717607&server=europe`

## Responses

### Success Example
```json
{
  "success": true,
  "data": {
    "game": "mobile-legends",
    "user_id": "1114917746",
    "zone_id": "13486",
    "nickname": "Outrageous+Dominance",
    "region": "ID"
  }
}
```

### Error Example
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_NOT_FOUND",
    "message": "Account not found."
  }
}
```

## Local Development

The gateway is built with standard Web APIs (Request/Response) and requires no runtime-specific emulation tools to test locally.

```sh
npm install
npm run build
npm start
```

The API will be available at `http://localhost:3000`.

## Portability
This gateway contains no generic framework dependencies and is designed to run natively on Node.js, Vercel Edge/Serverless, and Cloudflare Workers using thin runtime entrypoints.
