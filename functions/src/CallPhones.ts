import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import twilio from "twilio";

type Matches = {
	userIds: [string];
	matchId: string;
};

exports.CallPhones = functions.database
	.ref("matches/{matchId}")
	.onCreate(async (snap, _) => {
		const { userIds, matchId }: Matches = snap.val();

		let numbers: string[] = [];

		for (let i = 0; i < userIds.length; i++) {
			const user = await admin.auth().getUser(userIds[i]);
			const phoneNumber = user.phoneNumber;
			numbers.push(phoneNumber);
		}

		userIds.forEach(async (userId) => {
			const phoneNumber = (await admin.auth().getUser(userId)).phoneNumber;
			numbers.push(phoneNumber);
		});

		createConferenceCall(numbers, matchId);
	});

// Call both numbers and merge.
const createConferenceCall = (numbers: string[], matchId: string) => {
	const accountSid = functions.config().twilio.accountsid;
	const authToken = functions.config().twilio.authtoken;

	const client = twilio(accountSid, authToken);

	numbers.forEach(async (userPhoneNumber) => {
		await client.calls
			.create({
				from: "+61390687805",
				timeout: 20,
				to: userPhoneNumber,
				url: `https://us-central1-start-a-conversation.cloudfunctions.net/Conference/${matchId}`,
			})
			.then(() => process.stdout.write(`Called ${userPhoneNumber}`));
	});
};
