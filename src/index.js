#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import inquirer from 'inquirer';
import readPackage from 'to-read-package';
import queryWorkspaces from 'to-query-workspaces';
import upath from 'upath';
import Conf from 'conf';
import { execaCommand } from 'execa';
import { groupBy } from 'lodash-es';
import boxen from 'boxen';
import chalk from 'chalk';
import yaml from 'js-yaml-lite';

const run = async () => {
	console.log(boxen(chalk.red('Turbo Select'), { padding: 1, borderColor: 'blue', borderStyle: 'round', dimBorder: true }));

	const config = new Conf({ projectName: path.resolve() });
	const savedScript = config.get('script');
	const savedPackages = config.get('packages') ?? [];

	const pnpmWorkspaces = await fs
		.readFile('pnpm-workspace.yaml', 'utf8')
		.then(wsp => yaml.load(wsp)?.packages ?? null)
		.catch(() => null);

	const packageJsonWorkspaces = readPackage('package.json')?.workspaces ?? null;

	const workspaces = pnpmWorkspaces ?? packageJsonWorkspaces;

	if (!workspaces?.length) {
		throw new Error(
			chalk.red('No workspaces found, make sure you have paths defined in package.json workspaces field (npm/yarn) or pnpm-workspace.yaml (pnpm)'),
		);
	}

	const packages = workspaces.flatMap(workspace => queryWorkspaces([workspace]).map(pkg => ({ packageDir: pkg, workspace })));

	if (!packages.length) {
		throw new Error(
			chalk.red('No packages found, make sure you have paths defined in package.json workspaces field (npm/yarn) or pnpm-workspace.yaml (pnpm)'),
		);
	}

	let script = process.argv[2];

	if (!script) {
		const turboJson = readPackage('turbo.json');
		const turboScripts = Object.keys(turboJson?.pipeline ?? {});

		if (!turboScripts.length || !turboJson) {
			throw new Error(chalk.red('No script provided in turbo.json found'));
		}

		const { selectedScript } = await inquirer.prompt([
			{
				type: 'list',
				message: 'Select Script',
				name: 'selectedScript',
				default: savedScript,
				pageSize: 8,
				choices: turboScripts,
			},
		]);

		script = selectedScript;
	}

	const packegesInScope = packages
		.map(({ packageDir, workspace }) => {
			const pkgJson = readPackage(upath.join(packageDir, 'package.json'));
			const hasSelectedScript = !!pkgJson?.scripts?.[script];
			if (!hasSelectedScript) {
				return null;
			}

			const name = pkgJson?.name ?? folderName ?? packageDir;
			const value = pkgJson?.name ?? packageDir; // actual value used in filter e.g --filter=<value>
			const checked = savedPackages.includes(name);

			return { name, workspace, checked, value };
		})
		.filter(Boolean);

	if (!packegesInScope.length) {
		throw new Error(chalk.red(`No package found having the provided script ${script}`));
	}

	const packagesByWorkspace = groupBy(packegesInScope, 'workspace');

	const { selectedPackages } = await inquirer.prompt([
		{
			type: 'checkbox',
			message: 'Select Projects',
			name: 'selectedPackages',
			pageSize: 20,
			choices: [
				...Object.entries(packagesByWorkspace).flatMap(([workspace, workspacePackages]) => {
					return [new inquirer.Separator(workspace), ...workspacePackages];
				}),
			],
			validate(selections) {
				if (selections.length < 1) {
					return 'You must choose at least one project.';
				}

				return true;
			},
		},
	]);

	config.set('script', script);
	config.set('packages', selectedPackages);

	const turboCommand =
		`turbo run ${script} ` +
		selectedPackages.reduce((prev, cur) => {
			return `${prev}--filter=${cur} `;
		}, '');

	console.log(chalk.blue('Running:', turboCommand));
	execaCommand(turboCommand, { stdio: 'inherit' });
};

run();
