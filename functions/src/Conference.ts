import * as bodyParser from "body-parser";
import express from "express";
import * as functions from "firebase-functions";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";

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

exports.Conference = functions.https.onRequest(app);
