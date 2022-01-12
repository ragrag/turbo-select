export declare type TurboSelectOptions = {
    deps?: boolean;
};
export declare type TurboScript = {
    name: string;
    command: string;
};
export declare type TurboPackage = {
    name: string;
    workspace: string;
};
export declare const parseTurbo: () => Promise<{
    scripts: TurboScript[];
    workspacePackages: TurboPackage[];
}>;
export declare const dispatchTurboCommand: (script: TurboScript, scopedPkgs: string[], options?: TurboSelectOptions | undefined) => void;
