#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './ui';

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

render(<App options={{ ...cli.flags }} />);
