module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const stringSimilarity = require("string-similarity"),
    escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    logger = require("../../utils/log.js");
  const moment = require("moment-timezone");

  return async function ({ event }) {
    const dateNow = Date.now();
    const time = moment.tz("Asia/Manila").format("HH:MM:ss DD/MM/YYYY");
    const { allowInbox, PREFIX, ADMINBOT, DeveloperMode, adminOnly, YASSIN } = global.config;

    const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
    const { commands, cooldowns } = global.client;

    var { body, senderID, threadID, messageID } = event;
    if (!body) return;

    senderID = String(senderID);
    threadID = String(threadID);

    const threadSetting = threadData.get(threadID) || {};
    const prefix = "-"; // ✅ بادئة ثابتة -

    const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex(prefix)})\\s*`);
    const [matchedPrefix] = body.match(prefixRegex) || [null];

    // ✅ منع البوت من قراءة أو الاستجابة لأي رسالة إلا إذا بدأت بالبادئة
    if (!matchedPrefix) return;

    const args = body.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    var command = commands.get(commandName);

    // ✅ تجاهل الأوامر غير الموجودة بدون أي رد
    if (!command) return;

    if (YASSIN === "true" && !ADMINBOT.includes(senderID)) return;

    // ... (بقية منطق الحظر والصلاحيات كما هو في ملفك الأصلي)
    // تأكد من أن الجزء السفلي من الملف يحتوي على منطق تشغيل الأوامر (command.run)
