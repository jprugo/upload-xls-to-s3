/*config = Encore.getWebpackConfig();
config.node = {
    fs: 'empty',
    target: 'node',
}
module.exports = config;*/

module.exports = {
    target: 'node',
    entry: './app/app.jsx',
    fs: 'empty',
    /*output: {
        path : './app',
        filename: 'bundle.js',
    },
    cache : true,
    watch : true,
    devtool: "eval",
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                loader: 'jsx-loader?harmony'
            }
        ]
    },
    resolve : {
        extensions : ['', '.js', '.jsx']
    }*/
};