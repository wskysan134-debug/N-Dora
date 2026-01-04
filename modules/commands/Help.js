module.exports.config = {
  name: "اوامر",
  version: "1.0.4",
  hasPermssion: 0,
  credits: "XaviaTeam",
  description: "عرض جميع الأوامر أو تفاصيل أمر معين",
  commandCategory: "خدمات",
  usages: "[اسم الأمر] (اختياري)",
  cooldowns: 3
};

const langData = {
  "ar_SY": {
    "help.list": "{list}",
    "help.commandNotExists": "❌ الأمر {command} غير موجود.",
    "help.commandDetails": " ◆ الاسم: {name}\n ◆ الأسماء المستعارة: {aliases}\n ◆ الوصف: {description}\n ◆ الاستخدام: {usage}\n ◆ الصلاحيات: {permissions}\n ◆ الفئة: {category}\n ◆ وقت الانتظار: {cooldown} ثانية\n ◆ المطور: Rako San",
    "0": "عضو",
    "1": "إدارة المجموعة",
    "2": "إدارة البوت",
    "ADMIN": "المطور",
    "GENERAL": "عضو",
    "TOOLS": "أدوات",
    "ECONOMY": "اقتصاد",
    "MEDIA": "وسائط",
    "GROUP": "مجموعة",
    "AI": "ذكاء"
  }
};

const fs = require("fs");
const axios = require("axios");

async function ensureImageExists() {
  const folderPath = "./modules/commands/cache";
  const filePath = `${folderPath}/botW.jpg`;
  const imageUrl = "https://i.postimg.cc/sgQGvR9M/anime-girl.png";

  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
  if (!fs.existsSync(filePath)) {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(response.data));
  }

  return fs.createReadStream(filePath);
}

module.exports.run = async function({ api, event, args }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const prefix = "-";
  const language = "ar_SY";

  const commandName = args[0]?.toLowerCase();

  if (!commandName) {
    let categories = {};

    for (const [name, command] of commands.entries()) {
      if (command.config.isHidden) continue;
      
      let category = command.config.commandCategory || "GENERAL";
      if (langData[language][category.toUpperCase()]) {
        category = langData[language][category.toUpperCase()];
      }

      if (!categories[category]) categories[category] = [];
      categories[category].push(name);
    }

    let list = "※═════『قائمة الاوامر』═════※\n\n";

    for (const [category, cmds] of Object.entries(categories)) {
      list += ` □  ❴ ${category} ❵    \n\n`;
      for (let i = 0; i < cmds.length; i += 4) {
        const row = cmds.slice(i, i + 4).map(cmd => ` ◎ ${cmd}`).join("  ");
        list += `${row}\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n`;
      }
      list += "\n";
    }

    const total = Array.from(commands.values()).length;
    list += `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n`;
    list += `    ○ ❴ الاوامر ❵  ◄  ${total}\n`;
    list += `    ○ ❴ الاسم  ❵  ◄   سمسم \n`;
    list += `    ○ ❴ المطور ❵  ◄     \n`;
    list += `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n`;
    list += ` ◄  ${prefix}اوامر + اسم الامر لرؤية تفاصيل الامر \n`;

    const imageStream = await ensureImageExists();
    return api.sendMessage({ body: list, attachment: imageStream }, threadID, messageID);
  }

  const command = commands.get(commandName);
  if (!command) return api.sendMessage(`❌ الأمر ${commandName} غير موجود.`, threadID, messageID);

  let category = command.config.commandCategory || "GENERAL";
  if (langData[language][category.toUpperCase()]) {
    category = langData[language][category.toUpperCase()];
  }

  const msg = langData[language]["help.commandDetails"]
    .replace("{name}", command.config.name)
    .replace("{aliases}", command.config.aliases ? command.config.aliases.join(", ") : "لا يوجد")
    .replace("{description}", command.config.description || "لا يوجد وصف")
    .replace("{usage}", `${prefix}${command.config.name} ${command.config.usages || ""}`)
    .replace("{permissions}", (command.config.hasPermssion == 0) ? "عضو" : (command.config.hasPermssion == 1) ? "إدارة المجموعة" : "إدارة البوت")
    .replace("{category}", category)
    .replace("{cooldown}", command.config.cooldowns || 1);

  return api.sendMessage(msg, threadID, messageID);
};
