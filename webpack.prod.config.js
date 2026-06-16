const { createConfig } = require('@openedx/frontend-build');
const stripWutiskillParagonTheme = require('../webpack.wutiskill-theme');

const config = createConfig('webpack-prod');

stripWutiskillParagonTheme(config);

config.module.rules[0].exclude = /node_modules\/(?!(fastest-levenshtein|@edx))/;

module.exports = config;
