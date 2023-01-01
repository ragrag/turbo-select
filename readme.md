# Turbo Select

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

or 

```bash
$ turbo-select <script>
```

## Direct usage with npx
```bash
$ npx turbo-select
```


## Prerequisites

The only prerequisites for Turbo Select to work is to include ```workspaces``` in your workspace root package.json e.g:

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
  },
  "devDependencies": {
    "eslint": "^7.32.0",
  },
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}

```
