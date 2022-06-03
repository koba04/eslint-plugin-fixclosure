"use strict";

const { RuleTester } = require("eslint");
const rule = require("../../../lib/rules/fixclosure");
const fs = require("fs");
const path = require("path");

const readString = (file) =>
  fs
    .readFileSync(path.resolve(__dirname, "fixtures", file))
    .toString()
    .replace(/\r\n/g, "\n");

new RuleTester().run("fixclosure", rule, {
  valid: [
    {
      code: readString("valid/ok.js"),
      name: "ok.js",
    },
    {
      code: readString("valid/ok-with-line-feed.js"),
      name: "ok-with-line-feed.js",
    },
    {
      code: readString("valid/ok-with-provide-roots.js"),
      options: [
        {
          provideRoots: ["app"],
        },
      ],
      name: "ok-with-provide-roots.js",
    },
    {
      code: readString("valid/ok-with-config.js"),
      options: [
        {
          config: ".custom-fixclosurerc",
        },
      ],
      name: "ok-with-config.js",
    },
  ],
  invalid: [
    {
      code: readString("invalid/missing-require.js"),
      output: readString("invalid/missing-require-fix.js"),
      errors: ["Insert `require('goog.baz');\u000a\u000agoog.`"],
      name: "invalid/missing-require.js",
    },
    {
      code: readString("invalid/with-deps.js"),
      output: readString("invalid/with-deps-fix.js"),
      options: [
        {
          depsJs: [path.resolve(__dirname, "fixtures", "deps.js")],
        },
      ],
      errors: ["Insert `require('goog.deps');\u000a\u000agoog.`"],
      name: "invalid/with-deps.js",
    },
    {
      code: readString("invalid/missing-require-type.js"),
      output: readString("invalid/missing-require-type-fix.js"),
      errors: ["Insert `goog.requireType('goog.baz.Bar');\n\n`"],
      name: "invalid/missing-require-type.js",
    },
    {
      code: readString("invalid/missing-require-type.js"),
      output: readString(
        "invalid/missing-require-type-fix-with-forward-declare.js"
      ),
      options: [
        {
          useForwardDeclare: true,
        },
      ],
      errors: ["Insert `goog.forwardDeclare('goog.baz.Bar');\n\n`"],
      name: "invalid/missing-require-type.js",
    },
  ],
});
