import React, { useState, useEffect, useRef, useContext } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { SelectedFileContext, SelectedFileType } from "../files/context";

const Input: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { url } = useContext(SelectedFileContext) as SelectedFileType;

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
        file_uri: url,
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

  return (
    <div style={{ width: "100%" }}>
      {/* 左側の入力欄 */}
      <Box
        sx={{
          width: "30%",
          height: "100%",
          p: 2,
          borderRight: "1px solid #ccc",
          float: "left",
        }}
      >
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
      <Box sx={{ width: "60%", p: 2, overflowY: "scroll" }}>
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
    </div>
  );
};

export default Input;
