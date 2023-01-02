#!/usr/bin/env node
import inquirer from 'inquirer';
import readPackage from 'to-read-package';
import queryWorkspaces from 'to-query-workspaces';
import upath from 'upath';
import Conf from 'conf';
import { execaCommand } from 'execa';
import { groupBy } from 'lodash-es';
import boxen from 'boxen';
import chalk from 'chalk';

const run = async () => {
	console.log(boxen(chalk.red('Turbo Select'), { padding: 1, borderColor: 'blue', borderStyle: 'round', dimBorder: true }));
	const config = new Conf({ projectName: 'turbo-select' });
	const { script: savedScript = null, projects: savedProjects = [] } = config.get('default');

	const projects = queryWorkspaces([]);

	if (!projects.length) {
		throw new Error('No projects found, make sure you have a package.json with a workspaces field');
	}

	let script = process.argv[2];

	if (!script) {
		const turboJson = readPackage('turbo.json');
		const turboScripts = Object.keys(turboJson?.pipeline ?? {});

		if (!turboScripts.length || !turboJson) {
			throw new Error('No script provided in turbo.json found');
		}

		const { selectedScript } = await inquirer.prompt([
			{
				type: 'list',
				message: 'Select Script',
				name: 'selectedScript',
				default: savedScript,
				pageSize: 10,
				choices: turboScripts,
			},
		]);

		script = selectedScript;
		config.set('default', { script, projects: savedProjects });
	}

	const projectsInScope = projects
		.map(project => {
			const pkgJson = readPackage(upath.join(project, 'package.json'));
			return { scripts: pkgJson?.scripts ?? {}, name: pkgJson?.name ?? '', directory: project };
		})
		.filter(project => !!project.name && project.scripts[script]);

	if (!projectsInScope.length) {
		throw new Error(`No project found having the provided script ${script}`);
	}

	const choices = projectsInScope.map(project => {
		const directorySplit = project.directory.split('/');
		const folderName = directorySplit[directorySplit.length - 1];
		const workspace = directorySplit[0];

		return { name: project.name, workspace, checked: savedProjects.includes(project.name), value: project.name };
	});

	const projectsByWorkspace = groupBy(choices, 'workspace');

	const { selectedProjects } = await inquirer.prompt([
		{
			type: 'checkbox',
			message: 'Select Projects',
			name: 'selectedProjects',
			pageSize: 20,
			choices: [
				...Object.entries(projectsByWorkspace).flatMap(([workspace, workspaceProjects]) => {
					return [new inquirer.Separator(workspace), ...workspaceProjects];
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

	config.set('default', { script, projects: selectedProjects });

	const turboCommand =
		`turbo run ${script} ` +
		selectedProjects.reduce((prev, cur) => {
			return `${prev}--filter=${cur} `;
		}, '');

	console.log(chalk.blue('Running:', turboCommand));
	execaCommand(turboCommand, { stdio: 'inherit' });
};

run();
