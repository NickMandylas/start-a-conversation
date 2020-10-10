import firebase from "../components/firebase";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Redirect, Route } from "react-router-dom";

interface PrivateRouteProps {
	component: any;
}

const auth = firebase.auth();

const PrivateRoute: React.FC<PrivateRouteProps> = ({
	component: Component,
	...rest
}) => {
	const [user, loading] = useAuthState(auth);

	if (loading) {
		return null;
	}

	return (
		<Route
			{...rest}
			render={(props) =>
				!!user === true ? (
					<Component {...props} />
				) : (
					<Redirect
						to={{ pathname: "/login", state: { from: props.location } }}
					/>
				)
			}
		/>
	);
};

export default PrivateRoute;
