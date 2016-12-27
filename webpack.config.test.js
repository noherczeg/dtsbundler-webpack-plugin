var path = require('path');
var DtsBundlerPlugin = require('./plugin');

module.exports = {
    entry: ['./test/index.ts'],
    output: {
        path: path.join(__dirname),
        filename: 'test/lib/lib.umd.js',
        library: ['test.lib'],
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'ts-loader?configFileName=tsconfig.test.json' }
        ]
    },
    plugins: [
        new DtsBundlerPlugin({
            out:'./test/lib/lib.d.ts'
        })
    ]
};