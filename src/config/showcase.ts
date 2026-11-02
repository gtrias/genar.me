// How the PROJECTS screen shows each product from genar-brand: on which shelf, and the screenshot of
// it (public/showcase/<id>.webp, 640x400, captured from the live site; not under /projects, which
// _redirects sends to / for the old Hexo site). The projects themselves come from src/brand; a
// product missing here still shows, on the apps shelf and without a picture.
export type Shelf = 'games' | 'apps';

export const SHELVES: Record<Shelf, { title: string; action: string }> = {
  games: { title: 'Games', action: 'Play' },
  apps: { title: 'Apps', action: 'Try' },
};

export const SHOWCASE: Record<string, { shelf: Shelf; shot: string }> = {
  'age-of-slop': { shelf: 'games', shot: '/showcase/age-of-slop.webp' },
  mythgrow: { shelf: 'games', shot: '/showcase/mythgrow.webp' },
  sunflare: { shelf: 'apps', shot: '/showcase/sunflare.webp' },
  deplayer: { shelf: 'apps', shot: '/showcase/deplayer.webp' },
  slidetime: { shelf: 'apps', shot: '/showcase/slidetime.webp' },
  refstash: { shelf: 'apps', shot: '/showcase/refstash.webp' },
};
