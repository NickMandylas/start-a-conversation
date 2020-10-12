import firebase from "firebase/app";
import "firebase/auth";
import { useFormik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import "yup-phone";
import { Link, useHistory } from "react-router-dom";

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
	const history = useHistory();
	const [captcha, setCaptcha] = useState(false);
	const [verify, setVerify] = useState(false);
	const [OTP, setOTP] = useState<firebase.auth.ConfirmationResult>();

	const handleLogin = async (mobileNumber: string) => {
		let captcha = new firebase.auth.RecaptchaVerifier("recaptcha");
		const sendCode = await firebase
			.auth()
			.signInWithPhoneNumber(mobileNumber, captcha);

		setOTP(sendCode);
		setCaptcha(false);
		setVerify(true);
	};

	const handleVerification = (code: string) => {
		if (OTP) {
			OTP.confirm(code).then((result) => {
				if (result.user) {
					history.push("/queue");
				}
			});
		}
	};

	const loginSchema = Yup.object().shape({
		mobileNumber: Yup.string()
			.phone("AU", true, "Need a phone number! Aussie's only 🇦🇺")
			.required(),
	});

	const formik = useFormik({
		initialValues: {
			mobileNumber: "+61",
		},
		validationSchema: loginSchema,
		onSubmit: (values) => {
			setCaptcha(true);
			handleLogin(values.mobileNumber);
		},
		validateOnBlur: true,
		validateOnChange: false,
	});

	if (captcha) {
		return <div id="recaptcha" />;
	}

	if (verify) {
		return <Verification code={(e) => handleVerification(e)} />;
	}

	return (
		<form onSubmit={formik.handleSubmit}>
			<label className="Label" htmlFor="Mobile Number">
				Mobile #
			</label>
			<input
				id="mobileNumber"
				name="mobileNumber"
				type="tel"
				onChange={formik.handleChange}
				value={formik.values.mobileNumber}
				className="Input"
				style={{ display: "block" }}
			/>
			<div>
				{formik.errors.mobileNumber && (
					<p className="Error">{formik.errors.mobileNumber}</p>
				)}
				<Link to="/">
					<button className="Button" style={{ opacity: 0.5 }}>
						Back
					</button>
				</Link>
				<button type="submit" className="Button" style={{ marginLeft: 10 }}>
					Submit
				</button>
			</div>
		</form>
	);
};

interface VericationProps {
	code: (code: string) => void;
}

const Verification: React.FC<VericationProps> = (props) => {
	const verifySchema = Yup.object().shape({
		code: Yup.string().min(6).max(6).required(),
	});

	const formik = useFormik({
		initialValues: {
			code: "",
		},
		validationSchema: verifySchema,
		onSubmit: (values) => {
			props.code(values.code);
		},
		validateOnBlur: true,
		validateOnChange: false,
	});

	return (
		<>
			<h1>We sent you a text!</h1>
			<form onSubmit={formik.handleSubmit}>
				<label className="Label" htmlFor="OTP Code">
					Verification Code
				</label>
				<input
					id="code"
					name="code"
					type="string"
					onChange={formik.handleChange}
					value={formik.values.code}
					className="Input"
					style={{ display: "block" }}
				/>
				{formik.errors.code && (
					<p className="Error">Can't proceed without verifying!</p>
				)}
				<button type="submit" className="Button" style={{ marginLeft: 10 }}>
					Submit
				</button>
			</form>
		</>
	);
};

export default Login;
