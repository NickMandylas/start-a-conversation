import firebase from "firebase/app";
import "firebase/auth";

const app = firebase.initializeApp({
	apiKey: "AIzaSyD3rZRP23Cbtl6STrbpxOR323pb0FTNuUo",
	authDomain: "start-a-conversation.firebaseapp.com",
	databaseURL: "https://start-a-conversation.firebaseio.com",
	projectId: "start-a-conversation",
	storageBucket: "start-a-conversation.appspot.com",
	messagingSenderId: "669288623711",
	appId: "1:669288623711:web:23f58493a42ae380f775ea",
});

export default app;
