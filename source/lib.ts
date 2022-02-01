import fs from 'fs/promises';
import path from 'path';
import fg from 'fast-glob';
import { spawn } from 'child_process';
import chalk from 'chalk';

import { IPackageJson, TurboScript, TurboPackage, TurboSelectOptions, MonoRepo } from './types';

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
		.filter(([, command]) => new RegExp(/^turbo\s/).test(command))
		.map(([name, command]) => ({ name, command }));
};

const parseWorkspacePackages = async (pkgJson: IPackageJson): Promise<TurboPackage[]> => {
	assertError(pkgJson.workspaces, 'No package workspaces found');

	const workspaceWithPkgDirs = await Promise.all(
		pkgJson.workspaces.map(async workspace => {
			const workspaceWithoutGlob = workspace.replace(/\/\*$/, '').replace(/\/$/, '');
			const matchedDirectories = await fg(`${workspaceWithoutGlob}/**/package.json`, { deep: 2 });

			return matchedDirectories.map(dir => ({ workspace: workspaceWithoutGlob, dir }));
		}),
	);

	const workspacePackages = await Promise.all(
		workspaceWithPkgDirs.flat().map(async ({ workspace, dir }) => {
			const pkgJson = await parsePkgJson(dir);
			if (pkgJson.name) {
				return { workspace, name: pkgJson.name };
			}
			return null!;
		}),
	);

	return workspacePackages.filter(Boolean);
};

export const parseTurbo = async (): Promise<MonoRepo> => {
	const pkgJson: IPackageJson = await parsePkgJson(path.join(process.cwd(), 'package.json'));

	const scripts = parseScripts(pkgJson);
	const workspacePackages = await parseWorkspacePackages(pkgJson);

	assertError(scripts.length, 'No turbo scripts found');
	assertError(workspacePackages.length, 'No packages found in workspaces');

	return {
		scripts,
		workspacePackages,
		name: pkgJson.name,
	};
};

export const runTurboCommand = (script: TurboScript, scopedPkgs: string[], options?: TurboSelectOptions): void => {
	const scopes = scopedPkgs.map(pkg => `--scope="${pkg}"`).join(' ');

	const buildCommand = options?.build && script.name !== 'build' ? `turbo run build ${scopes} --include-dependencies --no-deps &&` : '';
	const turboCommand = `${buildCommand} ${script.command} ${scopes} --no-deps`;

	console.log(chalk.blue(`Running ${script.name}`));
	console.log(chalk.blue(turboCommand));

	spawn(turboCommand, {
		stdio: 'inherit',
		shell: true,
		cwd: process.cwd(),
	});
};
