module.exports = {
    config: {
        name: "mute",
        version: "5.2",
        role: 1, // للأدمنز فقط
        category: "BOX CHAT",
        description: "إسكات عضو في المجموعة ومسح رسائله تلقائياً"
    },

    onStart: async ({ api, event, args, message }) => {
        if (!global.mutedUsers) global.mutedUsers = {};
        
        let targetUID = Object.keys(event.mentions)[0];
        if (event.type === "message_reply") targetUID = event.messageReply.senderID;
        
        if (!targetUID) return message.reply("⚠️ تـاݣي الشخص أولا رد على الميساج ديالو باش تسكتو!");

        if (!global.mutedUsers[event.threadID]) global.mutedUsers[event.threadID] = [];

        if (global.mutedUsers[event.threadID].includes(targetUID)) {
            global.mutedUsers[event.threadID] = global.mutedUsers[event.threadID].filter(id => id !== targetUID);
            return message.reply("✅ تم إلغاء الإسكات، دابا يقدر يهضر عادي.");
        } else {
            global.mutedUsers[event.threadID].push(targetUID);
            return message.reply("تم اسڪااات هذا الترتار 🤫🤏✅");
        }
    },

    onChat: async ({ api, event }) => {
        if (!global.mutedUsers || !global.mutedUsers[event.threadID]) return;
        
        if (global.mutedUsers[event.threadID].includes(event.senderID)) {
            try {
                await api.unsendMessage(event.messageID);
            } catch (err) {
                console.log("خطأ في مسح الميساج: " + err.message);
            }
        }
    }
};
