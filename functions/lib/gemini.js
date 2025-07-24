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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGemini = void 0;
exports.generateWithGemini = generateWithGemini;
const https_1 = require("firebase-functions/v2/https");
const vertexai_1 = require("@google-cloud/vertexai");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.PROJECT_ID || 'default-project';
const LOCATION = process.env.REGION || 'us-central1';
const MODEL = process.env.MODEL || 'gemini-1.5-pro-preview-0409';
const vertexAI = new vertexai_1.VertexAI({ project: PROJECT_ID, location: LOCATION });
const generativeModel = vertexAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 2048,
    },
});
async function generateWithGemini(prompt) {
    try {
        const result = await generativeModel.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }],
                },
            ],
        });
        return (result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '');
    }
    catch (err) {
        console.error('[Gemini] Generation error:', err);
        return '[Error generating response]';
    }
}
exports.generateGemini = (0, https_1.onCall)(async (request) => {
    const prompt = request.data.prompt ?? '';
    const result = await generateWithGemini(prompt);
    return { result };
});
//# sourceMappingURL=gemini.js.map