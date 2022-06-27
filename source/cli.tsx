#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import meow from 'meow';

import App from './ui';
import Storage from './storage';
import { parseTurbo } from './lib';

const initializeTurboSelect = async () => {
	const cli = meow(
		`
		Usage
		  $ turbo-select
	
		Options
			--no-deps dont use turbo repo --include-dependencies flag
			--script specify which npm script to run
	
		Examples
		  $ turbo-select 
	`,
		{
			flags: {
				script: {
					type: 'string',
					default: '',
				},
			},
		},
	);

	const monorepo = await parseTurbo();
	const savedSelection = Storage.loadSelection(monorepo.name);

	render(<App options={{ ...cli.flags }} savedSelection={savedSelection} monorepo={monorepo} />);
};

initializeTurboSelect();
