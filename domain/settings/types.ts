export type SiteSettings = {
  hideDownloadManuals: boolean;
  updatedAt?: string;
};

export const defaultSiteSettings: SiteSettings = {
  hideDownloadManuals: false,
};
