const request = require('request');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "midjourney",
    version: "2.0.0",
    aliases: ["mj", "imagine"],
    author: "Simo-Fix",
    role: 0,
    category: "ai",
    description: "توليد صور بالذكاء الاصطناعي",
    guide: "{pn} [وصف الصورة]"
  },

  onStart: async function({ event, args, message }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("❌ دير وصف للصورة.");

    const loadingMsg = await message.send("⏳ جاري الرسم...");
    const imgPath = path.join(__dirname, `mj_${Date.now()}.png`);
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

    request(apiUrl)
      .pipe(fs.createWriteStream(imgPath))
      .on('close', () => {
        message.reply({
          body: "✅ هاهي الصورة ديالك:",
          attachment: fs.createReadStream(imgPath)
        }, () => {
          fs.unlinkSync(imgPath);
          message.unsend(loadingMsg.messageID);
        });
      })
      .on('error', (e) => {
        message.unsend(loadingMsg.messageID);
        message.reply("❌ خطأ: " + e.message);
      });
  }
};
