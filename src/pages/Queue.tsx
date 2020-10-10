import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

interface QueueProps {}

type UserStatus = {
	status: string;
	time: string;
};

const auth = firebase.auth();

const Queue: React.FC<QueueProps> = () => {
	const [loading, setLoading] = useState(true);
	const [queue, setQueue] = useState(false);
	const [match, setMatch] = useState(false);
	const [user] = useAuthState(auth);

	var dbRef = firebase.database().ref(`matchmaking/${user?.uid}`);

	const queueHandler = () => {
		setQueue(!queue);
		if (queue) {
			dbRef.set(null);
		} else {
			const status = {
				status: "in-queue",
				time: Date.now().toString(),
			};
			dbRef.set(status);
		}
	};

	useEffect(() => {
		function handleValueChange(snapshot: firebase.database.DataSnapshot) {
			const status: UserStatus | null = snapshot.val();

			if (status) {
				if (status.status === "in-queue") {
					setQueue(true);
					setMatch(false);
				} else {
					setQueue(false);
					setMatch(true);
				}
			} else {
				setQueue(false);
				setMatch(false);
			}

			setLoading(false);
		}

		dbRef.on("value", handleValueChange);

		return () => {
			dbRef.off("value", handleValueChange);
		};
	});

	if (loading) {
		return (
			<div className="App">
				<h1>Loading...</h1>
			</div>
		);
	}

	if (match) {
		return <h1>Match found! Expect a call soon.</h1>;
	}

	return (
		<div className="App">
			<div style={{ display: "inline" }}>
				{queue ? (
					<>
						<h1 style={{ marginBottom: 5 }}>
							finding your new friend{" "}
							<span role="img" aria-label="searching">
								🔎
							</span>
						</h1>
						<p style={{ marginTop: 0, opacity: 0.5 }}>
							This might take a while, you can close this window if you want.
						</p>
					</>
				) : (
					<>
						<h1 style={{ marginBottom: 5 }}>Queue up to begin!</h1>
						<p style={{ marginTop: 0, opacity: 0.5 }}>
							Join the match queue, & we'll match you with a stranger to talk
							to.
						</p>
					</>
				)}
				{!queue ? (
					<button
						className="Button"
						onClick={() => auth.signOut()}
						style={{ opacity: 0.5 }}
					>
						Logout
					</button>
				) : null}
				<button
					className="Button"
					onClick={queueHandler}
					style={{ marginLeft: 10 }}
				>
					{queue ? "Cancel" : "Queue"}
				</button>
			</div>
		</div>
	);
};

export default Queue;
