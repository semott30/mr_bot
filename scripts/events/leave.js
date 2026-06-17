const { getTime } = global.utils;

module.exports = {
	config: {
		name: "leave",
		version: "2.1",
		author: "Simo",
		category: "events"
	},

	onStart: async ({ threadsData, event, api }) => {
		if (event.logMessageType != "log:unsubscribe") return;

		const { threadID, logMessageData } = event;
		const leftParticipantFbId = logMessageData.leftParticipantFbId;
		if (leftParticipantFbId == api.getCurrentUserID()) return;

		const threadData = await threadsData.get(threadID);
		if (!threadData.settings || threadData.settings.sendLeaveMessage === false) return;

		// جلب معلومات المستخدم والجنس
		const userInfo = await api.getUserInfo(leftParticipantFbId);
		const userName = userInfo[leftParticipantFbId]?.name || "عضو";
		const gender = userInfo[leftParticipantFbId]?.gender; // 1 = أنثى، 2 = ذكر

		// تحديد كلمة الخروج حسب الجنس
		let genderText = (gender === 1) ? "خرجات 👧" : "خرج 👦";

		// الرسالة اللي مسجلة فـ setleave أو الرسالة الافتراضية ديالك
		let customMessage = threadData.data?.leaveMessage || "باي باي مــع الـسـلامـة 👋😊✅";

		// تجميع الرسالة النهائية بالشكل والإطار اللي طلبتي
		const finalMessage = `${userName} ${genderText} من الكروب\n` +
			`┓━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
			`┃ \n` +
			`┃       ${customMessage}\n` +
			`┃\n` +
			`┛━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
			`𝗠𝗬 𝗜𝗡𝗦𝗧𝗔 : ≽ 𝗦𝗜𝗠𝗢𝗢𝗥𝗫  🇲🇦`;

		api.sendMessage(finalMessage, threadID);
	}
};
