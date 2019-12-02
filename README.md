# eslint-plugin-fixclosure
[![](https://github.com/koba04/eslint-plugin-fixclosure/workflows/test/badge.svg)](https://github.com/koba04/eslint-plugin-fixclosure/actions?workflow=test)
[![](https://github.com/koba04/eslint-plugin-fixclosure/workflows/lint/badge.svg)](https://github.com/koba04/eslint-plugin-fixclosure/actions?workflow=lint)

this is a eslint plugin for [fixclosure](https://github.com/teppeis/fixclosure).

## Installation

You'll first need to install [ESLint](http://eslint.org) and [fixclosure](https://github.com/teppeis/fixclosure):

```
$ npm i eslint fixclosure --save-dev
```

Next, install `eslint-plugin-fixclosure`:

```
$ npm install eslint-plugin-fixclosure --save-dev
```

## Usage

Add `fixclosure` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "fixclosure"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "fixclosure/fixclosure": "error"
    }
}
```

## Supported Rules

### fixclosure/fixclosure

A rule to test whether the code is compatible with `fixclosure` or not.

This rule supports `--fix` option, so you no longer write `goog.require(...)` manually :rocket: