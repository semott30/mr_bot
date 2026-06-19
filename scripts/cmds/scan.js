module.exports = {
  config: {
    name: "scan",
    aliases: ["سكان", "فحص"],
    version: "4.0.0",
    author: "Simo",
    countDown: 5,
    role: 1, 
    shortDescription: "سجل آخر 10 تغييرات مع الأسماء",
    longDescription: "يتعقب آخر 10 أعضاء ويخزن أسماءهم فور قيامهم بالتخريب",
    category: "admin",
    guide: "!scan"
  },

  onEvent: async function ({ api, event }) {
    // مراقبة تغيير الكنيات واسم المجموعة
    if (!["log:user-nickname", "log:thread-name"].includes(event.logMessageType)) return;

    const author = event.author;
    const threadID = event.threadID;

    // استثناء البوت نفسه
    if (author === api.getCurrentUserID()) return;

    if (!global.spamTracker) global.spamTracker = {};
    if (!global.spamTracker[threadID]) global.spamTracker[threadID] = [];

    // البوت يحاول جلب الاسم في نفس اللحظة التي وقع فيها التخريب!
    let userName = "عضو متخفي";
    try {
      const userInfo = await api.getUserInfo(author);
      if (userInfo && userInfo[author] && userInfo[author].name) {
        userName = userInfo[author].name; // تخزين الاسم الحقيقي
      }
    } catch (e) {
      // في حالة نادرة جداً إذا فشل جلب الاسم
      userName = `مجهول (ID: ${author})`;
    }

    let list = global.spamTracker[threadID];

    // تحديث مكان المخرب في القائمة إذا كرر العملية
    list = list.filter(user => user.id !== author);
    
    // حفظ الاسم والآيدي معاً
    list.push({ id: author, name: userName });

    // الاحتفاظ بآخر 10 أشخاص فقط
    if (list.length > 10) {
      list.shift();
    }

    global.spamTracker[threadID] = list;
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;

    if (!global.spamTracker || !global.spamTracker[threadID] || global.spamTracker[threadID].length === 0) {
      return api.sendMessage("✅ الكروب نقي، ماكين حتى سجل لتغيير الكنيات مؤخراً.", threadID, event.messageID);
    }

    let msg = "⚠ قائمة آخر الأشخاص اللي بدلو الكنيات أو السمية:\n\n";
    const spammers = global.spamTracker[threadID];

    // عرض الأسماء اللي سجلها البوت
    for (const user of spammers) {
      msg += `⚠ ${user.name} 🖕✅🚮\n`;
    }

    msg += "\n[!] تم تسجيل الأسماء بواسطة البوت لحظة التغيير.";
    
    api.sendMessage(msg, threadID, event.messageID);
  }
};
