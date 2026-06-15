const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: 'video',
    author: 'Nyx/Simo_Clone',
    usePrefix: true, // خليناها true حيت video كان كيستعمل prefix
    category: 'Youtube Video Downloader'
  },
  onStart: async ({ event, api, args, message }) => {
    try {
      const query = args.join(' ');
      if (!query) return message.reply('Please provide a search query!');
      
      // 1. البحث بنفس الطريقة الناجحة ديال song
      const searchResponse = await axios.get(`https://mostakim.onrender.com/mostakim/ytSearch?search=${encodeURIComponent(query)}`);
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const filteredVideos = searchResponse.data;
      if (!filteredVideos || filteredVideos.length === 0) {
        return message.reply('❌ No videos found!');
      }

      const selectedVideo = filteredVideos[0];
      const tempFilePath = path.join(__dirname, 'temp_video.mp4'); // بدلناها لـ mp4
      
      // 2. طلب الفيديو (هنا درنا /m/video عوض /m/sing)
      const apiResponse = await axios.get(`https://mostakim.onrender.com/m/video?url=${selectedVideo.url}`);
      
      if (!apiResponse.data || !apiResponse.data.url) {
        throw new Error('No video URL found in response (يقدر يكون السيرفر ماكيدعمش الفيديو)');
      }

      const writer = fs.createWriteStream(tempFilePath);
      const videoResponse = await axios({
        url: apiResponse.data.url,
        method: 'GET',
        responseType: 'stream'
      });

      videoResponse.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await message.reply({
        body: `🎬 Now playing: ${selectedVideo.title}\nDuration: ${selectedVideo.timestamp}`,
        attachment: fs.createReadStream(tempFilePath)
      });

      fs.unlink(tempFilePath, (err) => {
        if (err) console.log(`Error deleting temp file: ${err.message}`);
      });

    } catch (error) {
      message.reply(`❌ Error: ${error.message}`);
    }
  }
};
