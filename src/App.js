import React, { useState } from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { uploadData } from "@aws-amplify/storage"; // ✅ Correct import
import { Button, CircularProgress } from "@mui/material";
import { Amplify } from "aws-amplify"; // ✅ Ensure Amplify is used
import awsExports from "./aws-exports"; // ✅ Ensure AWS config is imported
import "./App.css";

Amplify.configure(awsExports); // ✅ Properly configure Amplify

function App({ signOut, user }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  // Handle file upload to S3
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    setUploading(true);

    try {
      // ✅ Use uploadData instead of Storage.put()
      const result = await uploadData({
        key: selectedFile.name, // File name as key
        data: selectedFile, // Actual file data
        options: {
          accessLevel: "public", // Set access level
          contentType: selectedFile.type, // Preserve file type
          progressCallback: (progress) => {
            setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
          },
        },
      });

      console.log("File uploaded successfully:", result);
      alert("File uploaded successfully!");
    } catch (error) {
      console.log("Error uploading file:", error);
      alert("Error uploading file: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="App">
      <div className="auth-container">
        <h1>Welcome to File Sync</h1>
        <p className="welcome-text">Upload and sync files seamlessly!</p>

        <h3>Welcome, {user?.username || "User"}!</h3>

        <Button onClick={signOut} variant="contained" color="secondary">
          Sign Out
        </Button>

        <div className="file-upload-section">
          <input type="file" onChange={handleFileChange} disabled={uploading} />
          <Button onClick={handleFileUpload} variant="contained" color="primary" disabled={uploading}>
            {uploading ? <CircularProgress size={24} /> : "Upload File"}
          </Button>

          {uploading && <p>Uploading... {uploadProgress}%</p>}
        </div>
      </div>

      <footer>
        <p>
          Need help?{" "}
          <button
            onClick={() => alert("Redirect to Contact Us page or show modal")}
            style={{
              background: "none",
              border: "none",
              color: "#0061ff", // Dropbox blue
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Contact us
          </button>
        </p>
      </footer>
    </div>
  );
}

// Custom Theme for AWS Amplify UI
const customTheme = {
  name: "DropboxTheme",
  tokens: {
    colors: {
      brand: {
        primary: {
          10: "#eaf2ff",
          80: "#0061ff", // Dropbox blue
          90: "#004ecc", // Darker blue on hover
        },
      },
    },
    components: {
      button: {
        borderRadius: { value: "8px" },
        fontWeight: { value: "bold" },
      },
    },
  },
};

// Export with Custom Theme Applied
export default withAuthenticator(App, { theme: customTheme });
