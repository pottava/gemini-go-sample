import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

const App: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (input.trim() === "") return;

    var messageToSend = input;
    const history = messages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n"); // 過去のチャット履歴を文字列化
    if (history !== "") {
      messageToSend = `Please respond based on what we talked before:\n${history}\n\nAnd here is a comment user has:\n${input}.`;
    }
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");

    // API との通信
    const response = await fetch("/api/gemini.v2.GeminiService/Generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: messageToSend,
        file_uri: selectedFileUrl,
      }),
    });

    const data = await response.json();
    setMessages([
      ...messages,
      { role: "user", content: input },
      { role: "assistant", content: data.text },
    ]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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
        fetchFiles(file.name);
      } else {
        console.error("アップロード失敗:", xhr.status, xhr.statusText);
      }
    };
    xhr.onerror = () => {
      console.error("アップロード失敗:", xhr.status, xhr.statusText);
    };
    xhr.send(formData);
  };

  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);

  const fetchFiles = async (name?: string) => {
    try {
      const response = await fetch("/api/files/");
      const data = await response.json();
      setFiles(data);

      if (name) {
        const file = data.find((file: { name: string }) => file.name === name);
        if (file) {
          setSelectedFileUrl(file.url);
        }
      }
    } catch (error) {
      console.error("ファイル一覧の取得に失敗しました:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileClick = (url: string) => {
    setSelectedFileUrl((prevUrl) => (prevUrl === url ? null : url));
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* 左側の入力欄 */}
      <Box sx={{ width: "30%", p: 2, borderRight: "1px solid #ccc" }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="メッセージを入力"
            multiline
            rows={10}
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            送信
          </Button>
        </form>
      </Box>

      {/* 右側のチャット表示欄 */}
      <Box sx={{ width: "70%", p: 2, overflowY: "scroll" }}>
        <List>
          {messages.map((message, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    component="span"
                    sx={{
                      fontWeight: message.role === "user" ? "bold" : "normal",
                    }}
                  >
                    {message.role === "user" ? "あなた: " : "アシスタント: "}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </Typography>
                }
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* ファイルアップロード */}
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
        {files && files.length > 0 && (
          <List sx={{ mt: 2 }}>
            {files.map((file) => (
              <ListItem
                sx={{
                  border: "none",
                  backgroundColor: "transparent",
                  height: "50px",
                  padding: "4px",
                }}
                key={file.name}
                component="button"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                  handleFileClick(file.url)
                }
              >
                <ListItemButton
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "white",
                    },
                  }}
                  selected={selectedFileUrl === file.url}
                >
                  {" "}
                  <ListItemText primary={file.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
