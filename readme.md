# Turbo Select

Run Turborepo scripts on selected packages via a nice prompt

<p align="center"><img height="400" src="https://user-images.githubusercontent.com/35541698/210186167-31efdba7-24cd-4c4b-90b7-7bc63b324627.gif"/></p>


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
