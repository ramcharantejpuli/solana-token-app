const webpack = require('webpack');

module.exports = {
    webpack: {
        configure: {
            resolve: {
                fallback: {
                    "url": require.resolve("url/"),
                    "assert": require.resolve("assert/"),
                    "stream": require.resolve("stream-browserify"),
                    "http": require.resolve("stream-http"),
                    "https": require.resolve("https-browserify"),
                    "os": require.resolve("os-browserify/browser"),
                    "crypto": require.resolve("crypto-browserify"),
                    "buffer": require.resolve("buffer/"),
                    "zlib": require.resolve("browserify-zlib"),
                }
            },
            plugins: [
                new webpack.ProvidePlugin({
                    process: 'process/browser',
                    Buffer: ['buffer', 'Buffer'],
                }),
            ],
        },
    },
};
