import React, { FC, useEffect, useState, useMemo } from 'react';
import { Text, Box, Spacer } from 'ink';
import MultiSelect, { ListedItem, SelectedItem } from 'ink-multi-select';
import SelectInput from 'ink-select-input';
import Gradient from 'ink-gradient';
import chalk from 'chalk';

import { runTurboCommand } from './lib';
import { TurboSelectOptions, TurboScript, MonoRepo } from './types';
import Storage from './storage';

type Props = {
	options: TurboSelectOptions;
	savedSelection: { scriptName: string; packages: string[] };
	monorepo: MonoRepo;
};

const App: FC<Props> = ({ options, savedSelection, monorepo }) => {
	const [cliStep, setCliStep] = useState(0);

	const [selectedScript, setSelectedScript] = useState<TurboScript | undefined>(undefined);
	const [selectedPackages, setSelectedPackages] = useState<string[]>([]);

	const [initialSelection, setInitialSelection] = useState<{ script: number; packages: SelectedItem[] }>({
		script: 0,
		packages: [],
	});

	// load previous selections
	useEffect(() => {
		const { scripts, workspacePackages } = monorepo;

		const initialSelection: { script: number; packages: SelectedItem[] } = { script: 0, packages: [] };

		if (savedSelection?.scriptName) {
			const scriptIdx = scripts.findIndex(s => s.name === savedSelection.scriptName);
			initialSelection.script = scriptIdx >= 0 ? scriptIdx : 0;
		}

		if (savedSelection?.packages?.length) {
			const matchedPackages = workspacePackages
				.filter(pkg => savedSelection.packages.includes(pkg.name))
				.map(p => ({
					label: `[${p.workspace}] - ${p.name}`,
					value: p.name,
					key: `${p.workspace}.${p.name}`,
				}));

			initialSelection.packages = matchedPackages;
		}

		setInitialSelection(initialSelection);
		setCliStep(1);
	}, []);

	// options.script check
	useEffect(() => {
		const { script } = options;
		if (script) {
			const monorepoScript = monorepo.scripts.find(s => s.name === script);
			if (!monorepoScript) {
				console.log(chalk.yellow(`did not recognize '${script}' as a turbo script`));
				return;
			}
			setSelectedScript(monorepoScript);
		}
	}, []);

	useEffect(() => {
		if (selectedScript) {
			setCliStep(2);
		}
	}, [selectedScript]);

	// run turbo
	useEffect(() => {
		if (selectedScript && selectedPackages.length) {
			setCliStep(3);
			Storage.saveSelection(monorepo.name, { scriptName: selectedScript.name, packages: selectedPackages });
			runTurboCommand(selectedScript, selectedPackages, options);
		}
	}, [selectedPackages]);

	const scriptOptions = useMemo(() => {
		return monorepo.scripts.map(p => ({
			label: p.name,
			value: p,
			key: p.name,
		}));
	}, [monorepo.scripts]);

	const packageOptions = useMemo(() => {
		return monorepo.workspacePackages.map(p => ({
			label: `[${p.workspace}] - ${p.name}`,
			value: p.name,
			key: `${p.workspace}.${p.name}`,
		}));
	}, [monorepo.workspacePackages]);

	const onScriptSelected = (selected: { label: string; value: TurboScript }) => {
		setSelectedScript(selected.value);
	};

	const onPackagesSelected = (selected: ListedItem[]) => {
		setSelectedPackages(selected.map(p => p.value as string));
	};

	return (
		<>
			<Box borderStyle="round" alignItems="center" flexDirection="column" borderColor="#6f2832" padding={1} width={30}>
				<Gradient name="passion">Turbo Select </Gradient>
			</Box>
			{cliStep === 1 ? (
				<>
					<Text>Select Script:</Text>
					<SelectInput items={scriptOptions} initialIndex={initialSelection.script} onSelect={onScriptSelected} />
				</>
			) : cliStep === 2 ? (
				<>
					<Text>Select Packages:</Text>
					<MultiSelect items={packageOptions} defaultSelected={initialSelection.packages} onSubmit={onPackagesSelected} />
				</>
			) : (
				<Spacer />
			)}
		</>
	);
};

module.exports = App;
export default App;
