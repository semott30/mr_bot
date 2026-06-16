const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "khrya", // الاسم اللي غاتخدم بيه الأمر فالميسنجر (!khrya)
    version: "1.0.0",
    author: "Simo",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Meme command" },
    longDescription: { en: "Meme command" },
    category: "fun",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, message }) {
    try {
      const msgReply = event.messageReply;
      if (!msgReply) return message.reply("⚠️ دير ريبلاي على الضحية!");
      
      const targetID = msgReply.senderID;
      const outPath = path.join(__dirname, 'cache', 'final.png');
      
      // هنا البوت كيقرا الصورة اللي سميتيها khrya.jpg ومحطوطة فالمستودع
      const templatePath = path.join(__dirname, 'khrya.jpg'); 
      if (!fs.existsSync(templatePath)) return message.reply("❌ الصورة غير موجودة في المجلد! تأكد من تسميتها khrya.jpg");

      const avUrl = `https://graph.facebook.com/${targetID}/picture?type=large`;

      // تحميل الصورة والقالب
      const [template, av] = await Promise.all([
        loadImage(templatePath),
        loadImage(avUrl)
      ]);

      const canvas = createCanvas(template.width, template.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(template, 0, 0);

      // الإحداثيات المضبوطة للدائرة الرمادية الكبيرة (على حساب صورتك اللخرة)
      ctx.drawImage(av, 230, 595, 420, 420); 

      // الحفظ والإرسال كرد مباشر على الضحية
      const out = fs.createWriteStream(outPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      
      out.on('finish', () => {
        api.sendMessage(
          { attachment: fs.createReadStream(outPath) }, 
          event.threadID, 
          () => fs.unlinkSync(outPath), 
          msgReply.messageID // الرد على الضحية نيشان
        );
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ حدث خطأ أثناء معالجة الصورة.");
    }
  }
};
