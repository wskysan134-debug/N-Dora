const { OpenAI } = require("openai");

module.exports.config = {
  name: "طقطقة",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ꮙ. ᎬᏢᏕᎥ  ᏕᏢᎯᏒᎠᎯ",
  description: "أمر مرح ومدعوم بالذكاء الاصطناعي للمزاح مع أعضاء المجموعة",
  commandCategory: "تسلية",
  usages: "[منشن الشخص أو كلام]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID, mentions } = event;
  
  const openai = new OpenAI({
    apiKey: process.env.REPLIT_AI_OPENAI_API_KEY,
    baseURL: "https://api.replit.com/ai/v1"
  });

  let targetName = "";
  if (Object.keys(mentions).length > 0) {
    targetName = Object.values(mentions)[0].replace("@", "");
  } else if (args.length > 0) {
    targetName = args.join(" ");
  }

  const senderName = await Users.getNameUser(senderID);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "أنت خبير في الطقطقة والمزاح الخفيف والكوميديا العربية. مهمتك هي كتابة رد مضحك ومرح جداً بناءً على الشخص أو الموضوع المذكور. اجعل الكلام باللهجة العامية المضحكة، استخدم الأمثال الشعبية بطريقة كوميدية، وأضف الكثير من الإيموجي المرحة. لا تكن مهيناً بشكل جارح، بل اجعل الجميع يضحك بما في ذلك الشخص المستهدف. كن خفيف ظل جداً." 
        },
        { 
          role: "user", 
          content: targetName ? `اعمل طقطقة مضحكة على ${targetName} بطلب من ${senderName}` : `قل نكتة أو ذبة مضحكة وجديدة للمجموعة بطلب من ${senderName}` 
        }
      ]
    });

    const joke = response.choices[0].message.content;
    return api.sendMessage(joke, threadID, messageID);
  } catch (error) {
    return api.sendMessage("حتى الذكاء الاصطناعي فصل ضحك وما قدر يرد! 😂 جرب مرة ثانية.", threadID, messageID);
  }
};
