## redux源码解读－－createStore源码解析

## createStore源码解析

`createStore`是`redux`最核心的模块。这个模块就是用于创建一个`store`对象，同时，对外暴露出`dispatch`,`getState`,`subscribe`和`replaceReducer`方法。(源码中关于`observable`的部分可以忽略，这个是`redux`内部使用的。我们在开发中几乎几乎用不到)

先看一下这个模块的基本结构：

![图片描述][1]


**依赖**

- `lodash/isPlainObject`
- `symbol-observable`

**对外输出**

- `dispatch`
- `getState`
- `subscribe`
- `replaceReducer`
- `[$$observable]`(几乎不用)

> redux源码中使用的`lodash/isPlainObject`依赖。在`IE6-8`中性能很差，其实现方式和`jQuery3.x`的实现相似，在旧版本的`IE`中支持不了。最后会和大家一起探讨。

*源码注释*

```javascript
// 判断是不是纯粹对象的模块({})
import isPlainObject from 'lodash/isPlainObject'
// 引入observable支持
import $$observable from 'symbol-observable'
```

```javascript
export const ActionTypes = {
  INIT: '@@redux/INIT'
}
```

上面这个是`redux`内部使用的一个`action`。主要用于内部测试和渲染初始的state。记住，我们自己编写`action`的时候，`action.type`不能为`@@redux/INIT`。因为，这个action会在`redux`的内部自动调用。比如，下面的捣蛋代码：

```js
import {createStore, combineReducers, applyMiddleware} from '../src'
import logger from 'redux-logger'

const actionTypes = '@@redux/INIT'
const reducers = (state = {}, action) => {
  switch(action.type) {
    case actionTypes:
      console.log('hello @@redux/INIT')
      return {
        'type': actionTypes
      }
    default:
      return state
  }
}
const store = createStore(reducers, applyMiddleware(logger))
console.log('*************************************')
console.log(store.getState()) //会渲染为 {'type': '@@redux/INIT'}
console.log('*************************************')
```

下面就是`createStore`方法的实现：

```js
export default function createStore(reducer, preloadedState, enhancer){
  //...初始条件的判断和设定
  function getState() {
    // getState方法的实现
  }
  function subscribe() {
    // subscribe方法的实现
  }
  function dispatch() {
    // dispatch方法的实现
  }
  function replaceReducer() {
    // replaceReducer方法的实现
  }
  function observable() {
    // observable方法的实现
  }
  // store被创建后，自动分发一个'INIT' action。渲染出初始化的state树。
  dispatch({ type: ActionTypes.INIT })
}
```

下面就来一点点分析每一行代码到底做什么：

```js
if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
  enhancer = preloadedState
  preloadedState = undefined
}
```

在调用`createStore`的方法的时候，可以传递三个参数`createStore(reducer, preloadedState, enhancer)`。其中,各参数属性如下：

- `reducer`必需参数，`function`类型
- `preloadedState`可选参数，`object`类型
- `enhancer`可选参数，`function`类型

在平常的使用中，我们一般会省略第二个参数。比如，当我们需要使用`redux中间件的时候`，就会像第三个参数传递一个`applyMiddleware()`[返回值是一个`function`]。如果，我们没有初始状态，则会省略第二个参数。这个时候，我们的函数调用形式为：

```js
const store = createStore(reducer, applyMiddleware(...))
```

这个时候就会执行上面源码中的代码，使函数调用满足最基本的形式调用。也就是函数在传递两个或者三个参数的情况下，其内部处理逻辑都是一样的。

```js
// 如果我们指定了reducer增强器enhancer
if (typeof enhancer !== 'undefined') {
  // enhancer必须是一个函数
  if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
	// 这个函数接收createStore作为参数，并且返回一个函数，这个函数接收的参数是reducer,preloadedState
    // 直接返回经过enhancer包装的对象
    return enhancer(createStore)(reducer, preloadedState)
  }
```

*想更好的理解这段代码，可以参考applyMiddleware内部的实现。*

```js
// 要求传递给createStore的第一个参数必须是一个函数
if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
 }
```

```js
// 保存初始的reducer
let currentReducer = reducer
// 保存初始的state
let currentState = preloadedState
// 保存所有的事件监听器
let currentListeners = []
// 获取当前监听器的一个副本(相同的引用)
let nextListeners = currentListeners
// 是否正在派发action
let isDispatching = false

function ensureCanMutateNextListeners() {
  // 如果nextListeners和currentListeners具有相同的引用，则获取一份当前事件监听器集合的一个副本保存到nextListeners中
  if (nextListeners === currentListeners) {
    nextListeners = currentListeners.slice()
  }
}
```
上面就是`createStore`方法中的一些初始参数，这里有一个地方值得思考：**为什么要维护两份事件监听器列表(nextListeners,currentListeners)?**。下面，我们会解释。

```js
// 直接返回当前store的state
function getState() {
  return currentState
}
```

```js
  function subscribe(listener) {
    // 事件监听器必须是函数，否则会抛出异常
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }
    // 这个事件监听器是否已经被取消的标志(个人感觉：这个初始值应该被设置为false，语意化更好一些。)
    let isSubscribed = true
    // 调用这个函数的结果就是生成一份当前事件监听器的一个副本保存到nextListeners中
    ensureCanMutateNextListeners()
    // 将新的事件监听器添加到nextListeners中
    nextListeners.push(listener)
	
    // 返回一个取消监听的函数
    return function unsubscribe() {
      // 如果这个监听器已经被取消了，则直接return
      if (!isSubscribed) {
        return
      }
      // 将监听器是否取消的标志设置为false
      isSubscribed = false
      // 再次生成一份事件监听器集合的副本
      ensureCanMutateNextListeners()
      // 获取到需要取消的事件监听器的索引
      const index = nextListeners.indexOf(listener)
      // 从事件监听器集合中删除这个事件监听器
      nextListeners.splice(index, 1)
    }
  }
```

从`subscribe`方法的源码中可以看出，每次在进行监听器的`添加/删除`之前，都会基于当前的监听器集合生成一个副本保存到`nextListeners`中。这个时候还是不能准确的回答上面的问题，下面我们继续研究`dispatch`的源码:

```js
function dispatch(action) {
    // dispatch的参数就是我们需要派发的action，一定要保证这个action是一个纯粹的对象
    // 如果不是一个纯粹的对象，则会抛出异常。
    if (!isPlainObject(action)) {
      // 这个方法有坑，在低版本的IE浏览器中性能很差，最后我们会研究这个方法的源码。
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      )
    }

    // 所派发的action必须有一个type属性(我们可以将这个属性认为就是action的身份证，这样redux才知道你派发的是哪个action，你需要做什么，该怎么为你做)
    // 如果没有这个属性则会抛出异常
    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      )
    }
	
    // 如果redux正在派发action，则抛出异常？什么时候会出现这种情况？？？
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true
      // 派发action
      // 实质就是将当前的state和你需要派发的action传递给reducer函数病返回一个新的state
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    // 这一块也是一个十分关键的地方，哈哈哈哈哈，又多了一份事件监听器的列表，简单的说一下这三份列表的作用
  	// nextListeners: 保存这次dispatch后，需要触发的所有事件监听器的列表
    // currentListeners: 保存一份nextListeners列表的副本
  	// listeners: 需要执行的列表
    const listeners = currentListeners = nextListeners
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
	  // 调用所有的事件监听器
      listener()
    }
	//  dispatch的返回值也是十分重要的，如果没有这个返回值，就不可能引入强大的中间件机制。
    return action
  }
```

到这里，我们就可以回答这个问题了：**为什么要维护两份事件监听器列表(nextListeners,currentListeners)?**

首先，我们必须要知道的事情就是：我们的监听器在什么时候会执行？在我们的调用dispatch派发action之后。ok，看下面的这个图：

![图片描述][2]


这个图表示，当`dispatch`方法执行到这行代码的时候，`listeners`，`currentListeners`，`nextListeners`这三个变量引用内存中的同一份数组，只要其中一个发生变化，另外两个立马改变。和下面的这个例子一样的含义：

![图片描述][3]

所以，在这种情况下。**如果我在某个事件监听器函数中调用了取消了某个监听器，那么在这次dispatch后，被取消的这个事件监听器就不会被执行了（？？？？？是吗？？？？）。**

```js
import {createStore, combineReducers, applyMiddleware} from '../src'
import logger from 'redux-logger'

const actionTypes = '@@redux/INIT'
const reducers = (state = {}, action) => {
  switch(action.type) {
    case actionTypes:
      return {
        'type': actionTypes
      }
    default:
      return state
  }
}
const store = createStore(reducers, applyMiddleware(logger))

const listener1 = store.subscribe(() => {
    console.log('listener1')
})


const listener2 = store.subscribe(() => {
    // 取消listener3
    listener3()
    console.log('listener2')
})


const listener3 = store.subscribe(() => {
    console.log('listener3')
})

store.dispatch({type: actionTypes})
```

结果是：

```js
listener1
listener2
listener3
```

结果，就是：**即使你在某个事件监听器中，取消了其它的事件监听器，那么被取消的这个事件监听器，在这次dispatch后仍然会执行**。也就是说。**redux会保证在某个dispatch后，会保证在这个dispatch之前的所有事件监听器全部执行。**

这是个bug还是个feature。无从而知，但是从redux源码中，可以知道，这是一个bug。所以，redux作者就利用上面的方法很巧妙的避免了这种情况。其实实现的方法很简单：**切断nextListeners和currentListener,listeners相同的引用关系**。


![图片描述][4]


下面接着扯：

```js
// 提换reducer的方法。(动态加载reducers的时候才用)
function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    currentReducer = nextReducer
    // 替换结束后，重新初始化
    dispatch({ type: ActionTypes.INIT })
  }
```

```js
// 触发预设action，主要就是为了生成初始的state tree的结构
dispatch({ type: ActionTypes.INIT })
```

```js
// 这就很熟悉了吧
return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
  	// 尼玛 忽略这个
    [$$observable]: observable
  }
```

这就是对`createStore`源码的一个整体解读，水平有限，欢迎拍砖。后续的源码解读和测试例子可以关注：[redux源码解读仓库](https://github.com/SourceCooode/__redux)


  [1]: /img/bVXO16
  [2]: /img/bVXO2h
  [3]: /img/bVXO2o
  [4]: /img/bVXO2w