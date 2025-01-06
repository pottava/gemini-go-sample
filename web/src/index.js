"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const react_markdown_1 = __importDefault(require("react-markdown"));
const remark_gfm_1 = __importDefault(require("remark-gfm"));
const Box_1 = __importDefault(require("@mui/material/Box"));
const Button_1 = __importDefault(require("@mui/material/Button"));
const TextField_1 = __importDefault(require("@mui/material/TextField"));
const IconButton_1 = __importDefault(require("@mui/material/IconButton"));
const CloudUpload_1 = __importDefault(require("@mui/icons-material/CloudUpload"));
const LinearProgress_1 = __importDefault(require("@mui/material/LinearProgress"));
const Typography_1 = __importDefault(require("@mui/material/Typography"));
const List_1 = __importDefault(require("@mui/material/List"));
const ListItem_1 = __importDefault(require("@mui/material/ListItem"));
const ListItemButton_1 = __importDefault(require("@mui/material/ListItemButton"));
const ListItemText_1 = __importDefault(require("@mui/material/ListItemText"));
const App = () => {
    const [input, setInput] = (0, react_1.useState)("");
    const [messages, setMessages] = (0, react_1.useState)([]);
    const messagesEndRef = (0, react_1.useRef)(null);
    const handleSubmit = (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        if (input.trim() === "")
            return;
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
        const response = yield fetch("/api/gemini.v2.GeminiService/Generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: messageToSend,
                file_uri: selectedFileUrl,
            }),
        });
        const data = yield response.json();
        setMessages([
            ...messages,
            { role: "user", content: input },
            { role: "assistant", content: data.text },
        ]);
    });
    (0, react_1.useEffect)(() => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    const [file, setFile] = (0, react_1.useState)(null);
    const [uploadProgress, setUploadProgress] = (0, react_1.useState)(null);
    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };
    const handleUpload = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!file)
            return;
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
            }
            else {
                console.error("アップロード失敗:", xhr.status, xhr.statusText);
            }
        };
        xhr.onerror = () => {
            console.error("アップロード失敗:", xhr.status, xhr.statusText);
        };
        xhr.send(formData);
    });
    const [files, setFiles] = (0, react_1.useState)([]);
    const [selectedFileUrl, setSelectedFileUrl] = (0, react_1.useState)(null);
    const fetchFiles = (name) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield fetch("/api/files/");
            const data = yield response.json();
            setFiles(data);
            if (name) {
                const file = data.find((file) => file.name === name);
                if (file) {
                    setSelectedFileUrl(file.url);
                }
            }
        }
        catch (error) {
            console.error("ファイル一覧の取得に失敗しました:", error);
        }
    });
    (0, react_1.useEffect)(() => {
        fetchFiles();
    }, []);
    const handleFileClick = (url) => {
        setSelectedFileUrl((prevUrl) => (prevUrl === url ? null : url));
    };
    return (react_1.default.createElement(Box_1.default, { sx: { display: "flex", height: "100vh" } },
        react_1.default.createElement(Box_1.default, { sx: { width: "30%", p: 2, borderRight: "1px solid #ccc" } },
            react_1.default.createElement("form", { onSubmit: handleSubmit },
                react_1.default.createElement(TextField_1.default, { label: "\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B", multiline: true, rows: 10, fullWidth: true, value: input, onChange: (e) => setInput(e.target.value) }),
                react_1.default.createElement(Button_1.default, { type: "submit", variant: "contained", sx: { mt: 2 } }, "\u9001\u4FE1"))),
        react_1.default.createElement(Box_1.default, { sx: { width: "70%", p: 2, overflowY: "scroll" } },
            react_1.default.createElement(List_1.default, null,
                messages.map((message, index) => (react_1.default.createElement(ListItem_1.default, { key: index },
                    react_1.default.createElement(ListItemText_1.default, { primary: react_1.default.createElement(Typography_1.default, { variant: "body1", component: "span", sx: {
                                fontWeight: message.role === "user" ? "bold" : "normal",
                            } },
                            message.role === "user" ? "あなた: " : "アシスタント: ",
                            react_1.default.createElement(react_markdown_1.default, { remarkPlugins: [remark_gfm_1.default] }, message.content)) })))),
                react_1.default.createElement("div", { ref: messagesEndRef }))),
        react_1.default.createElement(Box_1.default, { sx: { position: "fixed", bottom: 30, left: 16 } },
            react_1.default.createElement(Typography_1.default, { variant: "h6", component: "div", gutterBottom: true }, "\u30D5\u30A1\u30A4\u30EB\u3092\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3057\u3066\u8CEA\u554F"),
            react_1.default.createElement("label", { htmlFor: "upload-button" },
                react_1.default.createElement("input", { accept: "*" // 任意のファイル
                    , id: "upload-button", type: "file", hidden: true, onChange: handleFileChange }),
                react_1.default.createElement(IconButton_1.default, { color: "primary", "aria-label": "upload file", component: "span" },
                    react_1.default.createElement(CloudUpload_1.default, null))),
            file && (react_1.default.createElement(Box_1.default, { sx: { mt: 2, display: "flex", alignItems: "center" } },
                react_1.default.createElement(Typography_1.default, { variant: "body2", sx: { mr: 1 } }, file.name),
                react_1.default.createElement(Button_1.default, { variant: "contained", color: "primary", onClick: handleUpload, disabled: uploadProgress !== null }, "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9"))),
            uploadProgress !== null && (react_1.default.createElement(LinearProgress_1.default, { variant: "determinate", value: uploadProgress, sx: { mt: 1 } })),
            files && files.length > 0 && (react_1.default.createElement(List_1.default, { sx: { mt: 2 } }, files.map((file) => (react_1.default.createElement(ListItem_1.default, { sx: {
                    border: "none",
                    backgroundColor: "transparent",
                    height: "50px",
                    padding: "4px",
                }, key: file.name, component: "button", onClick: (event) => handleFileClick(file.url) },
                react_1.default.createElement(ListItemButton_1.default, { sx: {
                        "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                        },
                        "&.Mui-selected": {
                            backgroundColor: "primary.main",
                            color: "white",
                        },
                    }, selected: selectedFileUrl === file.url },
                    " ",
                    react_1.default.createElement(ListItemText_1.default, { primary: file.name }))))))))));
};
client_1.default.createRoot(document.getElementById("root")).render(react_1.default.createElement(App, null));
