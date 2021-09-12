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

Refer to the [type definitions](https://github.com/aki77/typescript-plugin-import-filter/blob/2862e0d2137a4e8ae5f9f9fc49f790819152760d/src/index.ts#L3-L10) for more options.
