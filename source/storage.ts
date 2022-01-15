// @todo change to esm
const Conf = require('conf');

const config = new Conf();

export default class Storage {
	static saveSelection(monorepoName = 'default', { scriptName, packages }: { scriptName: string; packages: string[] }) {
		config.set(monorepoName, { scriptName, packages });
	}

	static loadSelection(monorepoName = 'default'): { scriptName: string; packages: string[] } {
		return config.get(monorepoName);
	}
}
