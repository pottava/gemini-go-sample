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
const Box_1 = __importDefault(require("@mui/material/Box"));
const TextField_1 = __importDefault(require("@mui/material/TextField"));
const Button_1 = __importDefault(require("@mui/material/Button"));
const Typography_1 = __importDefault(require("@mui/material/Typography"));
const List_1 = __importDefault(require("@mui/material/List"));
const ListItem_1 = __importDefault(require("@mui/material/ListItem"));
const ListItemText_1 = __importDefault(require("@mui/material/ListItemText"));
const App = () => {
    const [input, setInput] = (0, react_1.useState)("");
    const [messages, setMessages] = (0, react_1.useState)([]);
    const messagesEndRef = (0, react_1.useRef)(null);
    const handleSubmit = (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        if (input.trim() === "")
            return;
        setMessages([...messages, { role: "user", content: input }]);
        setInput("");
        // API との通信
        const response = yield fetch("http://127.0.0.1:8080/api/gemini.v2.GeminiService/Generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ prompt: input }),
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
        // メッセージが追加されたら、スクロールを一番下まで移動
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    return (react_1.default.createElement(Box_1.default, { sx: { display: "flex", height: "100vh" } },
        react_1.default.createElement(Box_1.default, { sx: { width: "30%", p: 2, borderRight: "1px solid #ccc" } },
            react_1.default.createElement("form", { onSubmit: handleSubmit },
                react_1.default.createElement(TextField_1.default, { label: "\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B", multiline: true, rows: 4, fullWidth: true, value: input, onChange: (e) => setInput(e.target.value) }),
                react_1.default.createElement(Button_1.default, { type: "submit", variant: "contained", sx: { mt: 2 } }, "\u9001\u4FE1"))),
        react_1.default.createElement(Box_1.default, { sx: { width: "70%", p: 2, overflowY: "scroll" } },
            react_1.default.createElement(List_1.default, null,
                messages.map((message, index) => (react_1.default.createElement(ListItem_1.default, { key: index },
                    react_1.default.createElement(ListItemText_1.default, { primary: react_1.default.createElement(Typography_1.default, { variant: "body1", component: "span", sx: {
                                fontWeight: message.role === "user" ? "bold" : "normal",
                            } },
                            message.role === "user" ? "あなた: " : "アシスタント: ",
                            message.content) })))),
                react_1.default.createElement("div", { ref: messagesEndRef })))));
};
client_1.default.createRoot(document.getElementById("root")).render(react_1.default.createElement(App, null));
