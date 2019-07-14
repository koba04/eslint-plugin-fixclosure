"use strict";

const { RuleTester } = require("eslint");
const rule = require("../../../lib/rules/fixclosure");

new RuleTester().run("fixclosure", rule, {
  valid: [
    `
    goog.require('goog.array');
    goog.array.forEach([1,2,3], function(e) { console.log(e) });
    `
  ],
  invalid: [
    {
      code: `
      goog.require('goog.array');
      goog.require('goog.unused');
      goog.array.forEach([1,2,3], function(e) { console.log(e) });
      console.log(goog.math.average(10, 20));
      `,
      // output: ""
      errors: [""]
    }
  ]
});
