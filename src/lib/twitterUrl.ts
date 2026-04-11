const twitterUrlPattern = /^https:\/\/(x|twitter)\.com\/[A-Za-z0-9_]{1,15}(\/.*)?$/;

export const isValidTwitterUrl = (url: string): boolean =>
  twitterUrlPattern.test(url.trim());

export const normalizeTwitterUrl = (url: string): string =>
  url
    .replace(/^http:\/\//, "https://")
    .replace(/^https:\/\/twitter\.com\//, "https://x.com/");
