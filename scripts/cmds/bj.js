const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "bj",
  version: "1.0",
  role: 0,
  author: "Simo",
  category: "fun",
  cooldowns: 5
};

module.exports.onStart = async ({ event, api, args }) => {
  try {
    const { threadID, messageID, senderID } = event;
    const mention = Object.keys(event.mentions)[0] || (event.messageReply && event.messageReply.senderID);

    if (!mention) {
      return api.sendMessage("⚠️ طاكي الضحية أو دير ريبلاي!", threadID, messageID);
    }

    const imgPath = __dirname + `/cache/bj_${senderID}_${mention}.png`;

    const bgUrl = "https://i.ibb.co/FL2yP0Xs/bj-base.jpg";
    const myAvatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512`;
    const targetAvatarUrl = `https://graph.facebook.com/${mention}/picture?width=512&height=512`;

    const [bg, myAvatar, targetAvatar] = await Promise.all([
      loadImage(bgUrl),
      loadImage(myAvatarUrl),
      loadImage(targetAvatarUrl)
    ]);

    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(bg, 0, 0);
    ctx.drawImage(myAvatar, 150, 480, 200, 200);
    ctx.drawImage(targetAvatar, 650, 480, 200, 200);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(imgPath, buffer);

    api.sendMessage({
      body: "Here is your meme 😂",
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => fs.unlinkSync(imgPath), messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Error generating image: " + error.message, event.threadID, event.messageID);
  }
};
