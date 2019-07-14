module.exports = {
  meta: {
    docs: {
      description: "",
      category: "",
      recommended: false,
      url: ""
    },
    // fixable: "code",
    messages: {
      disallowExample: "found missing or unused goog.require."
    },
    schema: [],
    type: "problem"
  },

  create(context) {
    return {
      Program(node) {
        // run fixclosure
      }
    };
  }
};
