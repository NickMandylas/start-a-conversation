import * as bodyParser from "body-parser";
import express from "express";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import twilio from "twilio";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";

admin.initializeApp(functions.config().firebase);

let database = admin.database();

type UserStatus = {
	status: string;
	time: string;
};

// Matching
exports.matching = functions.database
	.ref("matchmaking/{userId}")
	.onCreate((_, context) => {
		let matchId = generateMatchId();

		database
			.ref("matchmaking")
			.once("value")
			.then((users) => {
				let secondUser = null;
				users.forEach((user) => {
					const status: UserStatus = user.val();

					if (
						status.status === "in-queue" &&
						user.key !== context.params.userId
					) {
						secondUser = user;
					}
				});

				if (secondUser === null) return null;

				database
					.ref("matchmaking")
					.transaction(function (matchmaking) {
						if (
							matchmaking === null ||
							matchmaking[context.params.userId].status !== "in-queue" ||
							matchmaking[secondUser.key].status !== "in-queue"
						)
							return matchmaking;

						matchmaking[context.params.userId].status = matchId;
						matchmaking[secondUser.key].status = matchId;
						return matchmaking;
					})
					.then((result) => {
						if (
							result.snapshot.child(context.params.userId).val().status !==
							matchId
						)
							return;

						let match = {
							matchId: matchId,
							time: Date.now().toString(),
							userIds: [context.params.userId, secondUser.key],
						};

						database
							.ref("matches/" + matchId)
							.set(match)
							.then(() => {
								console.log("Match successfully found.");
								return null;
							})
							.catch((error) => {
								console.log(error);
							});

						return null;
					})
					.catch((error) => {
						console.log(error);
					});

				return null;
			})
			.catch((error) => {
				console.log(error);
			});
	});

function generateMatchId() {
	let possibleChars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let matchId = "";
	for (let j = 0; j < 20; j++)
		matchId += possibleChars.charAt(
			Math.floor(Math.random() * possibleChars.length)
		);
	return matchId;
}

// Call Phones

type Matches = {
	userIds: [string];
	matchId: string;
};

exports.callPhones = functions.database
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
				url: `https://us-central1-start-a-conversation.cloudfunctions.net/conference/${matchId}`,
			})
			.then(() => process.stdout.write(`Called ${userPhoneNumber}`));
	});
};

// Conferencing

const urlencoded = bodyParser.urlencoded;
const app = express();

app.use(urlencoded({ extended: false }));

app.post("/:id", (request, response) => {
	const twiml = new VoiceResponse();

	const matchId = request.params.id;

	// Prior to conference opening, state message.
	twiml.say(
		{
			voice: "Polly.Matthew-Neural",
		},
		"Starting a new conversation! You'll have two minutes to chat. Good Luck!"
	);

	const dial = twiml.dial({ timeLimit: 150 });

	dial.conference(
		{
			beep: "onEnter",
			endConferenceOnExit: true,
			startConferenceOnEnter: true,
		},
		matchId
	);

	response.type("text/xml");
	response.send(twiml.toString());
});

exports.conference = functions.https.onRequest(app);

// Reset user status

exports.resetUser = functions.pubsub
	.schedule("every 5 minutes")
	.onRun((context) => {
		database
			.ref("matchmaking")
			.once("value")
			.then((users) => {
				users.forEach((user) => {
					const status: UserStatus = user.val();

					if (status.status !== "in-queue") {
						let timeCompare = Date.now() - Number(status.time) >= 1000 * 240;

						if (timeCompare) {
							database.ref("matchmaking/" + user.key).set(null);
						}
					}
				});
			});
		return null;
	});
