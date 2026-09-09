const { Client, GatewayIntentBits } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");

// Supabase クライアント
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ===============================
// 1. ブキ辞書
// ===============================
const quizWeapons = {
  "クイックボム+ウルトラショット": ["カーボンローラーデコ"],
  "キューバンボム+ウルトラショット": [
    "オーダーシューターレプリカ",
    "スプラシューター",
    "ヒーローシューターレプリカ",
  ],
  "スプラッシュシールド+ウルトラショット": [
    "ボトルガイザー",
    "フィンセントBRNZ",
  ],
  "ポイントセンサー+ウルトラショット": [
    "スクリュースロッシャーネオ",
    "ケルビン525デコ",
  ],
  "トラップ+ウルトラショット": ["キャンピングシェルターソレーラ"],
  "スプラッシュボム+ウルトラショット": ["クラッシュブラスター"],
  "カーリングボム+ウルトラショット": ["ドライブワイパーRUST"],
  "ジャンプビーコン+ウルトラショット": ["スプラスピナーPYTN"],

  "キューバンボム+エナジースタンド": ["N-ZAP85", "RブラスターエリートWNTR"],
  "タンサンボム+エナジースタンド": ["ヒッセン・ヒュー"],
  "スプリンクラー+エナジースタンド": ["ダイナモローラー", "R-PEN/5H"],
  "ジャンプビーコン+エナジースタンド": ["スパッタリー"],
  "ポイントセンサー+エナジースタンド": ["H3リールガン"],
  "カーリングボム+エナジースタンド": ["イグザミナー"],
  "ラインマーカー+エナジースタンド": ["96ガロン爪"],

  "キューバンボム+カニタンク": [
    "スプラマニューバー",
    "オーダーマニューバーレプリカ",
  ],
  "ラインマーカー+カニタンク": ["プライムシューター"],
  "カーリングボム+カニタンク": ["L3リールガン", "モップリン角"],
  "クイックボム+カニタンク": ["シャープマーカー"],
  "ポイズンミスト+カニタンク": ["ジムワイパー・ヒュー"],
  "スプラッシュボム+カニタンク": ["イグザミナー・ヒュー"],
  "スプリンクラー+カニタンク": ["スプラチャージャーFRST"],
  "スプリンクラー+カニタンク": ["スプラスコープFRST"],
  "ジャンプビーコン+カニタンク": ["ホットブラスター艶"],

  "スプラッシュボム+キューインキ": [
    "スプラチャージャー",
    "スプラスコープ",
    "オーダーチャージャーレプリカ",
  ],
  "ラインマーカー+キューインキ": ["ジェットスイーパー"],
  "スプリンクラー+キューインキ": ["96ガロン"],
  "ポイズンミスト+キューインキ": ["Rブラスターエリート"],
  "ジャンプビーコン+キューインキ": ["キャンピングシェルター"],
  "トラップ+キューインキ": ["クーゲルシュライバー・ヒュー"],
  "スプラッシュシールド+キューインキ": ["ワイドローラー"],

  "スプラッシュボム+グレートバリア": ["わかばシューター"],
  "カーリングボム+グレートバリア": [
    "スプラローラー",
    "オーダーローラーレプリカ",
  ],
  "ロボットボム+グレートバリア": ["ホットブラスター"],
  "ポイントセンサー+グレートバリア": ["スクイックリンα"],
  "ポイズンミスト+グレートバリア": ["スプラスピナーコラボ"],
  "スプラッシュシールド+グレートバリア": ["H3リールガンD"],
  "ラインマーカー+グレートバリア": ["24式張替傘・甲"],
  "キューバンボム+グレートバリア": ["デンタルワイパーミント"],
  "スプリンクラー+グレートバリア": ["ハイドラント圧"],
  "タンサンボム+グレートバリア": ["スプラマニューバー耀"],

  "タンサンボム+サメライド": ["プロモデラーMG"],
  "トラップ+サメライド": ["スパイガジェット"],
  "ロボットボム+サメライド": ["クアッドホッパーブラック"],
  "トーピード+サメライド": ["スパッタリー・ヒュー"],
  "スプリンクラー+サメライド": ["S-BLAST92"],
  "キューバンボム+サメライド": ["モップリン"],
  "スプラッシュシールド+サメライド": ["LACT-450デコ"],

  "ロボットボム+ショクワンダー": ["カーボンローラー", "スクイックリンβ"],
  "ラインマーカー+ショクワンダー": ["バケットスロッシャーデコ"],
  "キューバンボム+ショクワンダー": ["ホクサイ", "オーダーブラシレプリカ"],
  "スプラッシュボム+ショクワンダー": [
    "ノヴァブラスター",
    "オーダーブラスターレプリカ",
  ],
  "スプリンクラー+ショクワンダー": ["クアッドホッパーホワイト"],
  "クイックボム+ショクワンダー": ["ジムワイパー", "オーダーワイパーレプリカ"],

  "スプラッシュボム+トリプルトルネード": [
    "スプラシューターコラボ",
    "バケットスロッシャー",
    "オーダースロッシャーレプリカ",
    "オクタシューターレプリカ",
  ],
  "スプリンクラー+トリプルトルネード": [
    "パラシェルター",
    "オーダーシェルターレプリカ",
  ],
  "トラップ+トリプルトルネード": ["ラピッドブラスター"],
  "スプラッシュシールド+トリプルトルネード": [
    "スプラチャージャーコラボ",
    "スプラスコープコラボ",
  ],
  "キューバンボム+トリプルトルネード": [
    "シャープマーカーネオ",
    "H3リールガンSNAK",
  ],
  "クイックボム+トリプルトルネード": ["ガエンFFカスタム"],

  "トーピード+ホップソナー": ["もみじシューター"],
  "スプリンクラー+ホップソナー": ["バレルスピナー", "オーダースピナーレプリカ"],
  "スプラッシュボム+ホップソナー": ["デュアルスイーパー"],
  "キューバンボム+ホップソナー": ["ロングブラスター"],
  "トラップ+ホップソナー": ["リッター4K", "4Kスコープ"],
  "カーリングボム+ホップソナー": ["フィンセント"],
  "ジャンプビーコン+ホップソナー": ["モップリンD"],
  "ポイントセンサー+ホップソナー": ["フルイドVカスタム"],

  "スプラッシュボム+メガホンレーザー5.1ch": ["パブロ", "スパッタリーOWL"],
  "スプラッシュシールド+メガホンレーザー5.1ch": ["52ガロン"],
  "ジャンプビーコン+メガホンレーザー5.1ch": ["ボールドマーカーネオ"],
  "ロボットボム+メガホンレーザー5.1ch": ["14式竹筒銃・甲"],
  "ラインマーカー+メガホンレーザー5.1ch": ["Rブラスターエリートデコ"],
  "ポイズンミスト+メガホンレーザー5.1ch": [
    "トライストリンガー",
    "オーダーストリンガーレプリカ",
  ],
  "トラップ+メガホンレーザー5.1ch": ["ガエンFF"],
  "カーリングボム+メガホンレーザー5.1ch": ["スパイガジェット繚"],
  "ポイントセンサー+メガホンレーザー5.1ch": ["ダイナモローラー冥"],

  "ジャンプビーコン+テイオウイカ": [
    "スプラローラーコラボ",
    "リッター4Kカスタム",
    "4Kスコープカスタム",
  ],
  "ポイントセンサー+テイオウイカ": ["バレルスピナーデコ"],
  "スプラッシュボム+テイオウイカ": ["ロングブラスターカスタム"],
  "ラインマーカー+テイオウイカ": ["オーバーフロッシャーデコ"],
  "スプラッシュシールド+テイオウイカ": ["96ガロンデコ"],
  "クイックボム+テイオウイカ": ["スプラシューター煌"],
  "ロボットボム+テイオウイカ": ["ホクサイ彗"],

  "ロボットボム+デコイチラシ": ["N-ZAP89"],
  "ジャンプビーコン+デコイチラシ": ["デュアルスイーパーカスタム"],
  "タンサンボム+デコイチラシ": ["14式竹筒銃・乙", "カーボンローラーANGL"],
  "スプラッシュボム+デコイチラシ": ["ダイナモローラーテスラ"],
  "カーリングボム+デコイチラシ": ["クラッシュブラスターネオ"],
  "スプリンクラー+デコイチラシ": ["トライストリンガーコラボ"],
  "ポイズンミスト+デコイチラシ": ["キャンピングシェルターCREM"],

  "カーリングボム+スミナガシート": ["52ガロンデコ"],
  "キューバンボム+スミナガシート": ["ヴァリアブルローラーフォイル"],
  "トラップ+スミナガシート": ["ハイドラントカスタム"],
  "ロボットボム+スミナガシート": ["ボトルガイザーフォイル"],
  "トーピード+スミナガシート": ["スパイガジェットソレーラ"],
  "スプラッシュボム+スミナガシート": ["ヒッセンASH"],
  "クイックボム+スミナガシート": ["プロモデラー彩"],
  "ポイントセンサー+スミナガシート": ["デュアルスイーパー蹄"],

  "スプラッシュシールド+ウルトラチャクチ": ["エクスプロッシャーカスタム"],
  "キューバンボム+ウルトラチャクチ": ["ノーチラス79"],
  "カーリングボム+ウルトラチャクチ": ["スプラマニューバーコラボ"],
  "ポイントセンサー+ウルトラチャクチ": ["ホットブラスターカスタム"],
  "ポイズンミスト+ウルトラチャクチ": ["24式張替傘・乙"],
  "クイックボム+ウルトラチャクチ": ["ジェットスイーパーCOBR"],
  "トーピード+ウルトラチャクチ": ["ワイドローラー惑"],

  "スプリンクラー+アメフラシ": ["オーバーフロッシャー"],
  "ジャンプビーコン+アメフラシ": ["ホクサイ・ヒュー"],
  "ポイントセンサー+アメフラシ": ["エクスプロッシャー", "ノーチラス47"],
  "ポイズンミスト+アメフラシ": [
    "ジェットスイーパーカスタム",
    "シャープマーカーGECK",
  ],
  "ラインマーカー+アメフラシ": ["ワイドローラーコラボ"],
  "スプラッシュシールド+アメフラシ": ["R-PEN/5B"],

  "トラップ+ウルトラハンコ": ["パブロ・ヒュー"],
  "カーリングボム+ウルトラハンコ": ["ボールドマーカー"],
  "クイックボム+ウルトラハンコ": ["L3リールガンD", "スプラスピナー"],
  "タンサンボム+ウルトラハンコ": [
    "ノヴァブラスターネオ",
    "ソイチューバーカスタム",
  ],
  "トーピード+ウルトラハンコ": ["ドライブワイパー"],
  "ロボットボム+ウルトラハンコ": ["フルイドV"],

  "ロボットボム+ジェットパック": ["パラシェルターソレーラ"],
  "ポイズンミスト+ジェットパック": ["ヒッセン"],
  "トーピード+ジェットパック": ["ラピッドブラスターデコ"],
  "タンサンボム+ジェットパック": ["クーゲルシュライバー"],
  "トラップ+ジェットパック": ["スペースシューターコラボ"],
  "スプラッシュシールド+ジェットパック": ["デンタルワイパースミ"],
  "スプラッシュボム+ジェットパック": ["L3リールガン箔"],
  "ラインマーカー+ジェットパック": ["トライストリンガー燈"],

  "タンサンボム+ナイスダマ": ["スクリュースロッシャー"],
  "スプラッシュシールド+ナイスダマ": ["ケルビン525"],
  "キューバンボム+ナイスダマ": ["プライムシューターコラボ"],
  "ロボットボム+ナイスダマ": ["ハイドラント", "ジムワイパー封"],
  "スプリンクラー+ナイスダマ": ["プロモデラーRG"],
  "クイックボム+ナイスダマ": ["S-BLAST91"],
  "トーピード+ナイスダマ": ["LACT-450MILK"],

  "トーピード+マルチミサイル": ["ソイチューバー"],
  "トラップ+マルチミサイル": ["ヴァリアブルローラー"],
  "カーリングボム+マルチミサイル": ["LACT450"],
  "ジャンプビーコン+マルチミサイル": ["ドライブワイパーデコ"],
  "ポイントセンサー+マルチミサイル": ["フィンセント・ヒュー"],
  "スプラッシュボム+マルチミサイル": ["プライムシューターFRZN"],
};

// ===============================
// 2. 全ブキ一覧（SelectMenu用）
// ===============================
const allWeaponNames = Object.values(quizWeapons).flat();

// ===============================
// 連続正解メッセージ（10回まで）
// ===============================
const streakMessages = [
  "いいね！調子出てきた！",
  "その調子！まだいける！",
  "おお、連続正解！",
  "キレてるね！",
  "半分突破！すごい！",
  "勢い止まらん！",
  "強すぎる！",
  "天才か？",
  "神がかってる！",
  "🎉 10連続正解！すごい！！ 🎉",
];

// ユーザーごとのゲーム状態保存
const quizState = {};

// ===============================
// 5. SelectMenu 多段生成
// ===============================
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");

function createPagedMenus(items, customIdBase) {
  const menus = [];
  const pageSize = 25;

  for (let i = 0; i < items.length; i += pageSize) {
    const pageItems = items.slice(i, i + pageSize);

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`${customIdBase}_${menus.length}`)
      .setPlaceholder(`ブキを選んでね（ページ ${menus.length + 1}）`)
      .setMinValues(0)
      .setMaxValues(pageItems.length)
      .addOptions(
        pageItems.map((name) => ({
          label: name,
          value: name,
        })),
      );

    menus.push(new ActionRowBuilder().addComponents(menu));
  }

  return menus;
}

// ブキ一覧
const weapons = [
  // シューター
  "わかばシューター",
  "もみじシューター",
  "スプラシューター",
  "スプラシューターコラボ",
  "スプラシューター煌",
  "プロモデラーMG",
  "プロモデラーRG",
  "プロモデラー彩",
  "N-ZAP85",
  "N-ZAP89",
  "スペースシューター",
  "スペースシューターコラボ",
  "シャープマーカー",
  "シャープマーカーネオ",
  "シャープマーカーGECK",
  "プライムシューター",
  "プライムシューターコラボ",
  "プライムシューターFRZN",
  "52ガロン",
  "52ガロンデコ",
  "96ガロン",
  "96ガロンデコ",
  "96ガロン爪",
  "ジェットスイーパー",
  "ジェットスイーパーカスタム",
  "ジェットスイーパーCOBR",
  "ボールドマーカー",
  "ボールドマーカーネオ",
  "L3リールガン",
  "L3リールガンD",
  "L3リールガン箔",
  "H3リールガン",
  "H3リールガンD",
  "H3リールガンSNAK",
  "ボトルガイザー",
  "ボトルガイザーフォイル",

  // ブラスター
  "ホットブラスター",
  "ホットブラスターカスタム",
  "ホットブラスター艶",
  "ラピッドブラスター",
  "ラピッドブラスターデコ",
  "Rブラスターエリート",
  "Rブラスターエリートデコ",
  "RブラスターエリートWNTR",
  "ロングブラスター",
  "ロングブラスターカスタム",
  "クラッシュブラスター",
  "クラッシュブラスターネオ",
  "ノヴァブラスター",
  "ノヴァブラスターネオ",
  "S-BLAST92",
  "S-BLAST91",

  // ローラー
  "スプラローラー",
  "スプラローラーコラボ",
  "カーボンローラー",
  "カーボンローラーデコ",
  "カーボンローラーANGL",
  "ヴァリアブルローラー",
  "ヴァリアブルローラーフォイル",
  "ダイナモローラー",
  "ダイナモローラーテスラ",
  "ダイナモローラー冥",
  "ワイドローラー",
  "ワイドローラーコラボ",
  "ワイドローラー惑",

  // フデ
  "パブロ",
  "パブロ・ヒュー",
  "ホクサイ",
  "ホクサイ・ヒュー",
  "ホクサイ彗",
  "フィンセント",
  "フィンセント・ヒュー",
  "フィンセントBRNZ",

  // チャージャー
  "スプラチャージャー",
  "スプラチャージャーコラボ",
  "スプラチャージャーFRST",
  "スプラスコープ",
  "スプラスコープコラボ",
  "スプラスコープFRST",
  "リッター4K",
  "リッター4Kカスタム",
  "4Kスコープ",
  "4Kスコープカスタム",
  "スクイックリンα",
  "スクイックリンβ",
  "ソイチューバー",
  "ソイチューバーカスタム",
  "R-PEN/5H",
  "R-PEN/5B",
  "14式竹筒銃・甲",
  "14式竹筒銃・乙",

  // スロッシャー
  "バケットスロッシャー",
  "バケットスロッシャーデコ",
  "ヒッセン",
  "ヒッセン・ヒュー",
  "ヒッセンASH",
  "スクリュースロッシャー",
  "スクリュースロッシャーネオ",
  "モップリン",
  "モップリンD",
  "モップリン角",
  "オーバーフロッシャー",
  "オーバーフロッシャーデコ",
  "エクスプロッシャー",
  "エクスプロッシャーカスタム",

  // スピナー
  "スプラスピナー",
  "スプラスピナーコラボ",
  "スプラスピナーPYTN",
  "バレルスピナー",
  "バレルスピナーデコ",
  "ハイドラント",
  "ハイドラントカスタム",
  "ハイドラント圧",
  "クーゲルシュライバー",
  "クーゲルシュライバー・ヒュー",
  "ノーチラス47",
  "ノーチラス79",
  "イグザミナー",
  "イグザミナー・ヒュー",

  // マニューバー
  "スプラマニューバー",
  "スプラマニューバーコラボ",
  "スプラマニューバー耀",
  "デュアルスイーパー",
  "デュアルスイーパーカスタム",
  "デュアルスイーパー蹄",
  "ケルビン525",
  "ケルビン525デコ",
  "クアッドホッパーブラック",
  "クアッドホッパーホワイト",
  "スパッタリー",
  "スパッタリー・ヒュー",
  "スパッタリーOWL",
  "ガエンFF",
  "ガエンFFカスタム",

  // シェルター
  "パラシェルター",
  "パラシェルターソレーラ",
  "キャンピングシェルター",
  "キャンピングシェルターソレーラ",
  "キャンピングシェルターCREM",
  "スパイガジェット",
  "スパイガジェットソレーラ",
  "スパイガジェット繚",
  "24式張替傘・甲",
  "24式張替傘・乙",

  // ワイパー
  "ドライブワイパー",
  "ドライブワイパーデコ",
  "ドライブワイパーRUST",
  "ジムワイパー",
  "ジムワイパー・ヒュー",
  "ジムワイパー封",
  "デンタルワイパーミント",
  "デンタルワイパースミ",

  // ストリンガー
  "トライストリンガー",
  "トライストリンガーコラボ",
  "トライストリンガー燈",
  "LACT-450",
  "LACT-450デコ",
  "LACT-MILK",
  "フルイドV",
  "フルイドVカスタム",
];

// XP を取得
async function getXP(guildId, player) {
  const { data, error } = await supabase
    .from("xp")
    .select("xp")
    .eq("guild_id", guildId)
    .eq("player", player)
    .single();

  if (error) {
    console.error("getXP error:", error);
    return 0;
  }

  return data?.xp ?? 0;
}

// XP を保存
async function setXP(guildId, player, xp) {
  const { error } = await supabase
    .from("xp")
    .upsert({ guild_id: guildId, player, xp });

  if (error) {
    console.error("setXP error:", error);
  }
}

// XP を削除
async function deleteXP(guildId, player) {
  const { error } = await supabase
    .from("xp")
    .delete()
    .eq("guild_id", guildId)
    .eq("player", player);

  if (error) {
    console.error("deleteXP error:", error);
  }
}

// サーバー内の全プレイヤー一覧
async function listPlayers(guildId) {
  const { data, error } = await supabase
    .from("xp")
    .select("*")
    .eq("guild_id", guildId);

  if (error) {
    console.error("listPlayers error:", error);
    return [];
  }

  return data ?? [];
}

client.once("clientReady", () => {
  console.log(`ログイン完了: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const guildId = message.guild.id;

  // -------------------------
  // ① !set プレイヤー名 値
  // -------------------------
  if (message.content.startsWith("!set")) {
    const args = message.content.trim().split(/\s+/);
    const player = args[1]?.trim(); // ← 重要：スペース除去
    const value = Number(args[2]);

    if (!player) {
      return message.reply("プレイヤー名を指定してね（例: !set うさぎ 50）");
    }
    if (isNaN(value)) {
      return message.reply("XPは数字で指定してね");
    }

    await setXP(guildId, player, value);
    return message.reply(`プレイヤー「${player}」に ${value} を保存したよ`);
  }

  // -------------------------
  // ② !get プレイヤー名
  // -------------------------
  if (message.content.startsWith("!get")) {
    const args = message.content.trim().split(/\s+/);
    const player = args[1]?.trim(); // ← 重要

    if (!player) {
      return message.reply("プレイヤー名を指定してね（例: !get うさぎ）");
    }

    const xp = await getXP(guildId, player);

    if (xp === 0) {
      return message.reply(`プレイヤー「${player}」のデータはまだないよ`);
    }

    return message.reply(`プレイヤー「${player}」のXPは ${xp} だよ`);
  }

  // -------------------------
  // ③ !list（サーバー内のプレイヤー一覧）
  // -------------------------
  if (message.content === "!list") {
    const players = await listPlayers(guildId);

    if (players.length === 0) {
      return message.reply(
        "このサーバーにはまだプレイヤーが登録されていないよ",
      );
    }

    const names = players.map((p) => p.player);
    return message.reply("このサーバーのプレイヤー一覧:\n" + names.join("\n"));
  }

  // -------------------------
  // XP付き一覧 !listxp
  // -------------------------
  if (message.content === "!listxp") {
    const players = await listPlayers(guildId);

    if (players.length === 0) {
      return message.reply(
        "このサーバーにはまだプレイヤーが登録されていないよ",
      );
    }

    const lines = players.map((p) => `${p.player}: ${p.xp}`);
    return message.reply("プレイヤー一覧（XP付き）:\n" + lines.join("\n"));
  }

  // -------------------------
  // ④ !del プレイヤー名（削除）
  // -------------------------
  if (message.content.startsWith("!del")) {
    const args = message.content.trim().split(/\s+/);
    const player = args[1]?.trim(); // ← 重要

    if (!player) {
      return message.reply(
        "削除するプレイヤー名を指定してね（例: !del うさぎ）",
      );
    }

    await deleteXP(guildId, player);
    return message.reply(`プレイヤー「${player}」のデータを削除したよ`);
  }

  // -------------------------
  // ⑤ 可変人数 + 最大コスト差分 !sum
  // -------------------------
  if (message.content.startsWith("!sum")) {
    const args = message.content.trim().split(/\s+/);

    if (args.length < 3) {
      return message.reply(
        "使い方: !sum プレイヤー1 プレイヤー2 ... 最大コスト",
      );
    }

    const maxCost = Number(args[args.length - 1]);
    if (isNaN(maxCost)) {
      return message.reply("最後の値は最大コスト（数字）を指定してね");
    }

    const players = args.slice(1, -1).map((p) => p.trim());

    let total = 0;
    const lines = [];

    for (const player of players) {
      const xp = await getXP(guildId, player);
      total += xp;
      lines.push(`${player}: ${xp}`);
    }

    const remain = maxCost - total;

    return message.reply(
      "XP内訳:\n" +
        lines.join("\n") +
        `\n\n合計XP: ${total}\n最大コスト: ${maxCost}\n残りコスト: ${remain}`,
    );
  }

  // -------------------------
  // ⑦ !team プレイヤー名...
  // -------------------------
  if (message.content.startsWith("!team2 ")) {
    const args = message.content.trim().split(/\s+/);
    const players = args.slice(1).map((p) => p.trim());

    if (players.length < 4) {
      return message.reply("最低4人以上を指定してね（例: !team A B C D）");
    }
    if (players.length > 8) {
      return message.reply("最大8人まで指定できるよ（観戦枠なし仕様）");
    }

    const N = players.length;

    const teamA_size = Math.floor(N / 2);
    const teamB_size = N - teamA_size;

    const xpList = [];
    for (const player of players) {
      const xp = await getXP(guildId, player);
      xpList.push({ player, xp });
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    let bestTeamA = [];
    let bestTeamB = [];
    let bestDiff = Infinity;

    const goodCandidates = []; // 差200以下の候補を貯める

    for (let trial = 0; trial < 100; trial++) {
      const arr = [...xpList];
      shuffle(arr);

      const teamA = arr.slice(0, teamA_size);
      const teamB = arr.slice(teamA_size);

      const sumA = teamA.reduce((a, b) => a + b.xp, 0);
      const sumB = teamB.reduce((a, b) => a + b.xp, 0);
      const diff = Math.abs(sumA - sumB);

      // 差200以下なら候補として保存
      if (diff <= 200) {
        goodCandidates.push({ teamA, teamB, sumA, sumB, diff });
      }

      // 最小差も一応記録しておく（保険）
      if (diff < bestDiff) {
        bestDiff = diff;
        bestTeamA = teamA;
        bestTeamB = teamB;
      }
    }

    let finalTeamA, finalTeamB, sumA, sumB, finalDiff;

    if (goodCandidates.length > 0) {
      // 差200以下の中からランダムで1つ選ぶ
      const pick =
        goodCandidates[Math.floor(Math.random() * goodCandidates.length)];
      finalTeamA = pick.teamA;
      finalTeamB = pick.teamB;
      sumA = pick.sumA;
      sumB = pick.sumB;
      finalDiff = pick.diff;
    } else {
      // 200以下が1つもなければ最小差の組み合わせ
      finalTeamA = bestTeamA;
      finalTeamB = bestTeamB;
      sumA = finalTeamA.reduce((a, b) => a + b.xp, 0);
      sumB = finalTeamB.reduce((a, b) => a + b.xp, 0);
      finalDiff = Math.abs(sumA - sumB);
    }

    const teamAList = finalTeamA.map((p) => `${p.player} (${p.xp})`).join("\n");
    const teamBList = finalTeamB.map((p) => `${p.player} (${p.xp})`).join("\n");

    return message.reply(
      `入力人数: ${players.length}人\n` +
        `アルファチーム人数: ${teamA_size}\n` +
        `ブラボーチーム人数: ${teamB_size}\n\n` +
        `**アルファチーム (合計XP: ${sumA})**\n${teamAList}\n\n` +
        `**ブラボーチーム (合計XP: ${sumB})**\n${teamBList}\n\n` +
        `XP差: ${finalDiff}（許容200）`,
    );
  }

  // -------------------------
  // ⑪ 複数ルール選択式ステージ抽選 !stage
  // -------------------------
  if (message.content === "!stage") {
    const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("rule_multi_select")
      .setPlaceholder("ルールを選んでね（複数選択OK）")
      .setMinValues(1)
      .setMaxValues(4)
      .addOptions([
        { label: "ガチエリア", value: "ガチエリア" },
        { label: "ガチヤグラ", value: "ガチヤグラ" },
        { label: "ガチホコ", value: "ガチホコ" },
        { label: "ガチアサリ", value: "ガチアサリ" },
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    return message.reply({
      content: "ルールを選んでね！（複数選択できます）",
      components: [row],
    });
  }

  // -------------------------
  // ⑮ プレイヤー選択 → チーム分け UI（最大50人対応）
  // -------------------------
  if (message.content === "!team") {
    const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

    const players = await listPlayers(guildId);

    if (players.length === 0) {
      return message.reply("まだプレイヤーが登録されていないよ");
    }

    // 25人ずつに分割
    const firstGroup = players.slice(0, 25);
    const secondGroup = players.slice(25, 50);

    const rows = [];

    // 1つ目のメニュー（必ず表示）
    const menu1 = new StringSelectMenuBuilder()
      .setCustomId("player_team_select_1")
      .setPlaceholder("プレイヤー選択（1〜25人）")
      .setMinValues(0)
      .setMaxValues(firstGroup.length)
      .addOptions(
        firstGroup.map((p) => ({
          label: p.player,
          value: p.player,
        })),
      );

    rows.push(new ActionRowBuilder().addComponents(menu1));

    // ★ ここがポイント：25人を超えたときだけ2つ目を追加
    if (players.length > 25) {
      const menu2 = new StringSelectMenuBuilder()
        .setCustomId("player_team_select_2")
        .setPlaceholder("プレイヤー選択（26〜50人）")
        .setMinValues(0)
        .setMaxValues(secondGroup.length)
        .addOptions(
          secondGroup.map((p) => ({
            label: p.player,
            value: p.player,
          })),
        );

      rows.push(new ActionRowBuilder().addComponents(menu2));
    }

    return message.reply({
      content: "チーム分けするプレイヤーを選んでね！（最大50人対応）",
      components: rows,
    });
  }

  if (message.content === "!weapon") {
    const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("weapon_mode_select")
      .setPlaceholder("ブキ抽選モードを選んでね")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions([
        { label: "1種類だけ選ぶ（全員同じ）", value: "single" },
        { label: "選んだプレイヤーに別々のブキを割り当てる", value: "multi" },
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    return message.reply({
      content: "ブキ抽選モードを選んでね！",
      components: [row],
    });
  }

  // -------------------------
  // ① サブ＋スペシャル当てゲーム開始
  // -------------------------
  if (message.content === "!quiz1") {
    const keys = Object.keys(quizWeapons);

    // ランダムで組み合わせを選ぶ
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const [sub, sp] = randomKey.split("+");

    // 正解ブキ一覧
    const answers = quizWeapons[randomKey];

    // SelectMenu（複数ページ対応）
    const menus = createPagedMenus(allWeaponNames, "quiz1_select");

    // ゲーム状態保存
    quizState[message.author.id] = {
      answers,
      streak: quizState[message.author.id]?.streak || 0,
      selected: [],
    };

    // Embed
    const embed = new EmbedBuilder()
      .setTitle("🎯 サブ＋スペシャル当てゲーム")
      .setDescription(
        `**サブ：${sub}**\n**スペシャル：${sp}**\n\nこの組み合わせのブキを全部選んでね！\n（複数ページのメニューから選んでOK）`,
      )
      .setColor(0x00aeef);

    return message.reply({
      embeds: [embed],
      components: menus,
    });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  // ルール選択
  if (interaction.customId === "rule_multi_select") {
    const selectedRules = interaction.values;

    const stages = [
      "ユノハナ大渓谷",
      "ゴンズイ地区",
      "ヤガラ市場",
      "マテガイ放水路",
      "ナメロウ金属",
      "クサヤ温泉",
      "ヒラメが丘団地",
      "マサバ海峡大橋",
      "スメーシーワールド",
      "キンメダイ美術館",
      "リュウグウターミナル",
      "デカライン高架下",
      "バイガイ亭",
      "ナンプラー遺跡",
      "マヒマヒリゾート＆スパ",
      "ザトウマーケット",
      "チョウザメ造船",
      "マンタマリア号",
      "カジキ空港",
      "ネギトロ炭鉱",
      "タラポートショッピングセンター",
      "タカアシ経済特区",
      "オヒョウ海運",
      "海女美術大学",
      "コンブトラック",
    ];

    const stage = stages[Math.floor(Math.random() * stages.length)];
    const rule =
      selectedRules[Math.floor(Math.random() * selectedRules.length)];

    return interaction.reply(
      `🎯 **選択ルール: ${selectedRules.join(", ")}**\n` +
        `🎲 抽選ルール: **${rule}**\n` +
        `🗺️ ステージ: **${stage}**`,
    );
  }

  // -------------------------
  // ブキ抽選モード選択
  // -------------------------
  if (interaction.customId === "weapon_mode_select") {
    const mode = interaction.values[0];

    // ① 1種類だけ選ぶ
    if (mode === "single") {
      const weapon = weapons[Math.floor(Math.random() * weapons.length)];
      return interaction.reply(`🎯 今回のブキは **${weapon}** だよ！`);
    }

    // ② プレイヤー選択 UI を表示（最大8人）
    if (mode === "multi") {
      const guildId = interaction.guild.id;
      const players = await listPlayers(guildId);

      if (players.length === 0) {
        return interaction.reply("まだプレイヤーが登録されていないよ");
      }

      const {
        ActionRowBuilder,
        StringSelectMenuBuilder,
      } = require("discord.js");

      const menu = new StringSelectMenuBuilder()
        .setCustomId("weapon_player_select")
        .setPlaceholder("ブキを割り当てるプレイヤーを選んでね（最大8人）")
        .setMinValues(1)
        .setMaxValues(8)
        .addOptions(
          players.map((p) => ({
            label: p.player,
            value: p.player,
          })),
        );

      const row = new ActionRowBuilder().addComponents(menu);

      return interaction.reply({
        content: "プレイヤーを選んでね！（最大8人）",
        components: [row],
      });
    }
  }

  // -------------------------
  // ブキ割り当て（選んだプレイヤーに割り当て）
  // -------------------------
  if (interaction.customId === "weapon_player_select") {
    await interaction.deferReply();

    const selectedPlayers = interaction.values;

    if (selectedPlayers.length === 0) {
      return interaction.editReply("最低1人以上選んでね");
    }

    if (selectedPlayers.length > 8) {
      return interaction.editReply("最大8人まで選べるよ");
    }

    // シャッフル
    const shuffled = [...weapons];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const lines = selectedPlayers.map((p, i) => `${p}: ${shuffled[i]}`);

    return interaction.editReply(
      "🎯 **選んだプレイヤーのブキ抽選結果**\n" + lines.join("\n"),
    );
  }

  // -------------------------
  // チーム分け（50人対応）
  // -------------------------
  if (
    interaction.customId === "player_team_select_1" ||
    interaction.customId === "player_team_select_2"
  ) {
    await interaction.deferReply();

    const guildId = interaction.guild.id;

    // どちらのメニューでも選択されたプレイヤーを取得
    const selectedPlayers = interaction.values;

    if (selectedPlayers.length < 4) {
      return interaction.editReply("最低4人以上選んでね");
    }
    if (selectedPlayers.length > 8) {
      return interaction.editReply("最大8人まで選べるよ（観戦枠なし仕様）");
    }

    const xpList = [];
    for (const player of selectedPlayers) {
      const xp = await getXP(guildId, player);
      xpList.push({ player, xp });
    }

    const N = xpList.length;
    const teamA_size = Math.floor(N / 2);
    const teamB_size = N - teamA_size;

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    let bestTeamA = [];
    let bestTeamB = [];
    let bestDiff = Infinity;

    for (let trial = 0; trial < 100; trial++) {
      const arr = [...xpList];
      shuffle(arr);

      const teamA = arr.slice(0, teamA_size);
      const teamB = arr.slice(teamA_size);

      const sumA = teamA.reduce((a, b) => a + b.xp, 0);
      const sumB = teamB.reduce((a, b) => a + b.xp, 0);
      const diff = Math.abs(sumA - sumB);

      if (diff < bestDiff) {
        bestDiff = diff;
        bestTeamA = teamA;
        bestTeamB = teamB;
      }
    }

    const sumA = bestTeamA.reduce((a, b) => a + b.xp, 0);
    const sumB = bestTeamB.reduce((a, b) => a + b.xp, 0);

    const teamAList = bestTeamA.map((p) => `${p.player} (${p.xp})`).join("\n");
    const teamBList = bestTeamB.map((p) => `${p.player} (${p.xp})`).join("\n");

    return interaction.editReply(
      `🎯 **選択人数: ${selectedPlayers.length}人**\n` +
        `アルファチーム人数: ${teamA_size}\n` +
        `ブラボーチーム人数: ${teamB_size}\n\n` +
        `**アルファチーム (合計XP: ${sumA})**\n${teamAList}\n\n` +
        `**ブラボーチーム (合計XP: ${sumB})**\n${teamBList}\n\n` +
        `XP差: ${bestDiff}`,
    );
  }

  // -------------------------
  // ② 回答チェック
  // -------------------------
  if (!interaction.customId.startsWith("quiz1_select")) return;

  const userId = interaction.user.id;
  const state = quizState[userId];
  if (!state) return interaction.reply("ゲームが開始されていません！");

  // 選択されたブキを蓄積
  state.selected = [...new Set([...state.selected, ...interaction.values])];

  // 正解判定
  const isCorrect = state.answers.every((a) => state.selected.includes(a));

  if (isCorrect) {
    state.streak++;

    const msgIndex = Math.min(state.streak - 1, streakMessages.length - 1);
    const streakMsg = streakMessages[msgIndex];

    const embed = new EmbedBuilder()
      .setTitle("🎉 正解！")
      .setDescription(`${streakMsg}\n\n現在の連続正解数：**${state.streak}**`)
      .setColor(0xffd700);

    return interaction.reply({ embeds: [embed] });
  } else {
    const embed = new EmbedBuilder()
      .setTitle("📝 選択を記録したよ")
      .setDescription("まだ他にも正解があるよ！")
      .setColor(0x00aeef);

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

// ★ Bot トークン
client.login(process.env.BOT_TOKEN);
