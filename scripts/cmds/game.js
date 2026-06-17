module.exports.config = {
    name: "gm",
    aliases: ["done", "go"],
    version: "1.5.0",
    role: 0,
    author: "Simo",
    description: "لعبة حرب الفواكه والسرعة",
    category: "Games"
};

const quizData = [
    { emoji: '💡', answers: ['بولة', 'مصباح', 'بولا'] },
    { emoji: '🚗', answers: ['طوموبيل', 'سيارة', 'طوموبيلة'] },
    { emoji: '🔑', answers: ['ساروت', 'مفتاح', 'سوارت'] },
    { emoji: '⌚', answers: ['مكانة', 'ساعة', 'مكانا'] },
    { emoji: '👓', answers: ['نضاضر', 'نظارات'] },
    { emoji: '🚲', answers: ['بيكالا', 'دراجة', 'بشكليط', 'بيسكلت'] },
    { emoji: '📱', answers: ['تيليفون', 'هاتف', 'تلفون'] },
    { emoji: '✂️', answers: ['مقص'] },
    { emoji: '☂️', answers: ['مضل', 'مضلة', 'مظلة', 'مظل'] },
    { emoji: '⚽', answers: ['كورة', 'كرة', 'كورا'] },
    { emoji: '🎧', answers: ['كاسك', 'سماعات', 'كيتمان'] }
];

const fruitEmojis = ['🍎', '🍓', '🍌', '🫐', '🍇', '🍉', '🍍', '🥝', '🍒', '🥭'];

if (!global.fruitGames) global.fruitGames = {};

function sendNewQuiz(api, threadID) {
    const game = global.fruitGames[threadID];
    if(!game || game.status !== 'playing') return;
    
    const randomQuiz = quizData[Math.floor(Math.random() * quizData.length)];
    game.currentQuiz = randomQuiz;
    api.sendMessage(`❓ شنو سميت هادشي بالزربة:\n\n👉 [  ${randomQuiz.emoji}  ] 👈`, threadID);
}

module.exports.onStart = async ({ api, event, usersData }) => {
    const { threadID, messageID, messageReply, body } = event;
    const cmd = body ? body.toLowerCase() : "";

    if (!global.fruitGames[threadID]) {
        global.fruitGames[threadID] = { status: 'idle', players: {}, emojisUsed: [], currentQuiz: null, attacker: null };
    }
    const game = global.fruitGames[threadID];

    // 1. فتح اللعبة /gm
    if (cmd.includes('gm')) {
        game.status = 'registering';
        game.players = {};
        game.emojisUsed = [];
        const introMsg = `🎮 [ 𝗙𝗥𝗨𝗜𝗧 𝗦𝗣𝗘𝗘𝗗 𝗚𝗔𝗠𝗘 ] 🎮\n━━━━━━━━━━━━━━━━━\nمرحباً بكم فـ حرب الفواكه! 🍎🍓🍌\n\nالقوانين:\n1️⃣ أي واحد بغا يلعب يكتب "انا".\n2️⃣ الأدمن غادي يختار 5 لاعبين.\n3️⃣ البوت غيلوح إيموجي، واللي عرف سميتو الأول بالزربة غيجاوب!\n4️⃣ الفائز فـ الجولة غيختار شكون يقصي ليه فاكهة من رصيدو.\n5️⃣ اللي بقاو عندو الفواكه للخر هو الفائز! 🏆\n━━━━━━━━━━━━━━━━━\nالتسجيل مفتوح دابا! ⏳`;
        return api.sendMessage(introMsg, threadID);
    }

    // 2. تسجيل اللاعبين /done
    if (cmd.includes('done')) {
        if (game.status !== 'registering') return api.sendMessage("⚠️ اللعبة مامفتوحاش للتسجيل دابا. دير /gm باش تبدا.", threadID, messageID);
        if (!messageReply) return api.sendMessage("⚠️ دير ريبلاي على الشخص اللي بغيتي تسجلو واكتب /done", threadID, messageID);
        
        const targetID = messageReply.senderID;
        if (game.players[targetID]) return api.sendMessage("⚠️ هاد خونا راه مسجل ديجا!", threadID, messageID);
        if (Object.keys(game.players).length >= 5) return api.sendMessage("⚠️ اللعبة عمرات! 5 لاعبين هو الماكسيموم.", threadID, messageID);

        let targetName = "لاعب";
        try { if(usersData) { const userData = await usersData.get(targetID); targetName = userData.name || "لاعب"; } } catch (e) {}

        let fruit = fruitEmojis.find(f => !game.emojisUsed.includes(f)) || '🍏';
        game.emojisUsed.push(fruit);

        game.players[targetID] = { name: targetName, lives: 3, fruit: fruit };
        
        return api.sendMessage(`✅ تم تسجيل اللاعب: @${targetName}\nالفاكهة ديالو: ${fruit.repeat(3)}`, threadID);
    }

    // 3. انطلاق اللعبة /go
    if (cmd.includes('go')) {
        if (game.status !== 'registering') return;
        if (Object.keys(game.players).length < 2) return api.sendMessage("⚠️ خاص على الأقل 2 لاعبين باش تبدا اللعبة!", threadID, messageID);

        game.status = 'playing';
        let scoreboard = "📋 [ قائمة اللاعبين ]\n━━━━━━━━━━━━━━━━━\n";
        for (let uid in game.players) {
            let p = game.players[uid];
            scoreboard += `• @${p.name} ${p.fruit.repeat(p.lives)}\n`;
        }
        scoreboard += "━━━━━━━━━━━━━━━━━\n🚨 استعدوووووو! غنلوح الإيموجي دابا... ⏳";
        
        api.sendMessage(scoreboard, threadID, async () => {
            setTimeout(() => {
                sendNewQuiz(api, threadID);
            }, 3000);
        });
    }
};

module.exports.onChat = async ({ api, event }) => {
    const { threadID, senderID, body, messageID } = event;
    if (!body || !global.fruitGames || !global.fruitGames[threadID]) return;
    
    const game = global.fruitGames[threadID];
    const text = body.toLowerCase().trim();
    
    // التفاعل مع الإجابات
    if (game.status === 'playing' && game.currentQuiz && game.players[senderID]) {
        const isCorrect = game.currentQuiz.answers.some(ans => text.includes(ans));
        
        if (isCorrect) {
            game.status = 'attacking';
            game.attacker = senderID;
            game.currentQuiz = null;
            
            api.setMessageReaction("✅", messageID);
            return api.sendMessage(`👏 برافوووو @${game.players[senderID].name}! جبتيها لاصقة نتا الأول.\n\n⚔️ دابا اكتب سمية الضحية اللي بغيتي تحيد ليه فاكهة (اكتب غير أول حروف من سميتو):`, threadID, messageID);
        }
    }

    // مرحلة الهجوم
    if (game.status === 'attacking' && senderID === game.attacker) {
        let targetUID = null;

        for (let uid in game.players) {
            if (uid === senderID) continue;
            if (game.players[uid].name.toLowerCase().includes(text) || 
                game.players[uid].name.toLowerCase().startsWith(text.substring(0, 2))) {
                targetUID = uid;
                break;
            }
        }

        if (targetUID) {
            game.players[targetUID].lives -= 1;
            let targetP = game.players[targetUID];
            let attackerP = game.players[senderID];

            let msg = `💥 بـــــووووم!\n${attackerP.name} حيد فاكهة لـ @${targetP.name} 🔪\n`;
            
            if (targetP.lives <= 0) {
                msg += `💀 @${targetP.name} خسرتي وتقصيتي من اللعبة!\n`;
                delete game.players[targetUID];
            } else {
                msg += `بقات عندو: ${targetP.fruit.repeat(targetP.lives)}\n`;
            }

            const remainingPlayers = Object.keys(game.players);
            if (remainingPlayers.length === 1) {
                const winnerUID = remainingPlayers[0];
                const winnerP = game.players[winnerUID];
                msg += `\n🎉🎊 مبروووووووك @${winnerP.name} انت هو الفائز فهاد اللعبة! احتافظتي على الفواكه ديالك 🏆👏`;
                game.status = 'idle';
                return api.sendMessage(msg, threadID);
            }

            msg += `\n⏳ استعدوا للسؤال الجاي...`;
            game.status = 'playing';
            game.attacker = null;
            
            api.sendMessage(msg, threadID, () => {
                setTimeout(() => { sendNewQuiz(api, threadID); }, 4000);
            });

        } else {
            api.sendMessage("⚠️ مالقيتش هاد السمية! تأكد راك كتبتي سمية صحيحة ديال شي لاعب معاك ف الجيم.", threadID, messageID);
        }
    }
};
