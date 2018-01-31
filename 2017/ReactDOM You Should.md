## ReactDOM You Should
在`react`的组件的开发过程中，一般来说，我们并不会真正的去操作`dom`。只有在顶层组件的渲染的过程中，我们借助`ReactDOM.render()`方法，将我们的应用渲染到`html`结构中。然而，由于`react`框架自身的限制，在某些特定的情况下，我们必须要手动的操作`dom`。这时，我们就需要使用`ReactDOM`了。

先说一个小事，在`react 0.14`版本的时候，`ReactDOM`就从`react`的核心库中分离出来了。所以，根据你使用的`react`版本的不同，我们引入`ReactDOM`的方式也就不一样。总而言之，也就下面两种基本的方法。

> 以下所有的代码，都会通过`EcmaScript6`进行编写

**React < 0.14之前的版本**

```js
import React, { ReactDOM } from 'react'
```

**React >= 0.14之后的版本**

```bash
yarn add react-dom
```

```js
import ReactDOM from 'react-dom'
```

### ReactDOM的API

`ReactDOM`给我们提供了仅仅三个`api`。所以相对来说学习起来还是比较简单的。

这三个`api` 如下：

- `ReactDOM.findDOMNode`
- `ReactDOM.unmountComponentAtNode`
- `ReactDOM.render`

下面，我们就简单的扯扯，这三个`api`我们应该怎么使用。

### `ReactDOM.findDOMNode`

在絮叨这个api之前啊，先扯两个你应该知道的东西。

Q：`DOM`被真正添加到`HTML`中是什么时候？

A：生命周期方法`componentDidMount`和`componentDidUpdate`

Q：还有没有其他获取`DOM`的方法

A：有，比如`this.refs`。

说这干啥，就是为了告诉你应该什么时候去获取`DOM`。不要以为在任何地方都能获取，否则更多等待你的就是`error * 3`。

好了，下面我们就好好扯扯`findDOMNode`该怎么用。

先看一下接口定义：

```js
DOMElement findDOMNode(ReactComponent)
```

简单的说就是：给它一点绿荫(`ReactComponent`)，还你一片森林(`DOM Tree`)。

![图片描述][1]

比如，下面这个小demo，在组件加载完成的时候，获取真正的`dom`结构。

```jsx
import React from 'react';
import {findDOMNode, render} from 'react-dom';

class App extends React.Component {
    constructor(props) {
        super(props)
        console.info('GET DOM IN %c constructor', 'color:red')
        console.log(findDOMNode(this))
    }

    componentWillMount() {
        console.info('GET DOM IN %c componentWillMount', 'color:red')
        console.log(findDOMNode(this))
    }

    componentDidMount() {
        console.info('GET DOM IN %c componentDidMount', 'color:red')
        console.log(findDOMNode(this))
    }

    render() {
        return (
            <div className="container">
                <header className="headers">
                    <div className="menu">The menu</div>
                    <div className="information">The person information</div>
                </header>
                <div className="wrapper">
                    The content wrapper
                </div>
                <footer className="footer">
                    The footer
                </footer>
            </div>
        )
    }
}

render(<App />, document.getElementById('root'));
```

哎呀，惨不忍睹。

![图片描述][2]

所以，把`constructor`的`findDOMNode`操作去掉，你会看到：

![图片描述][3]

可以看出，在`componentWillMount`中`findDOMNode`的操作结果是`null`。

但是，你会不会想，不是吧，返回`null`不能完全说明我没获取到元素啊。的确，比如：

```js
import React from 'react';
import {findDOMNode, render} from 'react-dom';

class App extends React.Component {
    constructor(props) {
        super(props)
        // console.info('GET DOM IN %c constructor', 'color:red')
        // console.log(findDOMNode(this))
    }

    componentWillMount() {
        console.info('GET DOM IN %c componentWillMount', 'color:red')
        console.log(findDOMNode(this))
    }

    componentDidMount() {
        console.info('GET DOM IN %c componentDidMount', 'color:red')
        console.log(findDOMNode(this))
    }

    render() {
        return null
    }
}

render(<App />, document.getElementById('root'));
```

如你所愿，`findDOMNode`的操作结果都是`null`。但是，对比之中你应该清楚两件事。

![图片描述][4]

1. 并不是组件中的任何地方都能够使用`findDOMNode`获取`DOM`结构，`findDOMNode`只对挂载后的组件生效。
2. 如果组件的`render`函数返回`null`，则在任何地方使用`findDOMNode`的结果都是null。

**ReactDOM.findDOMNode with ref**

先扯两句`ref`。`ref`－－组件的一个特殊属性，接受一个回调函数作为参数。两种情况：

- 给原生的`html`结构添加`ref`属性，其参数就是其对应的`DOM`元素。这时候，直接使用即可。
- 给`class`声明的组件添加`ref`属性的时候，参数则是这个已经加载完成的`react`组件。这时候，就可以和`findDOMNode`来个亲密碰撞了。

如下面的操作：

```jsx
import React from 'react';
import {findDOMNode, render} from 'react-dom';

class FieldInput extends React.Component {
    render() {
        return <input type="text" />
    }
}

class App extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        console.info('The value of %c this.input', 'color:red')
        console.log(this.input)
        console.info('The value of %c findDOMNode(this.input)', 'color:red')
        console.log(findDOMNode(this.input))
    }

    render() {
        return <FieldInput 
            ref={(input) => { this.input = input }}
        />
    }
}

render(<App />, document.getElementById('root'));

```

结果，就是你想的那样美好。

![图片描述][5]


> 最后呢，记住一句话，`findDOMNode`不能用在函数式组件中哦

### `ReactDOM.unmountComponentAtNode`

来先把接口的名称拆分一下：

unmount: 卸载

component: 组件

at: 在

node: 节点(DOM元素)

意思就是，从`DOM`元素中卸载已经挂载的组件，除此呢，还会清除它的事件处理器和state。来，看下面的代码：

```js
import React, { Component } from 'react';
import {findDOMNode, render, unmountComponentAtNode} from 'react-dom';

class FieldOne extends Component {
    componentWillUnmount() {
        console.log('%c FieldOne will unmount')
    }
    render() {
        return <div>The One</div>
    }
}

class FieldTwo extends Component {
    componentWillUnmount() {
        console.log('%c FieldTwo will unmount')
    }
    render() {
        return <div>The Two</div>
    }
}


class App extends Component {
    constructor(props) {
        super(props)
    }
    componentDidMount() {
        render(<FieldOne />, this.fieldOne)
    }
    handleClick() {
        console.log(unmountComponentAtNode(this.fieldOne))
        console.log(unmountComponentAtNode(this.fieldTwo))
    }
    render() {
        return (
            <div className="container">
                <div>
                    <button onClick={this.handleClick.bind(this)}>REMOVE COMPONENT</button>
                </div>
               <div ref={fieldOne => this.fieldOne = fieldOne}></div>
               <div ref={fieldTwo => this.fieldTwo = fieldTwo}>
                    <FieldTwo />
               </div>
            </div>
        )
    }
}

render(<App />, document.getElementById('root'))
```

简单的分析这段代码之前，先扯一个小的问题。`react`中的组件渲染有几种方式？一般来说，两种：

- 通过下面`render`函数，将组件渲染到`DOM`结构中。
- 由`React`自身渲染

这两种渲染方式，分别对应于上述代码中的`FieldOne`和`FieldTwo`组件的渲染方式。所以，你必须先搞明白一件事情，**`unmountComponentAtNode`并不能卸载所有已经挂载到`DOM`中的组件，它只能卸载通过`render`函数渲染的组件。**

所以，当我们点击`button`按钮的时候，会在控制台中看到，下面这些东西。

![图片描述][6]

其中，当`unmountComponentAtNode`的返回值为`true`的时候，表示卸载成功。反之，则表示卸载失败。
下面是点击按钮之前的`DOM`结构的对比情况。
**点击前**

![图片描述][7]

**点击后**

![图片描述][8]

### `ReactDOM.render`

`react`最让人爽的地方就是，接口名称的语意化很明显。所以，从字面意义上我们就能知道`render`是干啥的。干啥？用于渲染。

先简单的了解下接口定义。

```js
ReactDOM.render(
	ReactComponent,
  	DOMElement,
  	[callback]
)
```

一句话概括：

- 渲染一个`ReactComponent`，将其作为`DOMElement`的`innerHTML`。

记住两件事：

- 这个方法只会进行一次整体更新
- 第一次渲染后，会将`DOMElement`的`innerHTML`用`ReactComponent`的实例所替换，之后的渲染，便采用高效的`diff`算法进行更新。

几个问题：

- 这个方法是同步的还是异步的？
- 这个方法有没有返回值？
- `callback`函数，有参数吗？

来一起扯扯：

先看这个代码:

```jsx
import React from 'react';
import {findDOMNode, render} from 'react-dom';

// 函数式组件一
const FieldInput = (props) => {
    return (
        <div className="field-input">
            <input type="text"/>
        </div>
    )
}

class App extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div className="container">
                <header className="header">The header</header>
                <FieldInput />
            </div>
        )
    }
}

console.log('%c begin render', 'color:red')

const baseComponent = render(<App />, document.getElementById('root'))
console.log(baseComponent)

console.log('%c end render', 'color:red')
```

结果呢，是这样的。不错，同步调用的。而且返回值就是我们的根组件的实例。

挺好的，可是，官方有声明：

![图片描述][9]

所以嘞，我们应该避免使用这种方式获取根组件实例(一般也不会采用这种方法操作根组件实例，只需要知道有这么回事就好了)。

再看一下这段代码：

```js
import React from 'react';
import {findDOMNode, render} from 'react-dom';

class App extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div className="container">
               test
            </div>
        )
    }
}

render(<App />, document.getElementById('root'), (...args) => {
    console.log(args)  // []
})
```

 这个回调函数其实是没有参数的，但是，当`render`方法变成异步方法之后，说不定就会向其注入一些参数了。具体的，拭目以待。


  [1]: /img/bVUek1
  [2]: /img/bVUelb
  [3]: /img/bVUelj
  [4]: /img/bVUelA
  [5]: /img/bVUelC
  [6]: /img/bVUelP
  [7]: /img/bVUemu
  [8]: /img/bVUemA
  [9]: /img/bVUemO