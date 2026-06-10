const a = require("axios");

// الموديل والمفتاح الخاص بك
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=AQ.Ab8RN6IHWt15RukkrqNOaKm8sr_58cmeHDccpSOgtAM-PjVyPQ";

module.exports = {
  config: {
    name: "gemini",
    aliases: ["ai", "chat", "chama"],
    version: "2.0.0",
    author: "Simo",
    countDown: 3,
    role: 0,
    shortDescription: "Official Gemini 3.5 Flash",
    longDescription: "Talk directly to Google Gemini 3.5",
    category: "AI",
    guide: "/gemini [your question]"
  },

  onStart: async function ({ api, event, args }) {
    const p = args.join(" ");
    if (!p) return api.sendMessage("❌ عافاك اكتب السؤال ديالك.", event.threadID, event.messageID);

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await a.post(API_URL, {
        contents: [{ parts: [{ text: p + " (جاوبني بالدارجة المغربية أو العربية بشكل طبيعي)" }] }]
      });

      const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) throw new Error("استجابة غير متوقعة من جوجل.");

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(reply, event.threadID, (err, i) => {
        if (i) global.GoatBot.onReply.set(i.messageID, { commandName: this.config.name, author: event.senderID });
      }, event.messageID);

    } catch (error) {
      console.error("🔴 Gemini Error:", error.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ وقع مشكل فالاتصال بسيرفرات جوجل، تأكد من المفتاح.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if ([api.getCurrentUserID()].includes(event.senderID)) return;
    const p = event.body;
    if (!p) return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await a.post(API_URL, {
        contents: [{ parts: [{ text: p + " (جاوبني بالدارجة المغربية أو العربية)" }] }]
      });

      const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(reply, event.threadID, (err, i) => {
        if (i) global.GoatBot.onReply.set(i.messageID, { commandName: this.config.name, author: event.senderID });
      }, event.messageID);

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ مشكل فالرد، عاود حاول.", event.threadID, event.messageID);
    }
  }
};
