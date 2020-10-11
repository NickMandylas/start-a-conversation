import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Queue from "./pages/Queue";

function App() {
	return (
		<div className="App">
			<Router>
				<Switch>
					<Route exact path="/">
						<Home />
					</Route>
					<Route path="/login">
						<Login />
					</Route>
					<PrivateRoute component={Queue} />
				</Switch>
			</Router>
		</div>
	);
}

export default App;
