goog.provide('goog.bar');

goog.require('app.baz');

goog.bar.bar1 = function() {
  app.baz.baz1();
};

goog.bar.bar2 = function() {
  app.baz.baz2();
};
