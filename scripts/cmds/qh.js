const fs = require("fs");
const path = require("path");
const dbPath = path.join(__dirname, "../../database/qh.json");

module.exports = {
    config: { 
        name: "qh", 
        version: "4.0", 
        role: 0,
        author: "Simo",
        category: "fun"
    },
    onStart: async ({ api, event, args }) => {
        const { threadID, messageID, messageReply } = event;
        const fullText = args.join(" ").trim();

        if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        let data = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, "utf8")) : {};

        // 1. إضافة رد جديد
        if (fullText.startsWith("add ")) {
            const content = fullText.substring(4).trim(); 
            if (content.includes("=>")) {
                const parts = content.split("=>");
                const trigger = parts[0].trim();
                const response = parts.slice(1).join("=>").trim(); 
                
                if (trigger && response) {
                    data[trigger] = response;
                    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
                    return api.sendMessage(`✅ تم الحفظ بنجاح:\nالكلمة: ${trigger}\nالرد: ${response}`, threadID, messageID);
                }
            }
        }

        // 2. حذف رد موجود (الميزة الجديدة)
        if (fullText.startsWith("del ")) {
            const triggerToDelete = fullText.substring(4).trim();
            if (data[triggerToDelete]) {
                delete data[triggerToDelete]; // مسح الكلمة من قاعدة البيانات
                fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
                return api.sendMessage(`🗑️ تم حذف الرد الخاص بـ: "${triggerToDelete}" بنجاح!`, threadID, messageID);
            } else {
                return api.sendMessage(`⚠️ الكلمة "${triggerToDelete}" غير موجودة أصلاً في الذاكرة.`, threadID, messageID);
            }
        }

        // 3. استدعاء الرد التلقائي
        if (fullText && data[fullText]) {
            const targetID = messageReply ? messageReply.messageID : messageID;
            return api.sendMessage(data[fullText], threadID, targetID);
        }

        // 4. دليل الاستخدام الشامل
        api.sendMessage("⚠️ الاستعمال:\n➕ للإضافة: !qh add [الكلمة] => [الرد]\n🗑️ للحذف: !qh del [الكلمة]\n💬 للاستدعاء: !qh [الكلمة]", threadID, messageID);
    }
};
