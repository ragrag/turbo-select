const Conf = require('conf');

const config = new Conf();

export const saveSelection = (monorepoName = 'default', { scriptName, packages }: { scriptName: string; packages: string[] }) => {
	config.set(monorepoName, { scriptName, packages });
};

export const loadSelection = (monorepoName = 'default'): { scriptName: string; packages: string[] } => {
	return config.get(monorepoName);
};
