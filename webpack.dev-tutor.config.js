const { createConfig } = require('@openedx/frontend-build');
const ParagonWebpackPlugin = require('@openedx/frontend-build/lib/plugins/paragon-webpack-plugin/ParagonWebpackPlugin');
const webpack = require('webpack');

const config = createConfig('webpack-dev');

// ---------------------------------------------------------------------------
// Strip Paragon CSS from the build (tutor dev mode).
// ---------------------------------------------------------------------------

// 1. Remove Paragon entrypoints
Object.keys(config.entry).forEach((key) => {
    if (key.startsWith('paragon.theme') || key.startsWith('brand.theme')) {
        delete config.entry[key];
    }
});

// 2. Remove ParagonWebpackPlugin
config.plugins = config.plugins.filter(
    (plugin) => !(plugin instanceof ParagonWebpackPlugin),
);

// 3. Stub PARAGON_THEME global
config.plugins.push(
    new webpack.DefinePlugin({
        PARAGON_THEME: JSON.stringify({}),
    }),
);

// 4. Remove Paragon-specific cache groups
if (config.optimization?.splitChunks?.cacheGroups) {
    Object.keys(config.optimization.splitChunks.cacheGroups).forEach((key) => {
        if (key.startsWith('paragon') || key.startsWith('brand')) {
            delete config.optimization.splitChunks.cacheGroups[key];
        }
    });
}

// 5. Remove Paragon-specific CSS extraction rule
if (config.module?.rules) {
    config.module.rules = config.module.rules.map((rule) => {
        if (rule.oneOf) {
            return {
                ...rule,
                oneOf: rule.oneOf.filter((oneOfRule) => {
                    const resourceStr = oneOfRule.resource?.toString() || '';
                    return !resourceStr.includes('paragon') && !resourceStr.includes('brand');
                }),
            };
        }
        return rule;
    });
}

module.exports = config;
