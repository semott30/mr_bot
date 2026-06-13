const fs = require("fs");
const path = require("path");
const dbPath = path.join(__dirname, "../../database/qh.json");

module.exports = {
    config: { name: "qh", version: "2.0", role: 0 },
    onStart: async ({ api, event, args }) => {
        const { threadID, messageID, messageReply } = event;
        const fullText = args.join(" ");

        if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        let data = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, "utf8")) : {};

        // 1. إضافة رد باستخدام الفاصل =>
        if (fullText.includes("add")) {
            const content = fullText.replace("add", "").trim();
            if (content.includes("=>")) {
                const [trigger, response] = content.split("=>").map(s => s.trim());
                data[trigger] = response;
                fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
                return api.sendMessage(`✅ تم حفظ الرد: \nالكلمة: ${trigger}\nالرد: ${response}`, threadID, messageID);
            }
        }

        // 2. الرد التلقائي (الكلمة المفتاح)
        const triggerWord = args[0]; // نأخذ الكلمة الأولى فقط كبحث
        if (data[triggerWord]) {
            const targetID = messageReply ? messageReply.messageID : messageID;
            return api.sendMessage(data[triggerWord], threadID, targetID);
        }

        api.sendMessage("⚠️ استخدم: !qh add [الكلمة] => [الرد المليء بالإيموجيات والكلمات]", threadID, messageID);
    }
};
