import { NotionItem } from "src/models/Notion";

export const promoteTwitterURL = (item: NotionItem) => {
  const baseURL = "https://x.com/intent/post";
  const shareURL = "https://example.com";
  const hashtag = "#青空公式アカウント";
  let appealText = "Bluesky 公式アカウント移行まとめ";

  switch (item.status) {
    case "未移行（未確認）":
      if (item.bluesky) {
        appealText = `${item.name}さんの青空公式アカウントが本人なのか知りたい！`;
      } else {
        appealText = `${item.name}さんに青空公式アカウントを作ってほしい！`;
      }
      break;
    case "アカウント作成済":
      appealText = `${item.name}さんにもっと青空で投稿してほしい！`;
      break;
    case "両方運用中":
      appealText = `${item.name}さんは青空でも投稿されています！🦋`;
      break;
    case "Bluesky 完全移行":
      appealText = `${item.name}さんは青空に完全移行しています！卒業おめでとう🎉`;
      break;
  }

  const encodedText = encodeURIComponent(
    `${appealText} ${shareURL} ${hashtag}`
  );
  return `${baseURL}?text=${encodedText}`;
};

export const promoteBlueskyURL = (item: NotionItem) => {
  const baseURL = "https://bsky.app/intent/compose";
  const shareURL = "https://example.com";
  const hashtag = "#青空公式アカウント";
  let appealText = "Bluesky 公式アカウント移行まとめ";

  switch (item.status) {
    case "未移行（未確認）":
      if (item.bluesky) {
        appealText = `${item.name}さんの青空公式アカウントが本人なのか知りたい！`;
      } else {
        appealText = `${item.name}さんに青空公式アカウントを作ってほしい！`;
      }
      break;
    case "アカウント作成済":
      appealText = `${item.name}さんにもっと青空で投稿してほしい！`;
      break;
    case "両方運用中":
      appealText = `${item.name}さんは青空でも投稿されています！🦋`;
      break;
    case "Bluesky 完全移行":
      appealText = `${item.name}さんは青空に完全移行しています！卒業おめでとう🎉`;
      break;
  }

  const encodedText = encodeURIComponent(
    `${appealText} ${shareURL} ${hashtag}`
  );
  return `${baseURL}?text=${encodedText}`;
};
