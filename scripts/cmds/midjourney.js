const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "midjourney",
    version: "2.0.0",
    aliases: ["mj"],
    author: "Simo-Fix",
    countDown: 5,
    role: 0,
    description: "Generate AI images instantly",
    category: "ai",
    guide: { en: "{pn} [prompt]" }
  },

  onStart: async function({ event, args, message }) {
    if (!args[0]) return message.reply("• Please provide a prompt.");
    
    const prompt = encodeURIComponent(args.join(" "));
    const apiUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;
    
    const loadingMsg = await message.send("⏳ Generating image...");
    message.reaction("⏳", event.messageID);

    try {
      const imgPath = path.join(__dirname, `mj_${Date.now()}.png`);
      const response = await axios({ url: apiUrl, method: 'GET', responseType: 'stream' });
      
      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await message.reply({ body: "✅ Done!", attachment: fs.createReadStream(imgPath) });
      fs.unlinkSync(imgPath);
      await message.unsend(loadingMsg.messageID);
      await message.reaction("✅", event.messageID);

    } catch (e) {
      message.unsend(loadingMsg.messageID);
      message.reaction("❌", event.messageID);
      message.reply("❌ Error: " + e.message);
    }
  }
};
