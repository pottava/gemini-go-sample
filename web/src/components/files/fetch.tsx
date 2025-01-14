import React, { useState, useEffect, useContext } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { SelectedFileContext, SelectedFileType } from "../files/context";

const Files: React.FC = () => {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const { url, setURL } = useContext(SelectedFileContext) as SelectedFileType;

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/files/");
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("ファイル一覧の取得に失敗しました:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [url]);

  const handleFileClick = (value: string) => {
    setURL(url === value ? "" : value);
  };

  return (
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
            selected={url === file.url}
          >
            {" "}
            <ListItemText primary={file.name} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default Files;
