const { getTime } = global.utils;

module.exports = {
	config: {
		name: "leave",
		version: "2.0",
		author: "Simo",
		category: "events"
	},

	onStart: async ({ threadsData, event, api, usersData }) => {
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
		let leaveType = (logMessageData.leftParticipantFbId === event.author) ? "خرجت برضاها/خرج برضاه" : "تم طرده/طردها";

		// الرسالة اللي مسجلة فـ setleave أو الافتراضية
		let leaveMessage = threadData.data?.leaveMessage || "{userName} {type} من الكروب.";

		// تعويض الـ Shortcuts
		leaveMessage = leaveMessage
			.replace(/{userName}/g, userName)
			.replace(/{userNameTag}/g, userName)
			.replace(/{type}/g, genderText)
			.replace(/{boxName}/g, threadData.threadName)
			.replace(/{threadName}/g, threadData.threadName);

		// إضافة الرسالة النهائية مع حقوق المطور
		const finalMessage = `${leaveMessage}\n\n_________________\nمطور البوت: 𝗦𝗜𝗠𝗢`;

		api.sendMessage(finalMessage, threadID);
	}
};
