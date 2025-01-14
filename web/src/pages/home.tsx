import React from "react";
import Box from "@mui/material/Box";
import Input from "../components/chat/input";
import SelectedFile from "../components/files/context";
import Upload from "../components/files/upload";

const Home: React.FC = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <SelectedFile>
        <Input />
        <Upload />
      </SelectedFile>
    </Box>
  );
};

export default Home;
