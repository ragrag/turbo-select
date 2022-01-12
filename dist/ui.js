"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const ink_spinner_1 = __importDefault(require("ink-spinner"));
const ink_1 = require("ink");
const ink_multi_select_1 = __importDefault(require("ink-multi-select"));
const ink_select_input_1 = __importDefault(require("ink-select-input"));
const lib_1 = require("./lib");
const App = ({ options }) => {
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [cliStep, setCliStep] = (0, react_1.useState)(1);
    const [turboScripts, setTurboScripts] = (0, react_1.useState)([]);
    const [workspacePackages, setWorkspacePackages] = (0, react_1.useState)([]);
    const [selectedScript, setSelectedScript] = (0, react_1.useState)(null);
    const [selectedPackages, setSelectedPackages] = (0, react_1.useState)([]);
    // init
    (0, react_1.useEffect)(() => {
        const initializeTurboSelect = async () => {
            const { scripts, workspacePackages } = await (0, lib_1.parseTurbo)();
            setTurboScripts(scripts);
            setWorkspacePackages(workspacePackages);
            setLoading(false);
        };
        initializeTurboSelect();
    }, []);
    // dispatch cli command
    (0, react_1.useEffect)(() => {
        const dispatchCommand = async () => {
            if (selectedScript && selectedPackages.length) {
                setCliStep(3);
                (0, lib_1.dispatchTurboCommand)(selectedScript, selectedPackages, options);
            }
        };
        dispatchCommand();
    }, [selectedPackages]);
    const scriptOptions = (0, react_1.useMemo)(() => {
        return turboScripts.map((p) => ({
            label: p.name,
            value: p,
            key: p.name,
        }));
    }, [turboScripts]);
    const packageOptions = (0, react_1.useMemo)(() => {
        return workspacePackages.map((p) => ({
            label: `[${p.workspace}] - ${p.name}`,
            value: p.name,
            key: `${p.workspace}.${p.name}`,
        }));
    }, [workspacePackages]);
    const onScriptSelected = (selected) => {
        setSelectedScript(selected.value);
        setCliStep(2);
    };
    const onPackagesSelected = (selected) => {
        setSelectedPackages(selected.map((p) => p.value));
    };
    return loading ? (react_1.default.createElement(ink_1.Text, null,
        react_1.default.createElement(ink_1.Text, { color: "blue" },
            react_1.default.createElement(ink_spinner_1.default, { type: "dots" })),
        " Loading")) : (react_1.default.createElement(react_1.default.Fragment, null, cliStep === 1 ? (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(ink_1.Text, null, "Select Script:"),
        react_1.default.createElement(ink_select_input_1.default, { items: scriptOptions, onSelect: onScriptSelected }))) : cliStep === 2 ? (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(ink_1.Text, null, "Select Packages:"),
        react_1.default.createElement(ink_multi_select_1.default, { items: packageOptions, onSubmit: onPackagesSelected }))) : (react_1.default.createElement(ink_1.Text, null, "Running Turbo"))));
};
module.exports = App;
exports.default = App;
