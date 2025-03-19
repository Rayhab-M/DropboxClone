
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
import DropboxClone from "./components/DropboxClone";
import SignIn from "./components/SignIn"; // Separate sign-in component
import { Authenticator } from "@aws-amplify/ui-react";

Amplify.configure(awsExports);

function App() {
  return (
    <Router>
      <Authenticator>
        {({ signOut, user }) => (
          user ? (
            <>
              <button onClick={signOut} style={styles.signOutBtn}></button>
              <Routes>
                <Route path="/*" element={<DropboxClone />} />
              </Routes>
            </>
          ) : (
            <Navigate to="/signin" replace />
          )
        )}
      </Authenticator>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  );
}

const styles = {
  signOutBtn: { 
    position: "absolute",
    cursor: "pointer" 
  }
};

export default App;
