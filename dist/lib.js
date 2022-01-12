"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchTurboCommand = exports.parseTurbo = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
const child_process_1 = require("child_process");
const assertError = (value, message) => {
    if (!value) {
        throw new Error(message);
    }
};
const parsePkgJson = async (path) => {
    const packageJsonBuffer = await promises_1.default.readFile(path);
    return JSON.parse(packageJsonBuffer);
};
const parseScripts = (pkgJson) => {
    assertError(pkgJson.scripts, "Couldn't find package.json scripts");
    return Object.entries(pkgJson.scripts)
        .filter(([, command]) => command.includes("turbo"))
        .map(([name, command]) => ({ name, command }));
};
const parseWorkspacePackages = async (pkgJson) => {
    assertError(pkgJson.workspaces, "No package workspaces found");
    const workspaceWithPkgDirs = pkgJson.workspaces.reduce((acc, workspace) => {
        const trimmedWorkSpace = workspace
            .replaceAll("/", "")
            .replaceAll("*", "")
            .trim();
        return [
            ...acc,
            ...glob_1.default
                // @todo: use ignore opt to ignore node_modules
                .sync(path_1.default.join(process.cwd(), `${trimmedWorkSpace}/**/package.json`))
                .filter((dir) => !dir.includes("node_modules"))
                .map((dir) => ({ workspace: trimmedWorkSpace, dir })),
        ];
    }, []);
    const workspacePackages = [];
    for (const { workspace, dir } of workspaceWithPkgDirs) {
        const pkgJson = await parsePkgJson(dir);
        if (pkgJson.name) {
            workspacePackages.push({ workspace, name: pkgJson.name });
        }
    }
    return workspacePackages;
};
const parseTurbo = async () => {
    const pkgJson = await parsePkgJson(path_1.default.join(process.cwd(), "package.json"));
    const scripts = parseScripts(pkgJson);
    const workspacePackages = await parseWorkspacePackages(pkgJson);
    assertError(scripts.length, "No turbo scripts found");
    assertError(workspacePackages.length, "No packages found in workspaces");
    return {
        scripts,
        workspacePackages,
    };
};
exports.parseTurbo = parseTurbo;
const dispatchTurboCommand = (script, scopedPkgs, options) => {
    const scopesWithDeps = scopedPkgs.map((pkg) => `--scope="${pkg}"`).join(" ");
    const flags = `${(options === null || options === void 0 ? void 0 : options.deps) ? "--include-dependencies" : ""}`;
    const turboCommand = `${script.command} ${scopesWithDeps} ${flags}`;
    (0, child_process_1.execSync)(turboCommand, {
        stdio: "inherit",
    });
};
exports.dispatchTurboCommand = dispatchTurboCommand;
