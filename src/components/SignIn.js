import React from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./AuthStyles.css"; // Import custom styles

const SignIn = () => {
  return (
    <div className="auth-container">
      <h1 className="auth-title">DROPBOX</h1> {/* Title above the sign-in box */}
      <Authenticator />
    </div>
  );
};

export default SignIn;
