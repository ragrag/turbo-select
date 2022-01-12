"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePkgJson = exports.assertError = void 0;
const assert_1 = __importDefault(require("assert"));
const promises_1 = __importDefault(require("fs/promises"));
const assertError = (value, errorMessage) => {
    try {
        (0, assert_1.default)(value);
    }
    catch (err) {
        throw new Error(errorMessage);
    }
};
exports.assertError = assertError;
const parsePkgJson = async (path) => {
    const packageJsonBuffer = await promises_1.default.readFile(path);
    return JSON.parse(packageJsonBuffer);
};
exports.parsePkgJson = parsePkgJson;
