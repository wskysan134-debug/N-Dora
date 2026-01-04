module.exports.config = {
  name: "ابتايم ",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ꮙ. ᎬᏢᏕᎥ  ᏕᏢᎯᏒᎠᎯ",
  description: "عرض معلومات السيرفر",
  commandCategory: "النظام",
  usages: "ابتايم ",
  cooldowns: 3
};

module.exports.run = async function ({ api, event }) {
  const os = require("os");
  const moment = require("moment-timezone");

  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
  const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
  const usedMem = totalMem - freeMem;
  const memUsage = ((usedMem / totalMem) * 100).toFixed(0);

  const cpuModel = os.cpus()[0].model;
  const cpuCores = os.cpus().length;
  const osType = `${os.type()} ${os.release()}`;
  const currentTime = moment.tz("Africa/Algiers").format("YYYY-MM-DD | HH:mm:ss");

  const message = `

⏳: ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية ✅


  api.sendMessage(message, event.threadID, event.messageID);
};
