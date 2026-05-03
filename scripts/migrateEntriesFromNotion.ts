import fs from "fs";
import { Client } from "@notionhq/client";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// ---------------------------------------------------------------------------
// ページ単位の field_id 上書き（カテゴリマッピングより優先）
// ---------------------------------------------------------------------------
const PAGE_ID_TO_FIELD_ID: Record<string, string> = {
  "318ec3b2-73dd-819f-86ba-fecb1c7ca35a": "video",      // Japanese Film Project（権利・社会 → 映像作品）
  "187ec3b2-73dd-81fd-aea3-ec003f11e980": "local",      // 長浜桜演隊（福祉・ボランティア → 飲食・観光・地域文化）
  "14fec3b2-73dd-81d5-bb18-cbfd3d81086a": "lifestyle",  // Soil in a Bottle（教育機関 → 探究・趣味・暮らし）
  "309ec3b2-73dd-81ff-a766-de54a4dc28b5": "lifestyle",  // KUNILABO（教育機関 → 探究・趣味・暮らし）
  "c1a82d9f-dcc4-47a0-8eb5-96ccf403882f": "lifestyle",  // 日本プレゼンテーション教育協会(JPEA)（教育機関 → 探究・趣味・暮らし）
  "156ec3b2-73dd-81a9-ba81-c36c7f0b9486": "lifestyle",  // おると🦴整形外科医@筋トレ（学者・研究者・科学者 → 探究・趣味・暮らし）
  "15dec3b2-73dd-8174-a789-d172d72d6e48": "lifestyle",  // バク@ 精神科医（学者・研究者・科学者 → 探究・趣味・暮らし）
  "13dec3b2-73dd-8156-ab6b-ca27cf62bceb": "lifestyle",  // エミコヤマ（学者・研究者・科学者 → 探究・趣味・暮らし）
  // 学生活動
  "1b1ec3b2-73dd-81b1-af2e-c86d817039bf": "tech",         // KUMEC（学生活動 → IT・テック・Web）
  "176ec3b2-73dd-8191-a95a-e8acd4c56830": "tech",         // デジタルコンテンツ研究会（学生活動 → IT・テック・Web）
  "174ec3b2-73dd-8127-963c-d8f94d19fae5": "tech",         // 中央大学ドローン研究会（学生活動 → IT・テック・Web）
  "174ec3b2-73dd-81db-b2dc-c47cbb9d2395": "tech",         // 北見工業大学ロボコンチーム・SUMARI（学生活動 → IT・テック・Web）
  "173ec3b2-73dd-8148-be95-f3427c68d84e": "tech",         // 大阪電気通信大学 通信研究会（学生活動 → IT・テック・Web）
  "13cec3b2-73dd-8189-a8e9-ed730f2767d8": "tech",         // 所沢北高校物理部（学生活動 → IT・テック・Web）
  "174ec3b2-73dd-8157-9d84-e08b65945bb7": "tech",         // 東北大学アマチュア無線部（学生活動 → IT・テック・Web）
  "126ec3b2-73dd-81da-9e50-d509bb672620": "tech",         // 玉川大学工学部テクノフェスタ公式（学生活動 → IT・テック・Web）
  "126ec3b2-73dd-8104-9b09-c5ab981ced60": "tech",         // 福山市立大学 大学アプリ運営委員会（学生活動 → IT・テック・Web）
  "174ec3b2-73dd-8145-800f-eb78bdf293ad": "visual_arts",  // ムサビ漫研（学生活動 → 漫画・イラスト・アート）
  "175ec3b2-73dd-811a-a4a7-d6380df5baea": "visual_arts",  // 一橋・津田塾大学美術部（学生活動 → 漫画・イラスト・アート）
  "17cec3b2-73dd-8191-9818-cf5e8d47164e": "visual_arts",  // 鶴見大学写真部（学生活動 → 漫画・イラスト・アート）
  "176ec3b2-73dd-81ba-ac9f-c07fd2760b73": "games",        // 埼玉大学シャドバサークル（学生活動 → ゲーム・玩具・キャラクター）
  "17fec3b2-73dd-81fb-b7e5-c303989d5af4": "games",        // 大和大学ゲーム制作サークル（学生活動 → ゲーム・玩具・キャラクター）
  "174ec3b2-73dd-8154-bc42-d649909753cc": "games",        // 山口大学ポケモンサークル（学生活動 → ゲーム・玩具・キャラクター）
  "181ec3b2-73dd-8122-b0ce-f03545b02c34": "games",        // 東方姫山伝@山口大学（学生活動 → ゲーム・玩具・キャラクター）
  "182ec3b2-73dd-81e1-a4e8-d0534fea1e68": "games",        // 畿央大学ゲーミングサークルGAME Kio（学生活動 → ゲーム・玩具・キャラクター）
  "173ec3b2-73dd-8186-9b6f-fef5495cc64a": "games",        // 立命館大学遊戯王サークル（学生活動 → ゲーム・玩具・キャラクター）
  "173ec3b2-73dd-81ca-9569-e6c6f814d49c": "video",        // 広島大学映画研究会（学生活動 → 映像作品）
  "174ec3b2-73dd-812b-b1c3-fd06dfd78f1d": "video",        // 日本大学女児アニメ研究会（学生活動 → 映像作品）
  "174ec3b2-73dd-81c3-a9a8-fbc1444df580": "video",        // 東京理科大学動画研究同好会（学生活動 → 映像作品）
  "176ec3b2-73dd-81e6-8d26-dbc22b5a00dd": "music",        // 混声合唱団名古屋大学コール・グランツェ（学生活動 → 音楽・声優・サウンド）
  "17cec3b2-73dd-816b-bd07-e006c6c8ad8f": "entertainment", // epa!（学生活動 → 芸能・タレント・配信）
  "174ec3b2-73dd-81e4-b061-ee517eca6b8c": "entertainment", // 北海道大学"縁"（学生活動 → 芸能・タレント・配信）
  "174ec3b2-73dd-8101-8be9-c180a23d7b46": "entertainment", // 早稲田大学VTuber研究会（学生活動 → 芸能・タレント・配信）
  "175ec3b2-73dd-8139-b541-ce4762657e97": "sports",       // 千葉大学馬術部（学生活動 → スポーツ・公営競技）
  "173ec3b2-73dd-8135-831f-ddbaaab8bc3e": "local",        // 大阪大学お出かけスポット紹介サークル（学生活動 → 飲食・観光・地域文化）
  "1aeec3b2-73dd-8135-b215-f1ac816cabf5": "public_infrastructure", // 学費値上げ反対緊急アクション（学生活動 → 公的機関・社会インフラ）
  // 博物館・美術館・展覧会（ギャラリー系 → 漫画・イラスト・アート）
  "17bec3b2-73dd-81f8-bc7f-e584c4b917bb": "visual_arts",  // GALLERY龍屋
  "14fec3b2-73dd-81e2-998f-f741df62cbb8": "visual_arts",  // SUNABAギャラリー
  "138ec3b2-73dd-811a-ad90-f3bd8591cdc0": "visual_arts",  // アートスープ前橋駅前店
  "14fec3b2-73dd-817c-85ec-f1f22cf1a151": "visual_arts",  // ヴァニラ画廊
  "14fec3b2-73dd-8177-8ce0-e4626f921f39": "visual_arts",  // ぎゃらりぃ　あと
  "14aec3b2-73dd-8125-922b-efaab58f0446": "visual_arts",  // 古書ギャラリー月
  "151ec3b2-73dd-81f1-a50e-c362d54d868c": "visual_arts",  // 画廊＆雑貨屋・箱の中のお店
  "15eec3b2-73dd-8129-bb9b-eccef96d8703": "visual_arts",  // 谷根千 ぎゃらりーKnulp
  "14fec3b2-73dd-819f-9bee-f91100af966f": "visual_arts",  // 銀座中央ギャラリー
  // 医療・ヘルスケア（美容医療系 → 美容・ファッション・装い）
  "7f7e4a5d-4c59-41ea-b754-e7d1fa69ffa8": "fashion",     // 高須克弥
  // その他著名人（公的機関・社会インフラ）
  "156ec3b2-73dd-811f-b20b-c6283a76b129": "public_infrastructure", // 三春充希
  "70410b7f-1c07-45ce-a2e7-699ddc076b30": "public_infrastructure", // 荒木健太郎
  "13dec3b2-73dd-81b9-833f-df8799086412": "public_infrastructure", // 荻上チキ
  "13cec3b2-73dd-8190-b62a-d2a51028a3f9": "public_infrastructure", // 松岡宗嗣
  "156ec3b2-73dd-81af-8582-c908324f6926": "public_infrastructure", // 雨宮純
  "2546fffb-9703-4b0b-b7ec-715b72cb4e42": "public_infrastructure", // 飯間浩明
  "14eec3b2-73dd-81df-a7bf-fef396bd11d8": "public_infrastructure", // 吉川めいろ
  "151ec3b2-73dd-8196-9c29-e76a9d34d104": "public_infrastructure", // 大塚実
  // その他著名人（IT・テック・Web）
  "145ec3b2-73dd-8166-bd2b-f54e68dfa32a": "tech",        // piyokango
  "134ec3b2-73dd-8187-b2bf-d4aa1eb6c772": "tech",        // くりたしげたか
  "162de294-bd01-4075-a78e-d9ba55bfb98b": "tech",        // 深津貴之
  "b50a7a60-7103-4142-9d35-7847249fe12a": "tech",        // ほく
  // その他著名人（音楽・声優・サウンド）
  "15cec3b2-73dd-81d5-ae69-d7ca3815f5da": "music",       // 宗像明将
  "15cec3b2-73dd-8133-9bfc-e4d037e3ff6b": "music",       // 栗本斉
  "155ec3b2-73dd-8143-8550-cfbcb6be88df": "music",       // 藤木優子
  "15cec3b2-73dd-8181-9b5c-daa5e978a749": "music",       // 保利透
  // その他著名人（出版・文芸）
  "7e1987af-9eb8-4297-aaca-36babcde8aa9": "publishing",  // Jane Su
  "15dec3b2-73dd-8114-a292-f6bc2c02a071": "publishing",  // 岸本佐知子
  "160ec3b2-73dd-816f-94c5-f464f5f31d94": "publishing",  // 川端裕人
  "14aec3b2-73dd-81b0-b5b0-fdc4f49a1fe5": "publishing",  // 博物月報
  "154ec3b2-73dd-8126-9161-c87b54523c01": "publishing",  // 角田奈穂子
  // その他著名人（漫画・イラスト・アート）
  "133ec3b2-73dd-819b-a42c-eee4fec59514": "visual_arts", // MAEDAX
  "162ec3b2-73dd-81b8-995c-f3de5a958a9e": "visual_arts", // 雪朱里
  "14fec3b2-73dd-81b2-8efa-cd2e7bb31040": "visual_arts", // いわたまいこ
  "13cec3b2-73dd-81b1-b408-c622c781e059": "visual_arts", // ゆうたONE
  // その他著名人（映像作品）
  "134ec3b2-73dd-8166-ab7e-e90f20244d3f": "video",       // 星子旋風脚
  "1bbec3b2-73dd-8117-92ce-d0f88a64f4e6": "video",       // 町山智浩
  // その他著名人（探究・趣味・暮らし）
  "14fec3b2-73dd-81e2-a045-cf54b0be0a36": "lifestyle",   // 沙東すず/メレ山メレ子
  "14eec3b2-73dd-8181-ac92-eb4119a301e1": "lifestyle",   // 蟲喰ロトワ
  "154ec3b2-73dd-8134-9adf-e6ce59eec416": "lifestyle",   // 髙橋拓也
  "207ec3b2-73dd-81f8-81e2-c317f9287881": "lifestyle",   // きっこ
  "154ec3b2-73dd-8175-ba9e-e359509adcf6": "lifestyle",   // 羽生理恵
  "14eec3b2-73dd-8111-a2ed-eaba836d0d9d": "lifestyle",   // 前畑真実
  "160ec3b2-73dd-8105-a78f-ffa0f12df650": "lifestyle",   // 牛研
  // ネットサービス
  "1aeec3b2-73dd-8111-9b67-f9b7441bc836": "publishing",  // アルファポリス
  "15aec3b2-73dd-8111-a591-f6ff46b0d4ad": "publishing",  // ノベトーク
  "135ec3b2-73dd-81fd-9e38-edd8fad99b6a": "publishing",  // 青空文庫
  "13bec3b2-73dd-8192-a554-cdc6bd47012c": "visual_arts", // サイコミ
  "30dec3b2-73dd-819b-9f31-c9c5ded50184": "visual_arts", // Skeb
  "122ec3b2-73dd-81de-a674-dc3b42d1d522": "visual_arts", // デザインポケット
  "306ec3b2-73dd-819a-b5ea-e9fadb24440b": "visual_arts", // 90KU-KAN
  "69ba88a1-2648-46a4-9ef6-f1fc48f11bda": "business",   // PR TIMES
  "123ec3b2-73dd-81b8-aa07-dceb29d1d6f9": "business",   // 駿河屋更新情報
  "c9d1063e-ebb6-4d82-bd86-40bd1fc37f9c": "lifestyle",  // オタ恋
  // 同人活動（個人・団体）
  "165ec3b2-73dd-81a1-9182-e1f104a7f6c8": "tech",        // 技術書同人誌博覧会
  "306ec3b2-73dd-8111-b8e5-d755a2a5c5fa": "publishing",  // もじのイチ
  "174ec3b2-73dd-8196-a820-f06fb6d0537e": "games",       // ホッカイドウシュピールフェスト
  // ネットメディア（IT・テック・Web）
  "13eec3b2-73dd-8197-9397-e9617567382b": "tech",        // 『WIRED』日本版
  "156ec3b2-73dd-81b2-bc0f-f0d31d706275": "tech",        // 9to5Google
  "156ec3b2-73dd-8185-8bc3-dcf070e13941": "tech",        // 9to5Mac
  "156ec3b2-73dd-817f-9e8d-e26746cff6a9": "tech",        // Ars Technica
  "156ec3b2-73dd-81d9-81cf-ff075058d2ad": "tech",        // 404 Media
  "78d8eb61-21c6-4c28-a8fb-b34874583df9": "tech",        // bouncy
  "c55de209-1cac-4e5a-bc62-1ae0222f20e7": "tech",        // Engadget
  "4c382193-687f-406d-9fa1-ed05b1004994": "tech",        // GIGAZINE
  "f0d0f98f-2739-4ae5-9ae7-0d83593d1cd1": "tech",        // gihyo.jp
  "4a74e305-9d5d-4cd9-8ee2-e2d22256fb7c": "tech",        // GIZMODO JAPAN
  "da79e2fd-a0ae-4181-8d07-81e6ee8ef0f3": "tech",        // Impress Watch
  "17b63a81-c213-43ff-9a08-e169055face4": "tech",        // ITmedia NEWS
  "1196897f-dc2f-44a2-975d-bade2bf69b42": "tech",        // PHILE WEB
  "47b5a609-8bb0-4755-99e6-c6b4dbc42d70": "tech",        // TechCrunch
  "134ec3b2-73dd-8102-85f6-deed33dafe96": "tech",        // The Verge
  "13fec3b2-73dd-81c2-a4d7-f88bf4ccc954": "tech",        // WIRED
  "145ec3b2-73dd-8127-80f2-d3f10a195b61": "tech",        // WordPress
  "cb5046a0-2cd8-47d1-97d0-c0ba957c8f8a": "tech",        // Webクリエイター ボックス
  "543cf299-5031-4d70-be49-afef7249021b": "tech",        // Web担当者Forum
  "ef5ce261-5b29-44a6-9260-2b0ebcaa7f09": "tech",        // エルミタージュ秋葉原
  "cc971dd6-958d-44ad-ade8-56e2223be1d9": "tech",        // カナガク
  "dee20c91-5f31-4f70-a294-a6bcd17d1672": "tech",        // すまほん!!
  "d2ace090-2e7e-4f0d-b3e1-69cbbbc290ee": "tech",        // テクノエッジ
  "135ec3b2-73dd-81ff-980a-e4f04e8b87fd": "tech",        // レバテックLAB
  "15eec3b2-73dd-81b7-993c-dd69e525924f": "tech",        // 気になる、記になる…
  // ネットメディア（漫画・イラスト・アート）
  "770586b0-41dc-43f2-8c28-6e98454e15ad": "visual_arts", // AIPT
  "160ec3b2-73dd-817d-bf62-c537743e632f": "visual_arts", // ArtReview
  "156ec3b2-73dd-81ec-803c-d9829ae82ad4": "visual_arts", // Dezeen
  "160ec3b2-73dd-816b-bfa8-f2ea1e4855e4": "visual_arts", // The Art Newspaper
  "156ec3b2-73dd-81c3-9e66-d77834eb3297": "visual_arts", // Typographica
  "318ec3b2-73dd-81bc-a069-ccf1e98fe93f": "visual_arts", // Web美庵
  "f3384b4a-2c2c-4817-88e3-e119eb4fcecb": "visual_arts", // アメコミ通信社
  "573a6510-4d6a-488b-9830-fb242c82ccde": "visual_arts", // いちあっぷ
  "177ec3b2-73dd-815e-ae7c-f704967e5d2e": "visual_arts", // コミックナタリー
  "a82e03fa-03f3-4502-81d8-b0bfbf8decdd": "visual_arts", // 美術手帖
  // ネットメディア（出版・文芸）
  "a9c8b0b6-917e-4a16-a08c-c26b74cc790b": "publishing",  // GCノベルズ
  "7b88ab45-f3ec-4cbf-9b21-c029af336e58": "publishing",  // HON.jp
  "f71153a5-be4e-4048-9f79-657ac74fa395": "publishing",  // ほんのひととき
  "30d98db4-4bbe-40ff-be4f-d92c30d1be9f": "publishing",  // 文學界
  "54867115-d2fe-42a0-b700-36df4b59bca4": "publishing",  // 本の話
  "156ec3b2-73dd-81f6-82a5-f74546cd6add": "publishing",  // 週刊文春
  // ネットメディア（音楽・声優・サウンド）
  "13dec3b2-73dd-8119-91a8-d066f89c2baa": "music",       // NiEW
  "15cec3b2-73dd-8168-be00-d2d29f61911c": "music",       // Rolling Stone
  "13bec3b2-73dd-815e-936e-fad9b3c23a4a": "music",       // 洋楽まっぷ
  "177ec3b2-73dd-8157-a5cd-c09ac2e0e1e2": "music",       // 音楽ナタリー
  // ネットメディア（映像作品）
  "1b3ec3b2-73dd-81e7-aad2-c8580cb3dbac": "video",       // DiscussingFilm
  "321ec3b2-73dd-81ad-bd8c-c0891ef2ff0d": "video",       // TVer新着
  "191ec3b2-73dd-813b-aad4-eb37d70b0a87": "video",       // ひとシネマ
  "191ec3b2-73dd-81e4-b7c3-f13a342b1b76": "video",       // 映画チャンネル
  "177ec3b2-73dd-8132-95b9-c71e4802afaf": "video",       // 映画ナタリー
  // ネットメディア（芸能・タレント・配信）
  "5f3fbef3-f1f8-4ba2-b977-88c3b211474d": "entertainment", // KAI-YOU
  "e24ca1bd-4058-4671-97f4-ddb53a24e7fa": "entertainment", // The Onion
  "3f2e152c-f107-484d-b781-c600a01e0b76": "entertainment", // おたくま経済新聞
  "177ec3b2-73dd-81c2-b458-cc4390b7a5ba": "entertainment", // お笑いナタリー
  "177ec3b2-73dd-81ca-b23c-d3173412ba8d": "entertainment", // ステージナタリー
  "a392eb2f-031e-4662-be6c-c4ebeea2857f": "entertainment", // ニコニコニュース
  "31443f02-45a7-4106-8283-1e15d28354a5": "entertainment", // ユーチュラ
  "4dc707ea-2bb1-4b53-8731-01550199e30d": "entertainment", // 日刊エンタメクリップ
  "015d21b0-79d4-4422-8415-97773e753efd": "entertainment", // 虚構新聞社
  "160ec3b2-73dd-8101-91ea-e9444fd26a16": "entertainment", // Vanity Fair
  // ネットメディア（ゲーム・玩具・キャラクター）
  "114ec3b2-73dd-8120-b7f6-d157a93f8b6d": "games",       // 東方よもやまニュース
  // ネットメディア（美容・ファッション・装い）
  "9b465481-2424-4fbb-8b1a-83bb762cb73f": "fashion",     // CREA WEB
  "97a9c5fb-f7dc-4885-a08d-3d2a6a67a7a7": "fashion",     // FASHIONSNAP
  "ca54ac41-506f-4fc5-a1aa-491a3523d329": "fashion",     // Tulle編集部
  // ネットメディア（探究・趣味・暮らし）
  "0f44c747-919c-4e1a-8b18-246c93c31c29": "lifestyle",   // sorae
  "127ec3b2-73dd-811c-9c86-ce256bfe40f2": "lifestyle",   // オモコロ
  "13bec3b2-73dd-8150-b4c7-e8d1ec9a97f9": "lifestyle",   // カラパイア
  "9d0cd558-c7fd-485d-b2f5-0d63a391d137": "lifestyle",   // キンセリ
  "2131cdb0-3386-404c-8a79-fdec2d73326e": "lifestyle",   // タイランドハイパーリンクス
  "2c0ec3b2-73dd-81f1-9876-dc2d31c14d35": "lifestyle",   // デイリーポータルZ
  "134ec3b2-73dd-8115-9257-c7a183d55667": "lifestyle",   // ほぼ日
  "142ec3b2-73dd-819b-8d6f-fd2bf0146510": "lifestyle",   // マイナビ農業
  "874dd097-7bce-43ed-b772-05cc09281425": "lifestyle",   // ロケットニュース24
  "154ec3b2-73dd-8129-ab20-dae7d82ce8a6": "lifestyle",   // 毎日、文房具。
  // ネットメディア（公的機関・社会インフラ / 報道機関）
  "f98b8dc0-953a-40a9-b2aa-f20c0678e733": "public_infrastructure", // 47NEWS
  "156ec3b2-73dd-812c-aee6-eefd562a1290": "public_infrastructure", // Axios
  "158ec3b2-73dd-814f-831c-f632e9205e92": "public_infrastructure", // HuffPost (英語)
  "169ec3b2-73dd-812e-a868-fe0c2cebbe94": "public_infrastructure", // Mediapart
  "156ec3b2-73dd-81d4-b345-c871cf78d3a0": "public_infrastructure", // Politico
  "156ec3b2-73dd-81f4-8d7a-f5344852b473": "public_infrastructure", // Politico Europe
  "37d16188-3dc8-4e00-8f9f-eb5fb0231133": "public_infrastructure", // Re:Ron編集部（朝日新聞デジタル）
  "156ec3b2-73dd-8137-8a5f-c89834fa539c": "public_infrastructure", // The Kyiv Independent
  "156ec3b2-73dd-815b-b081-cf1738e64202": "public_infrastructure", // Vox
  "51b6cc78-1204-47d4-ab26-4021387a0ae2": "public_infrastructure", // Yahoo!ニュース
  "227ec3b2-73dd-81d9-88d8-cd4780cd196c": "public_infrastructure", // クーリエ・ジャポン
  "13eec3b2-73dd-8115-a76d-e8dd86945d46": "public_infrastructure", // ハフポスト日本版
  "170ec3b2-73dd-818e-ba15-d0693c83fced": "public_infrastructure", // ライブドアニュース
  "4b2744e8-23e2-49ce-8db8-623b533ae2b1": "public_infrastructure", // リトマス
  "150ec3b2-73dd-815c-b7bc-c4fdc941ea25": "public_infrastructure", // 朝日新聞　コメントプラス
  "f0341bc6-e9f0-42a1-ad4c-233b3ee26338": "public_infrastructure", // 足利経済新聞
  "e4ca2950-cdb6-4aa0-a422-c8215399b52f": "lifestyle",             // 鉄道プレスネット
  // ネットメディア（公的機関・社会インフラ / 学術メディア）
  "161ec3b2-73dd-814d-bf54-c834da56c874": "public_infrastructure", // Nature
  "156ec3b2-73dd-81bf-9c26-d4e309542e18": "public_infrastructure", // Nature Portfolio
  "156ec3b2-73dd-81e6-abcb-d2691d438986": "public_infrastructure", // Quanta Magazine
  // その他企業・団体（public_infrastructure）
  "149ec3b2-73dd-814f-ac43-f410641fe5de": "public_infrastructure", // Center for Countering Digital Hate
  "160ec3b2-73dd-813a-b5ff-ff3672935b73": "public_infrastructure", // Creative Commons
  "5b08d2eb-d64d-4df7-8c55-420dbae0d405": "public_infrastructure", // IME株式会社（橋梁インフラ）
  "135ec3b2-73dd-8127-af4c-c609d167ac3f": "public_infrastructure", // INTERPOL
  "1aeec3b2-73dd-814f-9b91-eb2adb7245db": "public_infrastructure", // RIKEN BDR（理研）
  "149ec3b2-73dd-819e-a3a9-cdfc07fad323": "public_infrastructure", // UNEP
  "145ec3b2-73dd-812e-87ce-d26cac5d55b8": "public_infrastructure", // WHO
  "18cec3b2-73dd-81c3-89d0-c80c7bf121e7": "public_infrastructure", // 公益社団法人 佐賀県農業公社
  "f2434370-bd0f-4f4e-b42c-44b7bd8ccf61": "public_infrastructure", // 株式会社3eee（介護・福祉・保育）
  "eef302cb-6f4d-45f8-83fe-4187fbcf2b24": "public_infrastructure", // インクロム（治験CRO）
  // のぞみちゃん_アルファ化米 → business（デフォルト）
  "151ec3b2-73dd-81c3-961a-c3b77372347e": "public_infrastructure", // 日本トルコ連絡協会
  // その他企業・団体（tech）
  "134ec3b2-73dd-8159-ba8b-c92d8023ae19": "tech",                  // figma.com
  "133ec3b2-73dd-8144-8366-d2c8587ae0ca": "tech",                  // Glaze and Nightshade
  "15dec3b2-73dd-81eb-973a-f785b858cb1f": "business",              // Megalith IT Alliance
  "f2edc265-fb28-4e2b-a84e-0d96010ac510": "tech",                  // さくらのレンタルサーバ
  "44802227-e141-4639-b06a-49bc9fe53beb": "tech",                  // ジオテクノロジーズ
  "3ef60539-0bc7-442b-8c25-b082e02b8e2e": "tech",                  // タイムインターメディア
  "0a6e291f-3d00-4c5e-84c7-a782b6e689f6": "tech",                  // ナイセン（クラウドPBX）
  "135ec3b2-73dd-81d1-96bd-e9ab4b748650": "games",                 // 株式会社RayArc（ボードゲーム関連）
  "19137b15-0915-4c0d-8e57-3b1bc7edf863": "tech",                  // 株式会社スイッチサイエンス
  "1afec3b2-73dd-81b3-9f34-d65ba2ce23f7": "tech",                  // 物書堂（辞書アプリ）
  "ef0c0877-0af3-4d28-b5b9-f41f9d852995": "tech",                  // メディバン公式
  "7e8a89a6-62b0-4ce7-99cf-d733a4bd07f3": "tech",                  // 合同会社デジタル鑑識研究所
  "136ec3b2-73dd-81b9-a8a3-ef9faf379a12": "tech",                  // ツバメインダストリ（搭乗型ロボット）
  "a58689c4-3087-4cda-a657-258ef54ea5ab": "tech",                  // 虎の穴ラボ（Fantia開発）
  "124ec3b2-73dd-8104-a79a-ca568eb35056": "tech",                  // バーチャルマーケット
  // その他企業・団体（games）
  "306ec3b2-73dd-812d-909c-c629103c5918": "games",                 // (株)ペンギンパレード（キャラクターグッズ）
  "124ec3b2-73dd-81c0-af86-d10121b2ac13": "games",                 // ANICLOSET.（アニメグッズ）
  "161ec3b2-73dd-81b9-9ff0-fc2144f18790": "games",                 // WING フィギュア公式
  "124ec3b2-73dd-8199-b910-dcf562a09268": "games",                 // アイドルマスター公式
  "9161e748-99cc-498a-a0b8-2790c2952812": "games",                 // あみあみ
  "14bec3b2-73dd-8184-8925-e8c6ac8b31a6": "games",                 // スクウェア・エニックス
  "15dec3b2-73dd-812c-a1c2-dd2f02f170d3": "games",                 // サイバーガジェット（レトロゲーム互換機）
  "af4778c4-6679-4bf8-a1f5-7e25ae99a39d": "games",                 // 東京マルイ（エアガン・ホビー）
  "14bec3b2-73dd-81b2-a3af-f8978996e8cf": "games",                 // ゲームセンターテクノポリス
  "13fec3b2-73dd-81dd-bb5a-ff8933cc09d6": "games",                 // なかまる@plum企画（プラモデル・フィギュア）
  "15aec3b2-73dd-813c-bd4d-c89e0ab24468": "games",                 // ネイティブ（フィギュアメーカー）
  "177ec3b2-73dd-8127-9bc8-dda3b8cd206c": "games",                 // fantasy village新宿店（アニメグッズ）
  // その他企業・団体（visual_arts）
  "161ec3b2-73dd-8133-b08d-df7b3b873e8e": "visual_arts",           // DC（DCコミックス）
  "144ec3b2-73dd-8145-af35-d147435bb871": "visual_arts",           // GEOARTWORKS（野生動物画家集団）
  "156ec3b2-73dd-81f6-9012-c11fbe394d95": "visual_arts",           // Letterform Archive
  "142ec3b2-73dd-81b9-8aef-e4bfc073e08c": "visual_arts",           // Pebeo Japon（画材）
  "14bec3b2-73dd-81eb-b222-cd320a67aaaa": "visual_arts",           // PIGMENT TOKYO（画材）
  "142ec3b2-73dd-817c-b018-f02ef5c2676d": "visual_arts",           // ウィンザー＆ニュートン（画材）
  "142ec3b2-73dd-81e7-aca6-de6dfc71a309": "visual_arts",           // ターナー色彩（画材）
  "142ec3b2-73dd-8109-a0bf-ea3be6943060": "visual_arts",           // ホルベイン（画材）
  "142ec3b2-73dd-81c0-ac97-eed8f027c12e": "visual_arts",           // リキテックス（画材）
  "14bec3b2-73dd-8177-b91c-f8b264cfa475": "visual_arts",           // 世界堂
  "14bec3b2-73dd-8103-9534-d569c5bd917d": "visual_arts",           // 画箋堂 本店
  "136ec3b2-73dd-8167-b15e-cd5e4d2ee8cd": "games",                 // 造型工房SIGMA公式（着ぐるみ・キャラクターマスク製作）
  "5292fd67-d8bc-478f-8ed7-941bceb1b7e3": "visual_arts",           // 銀一株式会社（映像機材・スタジオ）
  "309ec3b2-73dd-8144-b22f-f517d3f1c23f": "visual_arts",           // アートユータス交流会
  "154ec3b2-73dd-8147-9078-cca2998bd632": "visual_arts",           // さと/合同会社hacca（フィギュア原型師）
  "134ec3b2-73dd-8195-b04b-d829fc9966d3": "visual_arts",           // 株式会社ワコム（ペンタブレット）
  "1c47d1cd-e19c-4665-9137-6bfa027c95e3": "visual_arts",           // 株式会社トリニティ（同人グッズ製作）
  "142ec3b2-73dd-817d-b09b-cb4bc942f8e1": "visual_arts",           // 株式会社 吉祥（日本画絵具）
  "14fec3b2-73dd-810e-9503-e4660957d58e": "visual_arts",           // dubhejp（アーティスト）
  "176ec3b2-73dd-8125-ac74-ce7f3fc5960b": "visual_arts",           // Osaka Zine + DIY Fest
  "10cec3b2-73dd-813b-9027-db6e2e684b75": "visual_arts",           // 株式会社エツミ（フォトアクセサリー）
  // その他企業・団体（fashion）
  "154ec3b2-73dd-81b5-9cae-cfe8aed37418": "fashion",               // VARIED（ジビエレザー）
  "14aec3b2-73dd-8144-a12b-ff11a72eb0c7": "fashion",               // (有)ゴフクヤサン（呉服）
  "135ec3b2-73dd-8162-8ef1-f48aede8ac63": "fashion",               // リラクゼーションサロン Mano de gato
  "6910999e-7d4d-470f-b4ed-2df364654f6c": "fashion",               // マクセルイズミ（理美容器具）
  "135ec3b2-73dd-8114-ae75-da66281208e3": "fashion",               // ホトハ（揉みほぐし）
  "135ec3b2-73dd-8184-b278-e691e3111d11": "fashion",               // 整体ケアルラ
  "135ec3b2-73dd-81b5-82c7-d3e76c4d3507": "fashion",               // 雅-miyabi-（婚約指輪・結婚指輪）
  // その他企業・団体（lifestyle）
  "142ec3b2-73dd-81ee-84b2-c9995c177f4b": "lifestyle",             // スケッチブックのマルマン（文房具）
  "15eec3b2-73dd-8195-8821-ece000daf486": "lifestyle",             // ドイツゲーム喫茶B-CAFF
  "15eec3b2-73dd-811e-b594-d6ae19aac3ba": "lifestyle",             // ジョコタスカフェ（ボードゲームカフェ）
  "15eec3b2-73dd-8129-b7ee-fb3b3c6a842b": "lifestyle",             // 名古屋大須ボードゲームカフェ DOPPEL
  "15dec3b2-73dd-81d4-a601-e1f857b119d4": "lifestyle",             // 京都ボードゲームカフェ エース
  "15eec3b2-73dd-81e7-8e09-c7873656fbc9": "lifestyle",             // 茨木ボードゲームカフェComorebi
  "15eec3b2-73dd-81f1-ba50-e47d7d475ba7": "lifestyle",             // 謎解きカフェ&ボードゲームなぞねこ
  "135ec3b2-73dd-8160-8daf-fbc6e0158425": "lifestyle",             // つまみ細工の東京クラフト（手芸）
  "135ec3b2-73dd-815e-b370-ceb9deb943ef": "lifestyle",             // ミシンのオズ（手芸）
  "465a445a-ae21-4422-bb2e-0dbbc0a855bc": "lifestyle",             // うみねこ博物堂（鉱物・標本）
  "151ec3b2-73dd-8167-82d1-d20ce630cf38": "lifestyle",             // GARDENA（ガーデニング用品）
  "160ec3b2-73dd-81c9-a741-e5a6a684edb5": "lifestyle",             // 猫雑貨とカフェねこのや（動物カフェ）
  "114ec3b2-73dd-8197-8906-ee542c62f2b1": "lifestyle",             // 縄文ドキドキ会
  "142ec3b2-73dd-81d4-b619-c3ce0d31a91e": "lifestyle",             // 鉱物標本 天然石 金星舎
  "14cec3b2-73dd-819a-9231-eba18700fafe": "lifestyle",             // 三保原屋（文房具・雑貨）
  "146ec3b2-73dd-817f-9968-f4781f0cbb71": "lifestyle",             // 梅森陶器店
  "13118350-68e3-4c5c-93cd-9761d88115bf": "lifestyle",             // 江戸切子協同組合
  "146ec3b2-73dd-8131-a546-ced7e8dae10a": "lifestyle",             // 林刃物株式会社 ALLEX（文具）
  "149ec3b2-73dd-81a0-af33-d54a488a943c": "lifestyle",             // 田中箸店
  "180ec3b2-73dd-81af-9c4a-e80b45e662b8": "lifestyle",             // にじまる農園
  "148ec3b2-73dd-8105-a561-c3a8b217964d": "lifestyle",             // おはなのみせ はなそら（花屋）
  "135ec3b2-73dd-81ee-80a0-f9e5696c3882": "lifestyle",             // 片付けのレガーロ
  "77a304b9-07f4-40ed-b0ec-9232c3c50d38": "lifestyle",             // グッズプロクラフト（ぬい作り用品）
  "150ec3b2-73dd-8145-a32f-d58475c644b7": "lifestyle",             // ドゥニクリスタル（クリスタルショップ）
  "14cec3b2-73dd-8182-ac94-c2ef9de93555": "lifestyle",             // サクラクレパス（文房具）
  "14fec3b2-73dd-81ec-8819-dc3c7c9f27f8": "lifestyle",             // いきものづくし（生き物グッズイベント）
  "14bec3b2-73dd-81f7-ae9b-c51ae2a235bf": "lifestyle",             // ロフト LOFT
  "6a0cf7a7-64b0-439c-8d54-2a1cbf582a49": "lifestyle",             // サンコーレアモノショップ
  "142ec3b2-73dd-810b-aa45-d8955bfd4445": "lifestyle",             // ボクノトリノス（鉱物・化石ショップ）
  "180ec3b2-73dd-8190-a10d-feea724dbe81": "lifestyle",             // 高田義勝（有機農業）
  "143ec3b2-73dd-81d5-9c58-dc3e3e25cc3d": "lifestyle",             // 缶バッジの達人【カンタツ】
  "143ec3b2-73dd-81ee-b09f-dadfc090db40": "lifestyle",             // 缶バッジ製作SECONDPRESS.US
  "148ec3b2-73dd-8128-9322-e233557763c1": "lifestyle",             // Fablab燕三条（ファブラボ）
  // その他企業・団体（local）
  "15eec3b2-73dd-8128-a5cf-df1cdcf69014": "local",                 // expcafe!エクスカフェ@苫小牧
  "14cec3b2-73dd-81bf-a5db-c917fdb5a771": "local",                 // ホテル ベラヴィータ
  "17bec3b2-73dd-815b-8595-ee319cf1320c": "local",                 // ホテルエース盛岡
  "172ec3b2-73dd-81eb-b0fb-db5297294933": "local",                 // 平和湯（銭湯）
  "171ec3b2-73dd-8149-aa1e-dad2d220d88e": "local",                 // 栄盛湯（銭湯）
  "187ec3b2-73dd-816c-b551-c4923379b6c5": "local",                 // 板宿本通商店街
  "253905d3-98f2-4441-9f34-85579da44bb6": "local",                 // 富田商店（現代版駄菓子屋）
  // その他企業・団体（entertainment）
  "13bec3b2-73dd-8193-8e9d-cc213673f5f1": "entertainment",         // 【こいアニ】よさこいアニメフェスティバル
  "13cec3b2-73dd-81b0-93c6-c40d644763a9": "entertainment",         // a2see（VTuber/バーチャルCEO）
  "134ec3b2-73dd-810b-ba73-fe75272d3a13": "entertainment",         // ビーフェクト（声優事務所）
  "166ec3b2-73dd-8182-958f-dbf9af913b58": "entertainment",         // 劇団四季
  "15dec3b2-73dd-8107-93c9-da70c5b206dc": "entertainment",         // 一般社団法人 江東すみだ大道芸協会
  "152ec3b2-73dd-818d-bda6-c57ba523772f": "entertainment",         // コスプレイベント「Color Player」
  "187ec3b2-73dd-81da-b5ee-c877d0cee003": "entertainment",         // ハチマンコスプレ実行委員会
  // その他企業・団体（video）
  "135ec3b2-73dd-81fa-87fa-cd73f0240391": "video",                 // P&A Works Company（アニメ制作）
  "07c14c7d-ede0-4be5-9659-c0c81744060a": "video",                 // TCエンタテインメント（DVD・Blu-ray配信）
  "134ec3b2-73dd-819a-9df7-d052abc6cb57": "video",                 // 日本アニメフィルム文化連盟-NAFCA-
  // その他企業・団体（publishing）
  "15cec3b2-73dd-8179-93ad-c2ba39e4bb15": "publishing",            // Merriam-Webster
  "15aec3b2-73dd-81c4-a800-c952e89497a1": "publishing",            // 立川まんがぱーく
  "12b81c3c-792e-4bcc-bc7c-df3f8d0a1b22": "publishing",            // Komiflo（電子コミック）
  // その他企業・団体（sports）
  "135ec3b2-73dd-81ff-b6fc-cfeee85c39f3": "sports",                // 日本棋院
  // その他サービス・作品（publishing）
  "178ec3b2-73dd-8150-95d8-d43fb250a226": "publishing",            // 【公式】マンガ図書館Z
  "87655218-0d72-4187-bdb2-665616b07079": "publishing",            // ノベルアップ＋
  // その他サービス・作品（tech）
  "134ec3b2-73dd-818e-876f-f2dcddaf255e": "tech",                  // CLIP STUDIO PAINT
  "164ec3b2-73dd-81f2-bccb-d4df6e345adc": "tech",                  // Procreate
  "156ec3b2-73dd-811b-9d36-c5198d9cfaf1": "tech",                  // Proton
  "122ec3b2-73dd-8137-944d-fc21b7b2ecc0": "tech",                  // SUZURI
  "13aec3b2-73dd-81d2-97f1-f6626d16bd9f": "tech",                  // Xfolio
  "e873803c-aebb-44ff-bec2-df94ab24bef9": "tech",                  // アテナちゃん＠DLチャンネル
  "c47cb228-0fc6-4e38-8db6-f376cb35e632": "tech",                  // ソフタマ
  "123ec3b2-73dd-8118-846e-e563c55d5cda": "tech",                  // とわすた@StreamersApps
  // その他サービス・作品（games）
  "146ec3b2-73dd-8159-b1fa-f0e94e830fd0": "games",                 // Valve
  "d0617e2c-4de6-46bc-8a19-4ebd566aceea": "games",                 // クレーンゲームアプリ『トレバ』
  "13bec3b2-73dd-81a4-bd91-c4dfd5ee7091": "games",                 // サイストア
  "30f20cb1-fb35-4001-b471-e1bdbc59c41c": "games",                 // 刀剣乱舞-本丸通信-
  "148ec3b2-73dd-81a1-bc3f-d62bc5939df9": "games",                 // 幻想郷学講談所
  "72056b42-50d5-43a8-9b22-28134b7e4613": "games",                 // 猫りん堂
  // その他サービス・作品（visual_arts）
  "140ec3b2-73dd-819c-b23e-da45574b8acb": "visual_arts",           // OKUMONO（フリー背景素材）
  "133ec3b2-73dd-81a4-8e33-c567f03963e6": "visual_arts",           // アジャラカ（デザイナー）
  "14cec3b2-73dd-81e1-b797-e4e1e7f4a011": "visual_arts",           // お絵かき講座パルミー
  "14dec3b2-73dd-8195-8904-fd0be14a8d1b": "visual_arts",           // コミティア実行委員会
  "124ec3b2-73dd-81db-8f95-fa54741b41d6": "visual_arts",           // フロップデザイン
  "8c60a9f3-d0dc-4b28-b69a-0a01fc42a9ff": "visual_arts",           // るちかポーズ
  "80fcae9c-2781-460f-ab3a-f14a503efdaa": "visual_arts",           // ワンスト（クリエイターズレーベル）
  "155ec3b2-73dd-8150-a834-c9aa48b4670f": "visual_arts",           // 背景倉庫
  // その他サービス・作品（entertainment）
  "125ec3b2-73dd-8118-bb8b-e984055e2f65": "entertainment",         // スタジオコンテナ
  "135ec3b2-73dd-81f2-8383-c3743fe9e761": "entertainment",         // ヒトブイ【公式】
  "125ec3b2-73dd-81e0-a178-dd554709b7aa": "entertainment",         // 世界コスプレサミット
  // その他サービス・作品（lifestyle）
  "123ec3b2-73dd-8150-ad6e-ca6401792ccf": "lifestyle",             // てづくり村
  "143ec3b2-73dd-8102-ba5f-e415a2761128": "lifestyle",             // メルキュール骨董店
  "10fec3b2-73dd-8160-954e-e3e6b50ebd65": "lifestyle",             // 占い師ゆめのうきはし
  "14eec3b2-73dd-81a6-8e77-fb9b320c1bf6": "lifestyle",             // 暦生活
  "f07f1a1d-2a88-430b-bb4a-17b4c7868250": "lifestyle",             // 魔法省
  "18cec3b2-73dd-8171-acc5-c88e654594db": "lifestyle",             // ビジネス著作権検定
  "14bec3b2-73dd-81d0-9bae-f5581ce1bc36": "lifestyle",             // ミチル
  // その他サービス・作品（music）
  "129ec3b2-73dd-81f5-950e-f8f0f9e28635": "music",                 // 模型娘のもち子さん（合成音声）
  "ab758a4f-d9c7-4237-9f58-62c201527e56": "music",                 // 重音テト
  "2b561a31-d713-427c-9710-d42256e6022f": "music",                 // 音街ウナ
  // その他サービス・作品（local）
  "232ec3b2-73dd-810c-a593-da50d83a1ebd": "local",                 // 花街ぞめき
};

// ---------------------------------------------------------------------------
// ページ単位の分類名上書き（カテゴリマッピングより優先）
// ---------------------------------------------------------------------------
const PAGE_ID_TO_CLASSIFICATION_NAME: Record<string, string> = {
  // 博物館・美術館・展覧会（ギャラリー系）
  "17bec3b2-73dd-81f8-bc7f-e584c4b917bb": "ギャラリー・展覧会",  // GALLERY龍屋
  "14fec3b2-73dd-81e2-998f-f741df62cbb8": "ギャラリー・展覧会",  // SUNABAギャラリー
  "138ec3b2-73dd-811a-ad90-f3bd8591cdc0": "ギャラリー・展覧会",  // アートスープ前橋駅前店
  "14fec3b2-73dd-817c-85ec-f1f22cf1a151": "ギャラリー・展覧会",  // ヴァニラ画廊
  "14fec3b2-73dd-8177-8ce0-e4626f921f39": "ギャラリー・展覧会",  // ぎゃらりぃ　あと
  "14aec3b2-73dd-8125-922b-efaab58f0446": "ギャラリー・展覧会",  // 古書ギャラリー月
  "151ec3b2-73dd-81f1-a50e-c362d54d868c": "ギャラリー・展覧会",  // 画廊＆雑貨屋・箱の中のお店
  "15eec3b2-73dd-8129-bb9b-eccef96d8703": "ギャラリー・展覧会",  // 谷根千 ぎゃらりーKnulp
  "14fec3b2-73dd-819f-9bee-f91100af966f": "ギャラリー・展覧会",  // 銀座中央ギャラリー
  // 医療・ヘルスケア（美容医療系）
  "7f7e4a5d-4c59-41ea-b754-e7d1fa69ffa8": "美容医療・クリニック", // 高須克弥
  // ネットメディア（IT・テック・Web → テックメディア）
  "13eec3b2-73dd-8197-9397-e9617567382b": "テックメディア",  // 『WIRED』日本版
  "156ec3b2-73dd-81b2-bc0f-f0d31d706275": "テックメディア",  // 9to5Google
  "156ec3b2-73dd-8185-8bc3-dcf070e13941": "テックメディア",  // 9to5Mac
  "156ec3b2-73dd-817f-9e8d-e26746cff6a9": "テックメディア",  // Ars Technica
  "156ec3b2-73dd-81d9-81cf-ff075058d2ad": "テックメディア",  // 404 Media
  "78d8eb61-21c6-4c28-a8fb-b34874583df9": "テックメディア",  // bouncy
  "c55de209-1cac-4e5a-bc62-1ae0222f20e7": "テックメディア",  // Engadget
  "4c382193-687f-406d-9fa1-ed05b1004994": "テックメディア",  // GIGAZINE
  "f0d0f98f-2739-4ae5-9ae7-0d83593d1cd1": "テックメディア",  // gihyo.jp
  "4a74e305-9d5d-4cd9-8ee2-e2d22256fb7c": "テックメディア",  // GIZMODO JAPAN
  "da79e2fd-a0ae-4181-8d07-81e6ee8ef0f3": "テックメディア",  // Impress Watch
  "17b63a81-c213-43ff-9a08-e169055face4": "テックメディア",  // ITmedia NEWS
  "1196897f-dc2f-44a2-975d-bade2bf69b42": "テックメディア",  // PHILE WEB
  "47b5a609-8bb0-4755-99e6-c6b4dbc42d70": "テックメディア",  // TechCrunch
  "134ec3b2-73dd-8102-85f6-deed33dafe96": "テックメディア",  // The Verge
  "13fec3b2-73dd-81c2-a4d7-f88bf4ccc954": "テックメディア",  // WIRED
  "cb5046a0-2cd8-47d1-97d0-c0ba957c8f8a": "テックメディア",  // Webクリエイター ボックス
  "543cf299-5031-4d70-be49-afef7249021b": "テックメディア",  // Web担当者Forum
  "ef5ce261-5b29-44a6-9260-2b0ebcaa7f09": "テックメディア",  // エルミタージュ秋葉原
  "cc971dd6-958d-44ad-ade8-56e2223be1d9": "テックメディア",  // カナガク
  "dee20c91-5f31-4f70-a294-a6bcd17d1672": "テックメディア",  // すまほん!!
  "d2ace090-2e7e-4f0d-b3e1-69cbbbc290ee": "テックメディア",  // テクノエッジ
  "135ec3b2-73dd-81ff-980a-e4f04e8b87fd": "テックメディア",  // レバテックLAB
  "15eec3b2-73dd-81b7-993c-dd69e525924f": "テックメディア",  // 気になる、記になる…
  // ネットメディア（公的機関・社会インフラ / 報道機関）
  "f98b8dc0-953a-40a9-b2aa-f20c0678e733": "報道機関",       // 47NEWS
  "156ec3b2-73dd-812c-aee6-eefd562a1290": "報道機関",       // Axios
  "158ec3b2-73dd-814f-831c-f632e9205e92": "報道機関",       // HuffPost (英語)
  "169ec3b2-73dd-812e-a868-fe0c2cebbe94": "報道機関",       // Mediapart
  "156ec3b2-73dd-81d4-b345-c871cf78d3a0": "報道機関",       // Politico
  "156ec3b2-73dd-81f4-8d7a-f5344852b473": "報道機関",       // Politico Europe
  "37d16188-3dc8-4e00-8f9f-eb5fb0231133": "報道機関",       // Re:Ron編集部（朝日新聞デジタル）
  "156ec3b2-73dd-8137-8a5f-c89834fa539c": "報道機関",       // The Kyiv Independent
  "156ec3b2-73dd-815b-b081-cf1738e64202": "報道機関",       // Vox
  "51b6cc78-1204-47d4-ab26-4021387a0ae2": "報道機関",       // Yahoo!ニュース
  "227ec3b2-73dd-81d9-88d8-cd4780cd196c": "報道機関",       // クーリエ・ジャポン
  "13eec3b2-73dd-8115-a76d-e8dd86945d46": "報道機関",       // ハフポスト日本版
  "170ec3b2-73dd-818e-ba15-d0693c83fced": "報道機関",       // ライブドアニュース
  "4b2744e8-23e2-49ce-8db8-623b533ae2b1": "報道機関",       // リトマス
  "150ec3b2-73dd-815c-b7bc-c4fdc941ea25": "報道機関",       // 朝日新聞　コメントプラス
  "f0341bc6-e9f0-42a1-ad4c-233b3ee26338": "報道機関",       // 足利経済新聞
  // ネットメディア（公的機関・社会インフラ / 学術メディア）
  "161ec3b2-73dd-814d-bf54-c834da56c874": "学術メディア",   // Nature
  "156ec3b2-73dd-81bf-9c26-d4e309542e18": "学術メディア",   // Nature Portfolio
  "156ec3b2-73dd-81e6-abcb-d2691d438986": "学術メディア",   // Quanta Magazine
};

// ---------------------------------------------------------------------------
// 旧カテゴリー → field_id マッピング
// ---------------------------------------------------------------------------
const CATEGORY_TO_FIELD_ID: Record<string, string> = {
  "政府・省庁・国会議員": "public_infrastructure",
  "地方自治体・地方議員": "public_infrastructure",
  "気象・災害": "public_infrastructure",
  "報道（マスメディア）": "public_infrastructure",
  "報道（個人・その他団体）": "public_infrastructure",
  "交通・乗り物": "public_infrastructure",
  "水族館・動植物園": "local",
  "観光": "local",
  "飲食": "local",
  "美術家・芸術家": "visual_arts",
  "写真・カメラ（個人・団体）": "visual_arts",
  "漫画家・イラストレーター": "visual_arts",
  "漫画作品": "visual_arts",
  "映像制作（個人・団体）": "video",
  "アニメ（作品）": "video",
  "アニメ（個人・団体）": "video",
  "テレビ番組・実写映画": "video",
  "ゲーム（個人・団体）": "games",
  "おもちゃ": "games",
  "キャラクター・マスコット": "games",
  "音楽（個人・団体）": "music",
  "声優": "music",
  "ラジオ番組・その他放送": "music",
  "タレント・モデル": "entertainment",
  "配信系": "entertainment",
  "小説家・作家": "publishing",
  "出版・書店": "publishing",
  "テクノロジー（個人・団体・技術領域）": "tech",
  "美容・ファッション": "fashion",
  "家具・インテリア": "fashion",
  "雑貨・インテリア": "fashion",
  "スポーツ": "sports",
  "文房具・事務用品": "lifestyle",
  "動物カフェ・いきものアカウント": "lifestyle",
  "神社仏閣・宗教": "lifestyle",
  "権利・社会": "public_infrastructure",
  "福祉・ボランティア": "public_infrastructure",
  "教育機関": "public_infrastructure",
  "学者・研究者・科学者": "public_infrastructure",
  "学生活動": "lifestyle",
  "ネットメディア": "business",
  "博物館・美術館・展覧会": "local",
  "同人活動（個人・団体）": "visual_arts",
  "医療・ヘルスケア（個人・団体）": "public_infrastructure",
  "ネットサービス": "tech",
  "その他著名人": "entertainment",
  "その他企業・団体": "business",
  "その他サービス・作品": "business",
};

// ---------------------------------------------------------------------------
// 旧カテゴリー → 分類名マッピング
// 1対1で確定できるもののみ。複数候補・内容依存のものは null（未分類）
// ---------------------------------------------------------------------------
const CATEGORY_TO_CLASSIFICATION_NAME: Record<string, string | null> = {
  "気象・災害":                   "気象・災害",
  "報道（マスメディア）":          "報道機関",
  "報道（個人・その他団体）":      "記者・ジャーナリスト",
  "交通・乗り物":                  "交通・インフラ",
  "水族館・動植物園":              "水族館・動植物園",
  "観光":                          "観光地・観光協会",
  "飲食":                          "飲食店・カフェ・バー",
  "美術家・芸術家":                "美術家・芸術家",
  "写真・カメラ（個人・団体）":    "写真家",
  "漫画家・イラストレーター":      "漫画家・イラストレーター",
  "漫画作品":                      "漫画作品",
  "映像制作（個人・団体）":        "映像クリエイター・監督",
  "アニメ（作品）":                "アニメ作品",
  "アニメ（個人・団体）":          "アニメ制作・スタジオ",
  "テレビ番組・実写映画":          "映画・ドラマ（実写）",
  "小説家・作家":                  "小説家・作家",
  "文房具・事務用品":              "文房具・ステーショナリー",
  "ゲーム（個人・団体）":          "ゲーム会社",
  "おもちゃ":                      "おもちゃ・ホビー",
  "キャラクター・マスコット":      "キャラクター・マスコット",
  "音楽（個人・団体）":            "ミュージシャン・アーティスト",
  "声優":                          "声優",
  "ラジオ番組・その他放送":        "ラジオ・ポッドキャスト",
  "タレント・モデル":              "タレント・モデル",
  "配信系":                        "配信者・ストリーマー",
  "動物カフェ・いきものアカウント": "動物カフェ",
  "神社仏閣・宗教":                "神社仏閣・寺院",
  "家具・インテリア":              "インテリア・家具",
  "雑貨・インテリア":              "インテリア・家具",
  // 以下は1対1で確定できないため null（未分類）
  "政府・省庁・国会議員":          null,
  "地方自治体・地方議員":          null,
  "博物館・美術館・展覧会":        "博物館・美術館・科学館",
  "出版・書店":                    null,
  "美容・ファッション":            null,
  "スポーツ":                      null,
  "テクノロジー（個人・団体・技術領域）": null,
  "ネットサービス":                "Webサービス・プロダクト",
  "同人活動（個人・団体）":        "同人（静止画）",
  "医療・ヘルスケア（個人・団体）": "医療・ヘルスケア",
  "ネットメディア":                "メディア・出版",
  "権利・社会":                    null,
  "福祉・ボランティア":            null,
  "教育機関":                      null,
  "学者・研究者・科学者":          null,
  "学生活動":                      null,
  "その他著名人":                  null,
  "その他企業・団体":              null,
  "その他サービス・作品":          null,
};

// ---------------------------------------------------------------------------
// Notion の移行ステータス（日本語）→ DB の transition_status（英語）
// ---------------------------------------------------------------------------
const NOTION_STATUS_TO_TRANSITION_STATUS: Record<string, string> = {
  "未移行（未確認）": "not_migrated",
  "アカウント作成済": "account_created",
  "両方運用中": "dual_active",
  "Bluesky 完全移行": "migrated",
  "確認不能": "unverifiable",
};

const TWITTER_URL_PREFIX = "https://x.com/";
const TWITTER_COM_PREFIX = "https://twitter.com/";
const BSKY_URL_PREFIX = "https://bsky.app/profile/";

// seed.sql で挿入するマイグレーション記録用アカウントの固定 UUID
const SYSTEM_ADMIN_ID = "00000000-0000-0000-0000-000000000002";

function extractTwitterHandle(url: string): string | null {
  if (url.startsWith(TWITTER_URL_PREFIX)) {
    return url.slice(TWITTER_URL_PREFIX.length).replace(/\/$/, "") || null;
  }
  if (url.startsWith(TWITTER_COM_PREFIX)) {
    return url.slice(TWITTER_COM_PREFIX.length).replace(/\/$/, "") || null;
  }
  return null;
}

function extractBlueskyHandle(url: string): string | null {
  if (!url.startsWith(BSKY_URL_PREFIX)) return null;
  return url.slice(BSKY_URL_PREFIX.length).replace(/\/$/, "") || null;
}

async function fetchAllPages(
  client: Client,
  databaseID: string
): Promise<any[]> {
  const pages: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    if (cursor) await new Promise((r) => setTimeout(r, 700));
    const res = await client.databases.query({
      database_id: databaseID,
      page_size: 100,
      start_cursor: cursor,
      in_trash: false,
      filter: { property: "公開", checkbox: { equals: true } },
    });
    pages.push(...res.results);
    console.log(`fetched ${pages.length} pages...`);
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);

  return pages;
}

(async () => {
  dotenv.config({ path: "./.env.local" });

  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const databaseID = process.env.ACCOUNTLIST_DATABASE;
  if (!databaseID) throw new Error("ACCOUNTLIST_DATABASE is not set");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SECRET_KEY is not set");
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  // classifications を全件取得して { "field_id:name" → uuid } のマップを作る
  const { data: classificationRows } = await supabase
    .from("classifications")
    .select("id, field_id, name");
  const classificationMap: Record<string, string> = {};
  for (const row of classificationRows ?? []) {
    classificationMap[`${row.field_id}:${row.name}`] = row.id;
  }
  console.log(`loaded ${Object.keys(classificationMap).length} classifications`);

  const pages = await fetchAllPages(notion, databaseID);
  console.log(`\ntotal: ${pages.length} records\n`);

  let entriesInserted = 0;
  let requestsInserted = 0;
  let warnings = 0;
  const unresolvedEntries: { notionPageId: string; name: string; blueskyHandle: string; twitterHandle: string | null }[] = [];

  for (const page of pages) {
    const notionPageId: string = page.id;
    const name: string = page.properties["名前"]?.title[0]?.plain_text ?? "";
    const category: string = page.properties["分類"]?.select?.name ?? "";
    const notionStatus: string = page.properties["ステータス"]?.select?.name ?? "";
    const twitterUrl: string | null = page.properties["Twitter/X アカウント"]?.url ?? null;
    const blueskyUrl: string | null = page.properties["Bluesky アカウント"]?.url ?? null;
    const source: string = page.properties["根拠"]?.rich_text[0]?.plain_text ?? "";
    const did: string = page.properties["did"]?.rich_text[0]?.plain_text ?? "";
    const createdAt: string = page.created_time;

    if (!twitterUrl && notionStatus !== "Bluesky 完全移行") {
      console.warn(`[WARN] no Twitter URL (page: ${notionPageId}, name: ${name})`);
      warnings++;
    }

    const twitterHandle = twitterUrl ? extractTwitterHandle(twitterUrl) : null;
    if (twitterUrl && !twitterHandle) {
      console.warn(
        `[WARN] unexpected Twitter URL format: "${twitterUrl}" (page: ${notionPageId})`
      );
      warnings++;
    }

    // Bluesky URL なし → requests テーブル（来て欲しいアカウント）
    if (!blueskyUrl) {
      if (!twitterHandle) {
        console.warn(`[WARN] skipping request with no twitter handle (page: ${notionPageId})`);
        warnings++;
        continue;
      }

      // accounts を先に作成
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .insert({
          display_name: name,
          submitted_by: SYSTEM_ADMIN_ID,
          old_category: category || null,
          created_at: createdAt,
        })
        .select("id")
        .single();

      if (accountError) {
        console.error(`[ERROR] accounts insert failed (${name}):`, accountError.message);
        warnings++;
        continue;
      }

      const accountId = account.id;

      const { error: requestError } = await supabase.from("requests").insert({
        account_id: accountId,
        twitter_handle: twitterHandle,
      });

      if (requestError) {
        if (requestError.code === "23505") {
          console.log(`[SKIP] duplicate request: ${twitterHandle}`);
        } else {
          console.error(`[ERROR] requests insert failed (${twitterHandle}):`, requestError.message);
          warnings++;
        }
        continue;
      }

      const fieldId = PAGE_ID_TO_FIELD_ID[notionPageId] ?? CATEGORY_TO_FIELD_ID[category] ?? "business";

      await supabase.from("account_fields").insert({
        account_id: accountId,
        field_id: fieldId,
        classification_id: null,
      });

      requestsInserted++;
      continue;
    }

    // Bluesky URL あり → entries テーブル
    const blueskyHandle = extractBlueskyHandle(blueskyUrl);
    if (!blueskyHandle) {
      console.warn(
        `[WARN] unexpected Bluesky URL format: "${blueskyUrl}" (page: ${notionPageId})`
      );
      warnings++;
      continue;
    }

    // DID 未解決 → data/unresolved_entries.json に記録してスキップ
    if (!did) {
      console.warn(
        `[WARN] DID not resolved for handle "${blueskyHandle}" (page: ${notionPageId}) — skipped`
      );
      unresolvedEntries.push({ notionPageId, name, blueskyHandle, twitterHandle });
      warnings++;
      continue;
    }

    const transitionStatus = NOTION_STATUS_TO_TRANSITION_STATUS[notionStatus] ?? "not_migrated";
    if (!NOTION_STATUS_TO_TRANSITION_STATUS[notionStatus]) {
      console.warn(
        `[WARN] unknown status "${notionStatus}" → not_migrated (page: ${notionPageId})`
      );
      warnings++;
    }

    const fieldId = PAGE_ID_TO_FIELD_ID[notionPageId] ?? CATEGORY_TO_FIELD_ID[category] ?? "business";
    if (!PAGE_ID_TO_FIELD_ID[notionPageId] && !CATEGORY_TO_FIELD_ID[category]) {
      console.warn(
        `[WARN] unknown category "${category}" → business (page: ${notionPageId})`
      );
      warnings++;
    }

    // accounts を先に作成
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .insert({
        display_name: name,
        submitted_by: SYSTEM_ADMIN_ID,
        old_category: category || null,
        created_at: createdAt,
      })
      .select("id")
      .single();

    if (accountError) {
      console.error(`[ERROR] accounts insert failed (${name}):`, accountError.message);
      warnings++;
      continue;
    }

    const accountId = account.id;

    const { error: entryError } = await supabase
      .from("entries")
      .insert({
        account_id: accountId,
        bluesky_did: did,
        bluesky_handle: blueskyHandle,
        twitter_handle: twitterHandle,
        transition_status: transitionStatus,
        status: "published",
        approved_at: createdAt,
        created_at: createdAt,
      })
      .select("id")
      .single();

    if (entryError) {
      if (entryError.code === "23505") {
        console.log(`[SKIP] duplicate entry: ${did}`);
      } else {
        console.error(`[ERROR] entries insert failed (${did}):`, entryError.message);
        warnings++;
      }
      continue;
    }

    const classificationName = PAGE_ID_TO_CLASSIFICATION_NAME[notionPageId] ?? CATEGORY_TO_CLASSIFICATION_NAME[category] ?? null;
    const classificationId = classificationName
      ? (classificationMap[`${fieldId}:${classificationName}`] ?? null)
      : null;

    await supabase.from("account_fields").insert({
      account_id: accountId,
      field_id: fieldId,
      classification_id: classificationId,
    });

    if (source) {
      await supabase.from("evidences").insert({
        account_id: accountId,
        moderator_id: null,
        content: source,
      });
    }

    await supabase.from("activities").insert({
      account_id: accountId,
      moderator_id: SYSTEM_ADMIN_ID,
      action: "migrate",
      payload: { notion_page_id: notionPageId },
    });

    entriesInserted++;
  }

  // DID 未解決アカウントを書き出し
  if (!fs.existsSync("data")) fs.mkdirSync("data");
  fs.writeFileSync(
    "data/unresolved_entries.json",
    JSON.stringify(unresolvedEntries, null, 2)
  );
  console.log(`\nwrote data/unresolved_entries.json (${unresolvedEntries.length} items)`);

  console.log("\n--- done ---");
  console.log(`entries inserted:    ${entriesInserted}`);
  console.log(`requests inserted:   ${requestsInserted}`);
  console.log(`unresolved entries:  ${unresolvedEntries.length}`);
  console.log(`warnings:            ${warnings}`);
})();
