const a = require("axios");

module.exports = {
  config: {
    name: "gemini",
    aliases: ["ai", "chat", "chama"],
    version: "0.0.4",
    author: "Simo",
    countDown: 3,
    role: 0,
    shortDescription: "Ask Gemini AI",
    longDescription: "Talk with Gemini AI using a stable endpoint",
    category: "AI",
    guide: "/gemini [your question]"
  },

  onStart: async function ({ api, event, args }) {
    const p = args.join(" ");
    if (!p) return api.sendMessage("❌ عافاك اكتب السؤال أو البرومبت ديالك.", event.threadID, event.messageID);

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      // استخدام سيرفر مستقر ومحدث
      const res = await a.get(`https://api.sandipbaruwal.onrender.com/gemini?prompt=${encodeURIComponent(p)}`);
      
      // استخراج الرد بناءً على بنية استجابة السيرفر الجديدة
      const reply = res.data?.answer || res.data?.response || res.data?.reply;

      if (!reply) throw new Error("لم يتم العثور على رد في استجابة السيرفر.");

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(reply, event.threadID, (err, i) => {
        if (!i) return;
        global.GoatBot.onReply.set(i.messageID, { commandName: this.config.name, author: event.senderID });
      }, event.messageID);

    } catch (error) {
      console.error("🔴 Gemini API Error:", error.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ وقع مشكل فالاتصال بـ Gemini، جرب شوية آخر أو تأكد من السيرفر.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if ([api.getCurrentUserID()].includes(event.senderID)) return;
    const p = event.body;
    if (!p) return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await a.get(`https://api.sandipbaruwal.onrender.com/gemini?prompt=${encodeURIComponent(p)}`);
      const reply = res.data?.answer || res.data?.response || res.data?.reply;

      if (!reply) throw new Error("لم يتم العثور على رد في استجابة السيرفر.");

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(reply, event.threadID, (err, i) => {
        if (!i) return;
        global.GoatBot.onReply.set(i.messageID, { commandName: this.config.name, author: event.senderID });
      }, event.messageID);

    } catch (error) {
      console.error("🔴 Gemini Reply Error:", error.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ وقع مشكل أثناء الرد من طرف الذكاء الاصطناعي.", event.threadID, event.messageID);
    }
  }
};
