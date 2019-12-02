const { generateDifferences } = require("prettier-linter-helpers");
const { Parser, getFixedSource, resolveConfig } = require("fixclosure");
const closureDeps = require("google-closure-deps");
const flat = require("array.prototype.flat");

// reportInsert & reportDelete & reportReplace are taken from eslint-plugin-prettier
function reportInsert(context, offset, text) {
  const pos = context.getSourceCode().getLocFromIndex(offset);
  const range = [offset, offset];
  context.report({
    message: "Insert `{{ code }}`",
    data: { code: text },
    loc: { start: pos, end: pos },
    fix(fixer) {
      return fixer.insertTextAfterRange(range, text);
    }
  });
}

function reportDelete(context, offset, text) {
  const start = context.getSourceCode().getLocFromIndex(offset);
  const end = context.getSourceCode().getLocFromIndex(offset + text.length);
  const range = [offset, offset + text.length];
  context.report({
    message: "Delete `{{ code }}`",
    data: { code: text },
    loc: { start, end },
    fix(fixer) {
      return fixer.removeRange(range);
    }
  });
}

function reportReplace(context, offset, deleteText, insertText) {
  const start = context.getSourceCode().getLocFromIndex(offset);
  const end = context
    .getSourceCode()
    .getLocFromIndex(offset + deleteText.length);
  const range = [offset, offset + deleteText.length];
  context.report({
    message: "Replace `{{ deleteCode }}` with `{{ insertCode }}`",
    data: {
      deleteCode: deleteText,
      insertCode: insertText
    },
    loc: { start, end },
    fix(fixer) {
      return fixer.replaceTextRange(range, insertText);
    }
  });
}

module.exports = {
  meta: {
    docs: {
      description: "A rule to apply fixclosure.",
      category: "Possible Errors",
      recommended: false,
      url: "https://github.com/koba04/eslint-plugin-fixclosure#supported-rules"
    },
    fixable: "code",
    messages: {
      disallowExample: "Insert goog.require('goog.array');."
    },
    schema: [
      {
        type: "object",
        properties: {
          depsJs: {
            type: "array"
          }
        },
        optional: true
      }
    ],
    type: "problem"
  },

  create(context) {
    return {
      Program(node) {
        const program = context.getSourceCode();
        const source = program.getText();
        // console.log("before", source);
        const options = resolveConfig({});

        let deps = [];
        if (context.options) {
          if (Array.isArray(context.options)) {
            if (context.options.length > 0) {
              deps = context.options[0].depsJs;
            }
          } else {
            deps = context.options.depsJs;
          }
        }

        const results = deps.map(file => closureDeps.parser.parseFile(file));
        const symbols = flat(
          results.map(result =>
            result.dependencies.map(dep => dep.closureSymbols)
          ),
          Infinity
        );

        const fixclosure = new Parser({
          ...options,
          providedNamespace: options.providedNamespace.concat(symbols)
        });
        const result = fixclosure.parseAst(node, program.ast.comments);
        const fixclosuredSource = getFixedSource(source, result);

        // console.log(result);
        // console.log("|fix|", fixclosuredSource);

        const differences = generateDifferences(source, fixclosuredSource);
        const { INSERT, DELETE, REPLACE } = generateDifferences;

        differences.forEach(difference => {
          switch (difference.operation) {
            case INSERT:
              reportInsert(context, difference.offset, difference.insertText);
              break;
            case DELETE:
              reportDelete(context, difference.offset, difference.deleteText);
              break;
            case REPLACE:
              reportReplace(
                context,
                difference.offset,
                difference.deleteText,
                difference.insertText
              );
              break;
          }
        });
      }
    };
  }
};
