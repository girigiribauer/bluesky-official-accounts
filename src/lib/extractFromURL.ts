export const extractTwitter = (url: string) => {
  const found = url.match(/http?s\:\/\/(?:x|twitter)\.com\/([a-zA-Z0-9_]+)/);
  if (!found) return url;

  return "@" + found[1].toLowerCase();
};

export const extractBluesky = (url: string) => {
  const found = url.match(/http?s\:\/\/bsky\.app\/profile\/([a-zA-Z0-9-\.]+)/);
  if (!found) return url;

  return "@" + found[1].toLowerCase();
};
