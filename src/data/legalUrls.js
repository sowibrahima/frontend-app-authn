import { getConfig } from '@edx/frontend-platform';

const stripTrailingSlash = (url) => String(url || '').replace(/\/+$/, '');

const appendPath = (baseUrl, path) => {
  const normalizedBaseUrl = stripTrailingSlash(baseUrl);
  return normalizedBaseUrl ? `${normalizedBaseUrl}${path}` : path;
};

const getLocalCatalogBaseUrl = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const { protocol, hostname } = window.location;
  if (hostname === 'apps.local.openedx.io' || hostname === 'localhost') {
    return `${protocol}//${hostname}:1998/catalog`;
  }

  return null;
};

const getCatalogBaseUrl = (config) => (
  config.CATALOG_MICROFRONTEND_URL
  || config.CATALOG_BASE_URL
  || getLocalCatalogBaseUrl()
  || appendPath(config.LMS_BASE_URL || config.MARKETING_SITE_BASE_URL, '/catalog')
);

export const getLegalUrls = () => {
  const config = getConfig();
  const catalogBaseUrl = getCatalogBaseUrl(config);

  return {
    terms: config.TOS_LINK
      || config.TOS_AND_HONOR_CODE
      || config.LEGAL_TERMS_URL
      || appendPath(catalogBaseUrl, '/legal/terms'),
    privacy: config.PRIVACY_POLICY
      || config.LEGAL_PRIVACY_URL
      || appendPath(catalogBaseUrl, '/legal/privacy'),
  };
};
