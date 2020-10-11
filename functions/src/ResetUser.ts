import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

let database = admin.database();

type UserStatus = {
	status: string;
	time: string;
};

// Reset user status

exports.ResetUser = functions.pubsub.schedule("every 5 minutes").onRun((_) => {
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
