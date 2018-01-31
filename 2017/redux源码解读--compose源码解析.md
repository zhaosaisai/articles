## redux源码解读--compose源码解析
## compose源码解析

`compose`模块的代码十分简练，但是实现的作用却是十分强大。`redux`为何称为redux？有人说就是`reduce`和`flux`的结合体，而`reduce`正是`compose`模块的核心。

`compose`模块所实现的功能强大而简单：**从右到左,组合参数(函数)。**所以，传递给`compose`方法的参数，必须都是函数类型的(这一点，在源码中没有判断，可能是因为这个模块是redux内部使用的模块，没有对外暴露，所以不需要很强的校验。)。例如：

```js
 compose(f, g, h) ====> (...args) => f(g(h(...args)))
```

模块的代码很简单，但是涉及到的内容却很重要，下面一点一点的看。

**reduce是什么？**

`reduce`是`es5`中的数组的一个方法，对累加器和数组中的每个元素（从左到右）应用一个函数，将其减少为单个值。函数签名为：

```js
arr.reduce(callback[, initialValue])
```
**callback**是执行数组中每个元素的函数，这个函数接收几个参数：

- **accumulator**:上一次callback调用的返回值，如果是第一次调用，则这个值就是initialValue。如果没有提供initialValue则使用数组的第一个元素。
- **currentValue**: 数组正在处理的元素
- **currentIndex**: 数组正在处理的元素的当前的索引
- **array**: 调用reduce方法的数组

综上，reduce方法详细的签名就是：

```js
arr.reduce(function (accumulator, currentValue, currentIndex, array) {}[, initialValue]) 
```

**几个小Demo**

- 数组求和

```js
[1,2,3,4,5].reduce((a, b) => a + b) // 15
```

- 数组拉平

```js
[[0, 1], [2, 3], [4, 5]].reduce((a, b) => {
  return a.concat(b);
}, []);  // [ 0, 1, 2, 3, 4, 5 ]
```

> 关于reduce详细的文档可以参考[Array.prototype.reduce](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)

明白了`reduce`是怎么回事之后，我们先来看一下`compose`有什么神奇的效果：

```js
import compose from '../src/compose'

// function f
const f = (arg) => `函数f(${arg})` 

// function g
const g = (arg) => `函数g(${arg})`

// function h 最后一个函数可以接受多个参数
const h = (...arg) => `函数h(${arg.join('_')})`

const r = compose(f, g, h)

console.log(typeof r) // function

console.log(r(1,2,3)) //函数f(函数g(函数h(1_2_3)))
```

从上面可以的代码可以看出：**compose的运行结果是一个函数，调用这个函数所传递的参数将会作为compose最后一个参数的参数，从而像'洋葱圈'似的，由内向外，逐步调用。**

![图片描述][1]

*源码*
```js
export default function compose(...funcs) {
  // funcs是一个保存着所有参数函数的数组
  // 如果没有传递任何参数，就返回一个函数，这个函数是输入什么得到什么。
  if (funcs.length === 0) {
    return arg => arg
  }
  // 只传递一个参数的时候，就直接把这个函数返回
  if (funcs.length === 1) {
    return funcs[0]
  }
  // 返回组合函数
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```

这就是对`compose`源码的一个整体解读，水平有限，欢迎拍砖。后续的源码解读和测试例子可以关注：[redux源码解读仓库](https://github.com/SourceCooode/__redux)


  [1]: /img/bVX1BG