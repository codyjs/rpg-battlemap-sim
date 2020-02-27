const path = require('path');
const webpack = require('webpack');

module.exports = function(env) {
    const appTarget = env.APP_TARGET || 'dev';
    return {
        context: __dirname,
        entry: './src/app/index.tsx',
        devtool: 'inline-source-map',
        devServer: {
            contentBase: ['./src/server/public'],
            proxy: {
                '/api': 'http://localhost:3000'
            }
        },
        resolve: {
            extensions: ['.jsx', '.js', '.ts', '.tsx']
        },
        mode: 'development',
        output: {
            path: path.resolve(__dirname, './src/server/public/dist')
        },
        plugins: [
            new webpack.NormalModuleReplacementPlugin(/(.*)-APP_TARGET(\.*)/, function(resource) {
                resource.request = resource.request.replace(/-APP_TARGET/, `-${appTarget}`);
            })
        ],
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                }, {
                    test: /\.jsx$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                    loader: 'babel-loader',
                        options: {
                            presets: [['@babel/preset-react', { pragma: 'createElement' }]],
                        }
                    }
                }, {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                }
            ]
        }
    };
}