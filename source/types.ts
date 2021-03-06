export type MonoRepo = {
	scripts: TurboScript[];
	workspacePackages: TurboPackage[];
	name: string | undefined;
};

export type TurboSelectOptions = {
	build?: boolean;
	script?: string;
};

export type TurboScript = {
	name: string;
	command: string;
};

export type TurboPackage = {
	name: string;
	workspace: string;
};

export type IPackageJson = Record<string, any> & {
	name?: string;
	scripts?: Record<string, string>;
	workspaces?: string[];
};
