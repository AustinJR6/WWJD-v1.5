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
const functions = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const gemini_1 = require("./gemini");
Object.defineProperty(exports, "generateGemini", { enumerable: true, get: function () { return gemini_1.generateGemini; } });
dotenv.config();
admin.initializeApp(); // Let Firebase inject project info
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
async function getReply(message) {
    return (0, gemini_1.generateWithGemini)(message);
}
app.post('/askJesus', async (req, res) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.split('Bearer ')[1];
        if (!token) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const decoded = await admin.auth().verifyIdToken(token);
        const uid = decoded.uid;
        const { message } = req.body;
        if (!message) {
            res.status(400).json({ error: 'Message required' });
            return;
        }
        const reply = await getReply(message);
        const db = admin.firestore();
        const ref = db.collection('users').doc(uid).collection('messages');
        await ref.add({ text: message, from: 'user', timestamp: Date.now() });
        await ref.add({ text: reply, from: 'ai', timestamp: Date.now() });
        res.json({ reply });
    }
    catch (err) {
        console.error('askJesus error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.askJesus = functions.https.onRequest({
    memory: '512MiB',
    timeoutSeconds: 60,
}, app);
//# sourceMappingURL=index.js.map