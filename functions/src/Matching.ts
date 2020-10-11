import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

type UserStatus = {
	status: string;
	time: string;
};

let database = admin.database();

// Matching
exports.Matching = functions.database
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
