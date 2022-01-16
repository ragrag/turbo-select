# turbo-select

Run Turborepo on selected packages via a nice prompt

<p align="center"><img height="400" src="/assets/terminal-demo.gif?raw=true"/></p>

## Getting Started

```bash
$ npm install -g turbo-select
```

And then in the root of your turbo repo

```bash
$ turbo-select
```

## Direct usage with npx
```bash
$ npx turbo-select@latest
```


## CLI Flags
| flag                   | description                                                                                         |
|------------------------|-----------------------------------------------------------------------------------------------------|
| --script=<script name> | specify which npm script to run (skips script selection)                                            | 
| --no-deps              | by default turbo-select adds --include-dependencies. this flag will stop turbo-select from using it |


	
