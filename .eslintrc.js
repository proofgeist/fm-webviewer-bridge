module.exports = {
  parser: "babel-eslint",
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parserOptions: {
    sourceType: "module"
  },
  plugins: ["prettier"],
  extends: ["eslint:recommended"],
  rules: {
    "prettier/prettier": "error",
    "no-console": 0
  }
};
