module.exports.config = {
  name: "setleave",
  aliases: ["setl"],
  version: "3.0.0",
  author: "Simo",
  role: 0,
  category: "custom",
  guide: "دير ريبلاي لرسالة واكتب !setleave"
};

// 1. تسجيل الرسالة
module.exports.onStart = async ({ message, event, threadsData }) => {
  const { threadID, messageReply } = event;
  if (!messageReply || !messageReply.body) return message.reply("⚠️ ديري ريبلاي على الرسالة اللي بغيتيها تكون رسالة مغادرة واكتبي !setleave");
  
  const threadData = await threadsData.get(threadID) || { data: {} };
  threadData.data.leaveMessage = messageReply.body;
  await threadsData.set(threadID, threadData);
  message.reply("✅ تم حفظ رسالة المغادرة بنجاح!");
};

// 2. إرسال الرسالة أوتوماتيكياً (Event داخلي)
module.exports.onEvent = async function ({ event, api, threadsData }) {
  if (event.logMessageType !== "log:unsubscribe") return;
  const { threadID, logMessageData } = event;
  if (logMessageData.leftParticipantFbId === api.getCurrentUserID()) return;

  const threadData = await threadsData.get(threadID) || {};
  const baseMessage = threadData.data?.leaveMessage || "{userName} {type} من الكروب.";
  
  try {
    const userInfo = await api.getUserInfo(logMessageData.leftParticipantFbId);
    const userName = userInfo[logMessageData.leftParticipantFbId]?.name || "عضو";
    const gender = userInfo[logMessageData.leftParticipantFbId]?.gender;
    let genderText = (gender === 1) ? "خرجات 👧" : "خرج 👦";

    let finalMessage = baseMessage
        .replace(/{userName}/g, userName)
        .replace(/{type}/g, genderText);

    finalMessage += `\n\n_________________\nمطور البوت: 𝗦𝗜𝗠𝗢`;
    api.sendMessage(finalMessage, threadID);
  } catch (e) {}
};
