/**
 * Personal Links - Single Source of Truth
 *
 * This file contains all personal social and professional links.
 * Used in:
 * - Footer navigation (Layout.astro)
 * - Terminal 'links' command
 *
 * To add a new link:
 * 1. Add entry to the personalLinks array
 * 2. Changes will automatically appear in footer and terminal command
 */

export interface PersonalLink {
  name: string;
  url: string;
  displayName?: string; // Optional custom display name (defaults to name)
}

export const personalLinks: PersonalLink[] = [
  {
    name: 'Github',
    url: 'https://github.com/gtrias',
  },
  {
    name: 'Gitlab',
    url: 'https://gitlab.com/gtrias',
  },
  {
    name: 'fika.bar',
    url: 'https://genar.fika.bar',
    displayName: 'genar.fika.bar',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/pub/genar-trias-ortiz/9/592/b90',
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/genar_tr',
    displayName: '@genar_tr',
  },
];

/**
 * Get display name for a link (uses displayName if available, otherwise name)
 */
export function getDisplayName(link: PersonalLink): string {
  return link.displayName || link.name;
}
