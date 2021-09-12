# typescript-plugin-import-filter

Exclude specific modules from auto import in typescript.

## Installation

```
npm install -D typescript-plugin-import-filter
# or yarn add -D typescript-plugin-import-filter
```

Then add this plugin in `tsconfig.json`.

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "typescript-plugin-import-filter",
        "excludes": [
          { "module": "@vue/runtime-com" },
          { "module": "@vue/reactivity" },
          { "module": "timers", "name": "setTimeout" },
        ]
      }
    ]
  }
}
```

Refer to the [type definitions](https://link) for more options.
