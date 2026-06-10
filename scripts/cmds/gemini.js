const a = require("axios");

module.exports = {
  config: {
    name: "gemini",
    aliases: ["ai", "chat", "chama"],
    version: "1.0.2",
    author: "Simo",
    countDown: 3,
    role: 0,
    shortDescription: "Free Gemini AI",
    longDescription: "Talk with Gemini AI easily",
    category: "AI",
    guide: "/gemini [your question]"
  },

  onStart: async function ({ api, event, args }) {
    const p = args.join(" ");
    if (!p) return api.sendMessage("❌ عافاك اكتب السؤال أو البرومبت ديالك.", event.threadID, event.messageID);

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    // إضافة أمر خفي ليجيب البوت بالدارجة المغربية أو العربية
    const finalPrompt = p + " (جاوبني بالدارجة المغربية أو العربية بشكل طبيعي)";

    try {
      const url = `https://deku-rest-api.eugene-dev.com/gemini?prompt=${encodeURIComponent(finalPrompt)}`;
      
      const res = await a.get(url);
      const reply = res.data?.gemini || res.data?.reply || res.data?.response || res.data?.data;

      if (!reply) throw new Error("استجابة خاوية من السيرفر.");

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(reply, event.threadID, (err, i) => {
        if (!i) return;
        global.GoatBot.onReply.set(i.messageID, { commandName: this.config.name, author: event.senderID });
      }, event.messageID);

    } catch (error) {
      console.error("🔴 API Error:", error.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      
      // نظام احتياطي في حالة تعطل السيرفر الأول
      try {
        const backupUrl = `https://api.kenliejugarap.com/freegemini/?text=${encodeURIComponent(finalPrompt)}`;
        const resBackup = await a.get(backupUrl);
        const backupReply = resBackup.data?.response || resBackup.data?.reply;
        
        if (backupReply) {
          api.setMessageReaction("✅", event.messageID, () => {}, true);
          return api.sendMessage(backupReply, event.threadID, (err, i) => {
             if (i) global.GoatBot.onReply.set(i.messageID, { commandName: this.config.name, author: event.senderID });
          }, event.messageID);
        }
      } catch (err) {}

      api.sendMessage("⚠ السيرفرات البديلة حتى هي عليها ضغط دابا، جرب من بعد شوية.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if ([api.getCurrentUserID()].includes(event.senderID)) return;
    const p = event.body;
    if (!p) return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const finalPrompt = p + " (جاوبني بالدارجة المغربية أو العربية بشكل طبيعي)";

    try {
      const url = `https://deku-rest-api.eugene-dev.com/gemini?prompt=${encodeURIComponent(finalPrompt)}`;
      
      const res = await a.get(url);
      const reply = res.data?.gemini || res.data?.reply || res.data?.response || res.data?.data;

      if (!reply) throw new Error("استجابة خاوية.");

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(reply, event.threadID, (err, i) => {
        if (!i) return;
        global.GoatBot.onReply.set(i.messageID, { commandName: this.config.name, author: event.senderID });
      }, event.messageID);

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ وقع مشكل أثناء الرد من طرف الذكاء الاصطناعي.", event.threadID, event.messageID);
    }
  }
};
