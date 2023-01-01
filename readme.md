# Turbo Select

Run Turborepo on selected packages via a nice prompt

<p align="center"><img height="400" src="https://user-images.githubusercontent.com/35541698/210180982-e4af6d5d-df31-4b7a-a715-52e9a4e6b47c.gif"/></p>

## Getting Started

```bash
 npm install -g turbo-select
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
