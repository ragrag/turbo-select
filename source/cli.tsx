#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import meow from 'meow';

import App from './ui';
import { loadSelection } from './storage';
import { parseTurbo } from './lib';

const initializeTurboSelect = async () => {
	const cli = meow(
		`
		Usage
		  $ turbo-select
	
		Options
			--no-deps exclude dependencies
	
		Examples
		  $ turbo-select 
	`,
		{
			flags: {
				deps: {
					type: 'boolean',
					default: true,
				},
			},
		},
	);

	const monorepo = await parseTurbo();
	const savedSelection = loadSelection(monorepo.name);

	render(<App options={{ ...cli.flags }} savedSelection={savedSelection} monorepo={monorepo} />);
};

initializeTurboSelect();
