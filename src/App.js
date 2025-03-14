import React, { useState, useEffect } from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { uploadData, list, getUrl } from "@aws-amplify/storage"; // ✅ Import getUrl to fetch file content
import { Button, CircularProgress } from "@mui/material";
import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
import "./App.css";

Amplify.configure(awsExports);

function App({ signOut, user }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [fileContent, setFileContent] = useState(""); // ✅ State for file content
  const [viewingFile, setViewingFile] = useState(""); // ✅ Track which file is being viewed

  useEffect(() => {
    fetchFiles();
  }, []);

  // ✅ Fetch list of files
  const fetchFiles = async () => {
    try {
      const { items } = await list({ accessLevel: "public" });
      setFileList(items);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  // ✅ Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  // ✅ Upload file to S3
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    setUploading(true);

    try {
      await uploadData({
        key: selectedFile.name,
        data: selectedFile,
        options: {
          accessLevel: "public",
          contentType: selectedFile.type,
          progressCallback: (progress) => {
            setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
          },
        },
      });

      alert("File uploaded successfully!");
      fetchFiles(); // Refresh file list after upload
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // ✅ View file content dynamically
  const handleViewFile = async (fileKey) => {
    try {
      setViewingFile(fileKey); // Track which file is being viewed
      const url = await getUrl({ key: fileKey, options: { accessLevel: "public" } });

      // Fetch content of the file
      const response = await fetch(url.url);
      const text = await response.text();
      setFileContent(text);
    } catch (error) {
      console.error("Error fetching file content:", error);
      alert("Error viewing file content.");
    }
  };

  // ✅ Delete file
  const handleDeleteFile = async (fileKey) => {
    try {
      await delete({ key: fileKey, options: { accessLevel: "public" } });
      alert("File deleted successfully!");
      fetchFiles(); // Refresh file list after deletion
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file.");
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

        <h2>Uploaded Files</h2>
        <ul>
          {fileList.map((file) => (
            <li key={file.key}>
              <button
                onClick={() => handleViewFile(file.key)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0061ff",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                  fontSize: "inherit",
                }}
              >
                {file.key}
              </button>
              &nbsp;
              <Button onClick={() => handleDeleteFile(file.key)} color="error" size="small">
                Delete
              </Button>
            </li>
          ))}
        </ul>

        {viewingFile && (
          <div className="file-content">
            <h3>Viewing: {viewingFile}</h3>
            <pre>{fileContent}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Export with AWS Authentication
export default withAuthenticator(App);
