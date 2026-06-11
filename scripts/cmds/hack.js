module.exports.config = {
  name: "hack",
  version: "1.4.0",
  role: 0,
  author: "Simo",
  description: "اختراق احترافي ببصمة سيمو",
  category: "Fun",
  guide: "{pn} @تاغ",
  countDown: 10
};

module.exports.onStart = async ({ message, event, api, usersData }) => {
  try {
    let targetID = Object.keys(event.mentions)[0] || (event.messageReply ? event.messageReply.senderID : null);
    if (!targetID) return message.reply("⚠️ طاكي الضحية!");

    let targetName = "الضحية";
    try { const userData = await usersData.get(targetID); targetName = userData.name || "الضحية"; } catch (e) {}

    await message.reply("[ ⏳ ] جاري الدخول إلى نظام " + targetName + "...");

    setTimeout(async () => {
      const report = `[ 💀 ] 𝗦𝗬𝗦𝗧𝗘𝗠 𝗛𝗔𝗖𝗞𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬 [ 💀 ]
━━━━━━━━━━━━━━━━━
🟢 اختراق هاتف الضحية بواسطة مبرمج سيمو 🟢
━━━━━━━━━━━━━━━━━
👤 الاسم: ${targetName}
🆔 الـ UID: ${targetID}
🌐 الـ IP: 105.150.20.10
📍 الموقع: Casablanca, Morocco
🛡️ مستوى الحماية: Critical
👥 عدد الأصدقاء: 842
📁 حالة الملفات: [ تم الوصول لـ 104 ملف مخفي ✔️ ]
━━━━━━━━━━━━━━━━━
⚠️ جاري سحب الصور والبيانات... 😂🏃‍♂️`;

      await message.reply(report);
    }, 3000);
  } catch (error) {
    message.reply("❌ عطل تقني.");
  }
};
