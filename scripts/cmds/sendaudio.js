const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "sendaudio",
        aliases: ["صوت", "audio"],
        version: "1.0",
        role: 0,
        author: "Simo",
        category: "fun"
    },
    onStart: async function ({ api, event }) {
        const { threadID, messageID, messageReply } = event;
        const targetMessageID = messageReply ? messageReply.messageID : messageID;

        // هذا المسار كيوجه البوت لمجلد assets الموجود في المجلد الرئيسي
        const audioPath = path.join(__dirname, "../../assets/my_audio.mp3");

        // التحقق من أن الملف موجود
        if (!fs.existsSync(audioPath)) {
            return api.sendMessage("⚠️ الملف الصوتي غير موجود في مجلد assets!", threadID, messageID);
        }

        // إرسال الصوت كملف
        api.sendMessage(
            { attachment: fs.createReadStream(audioPath) },
            threadID,
            targetMessageID
        );
    }
};
