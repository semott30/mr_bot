module.exports = {
  config: {
    name: "scan",
    aliases: ["سكان", "فحص"],
    version: "2.0.0", // النسخة المحدثة بنظام المصيدة
    author: "Simo",
    countDown: 5,
    role: 1, 
    shortDescription: "كشف مخربي الكنيات الذكي",
    longDescription: "يتعقب من يقوم بتغيير متكرر وسريع للكنيات (نظام Anti-Spam)",
    category: "admin",
    guide: "!scan"
  },

  onEvent: async function ({ api, event }) {
    // مراقبة أحداث تغيير الكنيات واسم الكروب فقط
    if (!["log:user-nickname", "log:thread-name"].includes(event.logMessageType)) return;

    const author = event.author;
    
    // استثناء البوت نفسه حتى لا يسجل نفسه
    if (author === api.getCurrentUserID()) return;

    // تجهيز الذاكرة إذا لم تكن موجودة
    if (!global.tempCounter) global.tempCounter = {}; // عداد مؤقت للكل
    if (!global.caughtSpammers) global.caughtSpammers = new Set(); // القائمة النهائية للمخربين

    // إذا كان الشخص موجوداً مسبقاً في قائمة المخربين، لا داعي لحسابه مجدداً
    if (global.caughtSpammers.has(author)) return;

    // إنشاء عداد للشخص إذا كانت هذه أول مرة يغير فيها
    if (!global.tempCounter[author]) {
      global.tempCounter[author] = { count: 0, timer: null };
    }

    // إضافة نقطة (تغيير واحد)
    global.tempCounter[author].count += 1;

    // إعادة ضبط المؤقت المؤقت: إذا مرت 60 ثانية دون تغيير، امسحه من الذاكرة تماماً
    clearTimeout(global.tempCounter[author].timer);
    global.tempCounter[author].timer = setTimeout(() => {
      delete global.tempCounter[author];
    }, 60000); // 60 ثانية (يمكنك تغييرها إلى 120000 لدقيقتين)

    // المصيدة: إذا قام بأكثر من 3 تغييرات في تلك الـ 60 ثانية، فقد تم اصطياده!
    if (global.tempCounter[author].count >= 4) {
      global.caughtSpammers.add(author); // إضافته للقائمة السوداء
      delete global.tempCounter[author]; // مسح عداده المؤقت لتوفير الذاكرة
    }
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;

    // التحقق من القائمة
    if (!global.caughtSpammers || global.caughtSpammers.size === 0) {
      return api.sendMessage("✅ الكروب نقي، ماكين حتى شي سبامر كيبدل بزاف حالياً.", threadID, event.messageID);
    }

    let msg = "⚠ قائمة المخربين اللي حصلو كيبدلو الكنيات أو السمية بزاف:\n\n";
    const spammers = Array.from(global.caughtSpammers);

    // تحويل الآيديهات إلى أسماء ليفضحهم
    for (const uid of spammers) {
      try {
        const userInfo = await api.getUserInfo(uid);
        const name = userInfo[uid]?.name || "عضو غير معروف";
        msg += `⚠ ${name} 🖕✅🚮\n`;
      } catch (e) {
        msg += `⚠ UserID: ${uid} 🖕✅🚮\n`;
      }
    }

    msg += "\n[!] تم تصفية القائمة بعد هذا الفحص.";
    
    // مسح قائمة المخربين لبدء مراقبة جديدة
    global.caughtSpammers.clear();

    api.sendMessage(msg, threadID, event.messageID);
  }
};
