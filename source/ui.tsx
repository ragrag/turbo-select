import React, { FC, useEffect, useState, useMemo } from 'react';
import { Text } from 'ink';
import MultiSelect, { ListedItem, SelectedItem } from 'ink-multi-select';
import SelectInput from 'ink-select-input';

import { runTurboCommand } from './lib';
import { TurboSelectOptions, TurboScript, MonoRepo } from './types';
import { saveSelection } from './storage';

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

	// set initial selections from previously saved selections
	useEffect(() => {
		const loadPreviousSelections = () => {
			const { scripts, workspacePackages } = monorepo;
			const initialSelection: { script: number; packages: SelectedItem[] } = { script: 0, packages: [] };

			if (savedSelection?.scriptName) {
				const scriptIdx = scripts.findIndex(s => s.name === savedSelection.scriptName);
				initialSelection.script = scriptIdx >= 0 ? scriptIdx : 0;
			}

			if (savedSelection?.packages?.length) {
				const matchedPackages = workspacePackages.filter(pkg => savedSelection.packages.includes(pkg.name));
				initialSelection.packages = matchedPackages.map(p => ({
					label: `[${p.workspace}] - ${p.name}`,
					value: p.name,
					key: `${p.workspace}.${p.name}`,
				}));
			}

			setInitialSelection(initialSelection);
		};

		loadPreviousSelections();
		setCliStep(1);
	}, []);

	// run turbo
	useEffect(() => {
		if (selectedScript && selectedPackages.length) {
			setCliStep(3);
			saveSelection(monorepo.name, { scriptName: selectedScript.name, packages: selectedPackages });
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
		setCliStep(2);
	};

	const onPackagesSelected = (selected: ListedItem[]) => {
		setSelectedPackages(selected.map(p => p.value as string));
	};

	return (
		<>
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
				<Text>Running {selectedScript?.name} in Turbo</Text>
			)}
		</>
	);
};

module.exports = App;
export default App;
