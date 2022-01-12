import { IPackageJson } from "./interfaces";
export declare const assertError: (value: any, errorMessage: string) => void;
export declare const parsePkgJson: (path: string) => Promise<IPackageJson>;
