import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

module.exports = {
  root: "src",
  build: {
    outDir: "../dist",
  },
};

export default defineConfig({
  plugins: [react()],
});
