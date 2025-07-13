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
exports.generateGemini = exports.askJesus = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const gemini_1 = require("./gemini");
Object.defineProperty(exports, "generateGemini", { enumerable: true, get: function () { return gemini_1.generateGemini; } });
dotenv.config();
admin.initializeApp();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
const systemPrompt = "You are responding as Jesus would—calm, loving, and wise. Reference scripture, speak with compassion, and guide users with biblical truths. Do not use slang or modern language. Stay rooted in Christ's teachings without claiming to be God directly.";
async function getReply(message) {
    var _a, _b, _c, _d;
    const apiKey = process.env.OPENAI_API_KEY || ((_a = functions.config().openai) === null || _a === void 0 ? void 0 : _a.key);
    if (!apiKey)
        throw new Error('Missing OpenAI API key');
    const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
        ],
    }, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
    });
    const reply = (_d = (_c = (_b = response.data.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content;
    if (!reply)
        throw new Error('No response from OpenAI');
    return reply.trim();
}
app.post('/askJesus', async (req, res) => {
    try {
        console.log('Incoming request to /askJesus');
        const authHeader = req.headers.authorization || '';
        const token = authHeader.split('Bearer ')[1];
        if (!token) {
            console.warn('Missing token');
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        console.log('Verifying token');
        const decoded = await admin.auth().verifyIdToken(token);
        const uid = decoded.uid;
        const message = req.body.message;
        console.log('User ID:', uid);
        console.log('Message:', message);
        if (!message) {
            console.warn('Missing message body');
            res.status(400).json({ error: 'Message required' });
            return;
        }
        console.log('Calling OpenAI');
        const reply = await getReply(message);
        console.log('AI Reply:', reply);
        console.log('Writing messages to Firestore');
        const db = admin.firestore();
        const ref = db.collection('users').doc(uid).collection('messages');
        await ref.add({ text: message, from: 'user', timestamp: Date.now() });
        await ref.add({ text: reply, from: 'ai', timestamp: Date.now() });
        res.status(200).json({ reply });
    }
    catch (err) {
        console.error('Error in askJesus:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});
exports.askJesus = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map