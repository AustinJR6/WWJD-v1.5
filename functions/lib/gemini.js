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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResponse = generateResponse;
const vertexai_1 = require("@google-cloud/vertexai");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const PROJECT_ID = (_a = process.env.PROJECT_ID) !== null && _a !== void 0 ? _a : '';
const REGION = (_b = process.env.REGION) !== null && _b !== void 0 ? _b : '';
const GEMINI_MODEL = (_c = process.env.GEMINI_MODEL) !== null && _c !== void 0 ? _c : '';
async function generateResponse(prompt) {
    var _a, _b, _c, _d, _e;
    if (!PROJECT_ID || !REGION || !GEMINI_MODEL) {
        throw new Error('PROJECT_ID, REGION, and GEMINI_MODEL must be set');
    }
    const vertexAi = new vertexai_1.VertexAI({ project: PROJECT_ID, location: REGION });
    const model = vertexAi.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    const reply = (_e = (_d = (_c = (_b = (_a = result.response.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text;
    return reply !== null && reply !== void 0 ? reply : '';
}
exports.default = generateResponse;
//# sourceMappingURL=gemini.js.map