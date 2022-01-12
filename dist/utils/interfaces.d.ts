export declare type IPackageJson = Record<string, any> & {
    name: string;
    scripts: Record<string, string>;
    workspaces: string[];
};
