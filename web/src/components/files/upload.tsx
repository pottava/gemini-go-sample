import React, { useState, useContext } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { SelectedFileContext, SelectedFileType } from "../files/context";
import Files from "../files/fetch";

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const { setURL } = useContext(SelectedFileContext) as SelectedFileType;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/files/");

    xhr.upload.onprogress = (event) => {
      const progress = Math.round((event.loaded / event.total) * 100);
      setUploadProgress(progress);
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log("アップロード成功:", xhr.responseText);
        setFile(null);
        setUploadProgress(null);
        setURL(xhr.responseText);
      } else {
        console.error("アップロード失敗:", xhr.status, xhr.statusText);
      }
    };
    xhr.onerror = () => {
      console.error("アップロード失敗:", xhr.status, xhr.statusText);
    };
    xhr.send(formData);
  };

  return (
    <Box sx={{ position: "fixed", bottom: 30, left: 16 }}>
      <Typography variant="h6" component="div" gutterBottom>
        ファイルをアップロードして質問
      </Typography>
      <label htmlFor="upload-button">
        <input
          accept="*" // 任意のファイル
          id="upload-button"
          type="file"
          hidden
          onChange={handleFileChange}
        />
        <IconButton color="primary" aria-label="upload file" component="span">
          <CloudUploadIcon />
        </IconButton>
      </label>
      {file && (
        <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            {file.name}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={uploadProgress !== null}
          >
            アップロード
          </Button>
        </Box>
      )}
      {uploadProgress !== null && (
        <LinearProgress
          variant="determinate"
          value={uploadProgress}
          sx={{ mt: 1 }}
        />
      )}
      <Files />
    </Box>
  );
};

export default Upload;
