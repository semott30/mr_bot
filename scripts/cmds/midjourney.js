module.exports = {
  config: {
    name: "midjourney",
    version: "1.0.0",
    aliases: ["mj"],
    author: "Simo",
    description: "Generate image",
    category: "ai",
    guide: "{pn} [prompt]"
  },

  onStart: async function({ args, message }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("❌ دير وصف للصورة!");
    
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 99999)}`;
    
    return message.reply({
      body: "✅ هاهي الصورة ديالك:",
      attachment: await global.utils.getStreamFromURL(imageUrl)
    });
  }
};
