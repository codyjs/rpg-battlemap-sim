
const path = require('path');

module.exports = {
    context: __dirname,
    entry: './src/app/index.jsx',
    devServer: {
        contentBase: ['./src/server/public'],
        proxy: {
            '/api': 'http://localhost:3000'
        }
    },
    resolve: {
        extensions: ['.jsx', '.js']
    },
    mode: 'development',
    output: {
        path: path.resolve(__dirname, './src/server/public/dist')
    },
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
            }
        ]
    }
}