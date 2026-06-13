const fs = require("fs");
const path = require("path");
const dbPath = path.join(__dirname, "../../database/qh.json");

module.exports = {
    config: {
        name: "qh",
        version: "1.1",
        role: 0,
        author: "Simo",
        category: "fun"
    },
    onStart: async ({ api, event, args }) => {
        const { threadID, messageID, messageReply } = event;
        const [action, trigger, ...response] = args;

        if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        let data = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, "utf8")) : {};

        // 1. إضافة رد
        if (action === "add" && trigger && response.length > 0) {
            data[trigger] = response.join(" ");
            fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
            return api.sendMessage(`✅ تم حفظ الرد: ${trigger}`, threadID, messageID);
        }

        // 2. الرد على الشخص المقصود (هنا فين كاين السحر)
        if (action && data[action]) {
            // إذا كنتي داير Reply لشي واحد، البوت غيجاوبو هو (عبر messageReply.messageID)
            const targetID = messageReply ? messageReply.messageID : messageID;
            return api.sendMessage(data[action], threadID, targetID);
        }

        api.sendMessage("⚠️ الاستعمال: !qh add [كلمة] [الرد]\nأو: !qh [كلمة] (مع الرد على الشخص المقصود)", threadID, messageID);
    }
};
