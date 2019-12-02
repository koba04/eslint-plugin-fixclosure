goog.provide('app.bar');

goog.require('app.baz');

app.bar.bar1 = function() {
  app.baz.baz1();
};

app.bar.bar2 = function() {
  app.baz.baz2();
};
