import React, { useState, useEffect } from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { uploadData, list, getUrl, remove } from "@aws-amplify/storage";
import { fetchUserAttributes } from "@aws-amplify/auth"; 
import { Button, CircularProgress, TextField } from "@mui/material";
import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
import "./App.css";

Amplify.configure(awsExports);

function App({ signOut }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [setUploadProgress] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [fileContent, setFileContent] = useState("");
  const [viewingFile, setViewingFile] = useState(null);
  const [username, setUsername] = useState("User");
  const [folderPath, setFolderPath] = useState("");
  
  useEffect(() => {
    fetchFiles();
    fetchUsername();
  }, []);

  const fetchFiles = async (folder = "") => {
    try {
      const { items } = await list({ accessLevel: "public", prefix: folder });
      setFileList(items);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const fetchUsername = async () => {
    try {
      const attributes = await fetchUserAttributes();
      setUsername(attributes?.email || attributes?.preferred_username || "User");
    } catch (error) {
      console.error("Error fetching user attributes:", error);
      setUsername("User");
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    setUploading(true);
    const timestamp = new Date().toISOString();
    const fileKey = `${folderPath}${selectedFile.name}_${timestamp}`;

    try {
      await uploadData({
        key: fileKey,
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
      fetchFiles(folderPath);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleViewFile = async (fileKey) => {
    try {
      setViewingFile(fileKey);
      const url = await getUrl({ key: fileKey, options: { accessLevel: "public" } });
      if (fileKey.match(/\.(jpg|jpeg|png|gif)$/)) {
        setFileContent(<img src={url.url} alt={fileKey} style={{ maxWidth: "100%" }} />);
      } else {
        const response = await fetch(url.url);
        const text = await response.text();
        setFileContent(<pre>{text}</pre>);
      }
    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  };

  const handleDeleteFile = async (fileKey) => {
    try {
      await remove({ key: fileKey, options: { accessLevel: "public" } });
      alert("File deleted successfully!");
      fetchFiles(folderPath);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const generateSharedLink = async (fileKey) => {
    try {
      const url = await getUrl({ key: fileKey, options: { accessLevel: "public", expiresIn: 3600 } });
      prompt("Copy this shareable link:", url.url);
    } catch (error) {
      console.error("Error generating link:", error);
    }
  };

  return (
    <div className="App">
      <h1>My Dropbox App</h1>
      <h3>Welcome, {username}!</h3>
      <Button onClick={signOut} variant="contained" color="secondary">
        Sign Out
      </Button>

      <TextField
        label="Folder Path"
        variant="outlined"
        fullWidth
        value={folderPath}
        onChange={(e) => setFolderPath(e.target.value)}
      />

      <div className="file-upload-section">
        <input type="file" onChange={handleFileChange} disabled={uploading} />
        <Button onClick={handleFileUpload} variant="contained" color="primary" disabled={uploading}>
          {uploading ? <CircularProgress size={24} /> : "Upload File"}
        </Button>
      </div>

      {!viewingFile ? (
        <>
          <h2>Uploaded Files</h2>
          <ul>
            {fileList.map((file) => (
              <li key={file.key}>
                <button onClick={() => handleViewFile(file.key)}>{file.key}</button>
                <Button onClick={() => handleDeleteFile(file.key)} color="error" size="small">
                  Delete
                </Button>
                <Button onClick={() => generateSharedLink(file.key)} size="small">Share</Button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="file-content">
          <h3>Viewing: {viewingFile}</h3>
          {fileContent}
          <Button onClick={() => setViewingFile(null)} variant="contained" color="primary">
            Back
          </Button>
        </div>
      )}
    </div>
  );
}

export default withAuthenticator(App);
