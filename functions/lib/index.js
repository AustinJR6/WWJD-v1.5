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
exports.askJesus = void 0;
const functions = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const gemini_1 = require("./gemini");
admin.initializeApp(); // Project/credentials auto in Gen 2
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// Verify Firebase ID token from Authorization: Bearer <token>
async function verifyToken(req) {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer '))
        throw new Error('Missing Authorization header');
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded.uid;
}
app.post('/askJesus', async (req, res) => {
    try {
        const uid = await verifyToken(req);
        const { message } = req.body;
        if (!message)
            return res.status(400).json({ error: 'Message required' });
        const reply = await (0, gemini_1.generateWithGemini)(message);
        const db = admin.firestore();
        const ref = db.collection('users').doc(uid).collection('messages');
        await ref.add({ text: message, from: 'user', timestamp: Date.now() });
        await ref.add({ text: reply, from: 'ai', timestamp: Date.now() });
        return res.json({ reply });
    }
    catch (err) {
        const code = err?.message?.includes('Authorization') ? 401 : 500;
        return res.status(code).json({ error: err?.message || 'Internal server error' });
    }
});
// Export the Express app as an HTTPS function (Gen 2)
exports.askJesus = functions.https.onRequest({ memory: '512MiB', timeoutSeconds: 60 }, app);
//# sourceMappingURL=index.js.map