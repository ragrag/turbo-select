import React, { FC, useEffect, useState, useMemo } from 'react';
import Spinner from 'ink-spinner';
import { Text } from 'ink';
import MultiSelect, { ListedItem } from 'ink-multi-select';
import SelectInput from 'ink-select-input';

import { TurboSelectOptions, dispatchTurboCommand, parseTurbo, TurboPackage, TurboScript } from './lib';

const App: FC<{ options?: TurboSelectOptions }> = ({ options }) => {
	const [loading, setLoading] = useState(true);
	const [cliStep, setCliStep] = useState(1);

	const [turboScripts, setTurboScripts] = useState<TurboScript[]>([]);
	const [workspacePackages, setWorkspacePackages] = useState<TurboPackage[]>([]);

	const [selectedScript, setSelectedScript] = useState<TurboScript | null>(null);
	const [selectedPackages, setSelectedPackages] = useState<string[]>([]);

	// init
	useEffect(() => {
		const initializeTurboSelect = async () => {
			const { scripts, workspacePackages } = await parseTurbo();

			setTurboScripts(scripts);
			setWorkspacePackages(workspacePackages);

			setLoading(false);
		};

		initializeTurboSelect();
	}, []);

	// dispatch cli command
	useEffect(() => {
		const dispatchCommand = () => {
			if (selectedScript && selectedPackages.length) {
				setCliStep(3);
				dispatchTurboCommand(selectedScript, selectedPackages, options);
			}
		};

		dispatchCommand();
	}, [selectedPackages]);

	const scriptOptions = useMemo(() => {
		return turboScripts.map(p => ({
			label: p.name,
			value: p,
			key: p.name,
		}));
	}, [turboScripts]);

	const packageOptions = useMemo(() => {
		return workspacePackages.map(p => ({
			label: `[${p.workspace}] - ${p.name}`,
			value: p.name,
			key: `${p.workspace}.${p.name}`,
		}));
	}, [workspacePackages]);

	const onScriptSelected = (selected: { label: string; value: TurboScript }) => {
		setSelectedScript(selected.value);
		setCliStep(2);
	};

	const onPackagesSelected = (selected: ListedItem[]) => {
		setSelectedPackages(selected.map(p => p.value as string));
	};

	return loading ? (
		<Text>
			<Text color="blue">
				<Spinner type="dots" />
			</Text>
			{' Loading'}
		</Text>
	) : (
		<>
			{cliStep === 1 ? (
				<>
					<Text>Select Script:</Text>
					<SelectInput items={scriptOptions} onSelect={onScriptSelected} />
				</>
			) : cliStep === 2 ? (
				<>
					<Text>Select Packages:</Text>
					<MultiSelect items={packageOptions} onSubmit={onPackagesSelected} />
				</>
			) : (
				<Text>Running Turbo</Text>
			)}
		</>
	);
};

module.exports = App;
export default App;
