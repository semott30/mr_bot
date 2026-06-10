const a = require("axios");

// 🔴 مفتاح الـ API الخاص بك من جوجل
const GEMINI_API_KEY = "AQ.Ab8RN6IHWt15RukkrqNOaKm8sr_58cmeHDccpSOgtAM-PjVyPQ"; 

module.exports = {
  config: {
    name: "gemini",
    aliases: ["ai", "chat", "chama"],
    version: "1.0.0",
    author: "Simo",
    countDown: 3,
    role: 0,
    shortDescription: "Official Gemini AI",
    longDescription: "Talk directly to official Gemini API",
    category: "AI",
    guide: "/gemini [your question]"
  },

  onStart: async function ({ api, event, args }) {
    const p = args.join(" ");
    if (!p) return api.sendMessage("❌ عافاك اكتب السؤال أو البرومبت ديالك.", event.threadID, event.messageID);

    if (GEMINI_API_KEY === "ضع_مفتاح_جوجل_هنا") {
      return api.sendMessage("❌ عافاك حط مفتاح الـ API key ديالك فالمسار المخصص له داخل الكود أولاً.", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      // الاتصال المباشر واليومي بسيرفرات جوجل الرسمية
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const res = await a.post(url, {
        contents: [{ parts: [{ text: p }] }]
      });

      const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) throw new Error("استجابة غير متوقعة من سيرفر جوجل.");

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(reply, event.threadID, (err, i) => {
        if (!i) return;
        global.GoatBot.onReply.set(i.messageID, { commandName: this.config.name, author: event.senderID });
      }, event.messageID);

    } catch (error) {
      console.error("🔴 Gemini Official Error:", error.response?.data || error.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ وقع مشكل فالاتصال بسيرفرات جوجل الرسمية، تأكد من الـ API Key.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if ([api.getCurrentUserID()].includes(event.senderID)) return;
    const p = event.body;
    if (!p) return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const res = await a.post(url, {
        contents: [{ parts: [{ text: p }] }]
      });

      const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) throw new Error("استجابة غير متوقعة من سيرفر جوجل.");

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(reply, event.threadID, (err, i) => {
        if (!i) return;
        global.GoatBot.onReply.set(i.messageID, { commandName: this.config.name, author: event.senderID });
      }, event.messageID);

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ وقع مشكل أثناء الرد من طرف الذكاء الاصطناعي الرسمي.", event.threadID, event.messageID);
    }
  }
};
