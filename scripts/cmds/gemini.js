const a = require("axios");

// قائمة سيرفرات بديلة لضمان اشتغال الأمر 24/7 بدون انقطاع
const API_ENDPOINTS = [
  "https://api.samir-xyz.tech",
  "https://sandipbaruwal.onrender.com",
  "https://api.shayan-project.xyz" // القديم تركناه كخيار أخير فقط
];

module.exports = {
  config: {
    name: "gemini",
    aliases: ["ai", "chat", "chama"],
    version: "0.0.3",
    author: "Simo",
    countDown: 3,
    role: 0,
    shortDescription: "Ask Gemini AI",
    longDescription: "Talk with Gemini AI using stable endpoints",
    category: "AI",
    guide: "/gemini [your question]"
  },

  onStart: async function({ api, event, args }) {
    const p = args.join(" ");
    if (!p) return api.sendMessage("❌ عافاك اكتب السؤال أو البرومبت ديالك.", event.threadID, event.messageID);

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    // محاولة الاتصال بالسيرفرات المتاحة بالتتابع حتى يشتغل أحدها
    let reply = null;
    let success = false;

    for (const baseUrl of API_ENDPOINTS) {
      try {
        const r = await a.get(`${baseUrl}/gemini?prompt=${encodeURIComponent(p)}`);
        reply = r.data?.response || r.data?.reply || r.data?.gemini;
        if (reply) {
          success = true;
          break; // وجدنا سيرفر شغال، نخرج من الحلقة
        }
      } catch (err) {
        // إذا فشل سيرفر، ننتقل للتالي صامتين
        continue;
      }
    }

    if (success && reply) {
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(reply, event.threadID, (err, i) => {
        if (!i) return;
        global.GoatBot.onReply.set(i.messageID, { commandName: this.config.name, author: event.senderID });
      }, event.messageID);
    } else {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ جميع سيرفرات Gemini متوقفة حالياً، جرب شوية آخر.", event.threadID, event.messageID);
    }
  },

  onReply: async function({ api, event, Reply }) {
    if ([api.getCurrentUserID()].includes(event.senderID)) return;
    const p = event.body;
    if (!p) return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    let reply = null;
    let success = false;

    for (const baseUrl of API_ENDPOINTS) {
      try {
        const r = await a.get(`${baseUrl}/gemini?prompt=${encodeURIComponent(p)}`);
        reply = r.data?.response || r.data?.reply || r.data?.gemini;
        if (reply) {
          success = true;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    if (success && reply) {
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(reply, event.threadID, (err, i) => {
        if (!i) return;
        global.GoatBot.onReply.set(i.messageID, { commandName: this.config.name, author: event.senderID });
      }, event.messageID);
    } else {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ وقع مشكل أثناء الرد من طرف الذكاء الاصطناعي.", event.threadID, event.messageID);
    }
  }
};
