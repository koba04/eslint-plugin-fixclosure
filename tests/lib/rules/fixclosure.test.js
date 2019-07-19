"use strict";

const { RuleTester } = require("eslint");
const rule = require("../../../lib/rules/fixclosure");

new RuleTester().run("fixclosure", rule, {
  valid: [
    `goog.provide('goog.bar');

goog.bar.bar1 = function() {
  goog.baz.baz1();
};

goog.bar.bar2 = function() {
  goog.baz.baz2();
};`
  ],
  invalid: [
    {
      code: `goog.provide('goog.bar');

goog.require('goog.baz');

goog.bar.bar1 = function() {
  goog.baz.baz1();
};

goog.bar.bar2 = function() {
  goog.baz.baz2();
};`,
      output: `goog.provide('goog.bar');

goog.bar.bar1 = function() {
  goog.baz.baz1();
};

goog.bar.bar2 = function() {
  goog.baz.baz2();
};`,
      errors: ["Delete `require('goog.baz');\u000a\u000agoog.`"]
    },
    {
      code: `goog.provide('foo.bar');

foo.bar.bar1 = function() {
  foo.bar.baz1();
};

goog.bar.bar2 = function() {
  baz.foo();
};`,
      output: `goog.provide('goog.bar');

foo.bar.bar1 = function() {
  foo.bar.baz1();
};

goog.bar.bar2 = function() {
  baz.foo();
};`,
      errors: ["Replace `foo` with `goog`"]
    }
  ]
});
