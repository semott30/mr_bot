module.exports.config = {
    name: "bj",
    version: "1.0.0",
    role: 0,
    author: "Simo",
    description: "Sarcastic meme",
    guide: "{pn} @tag or reply"
};

module.exports.onStart = async ({ message, event }) => {
    const { createCanvas, loadImage } = require('canvas');
    try {
        const imageUrl = "https://i.ibb.co/FL2yP0Xs/bj-base.jpg";
        let targetID = event.messageReply ? event.messageReply.senderID : (Object.keys(event.mentions || {})[0]);
        
        if (!targetID) return message.reply("⚠️ طاكي الضحية أو دير ريبلاي!");
        
        const [bg, myAvatar, targetAvatar] = await Promise.all([
            loadImage(imageUrl),
            loadImage('https://graph.facebook.com/' + event.senderID + '/picture?width=512&height=512'),
            loadImage('https://graph.facebook.com/' + targetID + '/picture?width=512&height=512')
        ]);
        
        const canvas = createCanvas(bg.width, bg.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bg, 0, 0);
        
        ctx.drawImage(myAvatar, 150, 480, 200, 200);
        ctx.drawImage(targetAvatar, 650, 480, 200, 200);
        
        message.reply({ attachment: canvas.toBuffer('image/jpeg') });
    } catch (e) {
        message.reply("خطأ في تشغيل الميم: " + e.message);
    }
};
