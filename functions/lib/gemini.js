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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiReply = void 0;
const functions = __importStar(require("firebase-functions"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const vertexai_1 = require("@google-cloud/vertexai");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
const vertexAi = new vertexai_1.VertexAI({
    project: process.env.PROJECT_ID,
    location: 'us-central1',
});
const model = vertexAi.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
        topP: 0.8,
    },
});
app.post('/gemini', async (req, res) => {
    var _a, _b, _c, _d, _e;
    const message = req.body.message;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: message }] }],
        });
        const reply = ((_e = (_d = (_c = (_b = (_a = result.response.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) || 'No response';
        res.status(200).json({ reply });
    }
    catch (error) {
        console.error('Gemini error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});
exports.geminiReply = functions.https.onRequest(app);
//# sourceMappingURL=gemini.js.map