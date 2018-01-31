## redux源码解读--applyMiddleware源码解析
## applyMiddleware源码解析
`中间件机制`在`redux`中是强大且便捷的，利用`redux`的中间件我们能够实现日志记录，异步调用等多种十分实用的功能。`redux`的中间件主要是通过`applyMiddleware`模块实现的。下面，我们就好好的看一下，这个模块到底有什么神奇的魔力。
> 关于中间件的使用，不了解的同学还需要参考redux文档进行学习。

在我们进行中间件源码剖析之前，我们需要知道一件事：中间件模块在`redux`的源码中是怎么被被调用的？只有明白了这个问题，我们才能够知道各个参数分别代表的是什么含义。

中间件的本质是作为`enhancer`而存在的。所以，它是通过`createStore`方法传递到`redux`的内部中的。在[createStore源码分析]()中有这样一段代码：

```js
if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
        throw new Error('Expected the enhancer to be a function.')
    }

    return enhancer(createStore)(reducer, preloadedState)
}
```
从这段代码中，我们不难看出，中间件模块是一个`高阶函数`。其函数签名可以表述如下：

```js
const applyMiddleware = (各个中间件列表) => (createStore(创建store)) => (reducer(reducer集合), preloadedState(初始state)) => {}
```
明白了上面的那个问题，还有一个问题是我们需要知道的－－就是`redux`的中间件的形式是怎么样的？这里，我们选择了用于处理异步的中间件`redux-thunk`的源码，为大家解释一下。（看到代码，只想说，卧槽卧槽卧槽）。

```js
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```
而在redux中我们应该怎么使用它？

```js
createStore(reducers, applyMiddleware(thunk))
```
到这里，我们知道了`redux`是怎么使用中间件的。下面，我们就要详细的解释：`redux`的源码内部是怎么处理中间件的。为了帮助大家更好的理解，先给大家扯点东西。`redux`的中间件都是遵循一定规范的。不管是官方的中间件还是我们以后需要自己写的中间件，其函数签名都是一定的。也就是说，中间件的基本的格式都是一样的，接收的参数也是`redux`注入进去的。下面就是`redux`中间件的基本格式：

```js
const reduxMiddleware = ({dispatch, getState}[简化的store]) => (next[上一个中间件的dispatch方法]) => (action[实际派发的action对象]) => {}
```
到这里，我们就可以去深究`redux`中间件的源码了：

```js
export default function applyMiddleware(...middlewares) {
  // middlewares就是我们传递给applyMiddlewarez函数的一系列中间件函数
  return (createStore) => (...args) => {
    // createStore就是redux用于创建store的方法,args === [reducers, preloadedState]。下面这句话就是在中间件的内部，使用我们传递的参数创建一个store对象
    // 注：这一块没有传递enhancer,所以返回的就是我们经常使用的store对象
    const store = createStore(...args)
    // 获取store对象的dispatch方法
    let dispatch = store.dispatch
    // 保存的是中间件函数的第二层函数
    let chain = []

    // 传递给中间件的第一层的函数的参数，
    const middlewareAPI = {
      getState: store.getState,
      // 重写了dispatch方法，其实就是store.dispatch(...args)
      dispatch: (...args) => dispatch(...args)
    }

    /** 
     * 着重给大家详细的解释一下这一块
     * 假设我们给applyMiddleware函数传递的中间件是
     * applyMiddleware(
     *      f1 => g1 => h1(...arg) => {},
     *      f2 => g2 => h2(...arg) => {}
     * )
     * 运行下面的这行代码之后，chain中保存的内容是
     * chain = [g1 => h1(...arg) => {}, g2 => h2(...arg) => {}]
     */
    
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    /**
     * 当我们把chain传入到 compose中后，根据我们对compose的分析，
     * compose(...chain)(store.dispatch)的结果就是:
     * g1(h2(...arg)) => h1(...arg)
     * 
     * 也就是说，按照上面的这个形式，下面的dispatch和h1函数是一样的，所以，h1的参数，就是我们需要派发的action，当我们调用dispatch的时候，其实就相当于调用h1(action)，而在h1的内部，这个action是由g1的参数
     * 也就是h2进行派发的，所以这个时候action就传递到了h2的内部，而h2的参数是由g2的参数，也就是实际传入的store.dispatch进行派发的，就这样层层传入，层层输出，就形成了我们强大的中间件机制。
     */
    dispatch = compose(...chain)(store.dispatch)

    // 返回的也是一个store对象
    return {
      ...store,
      // 这个dispatch其实就是，各个中间件的最底层(第三层)的哪个函数组成的圆环函数构成的
      dispatch
    }
  }
}
```

这就是对`applyMiddleware`源码的一个整体解读，水平有限，欢迎拍砖。后续的源码解读和测试例子可以关注：[redux源码解读仓库](https://github.com/SourceCooode/__redux)