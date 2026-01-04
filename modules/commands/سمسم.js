const { OpenAI } = require("openai");

module.exports.config = {
  name: "سمسم",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ꮙ. ᎬᏢᏕᎥ  ᏕᏢᎯᏒᎠᎯ",
  description: "بوت بشخصية مرحة وذكية يتحدث مثل البشر",
  commandCategory: "ذكاء اصطناعي",
  usages: "[نص الرسالة]",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  
  // تكامل Replit AI للوصول لـ GPT-4o
  const openai = new OpenAI({
    apiKey: process.env.REPLIT_AI_OPENAI_API_KEY,
    baseURL: "https://api.replit.com/ai/v1"
  });

  const prompt = args.join(" ");
  if (!prompt) return api.sendMessage("هلا والله! كيف أقدر أساعدك اليوم؟ اسألني أي شيء وبجاوبك بكل مرح! 😊", threadID, messageID);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "أنت اسمك 'سمسم'. أنت بوت دردشة مرح جداً، ذكي، وودود. تتحدث بلهجة عربية عامية بيضاء (مزيج مفهوم) وبأسلوب بشري طبيعي. استخدم الإيموجي في كلامك. لا تكن رسمياً أبداً. اجعل المستخدم يشعر أنه يتحدث مع صديق حقيقي. افهم المشاعر ورد عليها." 
        },
        { role: "user", content: prompt }
      ]
    });

    const reply = response.choices[0].message.content;
    return api.sendMessage(reply, threadID, messageID);
  } catch (error) {
    return api.sendMessage("أووه، حصل معي التماس بسيط في مخي الإلكتروني! 😅 جرب تسألني مرة ثانية.", threadID, messageID);
  }
};
