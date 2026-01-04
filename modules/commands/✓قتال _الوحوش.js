const { OpenAI } = require("openai");

module.exports.config = {
  name: "قتال_الوحوش",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "وسكي",
  description: "لعبة قتال الوحوش لربح الأموال وتطوير الأسلحة",
  commandCategory: "العاب",
  usages: "[بدء / هجوم / سلاح]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Currencies, Users }) {
  const { threadID, messageID, senderID } = event;
  const fs = require("fs-extra");
  const path = require("path");

  // تكامل Replit AI للذكاء الاصطناعي
  const openai = new OpenAI({
    apiKey: process.env.REPLIT_AI_OPENAI_API_KEY,
    baseURL: "https://api.replit.com/ai/v1"
  });

  const dataPath = path.join(__dirname, "cache", "monsters_game.json");
  if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));
  
  let gameData = {};
  if (fs.existsSync(dataPath)) {
    gameData = fs.readJSONSync(dataPath);
  }

  const action = args[0];
  const userData = gameData[senderID] || { hp: 100, weapon: "سكين صدئ", money: 0, level: 1 };

  if (action === "بدء" || !action) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Create a random anime-style monster for a game. Give it a name, HP, and a short funny description. Return as JSON: {name, hp, desc}" },
          { role: "user", content: "Generate monster" }
        ],
        response_format: { type: "json_object" }
      });
      const monster = JSON.parse(response.choices[0].message.content);
      gameData[senderID] = { ...userData, monster };
      fs.writeJSONSync(dataPath, gameData);

      let msg = `👹 ظهر وحش جديد!\n\n👾 الاسم: ${monster.name}\n❤️ الصحة: ${monster.hp}\n📜 الوصف: ${monster.desc}\n\n⚔️ سلاحك الحالي: ${userData.weapon}\n❤️ صحتك: ${userData.hp}\n\nاكتب ( .قتال_الوحوش هجوم ) للبدء!`;
      return api.sendMessage(msg, threadID, messageID);
    } catch (e) {
      return api.sendMessage("حدث خطأ أثناء استدعاء الوحش!", threadID, messageID);
    }
  }

  if (action === "هجوم") {
    if (!userData.monster) return api.sendMessage("لا يوجد وحش لقتاله! اكتب ( .قتال_الوحوش بدء )", threadID, messageID);

    const monster = userData.monster;
    const playerDamage = Math.floor(Math.random() * 20) + 10;
    const monsterDamage = Math.floor(Math.random() * 15) + 5;

    monster.hp -= playerDamage;
    userData.hp -= monsterDamage;

    let msg = `⚔️ قمت بمهاجمة ${monster.name} وتسببت بضرر ${playerDamage}!\n💥 قام الوحش بضربك وتسبب بضرر ${monsterDamage}!\n\n`;

    if (monster.hp <= 0) {
      const prize = Math.floor(Math.random() * 500) + 100;
      userData.money += prize;
      delete userData.monster;
      msg = `🎉 مبروك! قتلت الوحش ${monster.name} وحصلت على ${prize}$ من الأموال!\n💰 رصيدك الحالي: ${userData.money}$`;
      await Currencies.increaseMoney(senderID, prize);
    } else if (userData.hp <= 0) {
      userData.hp = 100;
      delete userData.monster;
      msg = `💀 لقد هزمت! الوحش ${monster.name} كان أقوى منك. تم استعادة صحتك وابدأ من جديد.`;
    } else {
      msg += `❤️ صحة الوحش المتبقية: ${monster.hp}\n❤️ صحتك المتبقية: ${userData.hp}`;
    }

    gameData[senderID] = userData;
    fs.writeJSONSync(dataPath, gameData);
    return api.sendMessage(msg, threadID, messageID);
  }

  if (action === "سلاح") {
    const weapons = [
      { name: "سيف الساموراي", price: 1000, damage: "+20" },
      { name: "فأس العملاق", price: 2500, damage: "+40" },
      { name: "رمح التنين", price: 5000, damage: "+70" }
    ];

    if (!args[1]) {
      let msg = "🏪 متجر الأسلحة:\n\n";
      weapons.forEach((w, i) => msg += `${i + 1}. ${w.name} - السعر: ${w.price}$ (ضرر ${w.damage})\n`);
      msg += "\nللشراء اكتب: ( .قتال_الوحوش سلاح [الرقم] )";
      return api.sendMessage(msg, threadID, messageID);
    }

    const choice = parseInt(args[1]) - 1;
    if (weapons[choice]) {
      const weapon = weapons[choice];
      const userMoney = (await Currencies.getData(senderID)).money;
      if (userMoney < weapon.price) return api.sendMessage("لا تملك أموالاً كافية!", threadID, messageID);

      await Currencies.decreaseMoney(senderID, weapon.price);
      userData.weapon = weapon.name;
      gameData[senderID] = userData;
      fs.writeJSONSync(dataPath, gameData);
      return api.sendMessage(`✅ تم شراء ${weapon.name} بنجاح!`, threadID, messageID);
    }
  }
};
