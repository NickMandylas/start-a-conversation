import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

interface QueueProps {}

type UserStatus = {
	status: string;
	time: string;
};

const auth = firebase.auth();

const Queue: React.FC<QueueProps> = () => {
	const [status, setStatus] = useState("loading");
	const [user] = useAuthState(auth);

	var dbRef = firebase.database().ref(`matchmaking/${user?.uid}`);

	const queueHandler = () => {
		if (status === "in-queue") {
			dbRef.set(null);
			setStatus("idle");
		} else {
			const status = {
				status: "in-queue",
				time: Date.now().toString(),
			};
			dbRef.set(status);
			setStatus("in-queue");
		}
	};

	useEffect(() => {
		function handleValueChange(snapshot: firebase.database.DataSnapshot) {
			const status: UserStatus | null = snapshot.val();

			if (status) {
				if (status.status === "in-queue") {
					setStatus("in-queue");
				} else {
					setStatus("match");
				}
			} else {
				setStatus("idle");
			}
		}

		dbRef.on("value", handleValueChange);

		return () => {
			dbRef.off("value", handleValueChange);
		};
	});

	if (status === "loading") {
		return <h1>Loading...</h1>;
	}

	if (status === "match") {
		return (
			<>
				<h1>Match found! Expect a call soon.</h1>
				<p style={{ marginTop: 0, opacity: 0.5, padding: "0 20px 0 20px" }}>
					You'll placed into a conference call with your match. You'll be able
					to re-queue in 5 mins.
				</p>
			</>
		);
	}

	if (status === "in-queue") {
		return (
			<>
				<h1 style={{ marginBottom: 5 }}>
					finding your new friend{" "}
					<span role="img" aria-label="searching">
						🔎
					</span>
				</h1>
				<p style={{ marginTop: 0, opacity: 0.5, padding: "0 20px 0 20px" }}>
					This might take a while, you can close this window if you want.
				</p>
				<button
					className="Button"
					onClick={queueHandler}
					style={{ marginLeft: 10 }}
				>
					Cancel
				</button>
			</>
		);
	}

	return (
		<div style={{ display: "inline" }}>
			<h1 style={{ marginBottom: 5 }}>Queue up to begin!</h1>
			<p style={{ marginTop: 0, opacity: 0.5, padding: "0 20px 0 20px" }}>
				Join the match queue, & we'll match you with a stranger to talk to.
			</p>
			<button
				className="Button"
				onClick={() => auth.signOut()}
				style={{ opacity: 0.5 }}
			>
				Logout
			</button>
			<button
				className="Button"
				onClick={queueHandler}
				style={{ marginLeft: 10 }}
			>
				Queue
			</button>
		</div>
	);
};

export default Queue;
