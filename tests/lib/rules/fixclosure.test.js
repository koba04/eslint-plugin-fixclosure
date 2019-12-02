"use strict";

const { RuleTester } = require("eslint");
const rule = require("../../../lib/rules/fixclosure");
const fs = require("fs");
const path = require("path");

const readString = file =>
  fs
    .readFileSync(path.resolve(__dirname, "fixtures", file))
    .toString()
    .replace(/\r\n/g, "\n");

new RuleTester().run("fixclosure", rule, {
  valid: [
    readString("valid/ok.js"),
    {
      code: readString("valid/ok-with-config.js"),
      options: [
        {
          config: ".custom-fixclosurerc"
        }
      ]
    }
  ],
  invalid: [
    {
      code: readString("invalid/missing-require.js"),
      output: readString("invalid/missing-require-fix.js"),
      errors: ["Insert `require('goog.baz');\u000a\u000agoog.`"]
    },
    {
      code: readString("invalid/with-deps.js"),
      output: readString("invalid/with-deps-fix.js"),
      options: [
        {
          depsJs: [path.resolve(__dirname, "fixtures", "deps.js")]
        }
      ],
      errors: ["Insert `require('goog.deps');\u000a\u000agoog.`"]
    }
  ]
});
