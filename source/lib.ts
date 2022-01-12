import fs from 'fs/promises';
import path from 'path';
import glob from 'glob';
import { execSync } from 'child_process';

export type TurboSelectOptions = {
	deps?: boolean;
};

export type TurboScript = {
	name: string;
	command: string;
};

export type TurboPackage = {
	name: string;
	workspace: string;
};

type IPackageJson = Record<string, any> & {
	name?: string;
	scripts?: Record<string, string>;
	workspaces?: string[];
};

const assertError: (value: unknown, message?: string) => asserts value = (value: unknown, message?: string) => {
	if (!value) {
		throw new Error(message);
	}
};

const parsePkgJson = async (path: string): Promise<IPackageJson> => {
	const packageJsonBuffer = await fs.readFile(path);
	return JSON.parse(packageJsonBuffer as any);
};

const parseScripts = (pkgJson: IPackageJson): TurboScript[] => {
	assertError(pkgJson.scripts, "Couldn't find package.json scripts");

	return Object.entries(pkgJson.scripts)
		.filter(([, command]) => command.includes('turbo'))
		.map(([name, command]) => ({ name, command }));
};

const parseWorkspacePackages = async (pkgJson: IPackageJson): Promise<TurboPackage[]> => {
	assertError(pkgJson.workspaces, 'No package workspaces found');

	const workspaceWithPkgDirs = pkgJson.workspaces.reduce<
		{
			workspace: string;
			dir: string;
		}[]
	>((acc, workspace) => {
		const trimmedWorkSpace = workspace.replaceAll('/', '').replaceAll('*', '').trim();

		return [
			...acc,
			...glob
				// @todo: use ignore opt to ignore node_modules
				.sync(path.join(process.cwd(), `${trimmedWorkSpace}/**/package.json`))
				.filter(dir => !dir.includes('node_modules'))
				.map(dir => ({ workspace: trimmedWorkSpace, dir })),
		];
	}, []);

	const workspacePackages: TurboPackage[] = [];
	for (const { workspace, dir } of workspaceWithPkgDirs) {
		const pkgJson = await parsePkgJson(dir);
		if (pkgJson.name) {
			workspacePackages.push({ workspace, name: pkgJson.name });
		}
	}

	return workspacePackages;
};

export const parseTurbo = async (): Promise<{
	scripts: TurboScript[];
	workspacePackages: TurboPackage[];
}> => {
	const pkgJson: IPackageJson = await parsePkgJson(path.join(process.cwd(), 'package.json'));

	const scripts = parseScripts(pkgJson);
	const workspacePackages = await parseWorkspacePackages(pkgJson);

	assertError(scripts.length, 'No turbo scripts found');
	assertError(workspacePackages.length, 'No packages found in workspaces');

	return {
		scripts,
		workspacePackages,
	};
};

export const dispatchTurboCommand = (script: TurboScript, scopedPkgs: string[], options?: TurboSelectOptions): void => {
	const scopes = scopedPkgs.map(pkg => `--scope="${pkg}"`).join(' ');

	const flags = `${options?.deps ? '--include-dependencies' : ''}`;

	const turboCommand = `${script.command} ${scopes} ${flags}`;

	execSync(turboCommand, {
		stdio: 'inherit',
	});
};
