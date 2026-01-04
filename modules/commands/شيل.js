const { OpenAI } = require("openai");

module.exports.config = {
  name: "شيل",
  version: "2.0.0",
  hasPermssion: 2,
  credits: "وسكي",
  description: "مساعد ذكاء اصطناعي مطور لبناء وتعديل الأوامر وعرض الأكواد",
  commandCategory: "المطور",
  usages: "[اسم الملف / اصنع / انسخ]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const fs = require("fs-extra");
  const path = require("path");

  // تكامل Replit AI للوصول إلى GPT-4o
  const openai = new OpenAI({
    apiKey: process.env.REPLIT_AI_OPENAI_API_KEY,
    baseURL: "https://api.replit.com/ai/v1"
  });

  const query = args.join(" ");
  if (!query) return api.sendMessage("أهلاً بك! أنا مساعدك المطور. يمكنك استخدامي لتعديل الأوامر (شيل اسم.js)، أو صناعة أوامر جديدة (شيل اصنع...)، أو عرض كود أي ملف (شيل انسخ...).", threadID, messageID);

  const commandDir = path.join(__dirname);

  // الحالة 1: تعديل ملف موجود
  if (query.endsWith(".js") && fs.existsSync(path.join(commandDir, query)) && !query.includes("انسخ") && !query.includes("اصنع")) {
    const filePath = path.join(commandDir, query);
    const fileContent = fs.readFileSync(filePath, "utf8");
    api.sendMessage(`⏳ جاري تحليل الكود في ${query} وإصلاح الخلل...`, threadID, messageID);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert bot developer for FCA (Facebook Chat API). Your task is to analyze the provided code, fix all syntax errors, logic bugs, and ensure it follows the standard FCA command structure. Return ONLY the corrected code." },
          { role: "user", content: `Fix this code:\n\n${fileContent}` }
        ]
      });
      let newCode = response.choices[0].message.content.trim().replace(/^```javascript\n|```js\n|```\n|```$/g, "");
      fs.writeFileSync(filePath, newCode, "utf8");
      return api.sendMessage(`✅ تم إصلاح الخلل في ${query} بنجاح.\n\n--- الكود المحدث ---\n\n${newCode}`, threadID, messageID);
    } catch (error) {
      return api.sendMessage(`❌ حدث خطأ أثناء التعديل: ${error.message}`, threadID, messageID);
    }
  }

  // الحالة 2: صناعة أمر جديد (بناء ذكي)
  if (query.includes("اصنع") || query.includes("صمم")) {
    api.sendMessage("⏳ جاري بناء الأمر الجديد بمواصفات مطورة...", threadID, messageID);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an AI Bot Architect. Create a robust, high-quality JavaScript command for an FCA bot. Include config (name, version, hasPermssion, credits: 'وسكي', description, commandCategory: 'خدمات', usages, cooldowns) and an optimized run function. Use modern JS. Return ONLY the code." },
          { role: "user", content: `Requirement: ${query}` }
        ]
      });
      let generatedCode = response.choices[0].message.content.trim().replace(/^```javascript\n|```js\n|```\n|```$/g, "");
      const nameMatch = generatedCode.match(/name:\s*["'](.+?)["']/);
      const fileName = (nameMatch ? nameMatch[1] : "new_command") + ".js";
      const filePath = path.join(commandDir, fileName);
      fs.writeFileSync(filePath, generatedCode, "utf8");
      
      let successMsg = `🚀 **تم بناء الأمر بنجاح!**\n📄 الملف: ${fileName}\n\n💡 **الخطوات القادمة:**\n1️⃣ اكتب ( ريست ) لتحديث قائمة الأوامر.\n2️⃣ استخدم الأمر بـ: ( .${fileName.replace(".js", "")} )\n\n--- الكود البرمجي المولد ---\n\n${generatedCode}`;
      return api.sendMessage(successMsg, threadID, messageID);
    } catch (error) {
      return api.sendMessage(`❌ فشل في بناء الأمر: ${error.message}`, threadID, messageID);
    }
  }

  // الحالة 3: عرض/نسخ الكود (مساعد ذكي)
  if (query.includes("انسخ") || query.includes("عرض")) {
    const targetFile = args[args.length - 1];
    const fileName = targetFile.endsWith(".js") ? targetFile : targetFile + ".js";
    const filePath = path.join(commandDir, fileName);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      return api.sendMessage(`📄 كود الأمر المطلوب (${fileName}):\n\n${content}`, threadID, messageID);
    } else {
      return api.sendMessage(`❌ لم أجد ملفاً بهذا الاسم: ${fileName}`, threadID, messageID);
    }
  }

  return api.sendMessage("أنا المساعد الذكي المطور (Agent).\n\nاستخدم:\n- `شيل [اسم_الملف].js` (لإصلاح أي خلل).\n- `شيل اصنع [وصف]` (لبناء أمر جديد).\n- `شيل انسخ [اسم_الأمر]` (لعرض الكود).", threadID, messageID);
};
