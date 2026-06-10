const a = require("axios");

// نصيحة: يفضل وضع رابط الـ API المباشر هنا بدلاً من رابط غيتهاب إذا كنت تعرفه
// مثال: const BASE_API = "https://api.yourprovider.com";
const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports = {
  config: {
    name: "gemini",
    aliases: ["ai", "chat", "chama"], // تم إضافة chama هنا كـ alias ليشتغل الأمر به أيضاً
    version: "0.0.2",
    author: "ArYAN x Simo",
    countDown: 3,
    role: 0,
    shortDescription: "Ask Gemini AI",
    longDescription: "Talk with Gemini AI",
    category: "AI",
    guide: "/gemini [your question]"
  },

  onStart: async function({ api, event, args }) {
    let e;
    try {
      const apiConfig = await a.get(nix);
      e = apiConfig.data && apiConfig.data.api;
      if (!e) throw new Error("Configuration Error: Missing API in GitHub JSON.");
    } catch (error) {
      console.error("🔴 Error fetching config:", error.message);
      api.sendMessage("❌ فشل في جلب إعدادات الـ API من السيرفر الخارجي.", event.threadID, event.messageID);
      return;
    }

    const p = args.join(" ");
    if (!p) return api.sendMessage("❌ عافاك اكتب السؤال أو البرومبت ديالك.", event.threadID, event.messageID);

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const r = await a.get(`${e}/gemini?prompt=${encodeURIComponent(p)}`);
      
      // هنا تأكد من أن الـ API يعيد فعلاً 'response'. إذا كان يعيد شيء آخر غيره هنا.
      const reply = r.data?.response || r.data?.reply; 
      if (!reply) throw new Error("مفتاح الاستجابة غير صحيح أو الـ API أعاد رد فارغ.");

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage(reply, event.threadID, (err, i) => {
        if (!i) return;
        global.GoatBot.onReply.set(i.messageID, { commandName: this.config.name, author: event.senderID, baseApi: e });
      }, event.messageID);

    } catch (error) {
      console.error("🔴 Gemini API Error:", error.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ وقع مشكل فالاتصال بـ Gemini API، جرب شوية آخر.", event.threadID, event.messageID);
    }
  },

  onReply: async function({ api, event, Reply }) {
    if ([api.getCurrentUserID()].includes(event.senderID)) return;
    const { baseApi: e } = Reply;
    if (!e) return api.sendMessage("❌ انتهت الجلسة. صيفط رسالة جديدة باش تبدا.", event.threadID, event.messageID);

    const p = event.body;
    if (!p) return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const r = await a.get(`${e}/gemini?prompt=${encodeURIComponent(p)}`);
      const reply = r.data?.response || r.data?.reply; 
      if (!reply) throw new Error("مفتاح الاستجابة غير صحيح أو الـ API أعاد رد فارغ.");

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      api.sendMessage(reply, event.threadID, (err, i) => {
        if (!i) return;
        global.GoatBot.onReply.set(i.messageID, { commandName: this.config.name, author: event.senderID, baseApi: e });
      }, event.messageID);

    } catch (error) {
      console.error("🔴 Gemini Reply Error:", error.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("⚠ وقع مشكل أثناء الرد من طرف الذكاء الاصطناعي.", event.threadID, event.messageID);
    }
  }
};
