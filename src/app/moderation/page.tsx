import { Metadata } from "next";
import Image from "next/image";
import { GlobalHeader } from "src/components/GlobalHeader";
import { ShareButtons } from "src/components/ShareButtons";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title:
    "移行まとめモデレーションサイト - Bluesky公式アカウント移行まとめ",
  description:
    "オープン・パブリックな Bluesky の世界へ移行しよう！X(Twitter)からBlueskyへ移行した公式アカウントを集約している移行まとめです。投稿されたアカウントの確認・分類を行うモデレーションサイトです。",
  openGraph: {
    siteName: "Bluesky公式アカウント移行まとめ",
    title: "移行まとめモデレーションサイト - Bluesky公式アカウント移行まとめ",
    url: "https://bluesky-official-accounts.vercel.app/moderation",
    type: "article",
  },
};

const PLANNING_TEXT = `## 分野へのマッピング案

### 1 公共・報道・インフラ

- 関心領域: 社会の動き、公的な信頼性、生活に不可欠な情報の流通
- 基準: 国や自治体、法律に則った公的機関、および公共性の高いインフラ（交通・ライフライン・医療）、報道機関
- 旧カテゴリからの移設
    - 1.政府・省庁・国会議員
    - 2.地方自治体・地方議員
    - 8.気象・災害
    - 9.報道（マスメディア）
    - 10.報道（個人・その他団体）
    - 37.交通・乗り物
    - 39.医療・ヘルスケア(医療機関)

### 2 法人・サービス・ビジネス

- 関心領域: ビジネス動向、企業の広報活動、産業、金融、BtoB
- 基準: 法人格を持つ企業の公式アカウント、および経済団体、およびそれらが行うサービスやビジネス
- 旧カテゴリからの移設
    - 22.出版・書店（一部）
    - 46.その他企業・団体
    - 33.飲食（チェーン展開等）

### 3 IT・テック・Web

- 関心領域: テクノロジー、エンジニアリング、AI、Webの最新技術
- 基準: GitHub等で一定の認知度を持つOSS、技術カンファレンスでの登壇実績がある個人、またはそれに関わる団体
- 旧カテゴリからの移設
    - 43.テクノロジー
    - 44.ネットサービス（技術寄り）
    - 11.ネットメディア（テック系）

### 4 漫画・イラスト・アート

- 関心領域: 二次元創作、視覚芸術、写真、静止画としての表現
- 基準: 商業出版・展示・製品採用等の実績がある作品・団体・個人、または二次創作に関わる前述に準じるもの
- 旧カテゴリからの移設
    - 13.博物館・美術館
    - 14.美術家・芸術家
    - 15.写真・カメラ
    - 19.漫画家・イラストレーター
    - 20.漫画作品
    - 24.同人活動（静止画）

### 5 映像作品（実写・アニメ）

- 関心領域: ストーリーテリング、演出、脚本、動く映像作品
- 基準: 映画、アニメ、テレビ番組、舞台など「時間軸を持つ映像コンテンツ」そのもの、およびその制作主体（制作会社・スタッフ・出演者等）、またはそれらに関連する活動で広く認知されている団体・個人
- 旧カテゴリからの移設
    - 16.映像制作
    - 17.アニメ（作品）
    - 18.アニメ（個人・団体）
    - 29.テレビ番組・実写映画

### 6 ゲーム・玩具・キャラクター

- 関心領域: 遊び、ホビー、IP（知的財産）、マスコット
- 基準: 商業展開されているゲーム・玩具の公式アカウント、およびそれに関わるクリエイター・開発者など、または企業・自治体等が運用するキャラクター・マスコット
- 旧カテゴリからの移設
    - 25.ゲーム
    - 26.おもちゃ
    - 35.キャラクター・マスコット

### 7 音楽・声優・サウンド

- 関心領域: 音楽、歌唱、声の演技、ラジオ、音響
- 基準: 商業音楽活動(CD・配信リリース、ライブ活動等)を行うアーティスト・団体、声優、またはラジオ番組等の音声メディア
- 旧カテゴリからの移設
    - 27.音楽（個人・団体）
    - 28.声優
    - 30.ラジオ番組・その他放送

### 8 芸能・タレント・配信

- 関心領域: パーソナリティ、パフォーマンス、タレント性、人気
- 基準: 芸能事務所所属、またはメディア出演・商業活動の実績があるタレント・配信者で、その人自身のパーソナリティが主なコンテンツとなっているもの
- 旧カテゴリからの移設
    - 31.タレント・モデル
    - 32.配信系
    - 45.その他著名人

### 9 出版・文芸・学術・教育

- 関心領域: 知的活動、言葉の表現、教育、社会貢献
- 基準: 商業出版の実績がある作家、学術機関・研究者、教育機関、またはNPO法人等の社会活動団体の公式アカウント
- 旧カテゴリからの移設
    - 3.権利・社会
    - 4.福祉・ボランティア
    - 5.教育機関
    - 6.学者・研究者
    - 7.学生活動
    - 21.小説家・作家
    - 22.出版・書店

### 10 スポーツ・公営競技

- 関心領域: 競技、身体能力の追求、勝負事
- 基準: プロスポーツ選手・団体、公式競技団体、プロ棋士、eスポーツ選手・チーム、公営競技の公式アカウント
- 旧カテゴリからの移設
    - 42.スポーツ

### 11 飲食・観光・地域文化

- 関心領域: 食、旅、地域特有の文化、お出かけ
- 基準: 実店舗を持つ飲食店、観光施設・レジャー施設、自治体・観光協会等が発信する地域文化・特産品
- 旧カテゴリからの移設
    - 12.水族館・動植物園（娯楽施設）
    - 33.飲食
    - 34.動物カフェ
    - 36.観光

### 12 美容・ファッション・装い

- 関心領域: トレンド、身だしなみ、住環境、生活の彩り
- 基準: 美容・ファッション・インテリア等の商業ブランド、実店舗を持つ事業者、またはメディア露出のあるインフルエンサーで、外見・身体・生活空間を彩る情報を発信するもの
- 旧カテゴリからの移設
    - 23.文房具・事務用品
    - 39.医療・ヘルスケア(美容医療・フィットネス等)
    - 40.美容・ファッション
    - 41.家具・インテリア

### 13 暮らし・趣味・こだわり

- 関心領域: 個人の生活、特定の対象への偏愛、ニッチな趣味
- 基準: 特定分野(ペット、いきもの、神社仏閣等)で書籍出版・メディア出演等の実績がある専門家、またはX(Twitter)で一定のフォロワー数を持つ情報発信アカウント
- 旧カテゴリからの移設
    - 34.動物カフェ・いきものアカウント(個人)
    - 38.神社仏閣・宗教
    - 47.その他サービス・作品（趣味系）

### 14 システム・自動配信・ツール

- 関心領域: 利便性の向上、情報取得の効率化、自動化
- 基準: 公的機関・企業が運用するbot、または広く利用されている(利用者数・認知度が高い)自動配信ツール・情報集約サービス
- 旧カテゴリからの移設
    - 44.ネットサービス（ツール系）
    - 47.その他サービス・作品（実用系）`;

export default function ModerationPage() {
  return (
    <>
      <header className="header">
        <GlobalHeader />
      </header>
      <div>
        <div className="page-hero-image">
          <Image
            src="/hero-moderation.png"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAKCAYAAAC0VX7mAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAeGVYSWZNTQAqAAAACAAEARoABQAAAAEAAAA+ARsABQAAAAEAAABGASgAAwAAAAEAAgAAh2kABAAAAAEAAABOAAAAAAAAAEgAAAABAAAASAAAAAEAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAFKADAAQAAAABAAAACgAAAABegu0pAAAACXBIWXMAAAsTAAALEwEAmpwYAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iPgogICAgICAgICA8eG1wOkNyZWF0b3JUb29sPkZpZ21hPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgoE/1zIAAACUUlEQVQoFTWSS2sUQRSFv66u6p7J9GSScSaiMgm48wHuRTcu9B+49m8I/hRBEBRE9y5EF0FcGUgIBg1KouRh6zx6np2efnlrJAVFV1XXOfecW8f58PZlaYxmMs1QpsrGxVVQ4DgKB/kqh7IsybNcNqC1xkQhB9t7PP64Tzwc8fThXarNgPDwRDi0i3FdGkEFt0gYjSfMk4wkmZMXhZBBnhcouWOMoUjOGJ2EPNs6YPekR5nmHP36KxocVtYaKMFQFCWu6+B7mr5UnKepaINSzrM0E7UOrlIUeYk3HfHm0x7vw+HiXjdJ2fz5ByPYYDlAlWUhhKJEwJaw4mu6/ei/TVtNhiW0ilWZs7ezz+vvIcfDKan8jgW31R2RldIaWas0K8SSKBQFvmeoL4l1VTIcjRekhXguxLLranSesr7R4sn9Wzy6fpmbrbr0W9FqLeNpKTqeoq1Vo5X0xxWQEjKH1XqVaByTZUt4vocl1QJ08pxabYl7Nzrc7jQYxXP6cUoQVOmfhvTCSB5NSJS9LLYWU9ZGlNYqGYPBQKpfkHNXGprRm6VE+8esLbv4vqKxUqchoRAlfNkJOTwaoM8bbkntsBGx0fB9QyoPEg2GNJtNeUOHzDWc1Ro8/7hNq+5x7VKDTrtObSVgOEkZSEEtqVhYskR22gJ22JhUqh7j8YzZbCpWA+mTpn1ljWB9gxefv+J86/Lgaps7nWVOo5hJJvjNd6/KivbwJNxa5jlhLv1KJT5nccx0ltFqtxcqPcmtPT/+3WP3xylbEpkkGmKSCeu1Cv8AZZYcuOfnNakAAAAASUVORK5CYII="
          />
        </div>

        <div className="page-content">
          <section className="page-section">
            <h1>移行まとめモデレーションサイト（構築中）</h1>
            <p>
              <strong>段階的に新しい分野別モデレーションサイトに移行する予定</strong>です。モデレーションに興味があるよという方がいらっしゃいましたら、直接{" "}
              <a href="https://bsky.app/profile/official-accounts.bsky.social">
                @official-accounts.bsky.social
              </a>
              {" "}までご連絡ください。
            </p>
            <h2 className="page-section-title">旧分類（旧カテゴリ）から分野へのマッピング草案</h2>
            <p>以下のように新旧の分野・分類をマッピングしていく方針です。分類が不適切なものが出てきた場合は、移行後に改めて分類し直しますので、その際はご協力をお願いします。</p>
            <textarea
              className={styles.planningArea}
              readOnly
              defaultValue={PLANNING_TEXT}
            />
          </section>

          <hr className="page-separator" />

          <footer className="page-footer">
            <ShareButtons />
          </footer>

        </div>
      </div>
    </>
  );
}
