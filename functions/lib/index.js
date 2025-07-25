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
exports.generateOpenAI = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const openai_1 = require("./openai");
Object.defineProperty(exports, "generateOpenAI", { enumerable: true, get: function () { return openai_1.generateOpenAI; } });
const FIREBASE_API_KEY = functions.config().firebase?.api_key;
admin.initializeApp(); // Let Firebase inject project info
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
async function getReply(message) {
    return (0, openai_1.generateWithOpenAI)(message);
}
async function signInWithCustomToken(customToken) {
    if (!FIREBASE_API_KEY) {
        throw new Error('Firebase API key not configured');
    }
    const resp = await (0, node_fetch_1.default)(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    });
    const data = await resp.json();
    if (!resp.ok) {
        throw new Error(data.error?.message || 'Authentication failed');
    }
    return data.idToken;
}
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password required' });
            return;
        }
        const user = await admin.auth().createUser({ email, password });
        const customToken = await admin.auth().createCustomToken(user.uid);
        const idToken = await signInWithCustomToken(customToken);
        res.json({ token: idToken });
    }
    catch (err) {
        console.error('signup error:', err);
        res.status(500).json({ error: err.message });
    }
});
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password required' });
            return;
        }
        if (!FIREBASE_API_KEY) {
            res.status(500).json({ error: 'Firebase API key not configured' });
            return;
        }
        const resp = await (0, node_fetch_1.default)(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: true }),
        });
        const data = await resp.json();
        if (!resp.ok) {
            res.status(400).json({ error: data.error?.message || 'Login failed' });
            return;
        }
        res.json({ token: data.idToken });
    }
    catch (err) {
        console.error('login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
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
// Start the Express server when running on Cloud Run. PORT defaults to 8080.
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
//# sourceMappingURL=index.js.map