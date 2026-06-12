const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const path = require("path"); // زدنا هاد المكتبة باش نتفاداو مشاكل المسارات

module.exports = {
    config: {
        name: "bj",
        version: "2.1",
        role: 0,
        author: "Simo",
        category: "fun"
    },
    onStart: async ({ event, api }) => {
        const { threadID, messageID, senderID } = event;
        const mention = Object.keys(event.mentions)[0] || (event.messageReply && event.messageReply.senderID);
        
        if (!mention) return api.sendMessage("⚠️ Tag the victim!", threadID, messageID);

        // هاد السطر هو اللي غيحل المشكل: كيتأكد واش كاين مجلد cache فجذر المشروع
        const cacheDir = path.join(process.cwd(), "cache");
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }

        const imgPath = path.join(cacheDir, `bj_${senderID}_${mention}.png`);
        const bgUrl = "https://i.postimg.cc/FK5Ywy0D/20260612-061402.jpg";
        const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

        try {
            const [bg, myAvatar, targetAvatar] = await Promise.all([
                loadImage(bgUrl),
                loadImage("https://graph.facebook.com/" + senderID + "/picture?width=512&height=512&access_token=" + token),
                loadImage("https://graph.facebook.com/" + mention + "/picture?width=512&height=512&access_token=" + token)
            ]);

            const canvas = createCanvas(bg.width, bg.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(bg, 0, 0);

            const drawCircularImage = (img, x, y, size) => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(img, x, y, size, size);
                ctx.restore();
            };

            drawCircularImage(myAvatar, 70, 160, 230);
            drawCircularImage(targetAvatar, 640, 80, 230);

            const buffer = canvas.toBuffer("image/png");
            fs.writeFileSync(imgPath, buffer);
            
            api.sendMessage({ attachment: fs.createReadStream(imgPath) }, threadID, () => {
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }, messageID);
            
        } catch (error) {
            api.sendMessage("❌ Error generating image: " + error.message, threadID, messageID);
        }
    }
};
