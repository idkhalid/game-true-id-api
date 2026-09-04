export type GameSlug =
  | 'free-fire'
  | 'mobile-legends'
  | 'honor-of-kings'
  | 'pubg-mobile'
  | 'magic-chess'
  | 'call-of-duty-mobile'
  | 'arena-of-valor'
  | 'genshin-impact'
  | 'honkai-star-rail'
  | 'zenless-zone-zero'
  | 'free-fire-global';

export interface GameDefinition {
  slug: GameSlug;
  name: string;
  requiredParams: string[];
}

export const GAMES: GameDefinition[] = [
  {
    slug: 'free-fire',
    name: 'Free Fire',
    requiredParams: ['user_id'],
  },
  {
    slug: 'mobile-legends',
    name: 'Mobile Legends',
    requiredParams: ['user_id', 'zone_id'],
  },
  {
    slug: 'honor-of-kings',
    name: 'Honor of Kings',
    requiredParams: ['user_id'],
  },
  {
    slug: 'pubg-mobile',
    name: 'PUBG Mobile',
    requiredParams: ['user_id'],
  },
  {
    slug: 'magic-chess',
    name: 'Magic Chess',
    requiredParams: ['user_id', 'zone_id'],
  },
  {
    slug: 'call-of-duty-mobile',
    name: 'Call of Duty Mobile',
    requiredParams: ['user_id'],
  },
  {
    slug: 'arena-of-valor',
    name: 'Arena of Valor',
    requiredParams: ['user_id'],
  },
  {
    slug: 'genshin-impact',
    name: 'Genshin Impact',
    requiredParams: ['user_id'],
  },
  {
    slug: 'honkai-star-rail',
    name: 'Honkai: Star Rail',
    requiredParams: ['user_id'],
  },
  {
    slug: 'zenless-zone-zero',
    name: 'Zenless Zone Zero',
    requiredParams: ['user_id'],
  },
  {
    slug: 'free-fire-global',
    name: 'Free Fire Global',
    requiredParams: ['user_id'],
  },
];

export function getGameDefinition(slug: string): GameDefinition | undefined {
  return GAMES.find(g => g.slug === slug);
}
