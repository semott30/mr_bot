module.exports = {
  config: {
    name: "re",
    aliases: ["تغييرات", "تغيير"],
    version: "1.0.0",
    author: "Simo",
    countDown: 5,
    role: 1, 
    shortDescription: "كشف من غير اسم وصورة المجموعة",
    longDescription: "يتعرف على من قام بتغيير اسم أو صورة المجموعة مع تحديد جنس الفاعل (ذكر/أنثى)",
    category: "admin",
    guide: "!re"
  },

  onEvent: async function ({ api, event }) {
    // التحقق مما إذا كان الحدث تغييراً لاسم المجموعة أو لصورة المجموعة
    const isNameChange = event.logMessageType === "log:thread-name";
    const isImageChange = event.logMessageType === "log:thread-icon" || event.type === "change_thread_image";

    if (!isNameChange && !isImageChange) return;

    const author = event.author;
    const threadID = event.threadID;

    // استثناء البوت نفسه
    if (author === api.getCurrentUserID()) return;

    // تجهيز مساحة في الذاكرة لتخزين التغييرات
    if (!global.groupChangesTracker) global.groupChangesTracker = {};
    if (!global.groupChangesTracker[threadID]) global.groupChangesTracker[threadID] = {};
    
    // إذا لم يكن الشخص مسجلاً من قبل، نضيفه
    if (!global.groupChangesTracker[threadID][author]) {
      global.groupChangesTracker[threadID][author] = { nameChanged: false, imageChanged: false };
    }

    // تسجيل نوع التخريب (يمكن أن يفعل الاثنين معاً)
    if (isNameChange) global.groupChangesTracker[threadID][author].nameChanged = true;
    if (isImageChange) global.groupChangesTracker[threadID][author].imageChanged = true;
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;

    // إذا لم يكن هناك أي سجل للتغييرات
    if (!global.groupChangesTracker || !global.groupChangesTracker[threadID] || Object.keys(global.groupChangesTracker[threadID]).length === 0) {
      return api.sendMessage("✅ لم يتم تغيير اسم أو صورة المجموعة مؤخراً.", threadID, event.messageID);
    }

    let msg = "";
    const authors = Object.keys(global.groupChangesTracker[threadID]);

    for (const uid of authors) {
      const data = global.groupChangesTracker[threadID][uid];
      let userName = "عضو متخفي";
      let isFemale = false; // الافتراضي ذكر حتى نتحقق

      try {
        const userInfo = await api.getUserInfo(uid);
        if (userInfo && userInfo[uid]) {
          userName = userInfo[uid].name || userName;
          // فيسبوك يعطي رقم 1 للأنثى، و 2 للذكر
          if (userInfo[uid].gender === 1) {
            isFemale = true;
          }
        }
      } catch (e) {
        userName = `(ID: ${uid})`; // في حال كان الحساب معطلاً تماماً
      }

      // تحديد الجملة بناءً على نوع التخريب وجنس الفاعل
      let actionText = "";

      if (data.nameChanged && data.imageChanged) {
        actionText = isFemale 
          ? "هذه من قامت بتغيير اسم وصورة المجموعة( او الڪروب) 🧐✅" 
          : "هذا من قام بتغيير اسم وصورة المجموعة( او الڪروب) 🧐✅";
      } else if (data.nameChanged) {
        actionText = isFemale 
          ? "هذه من غيرت اسم المجموعة 🧐✅" 
          : "هذا من غير اسم المجموعة 🧐✅";
      } else if (data.imageChanged) {
        actionText = isFemale 
          ? "هذه من قامت بتغيير صورة 🧐✅" 
          : "هذا من قام بتغيير صورة 🧐✅";
      }

      msg += `👤 ${userName}\n📌 ${actionText}\n\n`;
    }

    // مسح السجل بعد عرضه حتى لا تتراكم البيانات في المرات القادمة
    delete global.groupChangesTracker[threadID];

    api.sendMessage(msg, threadID, event.messageID);
  }
};
