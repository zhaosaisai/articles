## 从react-start到co源码(一)
react作为当前十分流行的前端框架，相信很多前端er都有蠢蠢欲动的学习它的想法。工欲善其事，必先利其器。这篇文章就简单的给大家介绍一下如何我快速的搭建一个`react`前端开发环境。主要针对于`react`小白，大神不喜勿喷。
从标题可以看出，这里不会仅仅只介绍一下`react`的开发环境如何搭建。我将这个系列分成三篇介绍:
* 第一篇--[快速搭建一个`react`开发环境。](https://segmentfault.com/a/1190000008123927)
* 第二篇--[快速开发一个`react`开发环境脚手架工具](https://segmentfault.com/a/1190000008129293)。有了这个工具，在任何地方都能够一键生成环境。
* 第三篇--[脚手架依赖的核心库`co`的源码解析。](https://segmentfault.com/a/1190000008189685)
----
接下来就开始介绍`react`开发环境的基本搭建。`react`需要通过`webpack`进行打包，所以请确保自己的机器上安装了`webpack`和`nodejs`。无安装的请自行谷歌。

### 安装`babel`
`react`使用`jsx`的语法，这种语法形式浏览器是不能识别的。所以需要借助`babel`编译器对我们的文件进行编译。简单的说这里的`babel`就有两个作用：
* 一是编译一些基本的`react`特性  
* 二是让我们能够使用`es6`等语法形式
接下来通过如下方式安装和配置对应的`loader`。

#### 1. 安装`babel-loader`
```bash
// 安装 babel-core 和 babel-loader
npm install babel-core babel-loader --save-dev
// 安装babel的es6和react支持
npm install babel-preset-es2015 babel-preset-react --save-dev
```
> `babel-preset-es2015`:将`es6`语法解析成浏览器支持的`es5`语法
> `babel-preset-react`:用于`react`语法的解析和优化

#### 1. 配置`.babelrc`文件
```js
{
  "presets":["es2015", "react"]  // 告诉babel解析js语法的时候需要使用这两个preset
}
```
上面就是我们对`babel-loader`的基本配置, 为了保持`js`语法的一致性和严谨性,我们还需要安装和配置`eslint`。
### 安装`eslint`
#### 1. 安装`eslint-loader`
```bash
npm install eslint eslint-loader --save-dev
```
安装好`eslint-loader`之后  我们还需要安装一个第三方配置好的格式插件 这里我们将使用`eslint-config-standard-react`这个插件。
#### 2. 安装`eslint-config-standard-react`
```bash
npm install eslint-config-standard eslint-config-standard-react eslint-plugin-promise eslint-plugin-react eslint-plugin-standard --save-dev 
```
#### 3. 配置`.eslintrc`文件
在根目录下建立一个`.eslintrc`文件, 同时写入如下代码：

```js
{
  "extends": ["standard", "standard-react"]
}
```

### 添加`HMR`功能
`HMR(Hot Module Replacement)`功能就是通常所说的热加载功能, `babel`提供了一个预设`babel-preset-react-hmre`可以很好的帮助我们完成`react`组件的热加载功能。

#### 1. 安装`babel-preset-react-hmre`
```bash
npm install babel-preset-react-hmre  --save-dev
```
这个预设主要包含了如下两个插件：
> `react-transform-hmr`:实现热加载
> `react-transform-catch-errors`:捕获`render`中的方法并展现在界面上

#### 2. 修改上述的`.babelrc`文件
```js
{
  "presets": ["react", "es2015"],
  "env": {
    "development": {
      "presets": ["react-hmre"]
    }
  }
}
```
### `webpack.config.js`文件
通过上面的几个步骤,我们就大致完成了`react`开发环境的基本搭建。下面就是我们完整的`webpack.config.js`文件。
```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OpenBrowserPlugin = require('open-browser-webpack-plugin')

const ROOT_PATH = path.resolve(__dirname)
const SRC_PATH = path.resolve(__dirname, 'src')
const BUILD_PATH = path.resolve(__dirname, 'build')

const webpackOptions = {
  devtool: '#source-map',
  entry: {
    app: path.resolve(SRC_PATH, 'index.jsx')
  },
  output: {
    path: BUILD_PATH,
    filename: 'bundle.js'
  },
  module: {
    //eslint应该在preLoaders中进行
    preLoaders: [
      {
        test: /\.jsx?$/,
        loader: 'eslint',
        exclude: /node_modules/
      }
    ],
    //配置loaders
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {
        test:  /\.css?$/,
        loader: 'style!css!stylus',
        include: SRC_PATH
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'react-start'
    }),
    new OpenBrowserPlugin({ url: 'http://localhost:8080' })
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true
  }
}
module.exports = webpackOptions
```
以上就是`react`简单的环境搭建,后面会推出后续的文章。喜欢的同学欢迎关注,并可以从我的`github`--[Pavooo](https://github.com/pavoooo/template)上获得文章中的所有代码。