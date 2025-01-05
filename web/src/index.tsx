import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
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

    setMessages([...messages, { role: "user", content: input }]);
    setInput("");

    // API との通信
    const response = await fetch(
      "http://127.0.0.1:8080/api/gemini.v2.GeminiService/Generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      }
    );

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
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* 左側の入力欄 */}
      <Box sx={{ width: "30%", p: 2, borderRight: "1px solid #ccc" }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="メッセージを入力"
            multiline
            rows={4}
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
                    {message.content}
                  </Typography>
                }
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>
    </Box>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
