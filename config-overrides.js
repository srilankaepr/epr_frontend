const webpack = require('webpack');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "util": require.resolve("util/"),
        "url": require.resolve("url/"),
        "assert": require.resolve("assert/"),
        "buffer": require.resolve("buffer/"),
        "stream": require.resolve("stream-browserify"),
        "process": require.resolve("process/browser.js"),
        "path": require.resolve("path-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": false,
        "dgram": false,
        "fs": false,
        "net": false,  // මේක false කිරීමෙන් අර 'net' error එක අයින් වෙනවා
        "tls": false,
        "dns": false,
        "tty": false,
        "zlib": false
    });
    
    config.resolve.fallback = fallback;

    // ESM modules වල errors මගහැරීමට
    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
            fullySpecified: false
        }
    });

    // Browser එකේ process සහ Buffer පණගැන්වීමට
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser.js',
            Buffer: ['buffer', 'Buffer']
        })
    ]);

    // Alias එකක් මගින් බලහත්කාරයෙන් net module එක bypass කිරීම
    config.resolve.alias = {
        ...config.resolve.alias,
        "net": false,
        "tls": false,
        "dns": false
    };

    return config;
};