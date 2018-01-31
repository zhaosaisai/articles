## 一字一句的搞懂vue-cli之vue webpack template配置
webpack--神一样的存在。无论写了多少次，再次相见，仍是初见。有的时候开发vue项目，对尤大的vue-cli感激涕零。但是，但是，但是。。。不是自己的东西，真的很不想折腾。所以，我们就得深入内部，`cp them us`。所以呢，就利用两天时间，参考了一些他人的文章，查阅了一些官方的配置，就在此先稍微记录一下。

> 这份配置解析是基于最新版本的[vue webpack template](https://github.com/vuejs-templates/webpack)。不过，我非常建议，先别看我的文章，自己一句一句的通读一遍。然后再来瞅瞅，毕竟，碰撞的思维才能创造新的发现。

vue webpack的配置文件还是挺多的，下面是关于此配置的基本目录结构：

```bash
config
├── dev.env.js //dev环境变量配置
├── index.js // dev和prod环境的一些基本配置
└── prod.env.js // prod环境变量配置
build
├── build.js // npm run build所执行的脚本
├── check-versions.js // 检查npm和node的版本
├── logo.png
├── utils.js // 一些工具方法，主要用于生成cssLoader和styleLoader配置
├── vue-loader.conf.js // vueloader的配置信息
├── webpack.base.conf.js // dev和prod的公共配置
├── webpack.dev.conf.js // dev环境的配置
└── webpack.prod.conf.js // prod环境的配置
```
下面我们就按照如下的顺序分析源码：

`config/index.js` -> `build/utils.js` -> `build/vue-loader.conf.js` -> `build/webpack.base.conf.js` -> `build/webpack.dev.conf.js` -> `build/webpack.prod.conf.js` -> `build/check-versions.js` -> `build/build.js`

### `config/index.js`: 一些基本属性的配置(我们可以根据自己的需要来更改这些配置)

```js
'use strict'
// 这个文件主要是对开发环境和生产环境的一个基本的配置
const path = require('path')

module.exports = {
  // 开发环境的一个基本配置
  dev: {
    // 编译输出的二级目录
    assetsSubDirectory: 'static',
    // 编译发布的根目录，可配置为资源服务器域名或者cdn域名
    assetsPublicPath: '/',
    // 需要使用proxyTable代理的接口(可以跨域)
    proxyTable: {},

    // 开发时候的访问域名。可以通过环境变量自己设置。
    host: 'localhost', // can be overwritten by process.env.HOST
    // 开发时候的端口。可以通过环境变量PORT设定。如果端口被占用了，会随机分配一个未被使用的端口
    port: 8080, 
    // 是否自动打开浏览器
    autoOpenBrowser: false,
    // 下面两个都是浏览器展示错误的方式
    //  在浏览器是否展示错误蒙层
    errorOverlay: true,
    // 是否展示错误的通知
    notifyOnErrors: true,

    // 这个是webpack-dev-servr的watchOptions的一个选项，指定webpack检查文件的方式
    // 因为webpack使用文件系统去获取文件改变的通知。在有些情况下，这个可能不起作用。例如，当使用NFC的时候，
    // vagrant也会在这方面存在很多问题，在这些情况下，使用poll选项（以轮询的方式去检查文件是否改变）可以设定为true
    // 或者具体的数值，指定文件查询的具体周期。
    poll: false, 
    // 是否使用eslint loader去检查代码
    useEslint: true,
    
    // 如果设置为true，在浏览器中，eslint的错误和警告会以蒙层的方式展现。
    showEslintErrorsInOverlay: false,

    /**
     * Source Maps
     */

    // source maps的格式
    devtool: 'eval-source-map',

    // 指定是否通过在文件名称后面添加一个查询字符串来创建source map的缓存
    cacheBusting: true,
    // 关闭css的source map
    cssSourceMap: false,
  },

  build: {
    // html文件的生成的地方
    index: path.resolve(__dirname, '../dist/index.html'),

    // 编译生成的文件的目录
    assetsRoot: path.resolve(__dirname, '../dist'),
    // 编译生成的静态文件的目录
    assetsSubDirectory: 'static',
    // 编译发布的根目录，可配置为资源服务器域名或者cdn域名
    assetsPublicPath: '/',

    /**
     * Source Maps
     */

    productionSourceMap: true,
    
    devtool: '#source-map',
    
    // 是否开启生产环境的gzip压缩
    productionGzip: false,
    // 开启gzip压缩的文件的后缀名称
    productionGzipExtensions: ['js', 'css'],

    // 如果这个选项是true的话，那么则会在build后，会在浏览器中生成一份bundler报告
    bundleAnalyzerReport: process.env.npm_config_report
  }
}

```

### `build/utils.js`: 主要用于生成css loader和style loader的一些方法

```js
'use strict'
// 引入nodejs的path模块，用于操作路径
const path = require('path')
// 引入模板的配置文件，下面就需要去这个文件中看看有什么基本的配置
const config = require('../config')
// 提取特定文件的插件，比如把css文件提取到一个文件中去
const ExtractTextPlugin = require('extract-text-webpack-plugin')
// 加载package.json文件
const packageConfig = require('../package.json')

// 生成编译输出的二级目录
exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory

  // path.posix是path模块跨平台的实现（不同平台的路径表示是不一样的）
  return path.posix.join(assetsSubDirectory, _path)
}

// 为不同的css预处理器提供一个统一的生成方式，也就是统一处理各种css类型的打包问题。
// 这个是为在vue文件中的style中使用的css类型
exports.cssLoaders = function (options) {
  options = options || {}

  // 打包css模块
  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // 编译postcss模块
  const postcssLoader = {
    // 使用postcss-loader来打包postcss模块
    loader: 'postcss-loader',
    // 配置source map
    options: {
      sourceMap: options.sourceMap
    }
  }

  // 创建loader加载器字符串，结合extract text插件使用
  /**
   * 
   * @param {loader的名称} loader 
   * @param {loader对应的options配置对象} loaderOptions 
   */
  function generateLoaders (loader, loaderOptions) {
    // 通过usePostCSS 来标明是否使用了postcss
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

    // 如果指定了具体的loader的名称
    if (loader) {
      // 向loaders的数组中添加该loader对应的加载器
      // 一个很重要的地方就是，一个数组中的loader加载器，是从右向左执行的。
      loaders.push({
        // loader加载器的名称
        loader: loader + '-loader',
        // 对应的加载器的配置对象
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // 如果明确指定了需要提取静态文件，则使用
    // ExtractTextPlugin.extract({})来包裹我们的各种css处理器。
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        // fallback这个选项我们可以这样理解
        // webpack默认会按照loaders中的加载器从右向左调用编译各种css类型文件。如果一切顺利，在loaders中的
        // 各个加载器运行结束之后就会把css文件导入到规定的文件中去，如果不顺利，则继续使用vue-style-loader来处理
        // css文件
        fallback: 'vue-style-loader'
      })
    } else {
      // 如果没有提取行为，则最后再使用vue-style-loader处理css
      return ['vue-style-loader'].concat(loaders)
    }
  }

  return {
    // css-loader
    css: generateLoaders(),
    // postcss-loader
    postcss: generateLoaders(),
    // less-loader
    less: generateLoaders('less'),
    // sass-loader 后面的选项表明sass使用的是缩进的愈发
    sass: generateLoaders('sass', { indentedSyntax: true }),
    // scss-loader
    scss: generateLoaders('sass'),
    // stylus-loader stylus文件有两种后缀名.stylus和styl
    stylus: generateLoaders('stylus'),
    // stylus-loader
    styl: generateLoaders('stylus')
  }
}

// 使用这个函数，为那些独立的style文件创建加载器配置。
exports.styleLoaders = function (options) {
  // 保存加载器配置的变量
  const output = []
  // 获取所有css文件类型的loaders
  const loaders = exports.cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    // 生成对应的loader配置
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}

exports.createNotifierCallback = () => {
  // node-notifier是一个跨平台的包，以类似浏览器的通知的形式展示信息。
  const notifier = require('node-notifier')

  return (severity, errors) => {
    // 只展示错误的信息
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    // 需要展示的错误信息的内容 
    notifier.notify({
      // 通知的标题
      title: packageConfig.name,
      // 通知的主体内容
      message: severity + ': ' + error.name,
      // 副标题
      subtitle: filename || '',
      // 通知展示的icon
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

```

### `build/vue-loader.conf.js`:vue-loader的一些基本配置

```js
'use strict'
const utils = require('./utils')
const config = require('../config')
// 设置是不是生产环境
const isProduction = process.env.NODE_ENV === 'production'
// 根据不同的环境，引入不同的source map配置文件
const sourceMapEnabled = isProduction
  ? config.build.productionSourceMap
  : config.dev.cssSourceMap

module.exports = {
  // vue文件中的css loader配置
  loaders: utils.cssLoaders({
    sourceMap: sourceMapEnabled,
    // 生产环境下就会把css文件抽取到一个独立的文件中
    extract: isProduction
  }),
  // css source map文件的配置
  cssSourceMap: sourceMapEnabled,
  // css source map文件缓存控制变量
  cacheBusting: config.dev.cacheBusting,
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
```
### `build/weback.base.conf.js`:dev和prod环境下的公共配置

```js
'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
// 生成相对于根目录的绝对路径
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

// eslint的规则
const createLintingRule = () => ({
  // 对.js和.vue结尾的文件进行eslint检查
  test: /\.(js|vue)$/,
  // 使用eslint-loader
  loader: 'eslint-loader',
  // enforce的值可能是pre和post。其中pre有点和webpack@1中的preLoader配置含义相似。
  // post和v1中的postLoader配置含义相似。表示loader的调用时机
  // 这里表示在调用其他loader之前需要先调用这个规则进行代码风格的检查
  enforce: 'pre',
  // 需要进行eslint检查的文件的目录存在的地方
  include: [resolve('src'), resolve('test')],
  // eslint-loader配置过程中需要指定的选项
  options: {
    // 文件风格的检查的格式化程序，这里使用的是第三方的eslint-friendly-formatter
    formatter: require('eslint-friendly-formatter'),
    // 是否需要eslint输出警告信息
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

// 下面就是webpack基本的配置信息（可以立即成是开发环境和生产环境公共的配置）
module.exports = {
  // webpack解析文件时候的根目录(如果把webpack.config.js)放在了项目的根目录下面，这个配置可以省略
  context: path.resolve(__dirname, '../'),
  // 指定项目的入口文件
  entry: {
    app: './src/main.js'
  },
  // 项目的输出配置
  output: {
    // 项目build的时候，生成的文件的存放路径(这里的路径是../dist)
    path: config.build.assetsRoot,
    // 生成文件的名称
    filename: '[name].js',
    // 输出解析文件的目录，url 相对于 HTML 页面(生成的html文件中，css和js等静态文件的url前缀)
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  // 配置模块解析时候的一些选项
  resolve: {
    // 指定哪些类型的文件可以引用的时候省略后缀名
    extensions: ['.js', '.vue', '.json'],
    // 别名，在引入文件的时候可以使用
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      // 可以在引入文件的时候使用@符号引入src文件夹中的文件
      '@': resolve('src'),
    }
  },
  // 下面是针对具体的模块进行的具体的配置
  // 下面的配置语法采用的是version >= @2的版本
  module: {
    // rules是一个数组，其中的每一个元素都是一个对象，这个对象是针对具体类型的文件进行的配置。
    rules: [
      // .vue文件的配置
      {
        // 这个属性是一个正则表达式，用于匹配文件。这里匹配的是.vue文件
        test: /\.vue$/,
        // 指定该种类型文件的加载器名称
        loader: 'vue-loader',
        // 针对此加载器的具体配置
        // 针对前面的分析，这个配置对象中包含了各种css类型文件的配置，css source map的配置 以及一些transform的配置
        options: vueLoaderConfig
      },
      {
        // .js文件的配置
        test: /\.js$/,
        // js文件的处理主要使用的是babel-loader。在这里没有指定具体的编译规则，babel-loader会自动
        // 读取根目录下面的.babelrc中的babel配置用于编译js文件
        /**
         * {
         * // 使用的预设
            "presets": [
              // babel-preset-env: 根据你所支持的环境自动决定具体类型的babel插件
              ["env", {
                // modules设置为false，不会转换module
                "modules": false
              }],
              // babel-preset-stage-2: 可以使用所有>=stage2语法
              "stage-2"
            ],
            // 使用的插件
            // babel-plugin-transform-runtime: 只会对es6的语法进行转换而不会对新的api进行转换
            // 如果需要支持新的api，请引入babel-polyfill
            "plugins": ["transform-runtime"]
          }

         */
        loader: 'babel-loader',
        // 指定需要进行编译的文件的路径
        // 这里表示只对src和test文件夹中的文件进行编译
        include: [resolve('src'), resolve('test')]
      },
      {
        // 对图片资源进行编译的配置
        // 指定文件的类型
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        // 使用url-loader进行文件资源的编译
        loader: 'url-loader',
        // url-loader的配置选项
        options: {
          // 文件的大小小于10000字节(10kb)的时候会返回一个dataUrl
          limit: 10000,
          // 生成的文件的保存路径和后缀名称
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        // 对视频文件进行打包编译
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        // 对字体文件进行打包编译
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  // 这些选项用于配置polyfill或mock某些node.js全局变量和模块。
  // 这可以使最初为nodejs编写的代码可以在浏览器端运行
  node: {
    // 这个配置是一个对象，其中的每个属性都是nodejs全局变量或模块的名称
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    // false表示什么都不提供。如果获取此对象的代码，可能会因为获取不到此对象而触发ReferenceError错误
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    // 设置成empty则表示提供一个空对象
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}

```

### `build/weboack.dev.conf.js`:dev环境的配置

```js
'use strict'
// 首先引入的是一些工具方法，下面我们就需要去util文件种看一下有哪些对应的工具方法
const utils = require('./utils')
// 引入webpack模块
const webpack = require('webpack')
// 引入配置文件
// 这个配置文件中包含了一些dev和production环境的基本配置
const config = require('../config')
// 引入webpack-merge模块。这个模块用于把多个webpack配置合并成一个配置，后面的配置会覆盖前面的配置。
const merge = require('webpack-merge')
// 引入webpack的基本设置，这个设置文件包含了开发环境和生产环境的一些公共配置
const baseWebpackConfig = require('./webpack.base.conf')
// 用于生成html文件的插件
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 这个插件能够更好的在终端看到webpack运行时的错误和警告等信息。可以提升开发体验。
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
// 查找一个未使用的端口
const portfinder = require('portfinder')

// 获取host环境变量，用于配置开发环境域名
const HOST = process.env.HOST
// 获取post环境变量，用于配置开发环境时候的端口号
const PORT = process.env.PORT && Number(process.env.PORT)

// 开发环境的完整的配置文件，
const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    // 为那些独立的css类型文件添加loader配置（没有写在vue文件的style标签中的样式）
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // 开发环境使用'eval-source-map'模式的source map
  // 因为速度快
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  // 下面是对webpack-dev-server选项的基本配置，这些配置信息，我们可以在/config/index.js
  // 文件中进行自定义配置。
  devServer: {
    // 用于配置在开发工具的控制台中显示的日志级别
    // 注意这个不是对bundle的错误和警告的配置，而是对它生成之前的消息的配置
    clientLogLevel: 'warning',
    // 表示当使用html5的history api的时候，任意的404响应都需要被替代为index.html
    historyApiFallback: true,
    // 启用webpack的热替换特性
    hot: true,
    // 一切服务都需要使用gzip压缩
    // 可以在js，css等文件的response header中发现有Content-Encoding:gzip响应头
    compress: true,
    // 指定使用一个 host。默认是 localhost
    // 如果希望服务器外部可以访问(通过我们电脑的ip地址和端口号访问我们的应用)
    // 可以指定0.0.0.0
    host: HOST || config.dev.host,
    // 指定要监听请求的端口号
    port: PORT || config.dev.port,
    // 是否自动打开浏览器
    open: config.dev.autoOpenBrowser,
    // 当编译出现错误的时候，是否希望在浏览器中展示一个全屏的蒙层来展示错误信息
    overlay: config.dev.errorOverlay
    // 表示只显示错误信息而不显示警告信息
    // 如果两者都希望显示，则把这两项都设置为true
      ? { warnings: false, errors: true }
      // 设置为false则表示啥都不显示
      : false,
      // 指定webpack-dev-server的根目录，这个目录下的所有的文件都是能直接通过浏览器访问的
      // 推荐和output.publicPath设置为一致
    publicPath: config.dev.assetsPublicPath,
    // 配置代理，这样我们就可以跨域访问某些接口
    // 我们访问的接口，如果符合这个选项的配置，就会通过代理服务器转发我们的请求
    proxy: config.dev.proxyTable,
    // 启用 quiet 后，除了初始启动信息之外的任何内容都不会被打印到控制台。这也意味着来自 webpack 的错误或警告在控制台不可见。
    quiet: true, // necessary for FriendlyErrorsPlugin
    // 与监视文件相关的控制选项。
    watchOptions: {
      // 如果这个选项为true，会以轮询的方式检查我们的文件的变动，效率不好
      poll: config.dev.poll,
    }
  },
  plugins: [
    // 创建一个在编译时可以配置的全局变量
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    // 启用热替换模块
    // 记住，我们永远不要再生产环境中使用hmr
    new webpack.HotModuleReplacementPlugin(),
    // 这个插件的主要作用就是在热加载的时候直接返回更新文件的名称，而不是文件的id
    new webpack.NamedModulesPlugin(),
    // 使用这个插件可以在编译出错的时候来跳过输出阶段，这样可以确保输出资源不会包含错误。
    new webpack.NoEmitOnErrorsPlugin(),

    // 这个插件主要是生成一个html文件
    new HtmlWebpackPlugin({
      // 生成的html文件的名称
      filename: 'index.html',
      // 使用的模板的名称
      template: 'index.html',
      // 将所有的静态文件都插入到body文件的末尾
      inject: true
    }),
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  // 这种获取port的方式会返回一个promise
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // 把获取到的端口号设置为环境变量PORT的值
      process.env.PORT = port
      // 重新设置webpack-dev-server的端口的值
      devWebpackConfig.devServer.port = port

      // 将FriendlyErrorsPlugin添加到webpack的配置文件中
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        // 编译成功时候的输出信息
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        // 当编译出错的时候，根据config.dev.notifyOnErrors来确定是否需要在桌面右上角显示错误通知框
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))
      // resolve我们的配置文件
      resolve(devWebpackConfig)
    }
  })
})

```

### `build/webpack.prod.conf.js`:prod环境的基本配置

```js
'use strict'
// 引入path模块
const path = require('path')
// 引入工具方法
const utils = require('./utils')
// 引入webpack模块
const webpack = require('webpack')
// 引入基本的配置
const config = require('../config')
// 引入webpack-merge模块
const merge = require('webpack-merge')
// 引入开发环境和生产环境公共的配置
const baseWebpackConfig = require('./webpack.base.conf')
// 引入copy-webpack-plugin模块
// 这个模块主要用于在webpack中拷贝文件和文件夹
const CopyWebpackPlugin = require('copy-webpack-plugin')
// 引入html-webpack-plugin插件
// 这个插件主要是用于基于模版生成html文件的
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 引入extract-text-webpack-plugin插件
// 这个插件主要是用于将入口中所有的chunk，移到独立的分离的css文件中
const ExtractTextPlugin = require('extract-text-webpack-plugin')
// 引入optimize-css-assets-webpack-plugin插件
// 这个插件主要是用于压缩css模块的
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
// 引入uglifyjs-webpack-plugin插件
// 这个插件主要是用于压缩js文件的
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
// 引入用于生产环境的一些基本变量
const env = require('../config/prod.env')

// 合并公共配置和生产环境独有的配置并返回一个用于生产环境的webpack配置文件
const webpackConfig = merge(baseWebpackConfig, {
  // 用于生产环境的一些loader配置
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      // 在生产环境中使用extract选项，这样就会把thunk中的css代码抽离到一份独立的css文件中去
      extract: true,
      usePostCSS: true
    })
  },
  // 配置生产环境中使用的source map的形式。在这里，生产环境使用的是#source map的形式
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    // build所产生的文件的存放的文件夹地址
    path: config.build.assetsRoot,
    // build之后的文件的名称
    // 这里[name]和[chunkhash]都是占位符
    // 其中[name]指的就是模块的名称
    // [chunkhash]chunk内容的hash字符串，长度为20
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    // [id]也是一个占位符，表示的是模块标识符(module identifier)
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    // 压缩javascript的插件
    new UglifyJsPlugin({
      // 压缩js的时候的一些基本配置
      uglifyOptions: {
        // 配置压缩的行为
        compress: {
          // 在删除未使用的变量等时，显示警告信息，默认就是false
          warnings: false
        }
      },
      // 使用 source map 将错误信息的位置映射到模块（这会减慢编译的速度）
      // 而且这里不能使用cheap-source-map
      sourceMap: config.build.productionSourceMap,
      // 使用多进程并行运行和文件缓存来提高构建速度
      parallel: true
    }),

    // 提取css文件到一个独立的文件中去
    new ExtractTextPlugin({
      // 提取之后css文件存放的地方
      // 其中[name]和[contenthash]都是占位符
      // [name]就是指模块的名称
      // [contenthash]根据提取文件的内容生成的 hash
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      
      // 从所有额外的 chunk(additional chunk) 提取css内容
      // （默认情况下，它仅从初始chunk(initial chunk) 中提取）
      // 当使用 CommonsChunkPlugin 并且在公共 chunk 中有提取的 chunk（来自ExtractTextPlugin.extract）时
      // 这个选项需要设置为true
      allChunks: false,
    }),
    // duplicated CSS from different components can be deduped.
    // 使用这个插件压缩css，主要是因为，对于不同组件中相同的css可以剔除一部分
    new OptimizeCSSPlugin({
      // 这个选项的所有配置都会传递给cssProcessor
      // cssProcessor使用这些选项决定压缩的行为
      cssProcessorOptions: config.build.productionSourceMap
      // safe我不是很明白是什么意思？？？求留言告知。。。
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    
    // 创建一个html文件
    new HtmlWebpackPlugin({
      // 生成的文件的名称
      filename: config.build.index,
      // 使用的模板的名称
      template: 'index.html',
      // 把script和link标签放在body底部
      inject: true,
      // 配置html的压缩行为
      minify: {
        // 移除注释
        removeComments: true,
        // 去除空格和换行
        collapseWhitespace: true,
        // 尽可能移除属性中的引号和空属性
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // 控制chunks的顺序，这里表示按照依赖关系进行排序
      // 也可以是一个函数，自己定义排序规则
      chunksSortMode: 'dependency'
    }),
    // keep module.id stable when vender modules does not change
    // 根据模块的相对路径生成一个四位数的hash作为模块id
    new webpack.HashedModuleIdsPlugin(),

    // webpack2处理过的每一个模块都会使用一个函数进行包裹
    // 这样会带来一个问题：降低浏览器中JS执行效率，这主要是闭包函数降低了JS引擎解析速度。
    // webpack3中，通过下面这个插件就能够将一些有联系的模块，
    // 放到一个闭包函数里面去，通过减少闭包函数数量从而加快JS的执行速度。
    new webpack.optimize.ModuleConcatenationPlugin(),

    // 这个插件用于提取多入口chunk的公共模块
    // 通过将公共模块提取出来之后，最终合成的文件能够在最开始的时候加载一次
    // 然后缓存起来供后续使用，这会带来速度上的提升。
    new webpack.optimize.CommonsChunkPlugin({
      // 这是 common chunk 的名称
      name: 'vendor',
      // 把所有从mnode_modules中引入的文件提取到vendor中
      minChunks (module) {
      
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),

    // 为了将项目中的第三方依赖代码抽离出来，官方文档上推荐使用这个插件，当我们在项目里实际使用之后，
    // 发现一旦更改了 app.js 内的代码，vendor.js 的 hash 也会改变，那么下次上线时，
    // 用户仍然需要重新下载 vendor.js 与 app.js——这样就失去了缓存的意义了。所以第二次new就是解决这个问题的
    // 参考：https://github.com/DDFE/DDFE-blog/issues/10
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      async: 'vendor-async',
      children: true,
      minChunks: 3
    }),

    // copy custom static assets
    // 拷贝静态资源到build文件夹中
    new CopyWebpackPlugin([
      {
        // 定义要拷贝的资源的源目录
        from: path.resolve(__dirname, '../static'),
        // 定义要拷贝的资源的目标目录
        to: config.build.assetsSubDirectory,
        // 忽略拷贝指定的文件，可以使用模糊匹配
        ignore: ['.*']
      }
    ])
  ]
})

if (config.build.productionGzip) {
  // 如果开启了生产环境的gzip
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      // 目标资源的名称
      // [path]会被替换成原资源路径
      // [query]会被替换成原查询字符串
      asset: '[path].gz[query]',
      // gzip算法
      // 这个选项可以配置成zlib模块中的各个算法
      // 也可以是(buffer, cb) => cb(buffer)
      algorithm: 'gzip',
      // 处理所有匹配此正则表达式的资源
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      // 只处理比这个值大的资源
      threshold: 10240,
      // 只有压缩率比这个值小的资源才会被处理
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  // 如果需要生成一分bundle报告，则需要使用下面的这个插件
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig

```

### `build/check-versions.js`：检查npm和node的版本

```js
'use strict'
// 在终端为不同字体显示不同的风格
const chalk = require('chalk')
// 解析npm包的version
const semver = require('semver')
// 引入package.json文件
const packageConfig = require('../package.json')
// node版本的uninx shell命令
const shell = require('shelljs')

// 执行命令的函数
function exec (cmd) {
  return require('child_process').execSync(cmd).toString().trim()
}

const versionRequirements = [
  {
    name: 'node',
    // node的版本
    // process.version就是node的版本
    // semver.clean('v8.8.0') => 8.8.0
    currentVersion: semver.clean(process.version),
    // package.json中定义的node版本的范围 
    versionRequirement: packageConfig.engines.node
  }
]

// 相当于 which npm
if (shell.which('npm')) {
  // 如果npm命令存在的话
  versionRequirements.push({
    name: 'npm',
    // 检查npm的版本 => 5.4.2
    currentVersion: exec('npm --version'),
    // package.json中定义的npm版本
    versionRequirement: packageConfig.engines.npm
  })
}

module.exports = function () {
  const warnings = []

  for (let i = 0; i < versionRequirements.length; i++) {
    const mod = versionRequirements[i]

    // semver.satisfies()进行版本之间的比较
    if (!semver.satisfies(mod.currentVersion, mod.versionRequirement)) {
      // 如果现有的npm或者node的版本比定义的版本低，则生成一段警告
      warnings.push(mod.name + ': ' +
        chalk.red(mod.currentVersion) + ' should be ' +
        chalk.green(mod.versionRequirement)
      )
    }
  }

  if (warnings.length) {
    console.log('')
    console.log(chalk.yellow('To use this template, you must update following to modules:'))
    console.log()

    for (let i = 0; i < warnings.length; i++) {
      const warning = warnings[i]
      console.log('  ' + warning)
    }

    console.log()
    // 退出程序
    process.exit(1)
  }
}

```

### `build/build.js`: build项目

```js
'use strict'
// 检查npm和node的版本
require('./check-versions')()

// 设置环境变量NODE_ENV的值是production
process.env.NODE_ENV = 'production'

// 终端的spinner
const ora = require('ora')
// node.js版本的rm -rf
const rm = require('rimraf')
// 引入path模块
const path = require('path')
// 引入显示终端颜色模块
const chalk = require('chalk')
// 引入webpack模块
const webpack = require('webpack')
// 引入基本的配置文件
const config = require('../config')
// 引入webpack在production环境下的配置文件
const webpackConfig = require('./webpack.prod.conf')

// 
const spinner = ora('building for production...')
spinner.start()

// 删除打包目标目录下的文件
rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  // 进行打包
  webpack(webpackConfig, (err, stats) => {
    // 打包完成
    spinner.stop()
    if (err) throw err
    // 输出打包的状态
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    // 如果打包出现错误
    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      process.exit(1)
    }

    // 打包完成
    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})

```

拍砖，bingo😊