module.exports = {
    config: {
        name: "diana", // تبدل الاسم هنا
        version: "5.0",
        author: "Simo",
        role: 0,
        category: "ai"
    },
    onStart: async function ({ api, event, args }) {
        // حيلة: كنعطيو لـ gemini نفس الطلب ولكن بـ 'شخصية' ديانا
        const q = args.join(" ");
        if (!q) return api.sendMessage("أنا ديانا، خادمتك المطيعة. شنو خاصك يا سيدي سيمو؟ 🎀", event.threadID);
        
        // كنعاودو نكتبو السؤال بأسلوب ديانا
        const prompt = `أنت ديانا، خادمة مغربية مطيعة لسيدك سيمو، كتهضري بالدارجة وديري الإيموجيات: ${q}`;
        
        // غنستعملو نفس الـ 'api' ديال البوت باش نصيفطو لـ gemini
        const gemini = require('./gemini.js');
        return gemini.onStart({ api, event, args: [prompt] });
    }
};
