-- ---------------------------------------------------------------------------
-- 管理者 moderators
-- id-0001: 普段作業用アカウント
-- id-0002: マイグレーション記録用アカウント（submitted_by / activities に使う）
-- handle・display_name は実行前に実際の値を確認して書き換えること。
-- ---------------------------------------------------------------------------
insert into moderators (id, did, handle, display_name, is_admin) values
  (
    '00000000-0000-0000-0000-000000000001',
    'did:plc:tsvcmd72oxp47wtixs4qllyi',
    'girigiribauer.com',
    'girigiribauer',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'did:plc:3iduvlxl3yrj3dmcbslte7cy',
    'official-accounts.bsky.social',
    '公式アカウント移行まとめ',
    true
  );

-- ---------------------------------------------------------------------------
-- classifications 初期データ
-- categories.md の「初期分類」に基づく。
-- ---------------------------------------------------------------------------

-- 1 公共・報道・インフラ (public_infrastructure)
insert into classifications (field_id, name) values
  ('public_infrastructure', '政府・省庁'),
  ('public_infrastructure', '国会議員'),
  ('public_infrastructure', '地方自治体'),
  ('public_infrastructure', '地方議員'),
  ('public_infrastructure', '気象・災害'),
  ('public_infrastructure', '報道機関'),
  ('public_infrastructure', '記者・ジャーナリスト'),
  ('public_infrastructure', '交通・インフラ'),
  ('public_infrastructure', '医療機関');

-- 2 企業・ブランド・サービス (business)
insert into classifications (field_id, name) values
  ('business', 'メーカー・製造'),
  ('business', '食品・飲食'),
  ('business', '小売・流通・EC'),
  ('business', '金融・保険'),
  ('business', 'メディア・出版'),
  ('business', '通信・テレコム'),
  ('business', 'その他サービス');

-- 3 IT・テック・Web (tech)
insert into classifications (field_id, name) values
  ('tech', 'プログラミング・OSS'),
  ('tech', 'AI・機械学習'),
  ('tech', 'クラウド・インフラ'),
  ('tech', 'Webサービス・プロダクト'),
  ('tech', 'セキュリティ'),
  ('tech', 'テックメディア'),
  ('tech', 'エンジニア・研究者（個人）');

-- 4 漫画・イラスト・アート (visual_arts)
insert into classifications (field_id, name) values
  ('visual_arts', '漫画家・イラストレーター'),
  ('visual_arts', '漫画作品'),
  ('visual_arts', '美術家・芸術家'),
  ('visual_arts', '写真家'),
  ('visual_arts', 'ギャラリー・展覧会'),
  ('visual_arts', '同人（静止画）');

-- 5 映像作品（実写・アニメ）(video)
insert into classifications (field_id, name) values
  ('video', 'アニメ作品'),
  ('video', 'アニメ制作・スタジオ'),
  ('video', '映画・ドラマ（実写）'),
  ('video', '映像クリエイター・監督'),
  ('video', '同人（映像）');

-- 6 ゲーム・玩具・キャラクター (games)
insert into classifications (field_id, name) values
  ('games', 'ゲーム作品・タイトル'),
  ('games', 'ゲームクリエイター・開発者'),
  ('games', 'ゲーム会社'),
  ('games', 'おもちゃ・ホビー'),
  ('games', 'キャラクター・マスコット');

-- 7 音楽・声優・サウンド (music)
insert into classifications (field_id, name) values
  ('music', 'ミュージシャン・アーティスト'),
  ('music', 'バンド・グループ'),
  ('music', '声優'),
  ('music', 'ラジオ・ポッドキャスト'),
  ('music', '音楽レーベル・事務所'),
  ('music', '同人（音楽）');

-- 8 芸能・タレント・配信 (entertainment)
insert into classifications (field_id, name) values
  ('entertainment', '芸人・お笑い'),
  ('entertainment', 'タレント・モデル'),
  ('entertainment', 'VTuber'),
  ('entertainment', '配信者・ストリーマー'),
  ('entertainment', '芸能プロダクション');

-- 9 出版・文芸 (publishing)
insert into classifications (field_id, name) values
  ('publishing', '小説家・作家'),
  ('publishing', 'エッセイスト・詩人'),
  ('publishing', '出版社'),
  ('publishing', '書店'),
  ('publishing', '文芸作品');

-- 10 スポーツ・公営競技 (sports)
insert into classifications (field_id, name) values
  ('sports', '野球'),
  ('sports', 'サッカー・フットボール'),
  ('sports', 'バスケットボール'),
  ('sports', 'その他球技'),
  ('sports', '格闘技・武道'),
  ('sports', '陸上・水泳・体操等'),
  ('sports', '公営競技'),
  ('sports', 'スポーツ団体・連盟');

-- 11 飲食・観光・地域文化 (local)
insert into classifications (field_id, name) values
  ('local', '飲食店・カフェ・バー'),
  ('local', '水族館・動植物園'),
  ('local', '博物館・美術館・科学館'),
  ('local', '観光地・観光協会'),
  ('local', 'ホテル・旅館・宿泊'),
  ('local', '地域・自治体（観光発信）');

-- 12 美容・ファッション・装い (fashion)
insert into classifications (field_id, name) values
  ('fashion', 'ファッションブランド'),
  ('fashion', '美容・コスメ・スキンケア'),
  ('fashion', 'ヘアサロン・ネイル等'),
  ('fashion', 'フィットネス・スポーツジム'),
  ('fashion', '美容医療・クリニック'),
  ('fashion', 'インテリア・家具');

-- 13 探究・趣味・暮らし (lifestyle)
insert into classifications (field_id, name) values
  ('lifestyle', 'ペット・いきもの'),
  ('lifestyle', '動物カフェ'),
  ('lifestyle', '神社仏閣・寺院'),
  ('lifestyle', '文房具・ステーショナリー'),
  ('lifestyle', '料理・食・レシピ（個人）'),
  ('lifestyle', '手芸・クラフト・DIY'),
  ('lifestyle', 'アウトドア・自然'),
  ('lifestyle', 'コレクション・趣味全般');

-- 14 bot・定期配信 (bot)
insert into classifications (field_id, name) values
  ('bot', 'ニュース・情報配信'),
  ('bot', '気象・防災情報'),
  ('bot', '交通・路線情報'),
  ('bot', '定期コンテンツ・エンタメ');
