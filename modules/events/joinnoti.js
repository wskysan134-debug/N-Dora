module.exports.config = {
  name: "joinNoti",
  eventType: ["log:subscribe"],
  version: "1.0.1",
  credits: "Mirai Team",
  description: "تنبيه انضمام احترافي باللغة العربية",
  dependencies: {
    "fs-extra": "",
    "path": "",
    "moment-timezone": ""
  }
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID } = event;
  const moment = require("moment-timezone");
  const path = require("path");
  const { createReadStream, existsSync } = global.nodemodule["fs-extra"];

  // --- إعدادات الوقت والتاريخ ---
  const time = moment.tz("Asia/Ho_Chi_Minh"); 
  const gio = time.format("HH");
  const bok = time.format("DD/MM/YYYY");
  
  let session = "";
  if (gio >= 5 && gio < 11) session = "الصباح ☀️";
  else if (gio >= 11 && gio < 14) session = "الظهيرة 🌤️";
  else if (gio >= 14 && gio < 19) session = "المساء ⛅";
  else session = "الليل ✨";

  // --- الحالة الأولى: انضمام البوت للمجموعة ---
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    const botName = global.config.BOTNAME || "بوت ميرائي";
    const prefix = global.config.PREFIX || "/";
    
    api.changeNickname(`[ ${prefix} ] • ${botName}`, threadID, api.getCurrentUserID());
    
    let botMsg = `╭─── • ◈ • ───╮\n` +
                 `  تـم تـفـعـيـل الـبـوت \n` +
                 `╰─── • ◈ • ───╯\n` +
                 `•🤖 اسـم الـبـوت: [ ${botName} ]\n` +
                 `•⚙️ الإصـدار: [ ${this.config.version} ]\n` +
                 `•👤 الـمـطـور: [ ${this.config.credits} ]\n` +
                 `•🛠️ الـبـادئـة: [ ${prefix} ]\n` +
                 `•✨ الـحـالـة: [ نـشـط الآن ]\n` +
                 `•⏰ الـتـوقـيـت: [ ${session} ]\n` +
                 `•📅 الـتـاريخ: [ ${bok} ]\n` +
                 `--------------------------\n` +
                 `• اكتب [ ${prefix}help ] لعرض الأوامر\n` +
                 `شكراً لاستخدامكم خدماتنا 🤠🚬`;
                   
    return api.sendMessage(botMsg, threadID);
  } 
  
  // --- الحالة الثانية: انضمام عضو جديد ---
  else {
    try {
      const { threadName, participantIDs } = await api.getThreadInfo(threadID);
      const nameArray = [];
      const mentions = [];
      const memLength = [];
      let i = 0;

      for (const item of event.logMessageData.addedParticipants) {
        const userName = item.fullName;
        const id = item.userFbId;
        
        nameArray.push(userName);
        mentions.push({ tag: userName, id: id });
        memLength.push(participantIDs.length - i++);

        if (!global.data.allUserID.includes(id)) {
          await Users.createData(id, { name: userName, data: {} });
          global.data.userName.set(id, userName);
          global.data.allUserID.push(id);
        }
      }
      
      memLength.sort((a, b) => a - b);
      const threadData = global.data.threadData.get(parseInt(threadID)) || {};
      
      const authorData = await Users.getData(event.author);
      const nameAuthor = typeof authorData.name === "undefined" ? "رابط الدعوة" : authorData.name;

      let msg = "";
      if (typeof threadData.customJoin === "undefined") {
        msg = `╭─── • ◈ • ───╮\n` +
              `  أهـلاً بـك فـي الـمـجـمـوعـة \n` +
              `╰─── • ◈ • ───╯\n` +
              `•👤 الاسـم: [ {name} ]\n` +
              `•🔢 الـعـضو رقـم: [ {soThanhVien} ]\n` +
              `•🏠 الـمـجـمـوعـة: [ {threadName} ]\n` +
              `•➕ تـمـت الإضـافـة بـواسطة: [ {author} ]\n` +
              `•⏰ الـتـوقـيـت: [ {get} ]\n` +
              `•📅 الـتـاريخ: [ {bok} ]\n` +
              `--------------------------\n` +
              `✨ دعـاء: "اللهم بارك لنا في جمعنا هذا واجعله جمعاً مرحوماً"\n` +
              `--------------------------\n` +
              `نـتـمـنـى لـك وقـتـاً مـمـتـعـاً 💝`;
      } else {
        msg = threadData.customJoin;
      }

      msg = msg
        .replace(/\{name}/g, nameArray.join(", "))
        .replace(/\{soThanhVien}/g, memLength.join(", "))
        .replace(/\{threadName}/g, threadName)
        .replace(/\{get}/g, session)
        .replace(/\{author}/g, nameAuthor)
        .replace(/\{bok}/g, bok);

      const pathGif = path.join(__dirname, "cache", "joinGif", `1.mp5`);
      let formPush = { body: msg, mentions };

      if (existsSync(pathGif)) {
        formPush.attachment = createReadStream(pathGif);
      }

      return api.sendMessage(formPush, threadID);
    } catch (e) {
      console.log(e);
    }
  }
};
