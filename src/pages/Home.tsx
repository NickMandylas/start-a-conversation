import React from "react";
import logo from "../images/sangfroid-logo.png";
import { Link } from "react-router-dom";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
	return (
		<>
			<img src={logo} className="App-logo" alt="logo" />
			<h1 style={{ padding: "20px 40px 10px 40px" }}>
				Needing a conversation? It's only{" "}
				<span style={{ textDecoration: "underline" }}>one</span> call away.
			</h1>
			<Link to="/queue">
				<button className="Button">Get Started</button>
			</Link>
		</>
	);
};

export default Home;
