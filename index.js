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

client.once("ready", () => {
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
});

// ★ Bot トークン
client.login(process.env.BOT_TOKEN);
