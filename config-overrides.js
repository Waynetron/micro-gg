const {override, useBabelRc, addBabelPlugins} = require("customize-cra");

module.exports = override(
  useBabelRc(),
  ...addBabelPlugins(
    "babel-plugin-styled-components"
  )
);