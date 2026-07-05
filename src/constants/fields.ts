// 分野マスターの単一ソース。
// 分野を追加・変更するときはこの FIELDS だけを編集し、ラベル/詳細マップは自動で導出される。
// DB の fields テーブル（seed: supabase/migrations/20260401000001_seed_data.sql）とは
// id / label / sort_order を一致させること（seed の自動生成は未対応）。

type Field = {
  id: string;
  label: string;
  sortOrder: number;
  interest: string; // 興味の向き（オンボーディングで表示）
  target: string; // 対象（オンボーディングで表示）
};

export const FIELDS = [
  {
    id: "public_infrastructure",
    label: "公的機関・社会インフラ",
    sortOrder: 1,
    interest: "社会・政治・科学・医療・インフラなど、社会を支える公共性の高い情報を把握したい人向け",
    target: "公的機関（政府・省庁・国会・地方自治体・議員を含む）、公共性の高いインフラ事業者（交通・ライフライン・気象・医療・ヘルスケア等）、報道機関および記者・ジャーナリスト、大学・研究機関・学会など学術機関、大学教員・研究者など学術的な立場を持つ個人",
  },
  {
    id: "business",
    label: "企業・ブランド・サービス",
    sortOrder: 2,
    interest: "よく知っている企業・ブランド・サービスがBlueskyに公式アカウントを持っているか知りたい人向け",
    target: "企業・ブランド・サービスの公式アカウント",
  },
  {
    id: "tech",
    label: "IT・テック・Web",
    sortOrder: 3,
    interest: "プログラミング・OSS・AI・Webなど、技術の最前線を追うエンジニアや開発者向け",
    target: "プログラミング・OSS・インフラ・AI・Web等の技術領域に関わる個人・組織",
  },
  {
    id: "visual_arts",
    label: "漫画・イラスト・アート",
    sortOrder: 4,
    interest: "イラスト・漫画・アートなど、目で見て楽しむ静止画の表現と、それを作るクリエイターが好きな人向け",
    target: "イラスト・漫画・写真・美術等、静止画表現に関わる個人・組織・作品",
  },
  {
    id: "video",
    label: "映像作品（実写・アニメ）",
    sortOrder: 5,
    interest: "映画・アニメ・ドラマなど、動く映像作品とその作り手が好きな人向け",
    target: "映画・アニメ・ドラマ・舞台等の映像作品、およびその制作・出演に関わる個人・組織",
  },
  {
    id: "games",
    label: "ゲーム・玩具・キャラクター",
    sortOrder: 6,
    interest: "ゲームをプレイする、フィギュアやホビーを楽しむ、キャラクターを応援・収集するなど、遊びとキャラクターを楽しむ人向け",
    target: "ゲーム・玩具・キャラクターに関わる作品・個人・組織",
  },
  {
    id: "music",
    label: "音楽・声優・サウンド",
    sortOrder: 7,
    interest: "音楽・声優・ラジオなど、耳で楽しむコンテンツとその作り手を追いたい人向け",
    target: "音楽・声優・ラジオ等、音声・聴覚コンテンツに関わる個人・組織・作品",
  },
  {
    id: "entertainment",
    label: "芸能・タレント・配信",
    sortOrder: 8,
    interest: "作品よりも「その人自身」が面白い芸人・タレント・VTuber・配信者を追いたい人向け",
    target: "芸人・タレント・VTuber・配信者など、その人自身のパーソナリティを主なコンテンツとする個人・組織",
  },
  {
    id: "publishing",
    label: "出版・文芸",
    sortOrder: 9,
    interest: "小説・エッセイ・詩など言葉で書かれた作品と、それを作り届ける作家・出版社・書店が好きな人向け",
    target: "小説・エッセイ・詩等の文芸作品、およびその執筆・出版・流通に関わる個人・組織",
  },
  {
    id: "sports",
    label: "スポーツ・公営競技",
    sortOrder: 10,
    interest: "スポーツ・競技・勝負ごとを観戦・応援・楽しむ人向け",
    target: "スポーツ・競技・公営競技（競馬・競輪・ボートレース・オートレース等）に関わる選手・チーム・団体",
  },
  {
    id: "local",
    label: "飲食・観光・地域文化",
    sortOrder: 11,
    interest: "食べる・飲む・旅する・出かける体験と、それを楽しめる飲食店・観光地・地域の魅力に関心がある人向け",
    target: "飲食・観光・地域文化に関わる店舗・施設・組織",
  },
  {
    id: "fashion",
    label: "美容・ファッション・装い",
    sortOrder: 12,
    interest: "ファッション・美容・インテリアなど、自分の見た目や身の回りをおしゃれに整えることに関心がある人向け",
    target: "美容・ファッション・装いに関わるブランド・店舗・個人",
  },
  {
    id: "lifestyle",
    label: "探究・趣味・暮らし",
    sortOrder: 13,
    interest: "ペット・いきもの・神社仏閣・文房具・伝統文化など、特定の対象を深く探究したり、趣味やこだわりを持つ人向け",
    target: "特定の趣味・探究・暮らしの領域に特化した個人・組織",
  },
  {
    id: "bot",
    label: "bot・定期配信",
    sortOrder: 14,
    interest: "情報収集の仕組みに関心があり、bot・定期配信を上手く活用したい人向け",
    target: "bot・定期配信など、一定のペースで情報を配信することを主体とするアカウント",
  },
] as const satisfies readonly Field[];

export type FieldId = (typeof FIELDS)[number]["id"];

// 分野ID → 表示ラベル
export const FIELD_ID_LABELS: Record<string, string> = Object.fromEntries(
  FIELDS.map((f) => [f.id, f.label]),
);

export type FieldDetail = {
  interest: string;
  target: string;
};

// 分野ID → 詳細（興味の向き・対象）
export const FIELD_DETAILS: Record<string, FieldDetail> = Object.fromEntries(
  FIELDS.map((f) => [f.id, { interest: f.interest, target: f.target }]),
);
