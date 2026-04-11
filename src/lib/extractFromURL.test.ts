import { describe, it, expect } from "vitest";
import { extractTwitter, extractBluesky } from "./extractFromURL";

describe("extractTwitter", () => {
  it("https://x.com/user からハンドルを返す", () => {
    expect(extractTwitter("https://x.com/bluesky")).toBe("@bluesky");
  });

  it("https://twitter.com/user からハンドルを返す", () => {
    expect(extractTwitter("https://twitter.com/bluesky")).toBe("@bluesky");
  });

  it("大文字を小文字に変換する", () => {
    expect(extractTwitter("https://x.com/BlueSky")).toBe("@bluesky");
  });

  it("URL でない場合はそのまま返す", () => {
    expect(extractTwitter("notaurl")).toBe("notaurl");
  });
});

describe("extractBluesky", () => {
  it("https://bsky.app/profile/user.bsky.social からハンドルを返す", () => {
    expect(extractBluesky("https://bsky.app/profile/user.bsky.social")).toBe("@user.bsky.social");
  });

  it("大文字を小文字に変換する", () => {
    expect(extractBluesky("https://bsky.app/profile/User.Bsky.Social")).toBe("@user.bsky.social");
  });

  it("URL でない場合はそのまま返す", () => {
    expect(extractBluesky("notaurl")).toBe("notaurl");
  });
});
