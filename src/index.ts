import ts from 'typescript/lib/tsserverlibrary';

type ExcludeOption = {
  module: string
  name?: string
}

type PluginConfigOptions = {
  excludes: readonly ExcludeOption[]
}

const IMPORT_MATCH = /import (?:\{\s*)?(\w+)(?:\s*\})? from ['"]([^'"]+)['"]/;

const isExcludeImport = (imp: string, excludes: readonly ExcludeOption[]): boolean => {
  const matches = imp.match(IMPORT_MATCH);
  if (!matches) return false;
  const [, name, module] = matches;

  return isExcludeModule({ excludes, name, module })
}

const isExcludeModule = ({ excludes, module, name }: { excludes: readonly ExcludeOption[], module: string, name: string }): boolean => {
  return excludes.some((exclude) => {
    return module.startsWith(exclude.module) && (!exclude.name || exclude.name === name)
  })
}

function init() {
  function create(info: ts.server.PluginCreateInfo) {
    const log = (...params: unknown[]) => {
      const text = params.map((p) => (p ? JSON.stringify(p) : p)).join(' ');
      info.project.projectService.logger.info(`[import-filter] ${text}`);
    };

    log('Start init');
    const config = info.config as PluginConfigOptions;
    log('config', { config });

    const getCompletionsAtPosition = info.languageService.getCompletionsAtPosition;
    info.languageService.getCompletionsAtPosition = (fileName, position, options) => {
      log('getCompletionsAtPosition', { fileName, position, options });
      const original = getCompletionsAtPosition(fileName, position, options);
      log('getCompletionsAtPosition', { original });
      if (!original) return original;

      const entries = original.entries.filter((entry) => {
        if (!entry.data?.moduleSpecifier || !entry.data.exportName) return true

        return !isExcludeModule({ excludes: config.excludes, name: entry.data.exportName, module: entry.data.moduleSpecifier  })
      });
      original.entries = entries;
      return original;
    };

    const getCodeFixesAtPosition = info.languageService.getCodeFixesAtPosition;
    info.languageService.getCodeFixesAtPosition = (fileName, start, end, errorCodes, formatOptions, preferences) => {
      log('getCodeFixesAtPosition', { fileName, start, end, errorCodes, formatOptions, preferences });
      const original = getCodeFixesAtPosition(fileName, start, end, errorCodes, formatOptions, preferences);

      const prog = info.languageService.getProgram();
      if (prog === undefined) {
        return original;
      }

      log('getCodeFixesAtPosition', { original });
      const filtered = original.filter((fix) => {
        if (fix.fixName !== 'import') return true;

        const imports = fix.changes.
          flatMap((change) => change.textChanges.map((textChange) => textChange.newText)).
          filter((text) => text.startsWith('import '))

        return imports.every((imp) => {
          return !isExcludeImport(imp, config.excludes)
        })
      })
      log('getCodeFixesAtPosition', { filtered });

      return filtered;
    };
  }

  return { create };
}

export = init;
