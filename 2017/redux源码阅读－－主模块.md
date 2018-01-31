## redux源码阅读－－主模块
## 主模块
`redux`的入口模块就是`src/index.js`。这个文件的代码十分简单。主要就做两件事：

* 引入个功能模块，并挂载至同一个对象上，对外暴露。
* 在非`production`环境下压缩代码，给予警告。

下面是模块的源码(只包含自己对代码的理解，并不包含原注释。)

```javascript
// 引入createStore模块，这个模块就是`createStore`方法的实现
import createStore from './createStore'
// 引入combineReducers模块，这个模块就是`combineReducers`方法的实现
import combineReducers from './combineReducers'
// 引入bindActionCreators模块，这个模块就是`bindActionCreators`方法的实现
import bindActionCreators from './bindActionCreators'
// 引入applyMiddleware模块，这个模块就是`applyMiddleware`方法的实现
import applyMiddleware from './applyMiddleware'
// 引入compose模块，这个模块就是`compose`方法的实现
import compose from './compose'
// warning在支持console对象的浏览器中可以看作是对console.error方法的一个便捷方法，否则就是一个Error的实例对象。
import warning from './utils/warning'

// 这个函数唯一的作用就是：判断代码是不是处于压缩模式下，如果代码处于压缩模式下，函数的名称会改变，即
// isCrushed.name === 'isCrushed' 为false
function isCrushed() {}

// 如果在非production模式下压缩我们的js代码，会抛出warning。
// if的判断条件其实就是告诉我们，在production的模式下，一定要设置process.env.NODE_ENV为production
if (
  process.env.NODE_ENV !== 'production' &&
  typeof isCrushed.name === 'string' &&
  isCrushed.name !== 'isCrushed'
) {
  warning(
    'You are currently using minified code outside of NODE_ENV === \'production\'. ' +
    'This means that you are running a slower development build of Redux. ' +
    'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' +
    'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' +
    'to ensure you have the correct code for your production build.'
  )
}

// 这就是我们通常使用的redux的几个常用的方法
export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose
}
```
怎么设置环境变量`NODE_ENV`的值呢？对于我们使用`webpack`进行开发的同学来说，我们可以通过如下方式设置。

```js
plugins: [
  new webpack.DefinePlugin({
    'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    }
  })
]
```
其中，`JSON.stringify(process.env.NODE_ENV)`是直接获取的我们`bash`终端而言的。所以，在运行我们的项目之前，我们必须确保制定了这个环境变量(注：`NODE_ENV`并不是不可变的，你也可以指定其他的名字，但是需要和自己项目中的获取保持一致)

> 假设我们项目的启动脚本是`yarn run start`

**Mac or Linux**

可以通过下面两种方式设置：

```bash
export NODE_ENV=production
yarn run start

# 或者

NODE_ENV=production yarn run start
```

**Windows**

可以通过下面这种方式指定：

```bash
set NODE_ENV=production yarn run start
```

这就是对redux源码主模块的一个整体解读，水平有限，欢迎拍砖。后续的源码解读和测试例子可以关注：[redux源码解读仓库](https://github.com/SourceCooode/__redux)