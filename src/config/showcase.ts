// How the PROJECTS screen shows each product from genar-brand: on which shelf, and the screenshot of
// it (public/projects/<id>.webp, 640x400, captured from the live site). The projects themselves come
// from src/brand; a product missing here still shows, on the apps shelf and without a picture.
export type Shelf = 'games' | 'apps';

export const SHELVES: Record<Shelf, { title: string; action: string }> = {
  games: { title: 'Games', action: 'Play' },
  apps: { title: 'Apps', action: 'Try' },
};

export const SHOWCASE: Record<string, { shelf: Shelf; shot: string }> = {
  'age-of-slop': { shelf: 'games', shot: '/projects/age-of-slop.webp' },
  mythgrow: { shelf: 'games', shot: '/projects/mythgrow.webp' },
  sunflare: { shelf: 'apps', shot: '/projects/sunflare.webp' },
  deplayer: { shelf: 'apps', shot: '/projects/deplayer.webp' },
  slidetime: { shelf: 'apps', shot: '/projects/slidetime.webp' },
  refstash: { shelf: 'apps', shot: '/projects/refstash.webp' },
};
