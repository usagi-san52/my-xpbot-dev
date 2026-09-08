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

// ブキ一覧
const weapons = [
  "スプラシューター",
  "プロモデラーMG",
  "N-ZAP85",
  "ボールドマーカー",
  "わかばシューター",
  "シャープマーカー",
  "52ガロン",
  "96ガロン",
  "ジェットスイーパー",
  "プライムシューター",
  "スプラローラー",
  "カーボンローラー",
  "ヴァリアブルローラー",
  "スプラチャージャー",
  "スプラスコープ",
  "リッター4K",
  "4Kスコープ",
  "スプラマニューバー",
  "ケルビン525",
  "デュアルスイーパー",
  "パブロ",
  "ホクサイ",
  "スプラブラシ",
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
        `Aチーム人数: ${teamA_size}\n` +
        `Bチーム人数: ${teamB_size}\n\n` +
        `**Aチーム (合計XP: ${sumA})**\n${teamAList}\n\n` +
        `**Bチーム (合計XP: ${sumB})**\n${teamBList}\n\n` +
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
        { label: "全員に別々のブキを割り当てる", value: "multi" },
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    return message.reply({
      content: "ブキ抽選モードを選んでね！",
      components: [row],
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

  // チーム分け（50人対応）
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
        `Aチーム人数: ${teamA_size}\n` +
        `Bチーム人数: ${teamB_size}\n\n` +
        `**Aチーム (合計XP: ${sumA})**\n${teamAList}\n\n` +
        `**Bチーム (合計XP: ${sumB})**\n${teamBList}\n\n` +
        `XP差: ${bestDiff}`,
    );

    // ブキ抽選モード選択
    if (interaction.customId === "weapon_mode_select") {
      const mode = interaction.values[0];

      // ① 1種類だけ選ぶ
      if (mode === "single") {
        const weapon = weapons[Math.floor(Math.random() * weapons.length)];
        return interaction.reply(`🎯 今日のブキは **${weapon}** だよ！`);
      }

      // ② 全員に別々のブキを割り当てる
      if (mode === "multi") {
        const guildId = interaction.guild.id;
        const players = await listPlayers(guildId);

        if (players.length === 0) {
          return interaction.reply("まだプレイヤーが登録されていないよ");
        }

        if (players.length > weapons.length) {
          return interaction.reply("プレイヤー数がブキ数を超えているよ！");
        }

        // シャッフル
        const shuffled = [...weapons];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const lines = players.map((p, i) => `${p.player}: ${shuffled[i]}`);

        return interaction.reply("🎯 メンバー別ブキ抽選:\n" + lines.join("\n"));
      }
    }
  }
});

// ★ Bot トークン
client.login(process.env.BOT_TOKEN);
