// c.f. https://rollup.docschina.org/guide/en/#renderdynamicimport
function keepImport({ moduleNames }) {
  return {
    name: 'keep-import',
    resolveDynamicImport(specifier) {
      if (moduleNames.includes(specifier)) return false;
      return null;
    },
    renderDynamicImport({ targetModuleId }) {
      if (moduleNames.includes(targetModuleId)) {
        return {
          left: 'import(',
          right: ')',
        };
      }
    },
  };
}

exports.keepImport = keepImport;
