module.exports.config = {
  name: "ضيفني",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ꮙ. ᎬᏢᏕᎥ  ᏕᏢᎯᏒᎠᎯ",
  description: "عرض قائمة المجموعات وإضافة المستخدم إليها",
  commandCategory: "خدمات",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  try {
    const allThreads = await api.getThreadList(100, null, ["INBOX"]);
    const groupThreads = allThreads.filter(thread => thread.isGroup && thread.threadID !== threadID);

    if (groupThreads.length === 0) {
      return api.sendMessage("لا توجد مجموعات متاحة حالياً.", threadID, messageID);
    }

    let msg = "قائمة المجموعات المتاحة:\n\n";
    groupThreads.forEach((thread, index) => {
      msg += `${index + 1}. ${thread.name || "مجموعة بدون اسم"}\n`;
    });

    msg += "\nقم بالرد على هذه الرسالة برقم المجموعة التي تريد الانضمام إليها.";

    return api.sendMessage(msg, threadID, (error, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        groupThreads: groupThreads.map(g => ({ id: g.threadID, name: g.name }))
      });
    }, messageID);
  } catch (e) {
    return api.sendMessage("حدث خطأ أثناء جلب قائمة المجموعات.", threadID, messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  if (handleReply.author !== senderID) return;

  const index = parseInt(body) - 1;
  if (isNaN(index) || index < 0 || index >= handleReply.groupThreads.length) {
    return api.sendMessage("رقم غير صحيح، يرجى اختيار رقم من القائمة.", threadID, messageID);
  }

  const selectedGroup = handleReply.groupThreads[index];

  try {
    await api.addUserToGroup(senderID, selectedGroup.id);
    return api.sendMessage(`تمت إضافتك بنجاح إلى مجموعة: ${selectedGroup.name}`, threadID, messageID);
  } catch (e) {
    return api.sendMessage(`فشل في إضافتك للمجموعة. تأكد أن البوت لا يزال عضواً هناك وأن إعدادات المجموعة تسمح بالإضافة.\nخطأ: ${e.message}`, threadID, messageID);
  }
};
