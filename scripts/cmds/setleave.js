module.exports.config = {
  name: "setleave",
  aliases: ["setl"],
  version: "1.9.0",
  author: "Simo",
  role: 0,
  description: "رسالة مغادرة عادية مع إضافة الاسم والجنس أوتوماتيكياً",
  category: "custom",
  guide: "دير ريبلاي لرسالة عادية واكتب !setleave"
};

module.exports.onStart = async function ({ message, event, threadsData }) {
  const { threadID, messageReply } = event;
  
  if (!messageReply || !messageReply.body) {
    return message.reply("⚠️ دير ريبلاي (رد) على رسالة عادية (مثلا: طريق السلامة)، واكتب: !setleave");
  }

  const threadData = await threadsData.get(threadID) || {};
  if (!threadData.data) threadData.data = {};
  
  threadData.data.leaveMessage = messageReply.body;
  await threadsData.set(threadID, threadData);

  message.reply("✅ تم حفظ الرسالة بنجاح! دابا البوت غيولي يزيد السمية وكلمة (خرج/خرجات) من عندو أوتوماتيكياً.");
};

module.exports.onEvent = async function ({ event, api, threadsData }) {
  if (event.logMessageType === "log:unsubscribe") {
    const { threadID, logMessageData } = event;
    const leftID = logMessageData.leftParticipantFbId;
    
    // تأكد بلي البوت ما كيصيفطش رسالة لراسو إلا خرج
    if (leftID === api.getCurrentUserID()) return;

    const threadData = await threadsData.get(threadID);
    if (!threadData || !threadData.data?.leaveMessage) return;

    let baseMessage = threadData.data.leaveMessage;
    
    try {
      const userInfo = await api.getUserInfo(leftID);
      const userName = userInfo[leftID]?.name || "عضو";
      const gender = userInfo[leftID]?.gender;

      let genderText = "خرج(ت)";
      if (gender === 1) {
        genderText = "خرجات 👧";
      } else if (gender === 2) {
        genderText = "خرج 👦";
      }

      let finalMessage = `${baseMessage}\n\n🚪 ${userName} ${genderText} من الكروب.\n_________________\nمطور البوت 𝗦𝗜𝗠𝗢`;

      api.sendMessage(finalMessage, threadID);
    } catch (e) {
      api.sendMessage(`${baseMessage}\n\n🚪 عضو غادر من الكروب.\n_________________\nمطور البوت 𝗦𝗜𝗠𝗢`, threadID);
    }
  }
};
