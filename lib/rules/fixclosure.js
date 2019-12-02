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
          },
          config: {
            type: "string"
          },
          provideRoots: {
            type: "array"
          },
          useForwardDeclare: {
            type: "boolean"
          }
        },
        optional: true
      }
    ],
    type: "problem"
  },

  create(context) {
    let deps = [];
    let provideRoots;
    let useForwardDeclare = false;
    if (context.options.length > 0) {
      if (context.options[0].depsJs) {
        deps = context.options[0].depsJs;
      }
      if (context.options[0].provideRoots) {
        provideRoots = context.options[0].provideRoots;
      }
      if (context.options[0].useForwardDeclare) {
        useForwardDeclare = context.options[0].useForwardDeclare;
      }
    }
    let options;
    if (context.options[0] && context.options[0].config) {
      options = resolveConfig({ config: context.options[0].config });
    } else {
      options = resolveConfig({});
    }

    const results = deps.map(file => closureDeps.parser.parseFile(file));
    const symbols = flat(
      results.map(result => result.dependencies.map(dep => dep.closureSymbols)),
      Infinity
    );

    return {
      Program(node) {
        const program = context.getSourceCode();
        const source = program.getText();
        // console.log("before", source);
        const fixclosure = new Parser({
          ...options,
          providedNamespace: options.providedNamespace.concat(symbols),
          provideRoots: provideRoots || options.provideRoots
        });
        const result = fixclosure.parseAst(node, program.ast.comments);
        if (useForwardDeclare) {
          result.toForwardDeclare = result.toRequireType;
          result.toRequireType = [];
        }
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
