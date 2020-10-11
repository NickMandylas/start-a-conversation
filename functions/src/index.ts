import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp(functions.config().firebase);

const Matching = require("./Matching");
const CallPhones = require("./CallPhones");
const Conference = require("./Conference");
const ResetUser = require("./ResetUser");

exports.Matching = Matching.Matching;
exports.CallPhones = CallPhones.CallPhones;
exports.Conference = Conference.Conference;
exports.ResetUser = ResetUser.ResetUser;
