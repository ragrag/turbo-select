#!/usr/bin/env node
import {jsx as $eUzym$jsx, jsxs as $eUzym$jsxs, Fragment as $eUzym$Fragment} from "react/jsx-runtime";
import {useState as $eUzym$useState, useEffect as $eUzym$useEffect, useMemo as $eUzym$useMemo} from "react";
import {render as $eUzym$render, Text as $eUzym$Text} from "ink";
import $eUzym$meow from "meow";
import $eUzym$inkspinner from "ink-spinner";
import $eUzym$inkmultiselect from "ink-multi-select";
import $eUzym$inkselectinput from "ink-select-input";
import $eUzym$fspromises from "fs/promises";
import $eUzym$path from "path";
import $eUzym$glob from "glob";
import {execSync as $eUzym$execSync} from "child_process";

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}




var $e28ec9cdf26c2efa$exports = {};

$parcel$export($e28ec9cdf26c2efa$exports, "default", () => $e28ec9cdf26c2efa$export$2e2bcd8739ae039, (v) => $e28ec9cdf26c2efa$export$2e2bcd8739ae039 = v);










const $e33148af9f502626$var$assertError = (value, message)=>{
    if (!value) throw new Error(message);
};
const $e33148af9f502626$var$parsePkgJson = async (path)=>{
    const packageJsonBuffer = await $eUzym$fspromises.readFile(path);
    return JSON.parse(packageJsonBuffer);
};
const $e33148af9f502626$var$parseScripts = (pkgJson)=>{
    $e33148af9f502626$var$assertError(pkgJson.scripts, "Couldn't find package.json scripts");
    return Object.entries(pkgJson.scripts).filter(([, command])=>command.includes("turbo")
    ).map(([name, command])=>({
            name: name,
            command: command
        })
    );
};
const $e33148af9f502626$var$parseWorkspacePackages = async (pkgJson)=>{
    $e33148af9f502626$var$assertError(pkgJson.workspaces, "No package workspaces found");
    const workspaceWithPkgDirs = pkgJson.workspaces.reduce((acc, workspace)=>{
        const trimmedWorkSpace = workspace.replaceAll("/", "").replaceAll("*", "").trim();
        return [
            ...acc,
            ...$eUzym$glob// @todo: use ignore opt to ignore node_modules
            .sync($eUzym$path.join(process.cwd(), `${trimmedWorkSpace}/**/package.json`)).filter((dir)=>!dir.includes("node_modules")
            ).map((dir)=>({
                    workspace: trimmedWorkSpace,
                    dir: dir
                })
            ), 
        ];
    }, []);
    const workspacePackages = [];
    for (const { workspace: workspace1 , dir: dir1  } of workspaceWithPkgDirs){
        const pkgJson = await $e33148af9f502626$var$parsePkgJson(dir1);
        if (pkgJson.name) workspacePackages.push({
            workspace: workspace1,
            name: pkgJson.name
        });
    }
    return workspacePackages;
};
const $e33148af9f502626$export$a8113e55cbc1c773 = async ()=>{
    const pkgJson = await $e33148af9f502626$var$parsePkgJson($eUzym$path.join(process.cwd(), "package.json"));
    const scripts = $e33148af9f502626$var$parseScripts(pkgJson);
    const workspacePackages = await $e33148af9f502626$var$parseWorkspacePackages(pkgJson);
    $e33148af9f502626$var$assertError(scripts.length, "No turbo scripts found");
    $e33148af9f502626$var$assertError(workspacePackages.length, "No packages found in workspaces");
    return {
        scripts: scripts,
        workspacePackages: workspacePackages
    };
};
const $e33148af9f502626$export$8376fef73060da60 = (script, scopedPkgs, options)=>{
    const scopesWithDeps = scopedPkgs.map((pkg)=>`--scope="${pkg}"`
    ).join(" ");
    const flags = `${(options === null || options === void 0 ? void 0 : options.deps) ? "--include-dependencies" : ""}`;
    const turboCommand = `${script.command} ${scopesWithDeps} ${flags}`;
    $eUzym$execSync(turboCommand, {
        stdio: "inherit"
    });
};


const $e28ec9cdf26c2efa$var$App = ({ options: options  })=>{
    const [loading, setLoading] = $eUzym$useState(true);
    const [cliStep, setCliStep] = $eUzym$useState(1);
    const [turboScripts, setTurboScripts] = $eUzym$useState([]);
    const [workspacePackages1, setWorkspacePackages] = $eUzym$useState([]);
    const [selectedScript, setSelectedScript] = $eUzym$useState(null);
    const [selectedPackages, setSelectedPackages] = $eUzym$useState([]);
    // init
    $eUzym$useEffect(()=>{
        const initializeTurboSelect = async ()=>{
            const { scripts: scripts , workspacePackages: workspacePackages  } = await $e33148af9f502626$export$a8113e55cbc1c773();
            setTurboScripts(scripts);
            setWorkspacePackages(workspacePackages);
            setLoading(false);
        };
        initializeTurboSelect();
    }, []);
    // dispatch cli command
    $eUzym$useEffect(()=>{
        const dispatchCommand = async ()=>{
            if (selectedScript && selectedPackages.length) {
                setCliStep(3);
                $e33148af9f502626$export$8376fef73060da60(selectedScript, selectedPackages, options);
            }
        };
        dispatchCommand();
    }, [
        selectedPackages
    ]);
    const scriptOptions = $eUzym$useMemo(()=>{
        return turboScripts.map((p)=>({
                label: p.name,
                value: p,
                key: p.name
            })
        );
    }, [
        turboScripts
    ]);
    const packageOptions = $eUzym$useMemo(()=>{
        return workspacePackages1.map((p)=>({
                label: `[${p.workspace}] - ${p.name}`,
                value: p.name,
                key: `${p.workspace}.${p.name}`
            })
        );
    }, [
        workspacePackages1
    ]);
    const onScriptSelected = (selected)=>{
        setSelectedScript(selected.value);
        setCliStep(2);
    };
    const onPackagesSelected = (selected)=>{
        setSelectedPackages(selected.map((p)=>p.value
        ));
    };
    return loading ? /*#__PURE__*/ $eUzym$jsxs($eUzym$Text, {
        children: [
            /*#__PURE__*/ $eUzym$jsx($eUzym$Text, {
                color: "blue",
                children: /*#__PURE__*/ $eUzym$jsx($eUzym$inkspinner, {
                    type: "dots"
                })
            }),
            " Loading"
        ]
    }) : /*#__PURE__*/ $eUzym$jsx($eUzym$Fragment, {
        children: cliStep === 1 ? /*#__PURE__*/ $eUzym$jsxs($eUzym$Fragment, {
            children: [
                /*#__PURE__*/ $eUzym$jsx($eUzym$Text, {
                    children: "Select Script:"
                }),
                /*#__PURE__*/ $eUzym$jsx($eUzym$inkselectinput, {
                    items: scriptOptions,
                    onSelect: onScriptSelected
                })
            ]
        }) : cliStep === 2 ? /*#__PURE__*/ $eUzym$jsxs($eUzym$Fragment, {
            children: [
                /*#__PURE__*/ $eUzym$jsx($eUzym$Text, {
                    children: "Select Packages:"
                }),
                /*#__PURE__*/ $eUzym$jsx($eUzym$inkmultiselect, {
                    items: packageOptions,
                    onSubmit: onPackagesSelected
                })
            ]
        }) : /*#__PURE__*/ $eUzym$jsx($eUzym$Text, {
            children: "Running Turbo"
        })
    });
};
$e28ec9cdf26c2efa$exports = $e28ec9cdf26c2efa$var$App;
var $e28ec9cdf26c2efa$export$2e2bcd8739ae039 = $e28ec9cdf26c2efa$var$App;


const $628112e1c5d9b6a4$var$cli = $eUzym$meow(`
	Usage
	  $ turbo-select

	Options
		--no-deps exclude dependencies

	Examples
	  $ turbo-select 
`, {
    flags: {
        deps: {
            type: "boolean",
            default: true
        }
    }
});
$eUzym$render(/*#__PURE__*/ $eUzym$jsx($e28ec9cdf26c2efa$exports.default, {
    options: {
        ...$628112e1c5d9b6a4$var$cli.flags
    }
}));


//# sourceMappingURL=module.js.map
