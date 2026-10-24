import { identity, type BrandLink } from '../brand/identity.js';

// Links come from genar-brand (identity.yaml); edit them there, not here.
const WRITING_ID = 'fika';

const ICONS: Record<string, string> = {
  github: 'GithubLogo',
  gitlab: 'GitlabLogo',
  linkedin: 'LinkedinLogo',
  twitter: 'TwitterLogo',
};

export interface SiteLink extends BrandLink {
  icon: string;
  text: string;
}

const toSiteLink = (link: BrandLink): SiteLink => ({
  ...link,
  icon: ICONS[link.id] ?? 'Link',
  text: link.display ?? link.label,
});

export const socialLinks: SiteLink[] = identity.links.filter((l) => l.id !== WRITING_ID).map(toSiteLink);

const writing = identity.links.find((l) => l.id === WRITING_ID);
export const writingLink: SiteLink | undefined = writing && { ...toSiteLink(writing), icon: 'Article', text: 'Articles' };
