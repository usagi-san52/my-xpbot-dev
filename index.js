const fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const DATA_FILE = "./data.json";

// データ読み込み
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "{}");
    return {};
  }

  const text = fs.readFileSync(DATA_FILE, "utf8");

  if (!text.trim()) {
    return {};
  }

  return JSON.parse(text);
}

// データ保存
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

client.once("ready", () => {
  console.log(`ログイン完了2: ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const data = loadData();
  const guildId = message.guild.id;

  // サーバーのデータがまだ無ければ作る
  if (!data[guildId]) {
    data[guildId] = {};
  }

  // -------------------------
  // ① !set プレイヤー名 値
  // -------------------------
  if (
    message.content.startsWith("!set") ||
    message.content.startsWith("iset")
  ) {
    const args = message.content.trim().split(/\s+/);
    const player = args[1];
    const value = Number(args[2]);

    if (!player || player.trim().length === 0) {
      return message.reply("プレイヤー名を指定してね（例: !set あああ 50）");
    }

    if (isNaN(value)) {
      return message.reply("XPは数字で指定してね");
    }

    data[guildId][player] = value;
    saveData(data);

    return message.reply(`プレイヤー「${player}」に ${value} を保存したよ`);
  }
  // -------------------------
  // ② !get プレイヤー名
  // -------------------------
  if (message.content.startsWith("!get")) {
    const args = message.content.trim().split(/\s+/);
    const player = args[1];

    if (!player)
      return message.reply("プレイヤー名を指定してね（例: !get あああ）");

    const value = data[guildId][player];

    if (value === undefined) {
      return message.reply(`プレイヤー「${player}」のデータはまだないよ`);
    }

    return message.reply(`プレイヤー「${player}」のXPは ${value} だよ`);
  }

  // -------------------------
  // ③ !list（サーバー内のプレイヤー一覧）
  // -------------------------
  if (message.content === "!list") {
    const players = Object.keys(data[guildId]);

    if (players.length === 0) {
      return message.reply(
        "このサーバーにはまだプレイヤーが登録されていないよ",
      );
    }

    return message.reply(
      "このサーバーのプレイヤー一覧:\n" + players.join("\n"),
    );
  }

  // -------------------------
  // XP付き一覧 !listxp
  // -------------------------
  if (message.content === "!listxp") {
    const players = Object.entries(data[guildId]);
    // 例: [ ["あああ", 50], ["いいい", 30] ]

    if (players.length === 0) {
      return message.reply(
        "このサーバーにはまだプレイヤーが登録されていないよ",
      );
    }

    const lines = players.map(([name, xp]) => `${name}: ${xp}`);
    return message.reply("プレイヤー一覧（XP付き）:\n" + lines.join("\n"));
  }

  // -------------------------
  // ④ !del プレイヤー名（削除）
  // -------------------------
  if (message.content.startsWith("!del")) {
    const args = message.content.trim().split(/\s+/);
    const player = args[1];

    if (!player)
      return message.reply(
        "削除するプレイヤー名を指定してね（例: !del あああ）",
      );

    if (data[guildId][player] === undefined) {
      return message.reply(`プレイヤー「${player}」のデータは見つからないよ`);
    }

    delete data[guildId][player];
    saveData(data);

    return message.reply(`プレイヤー「${player}」のデータを削除したよ`);
  }

  // -------------------------
  // 可変人数 + 最大コスト差分 !sum
  // -------------------------
  if (message.content.startsWith("!sum")) {
    const args = message.content.trim().split(/\s+/);

    // 最低でも !sum A B 100 のように3つ必要
    if (args.length < 3) {
      return message.reply(
        "使い方: !sum プレイヤー1 プレイヤー2 ... 最大コスト",
      );
    }

    // 最後の引数が最大コスト
    const maxCost = Number(args[args.length - 1]);
    if (isNaN(maxCost)) {
      return message.reply("最後の値は最大コスト（数字）を指定してね");
    }

    // プレイヤー名は最後以外
    const players = args.slice(1, -1);

    let total = 0;
    const lines = [];

    for (const player of players) {
      const xp = data[guildId][player] ?? 0;
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

// ★ あなたの Bot トークンを貼る
client.login(process.env.BOT_TOKEN);
