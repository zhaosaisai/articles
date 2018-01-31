## webpack性能优化
`webpack`是当下前端界中最著名的一个模块加载工具，`react`和`vue`也都是用其作为项目的开发工具之一。小组最近在二次开发一个开源项目，前端主要使用的技术栈试`react+redux+es6`。构建工具则采用的是`webpack`。起初整个项目的`2707 modules`打包花费时长大概有`112s`，经过对一番折腾，使整个打包编译时间降到`40s`左右。


下面是整个项目的`webpack.config.js`文件，可以参考这个文件进行下面的阅读。

```js
require("babel-register");
require("babel-polyfill");

var webpack = require('webpack');
var webpackPostcssTools = require('webpack-postcss-tools');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
var UnusedFilesWebpackPlugin = require("unused-files-webpack-plugin").default;
var BannerWebpackPlugin = require('banner-webpack-plugin');
var AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
var HappyPack = require('happypack');
var ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

var _ = require('underscore');
var glob = require('glob');
var fs = require('fs');

var chevrotain = require("chevrotain");
var allTokens = require("./frontend/src/metabase/lib/expressions/tokens").allTokens;

function hasArg(arg) {
    var regex = new RegExp("^" + ((arg.length === 2) ? ("-\\w*"+arg[1]+"\\w*") : (arg)) + "$");
    return process.argv.filter(regex.test.bind(regex)).length > 0;
}

var SRC_PATH = __dirname + '/frontend/src/metabase';
var BUILD_PATH = __dirname + '/resources/frontend_client';

// default NODE_ENV to development
var NODE_ENV = process.env["NODE_ENV"] || "development";

var IS_WATCHING = hasArg("-w") || hasArg("--watch");
if (IS_WATCHING) {
    process.stderr.write("Warning: in webpack watch mode you must restart webpack if you change any CSS variables or custom media queries\n");
}

// Babel:
var BABEL_CONFIG = {
    cacheDirectory: ".babel_cache"
};

// Build mapping of CSS variables
var CSS_SRC = glob.sync(SRC_PATH + '/css/**/*.css');
var CSS_MAPS = { vars: {}, media: {}, selector: {} };
CSS_SRC.map(webpackPostcssTools.makeVarMap).forEach(function(map) {
    for (var name in CSS_MAPS) _.extend(CSS_MAPS[name], map[name]);
});

// CSS Next:
var CSSNEXT_CONFIG = {
    features: {
        // pass in the variables and custom media we scanned for before
        customProperties: { variables: CSS_MAPS.vars },
        customMedia: { extensions: CSS_MAPS.media }
    },
    import: {
        path: ['resources/frontend_client/app/css']
    },
    compress: false
};

var CSS_CONFIG = {
    localIdentName: NODE_ENV !== "production" ?
        "[name]__[local]___[hash:base64:5]" :
        "[hash:base64:5]",
    restructuring: false,
    compatibility: true,
    url: false, // disabled because we need to use relative url()
    importLoaders: 1
}

// happypack.config
var happyPackConfig = {
    plugins:[
        new HappyPack({
           id: 'happyBabel',
           threads: 4,
           cache: true,
           loaders:[
               {
                   path: 'babel',
                   query: BABEL_CONFIG
               }
           ]
        }),
        new HappyPack({
            id: 'happyEslint',
            threads: 4,
            cache: true,
            loaders: ['eslint']
        })
    ]
}

var config = module.exports = {
    context: SRC_PATH,
    entry: {
        "app-main": './app-main.js',
        "app-public": './app-public.js',
        "app-embed": './app-embed.js',
        styles: './css/index.css',
    },

    // output to "dist"
    output: {
        path: BUILD_PATH + '/app/dist',
        filename: '[name].bundle.js?[hash]',
        publicPath: 'app/dist/'
    },

    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'HappyPack/loader?id=happyBabel'
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules|\.spec\.js/,
                loader: 'HappyPack/loader?id=happyEslint'
            },
            {
                test: /\.(eot|woff2?|ttf|svg|png)$/,
                loader: "file-loader"
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader?" + JSON.stringify(CSS_CONFIG) + "!postcss-loader")
            }
        ]
    },

    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx", ".css"],
        alias: {
            'metabase':             SRC_PATH,
            'style':                SRC_PATH + '/css/core/index.css',
            'ace':                  __dirname + '/node_modules/ace-builds/src-min-noconflict',
        }
    },

    plugins: [
        new UnusedFilesWebpackPlugin({
            globOptions: {
                ignore: [
                    "**/types/*.js",
                    "**/*.spec.*",
                    "**/__support__/*.js"
                ]
            }
        }),
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('./manifest.json'),
            name:"vendors_dll"
        }),
        // Extracts initial CSS into a standard stylesheet that can be loaded in parallel with JavaScript
        // NOTE: the filename on disk won't include "?[chunkhash]" but the URL in index.html generated by HtmlWebpackPlugin will:
        new ExtractTextPlugin('[name].bundle.css?[contenthash]'),
        new HtmlWebpackPlugin({
            filename: '../../index.html',
            chunks: ["app-main", "styles"],
            template: __dirname + '/resources/frontend_client/index_template.html',
            inject: 'head',
            alwaysWriteToDisk: true,
        }),
        new HtmlWebpackPlugin({
            filename: '../../public.html',
            chunks: ["app-public", "styles"],
            template: __dirname + '/resources/frontend_client/index_template.html',
            inject: 'head',
            alwaysWriteToDisk: true,
        }),
        new HtmlWebpackPlugin({
            filename: '../../embed.html',
            chunks: ["app-embed", "styles"],
            template: __dirname + '/resources/frontend_client/index_template.html',
            inject: 'head',
            alwaysWriteToDisk: true,
        }),
        new AddAssetHtmlPlugin({
            filepath: BUILD_PATH + '/app/dist/*.dll.js',
            includeSourcemap: false
        }),
        new HtmlWebpackHarddiskPlugin({
            outputPath: __dirname + '/resources/frontend_client/app/dist'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(NODE_ENV)
            }
        }),
        new BannerWebpackPlugin({
            chunks: {
                'app-main': {
                    beforeContent: "/*\n* This file is subject to the terms and conditions defined in\n * file 'LICENSE.txt', which is part of this source code package.\n */\n",
                },
                'app-public': {
                    beforeContent: "/*\n* This file is subject to the terms and conditions defined in\n * file 'LICENSE.txt', which is part of this source code package.\n */\n",
                },
                'app-embed': {
                    beforeContent: "/*\n* This file is subject to the terms and conditions defined in\n * file 'LICENSE-EMBEDDING.txt', which is part of this source code package.\n */\n",
                },
            }
        }),
    ].concat(happyPackConfig.plugins),

    postcss: function (webpack) {
        return [
            require("postcss-import")(),
            require("postcss-url")(),
            require("postcss-cssnext")(CSSNEXT_CONFIG)
        ]
    }
};

if (NODE_ENV === "hot") {
    // suffixing with ".hot" allows us to run both `yarn run build-hot` and `yarn run test` or `yarn run test-watch` simultaneously
    config.output.filename = "[name].hot.bundle.js?[hash]";

    // point the publicPath (inlined in index.html by HtmlWebpackPlugin) to the hot-reloading server
    config.output.publicPath = "http://localhost:8080/" + config.output.publicPath;

    config.module.loaders.unshift({
        test: /\.jsx$/,
        exclude: /node_modules/,
        loaders: ['react-hot', 'babel?'+JSON.stringify(BABEL_CONFIG)]
    });

    // disable ExtractTextPlugin
    config.module.loaders[config.module.loaders.length - 1].loader = "style-loader!css-loader?" + JSON.stringify(CSS_CONFIG) + "!postcss-loader"

    config.devServer = {
        hot: true,
        inline: true,
        contentBase: "frontend"
    };

    config.plugins.unshift(
        new webpack.NoErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin()
    );
}

if (NODE_ENV !== "production") {
    // replace minified files with un-minified versions
    for (var name in config.resolve.alias) {
        var minified = config.resolve.alias[name];
        var unminified = minified.replace(/[.-\/]min\b/g, '');
        if (minified !== unminified && fs.existsSync(unminified)) {
            config.resolve.alias[name] = unminified;
        }
    }

    // enable "cheap" source maps in hot or watch mode since re-build speed overhead is < 1 second
    config.devtool = "cheap-module-source-map";
    config.output.devtoolModuleFilenameTemplate = '[absolute-resource-path]';
    config.output.pathinfo = true;
} else {
    config.plugins.push(new ParallelUglifyPlugin({
        uglifyJs:{
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
            mangle: {
                except: allTokens.map(function(currTok) {
                    return chevrotain.tokenName(currTok);
                })
            }
        },
        cacheDir: '.js-cache'
    }))

    config.devtool = "source-map";
}

```
`webpack`编译缓慢一直是现代化前端开发的一个痛点。社区中很多优秀的开发者都贡献出非常多的插件来视图解决这个问题。下面就将本文中用到的插件抛出，在下面这几个插件的配合下，编译速度会得到显著的提升。

* `happypack`: 让`loader`以多进程去处理文件，借助缓存机制，可以在`rebuild`的时候更快
* `webpack.DllPlugin`: 优先构建`npm`的第三方包
* `webpack.DllReferencePlugin`: 只负责用来引用由`webpack.DllPlugin`生成的第三方依赖项
* `webpack-parallel-uglify-plugin`: 并行压缩`javascript`文件(生产环境中使用，可以显著的提升构建速度)

下面就对这些插件以及我踩下的坑进行一个简单的介绍。

### `happypack`
> [https://github.com/amireh/happypack](https://github.com/amireh/happypack)

`happypack`允许`webpack`并行编译多个文件来提升构建速度。但是在某些情况下，其提升的效果并不是十分明显，这个时候就需要看一下自己电脑的`cpu`占用率，以及进程的运行情况。

`happypack`作为`webpack`的一个插件，所以在使用之前应该先安装。

```bash
yarn add happywebpack -D
```

配置过程很简单，只需要在`plugins`选项中创建其实例，可以创建一个或多个，然后在`loader`中引用即可。只需要注意一点，当创建多个`happypack`的实例的时候，给每个实例传递一个`id`参数。基本的变动如下：

**原配置文件**
```js
// 省略了部分的配置文件
var config = module.exports = {
    //................
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: BABEL_CONFIG
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules|\.spec\.js/,
                loader: 'eslint'
            },
            {
                test: /\.(eot|woff2?|ttf|svg|png)$/,
                loader: "file-loader"
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader?" + JSON.stringify(CSS_CONFIG) + "!postcss-loader")
            }
        ]
    }
    //...............
}
```
**改动如下**
```js
// happypack.config：更多的配置可以参考文档，按需索取。
var happyPackConfig = {
    plugins:[
        new HappyPack({
           id: 'happyBabel',
           threads: 4,
           cache: true,
           loaders:[
               {
                   path: 'babel',
                   query: BABEL_CONFIG
               }
           ]
        }),
        new HappyPack({
            id: 'happyEslint',
            threads: 4,
            cache: true,
            loaders: ['eslint']
        })
    ]
}
var config = module.exports = {
    //................
    module: {
        loaders: [
            // 变动这两个
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'HappyPack/loader?id=happyBabel'
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules|\.spec\.js/,
                loader: 'HappyPack/loader?id=happyEslint'
            },
            // 其它的并未改动
            {
                test: /\.(eot|woff2?|ttf|svg|png)$/,
                loader: "file-loader"
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader?" + JSON.stringify(CSS_CONFIG) + "!postcss-loader")
            }
        ]
    }
    //...............
}
// 在module.loader中引用
```
然后，当我们运行：
```bash
yarn run build
```
就会看到如下输出：

![图片描述][1]

大概意思就是，`happupack`的版本是`3.1.0`，对`babel-loader`开启了四个线程并从缓存中加载了`627`个模块。

### `webpack.DllPlugin`和`webpack.DllReferencePlugin`
这两个插件在使用的时候，还是有几个小坑的，下面就会为大家讲述几个。

先说一下基本的用法，官方推荐在使用的时候，我们需要写两个`webpack`配置文件。其中一个配置文件主要用于`webpack.DllPlugin`插件进行第三方的预打包，另一个则是主`webpack`配置文件，在其中使用`webpack.DllReferencePlugin`插件引用第三方生成的依赖模块。

所以，我们其中一个配置文件可以命名如下：`ddl.config.js`

```js
const webpack = require('webpack')
const vendors = Object.keys(require('package.json')['dependencies'])
const SRC_PATH = __dirname + '/frontend/src/metabase'
const BUILD_PATH = __dirname + '/resources/frontend_client'

module.exports = {
  output: {
    path: BUILD_PATH + '/app/dist',
    filename: '[name].dll.js',
    library: '[name]_dll',
  },
  entry: {
    // 第三方依赖设置为打包的入口
    vendors: vendors,
  },
  plugins: [
    new webpack.DllPlugin({
      path: 'manifest.json',
      name: '[name]_dll',
      context: __dirname,
    }),
  ],
}
```
接下来，在我们进行`webpack`的正式打包之前可以先来一个预打包，运行如下命令：

```bash
webpack --config ddl.donfig.js
```
命令结束之后，我们可以在`BUILD_PATH`下面生成了一个`vendors.dll.js`(具体的名称根据你的配置而来)以及根目录下面的`manifset.json`文件。打开这个文件，可以看到`webpack.DllPlugin`插件为每个第三方包都生成了一个唯一的全局id。

> 上面的这个插件的配置有几个需要注意的地方，`output.library`属性是必须的，同时`webpack.DllPlugin`参数对象的`name`属性和其保持一致。更详细的配置可以参考文档。

预打包之后，我们需要对我们的主`webpack.config.js`文件做如下改动。

```js
//..........................
    plugins:[
        // ........
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('./manifest.json'),
            // 上述生成的文件的名称
            name:"vendors_dll"
        }),
        //.........
    ]
//..........................
```
配置很简单，详细的配置小伙伴可以参考文档按需索取。这里有几个需要注意的地方给大家说明一下。
1. `vendors.dll.js`文件一定要在引入我们的`html`文件中，而且在引入模块文件之前引入，否则你会看到这个错误。

![图片描述][2]

(骚年，有没有觉得菊花一紧)

2. 但是，有些情况下，我们使用的是`html-webpack-plugin`来动态创建我们的`html`模板，这个时候我们怎么把生成的`vendors.dll.js`引入到我们的页面中呢？路径可以写死，但是你试试，反正我遇到了这个错误。如果你的可以，欢迎在`github`上留言交流。

![图片描述][3]

3. 当你遇到这个错误，别灰心，接着找解决方法。原来，还真有，就是下面即将介绍的这个插件：[add-asset-html-webpack-plugin](https://github.com/SimenB/add-asset-html-webpack-plugin)
。这个插件的主要作用就是将我们自己的静态文件插入到模版生成的`html`文件中。所以需要对`webpack.config.js`作出如下的改动。
```js
var AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
//..........................
    plugins:[
        // ........
       new AddAssetHtmlPlugin({
            filepath: BUILD_PATH + '/app/dist/*.dll.js',
            includeSourcemap: false
        }),
        //.........
    ]
//..........................
```

> `includeSourcemap`选项如果不配置的话，可能会遇到`vendors.dll.js.map cannot found`的错误

然后，运行，bingo。至此，打包时间已经从`100s`左右降到了`35s`左右。恭喜恭喜。

### `webpack-parallel-uglify-plugin`
> [https://github.com/gdborton/webpack-parallel-uglify-plugin](https://github.com/gdborton/webpack-parallel-uglify-plugin)

这个插件的用处十分的强大，并行压缩`javascript`，配置也十分简单，参考官方文档就能知道怎么使用，如我们的配置文件就做了如下的变动。

**原js文件**

```js
config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    // suppress uglify warnings in production
    // output from these warnings was causing Heroku builds to fail (#5410)
    compress: {
        warnings: false,
    },
    output: {
        comments: false,
    },
    mangle: {
        // this is required to ensure we don't minify Chevrotain token identifiers
        // https://github.com/SAP/chevrotain/tree/master/examples/parser/minification
        except: allTokens.map(function(currTok) {
            return chevrotain.tokenName(currTok);
        })
    }
}))
```

**变动后**

```js
config.plugins.push(new ParallelUglifyPlugin({
        uglifyJs:{
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
            mangle: {
                // this is required to ensure we don't minify Chevrotain token identifiers
                // https://github.com/SAP/chevrotain/tree/master/examples/parser/minification
                except: allTokens.map(function(currTok) {
                    return chevrotain.tokenName(currTok);
                })
            }
        },
        cacheDir: '.js-cache'
    }))
```

至此，我们大部分的优化的内容已经完成，下面是我们打包时间的一个对比。
**优化前打包时间**

![图片描述][4]

**优化后打包时间**

![图片描述][5]

除了上述的几个可以优化的地方，还有很多一些小点可以进行优化，比如：
1. css-loader在0.15.0之后的版本打包时间明显增长
2. 我们也可以适当的缩短一下模块的查询路径等

如果你有好的优化点，欢迎在我的[github](https://github.com/pavoooo)留言交流哈！！！


  [1]: /img/bV1kCO
  [2]: /img/bV1kCY
  [3]: /img/bV1kEc
  [4]: /img/bV1kC7
  [5]: /img/bV1kD4