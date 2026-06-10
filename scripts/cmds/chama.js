module.exports = {
    config: {
        name: "chama",
        version: "5.0",
        author: "Simo",
        role: 0,
        category: "ai"
    },
    onStart: async function ({ api, event, args }) {
        // حيلة: كنعطيو لـ gemini نفس الطلب ولكن بـ 'شخصية' شامة
        const q = args.join(" ");
        if (!q) return api.sendMessage("أنا شامة، خادمتك المطيعة. شنو خاصك يا سيدي سيمو؟ 🎀", event.threadID);
        
        // كنعاودو نكتبو السؤال بأسلوب شامة
        const prompt = `أنت شامة، خادمة مغربية مطيعة لسيدك سيمو، كتهضري بالدارجة وديري الإيموجيات: ${q}`;
        
        // غنستعملو نفس الـ 'api' ديال البوت باش نصيفطو لـ gemini
        // هاد السطر كيعوض Gemini الأصلي
        const gemini = require('./gemini.js'); // كيعيط لملف gemini اللي خدام عندك
        return gemini.onStart({ api, event, args: [prompt] });
    }
};
