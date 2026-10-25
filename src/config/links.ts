import { identity, type BrandLink } from '../brand/identity.js';

// Links come from genar-brand (identity.yaml); edit them there, not here.
const WRITING_ID = 'fika';

export interface SiteLink extends BrandLink {
  text: string;
}

export const socialLinks: SiteLink[] = identity.links
  .filter((l) => l.id !== WRITING_ID)
  .map((l) => ({ ...l, text: l.display ?? l.label }));

const writing = identity.links.find((l) => l.id === WRITING_ID);
export const writingLink: SiteLink | undefined = writing && { ...writing, text: 'Articles' };
