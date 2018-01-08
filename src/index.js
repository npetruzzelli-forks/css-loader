/* eslint-disable
import/first,
import/order,
no-shadow,
no-param-reassign
*/
import schema from './options.json';
import { getOptions } from 'loader-utils';
import validateOptions from 'schema-utils';

import postcss from 'postcss';
// TODO(michael-ciniawsky)
// replace with postcss-icss-{url, import}
import urls from './plugins/url';
import imports from './plugins/import';

// import runtime from './runtime';
import SyntaxError from './Error';

// Loader Defaults
const DEFAULTS = {
  url: true,
  import: true,
  sourceMap: false,
};

export default function loader(css, map, meta) {
  // Loader Mode (Async)
  const cb = this.async();
  const file = this.resourcePath;
<<<<<<< HEAD

=======
  
>>>>>>> feat(plugins/import): add `@import` filter support (`options.import`) (#656)
  // Loader Options
  const options = Object.assign({}, DEFAULTS, getOptions(this));

  validateOptions(schema, options, 'CSS Loader');

  if (options.sourceMap) {
    if (map && typeof map !== 'string') {
      map = JSON.stringify(map);
    }
  } else {
    map = false;
  }

  const plugins = [];

  // URL Plugin
  if (options.url) {
    plugins.push(urls(options));
  }

  // Import Plugin
  if (options.import) {
    plugins.push(imports(options));
  }

  if (meta) {
    const { ast } = meta;
    // Reuse CSS AST (PostCSS AST e.g 'postcss-loader')
    // to avoid reparsing the CSS
    if (ast && ast.type === 'postcss') {
      css = ast.root;
    }
  }

  map = options.sourceMap
    ? {
        prev: map || false,
        inline: false,
        annotation: false,
        sourcesContent: true,
      }
    : false;

  return postcss(plugins)
    .process(css, {
      from: `/css-loader!${file}`,
      map,
      to: file,
    })
    .then(({ root, css, map, messages }) => {
      if (meta && meta.messages) {
        messages = messages.concat(meta.messages);
      }

      // CSS Imports
      let imports = messages
        .filter((msg) => (msg.type === 'import' ? msg : false))
        .reduce((imports, msg) => {
          try {
            msg = typeof msg.import === 'function' ? msg.import() : msg.import;

            imports += msg;
          } catch (err) {
            // TODO(michael-ciniawsky)
            // revisit (CSSImportsError)
            this.emitError(err);
          }

          return imports;
        }, '');

      // CSS Exports
      let exports = messages
        .filter((msg) => (msg.type === 'export' ? msg : false))
        .reduce((exports, msg) => {
          try {
            msg = typeof msg.export === 'function' ? msg.export() : msg.export;

            exports += msg;
          } catch (err) {
            // TODO(michael-ciniawsky)
            // revisit (CSSExportsError)
            this.emitError(err);
          }

          return exports;
        }, '');
      
      imports = imports ? `// CSS Imports\n${imports}\n` : false
      exports = exports ? `// CSS Exports\n${exports}\n` : false
      css = `// CSS\nexport default \`${css}\``

      imports = imports ? `// CSS Imports\n${imports}\n` : false;
      exports = exports ? `// CSS Exports\n${exports}\n` : false;
      css = `// CSS\nexport default \`${css}\``;

      // TODO(michael-ciniawsky)
      // triage if and add CSS runtime back
<<<<<<< HEAD
      const result = [imports, exports, css].filter(Boolean).join('\n');

=======
      const result = [
        imports,
        exports,
        css
      ]
        .filter(Boolean)
        .join('\n');
      
>>>>>>> feat(plugins/import): add `@import` filter support (`options.import`) (#656)
      cb(null, result, map ? map.toJSON() : null);

      return null;
    })
    .catch((err) => {
      err = err.name === 'CssSyntaxError' ? new SyntaxError(err) : err;

      cb(err);

      return null;
    });
}