# turbo-select

> Run Turborepo on selected packages via a nice prompt

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


## Todo
- better ui for selection (single selection screen for scripts & packages, grouping packages by workspace)
- move cjs imports to esm (currently only conf)
- better readme (demo gif, description)
- tests (github actions matrix for windows & linux with example turborepo)
- support more turbo cli flags
