## redux源码阅读－－基本概括
## Redux总体概括

`redux`是`react`官方推荐的一个状态管理库。功能强大且代码优雅。从`package.json`文件中：

```json
"dependencies": {
  "gitbook-plugin-algolia": "^1.0.7",
  "gitbook-plugin-anchorjs": "^1.1.1",
  "gitbook-plugin-edit-link": "^2.0.2",
  "gitbook-plugin-github": "^2.0.0",
  "gitbook-plugin-prism": "^2.3.0",
  "lodash": "^4.2.1",
  "lodash-es": "^4.2.1",
  "loose-envify": "^1.1.0",
  "symbol-observable": "^1.0.3"
}
```
可知，`redux`除了依赖gitbook的几个插件库用于生成文档外，还依赖`lodash`和`symbol-observable`这两个库。在阅读源码的过程中可以看出，其只依赖这两个库的某几个方法。从这里来看，`redux`可以看作是无依赖的一个库。这点，我们应该给`redux`点个赞。

通过`tree`命令，可以看出`redux`源码结构：

```bash
src
├── applyMiddleware.js
├── bindActionCreators.js
├── combineReducers.js
├── compose.js
├── createStore.js
├── index.js
└── utils
    └── warning.js
```
简单的不能再简单了，几个模块也就是我们平常在使用`redux`开发过程中经常使用的几个方法。具体的使用不作介绍，请查看[redux官方文档](http://redux.js.org/docs/introduction/index.html)详细查看。


下面是`redux`的各模块之间的依赖关系：

![图片描述][1]

接下来，我们就从主模块入手，一步步分析`redux`内部神奇的构造。

这就是对redux源码的整体概括，水平有限，欢迎拍砖。后续的源码解读和测试例子可以关注：[redux源码解读仓库](https://github.com/SourceCooode/__redux)


  [1]: /img/bVXO00