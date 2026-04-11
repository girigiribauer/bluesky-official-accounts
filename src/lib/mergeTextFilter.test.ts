import { describe, it, expect } from "vitest";
import { mergeTextFilter } from "./mergeTextFilter";

describe("mergeTextFilter", () => {
  it("既存とnew wordをマージする", () => {
    expect(mergeTextFilter("政府", "公式")).toBe("政府 公式");
  });

  it("重複を除去する", () => {
    expect(mergeTextFilter("政府 公式", "公式")).toBe("政府 公式");
  });

  it("既存が空のとき入力をそのまま返す", () => {
    expect(mergeTextFilter("", "公式")).toBe("公式");
  });

  it("入力が空のとき既存をそのまま返す", () => {
    expect(mergeTextFilter("政府", "")).toBe("政府");
  });

  it("両方空のとき空文字を返す", () => {
    expect(mergeTextFilter("", "")).toBe("");
  });
});
