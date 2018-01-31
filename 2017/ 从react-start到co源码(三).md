##  从react-start到co源码(三)
react作为当前十分流行的前端框架，相信很多前端er都有蠢蠢欲动的学习它的想法。工欲善其事，必先利其器。这篇文章就简单的给大家介绍一下如何我快速的搭建一个`react`前端开发环境。主要针对于`react`小白，大神不喜勿喷。
从标题可以看出，这里不会仅仅只介绍一下`react`的开发环境如何搭建。我将这个系列分成三篇介绍:
* 第一篇--[快速搭建一个`react`开发环境。](https://segmentfault.com/a/1190000008123927)
* 第二篇--[快速开发一个`react`开发环境脚手架工具](https://segmentfault.com/a/1190000008129293)。有了这个工具，在任何地方都能够一键生成环境。
* 第三篇--[脚手架依赖的核心库`co`的源码解析。](https://segmentfault.com/a/1190000008189685)
----
该篇是这个系列文章的第三篇,主要是对`co`的源码进行分析讲解。`co`的源码十分简单,但实现的功能却是十分的强大。不了解的同学可以通过[co](https://github.com/tj/co)自行学习,也可以通过我这篇源码分析的文章进行更深入的学习。

### `co`源码概括
`co`源码主要包含了两部分：公共方法和私有方法。

**1、公共方法**
* `co`
* `co.wrap`

**2、私有方法**
* `isObject`
* `isGeneratorFunction`
* `isGenerator`
* `isPromise`
* `objectToPromise`
* `arrayToPromise`
* `thunkToPromise`
* `toPromise`

源码的阅读顺序建议先阅读`私有方法`的部分,然后在阅读`公共方法`的部分。各个部分的阅读顺序也按照上面列举的顺序进行阅读。

### `co`源码分析

```js
/**
 * slice() reference.
 */

var slice = Array.prototype.slice;

/**
 * Expose `co`.
 */

module.exports = co['default'] = co.co = co;

co.wrap = function (fn) {
  // 这个方法的主要作用就是将generator函数转化成普通的函数调用  有点类似于thunk函数的转化
  /**
   * function* a(val) {
   *   return val
   * }
   *
   * console.log(co(a,'pavoooo'))
   * console.log(co.wrap(a)('pavoooo'))  就可以这样调用了
   *  */
  createPromise.__generatorFunction__ = fn;
  return createPromise;
  function createPromise() {
    return co.call(this, fn.apply(this, arguments));
  }
};

function co(gen) {
  var ctx = this;
  var args = slice.call(arguments, 1)

  // co的调用结果是一个promise对象
  return new Promise(function(resolve, reject) {
    // 如果co的第一个参数是函数的话 就将第二个以及后续的参数传递给这个函数
    // 并将gen的调用结果赋给gen
    /**
     * co(function(){
     *    console.log(arguments)
     *  }, 1, 2, 3)
     * 不考虑下面转化的情况 这个函数运行之后 会打印出{ '0': 1, '1': 2, '2': 3 }
     * 同时gen的值就是undefined
     */
    if (typeof gen === 'function') gen = gen.apply(ctx, args);
    // 这个条件判断的就是 如果gen调用之后的返回值是undefined或者不是一个generator函数 直接将promise的状态转化成resolved
    // 同时将返回值作为resolved的状态值释放 也就是说co函数的参数应该是一个generator函数
    if (!gen || typeof gen.next !== 'function') return resolve(gen);

    // 调用onFulfilled函数--递归的调用generator函数的next方法
    onFulfilled();

    function onFulfilled(res) {
      var ret;
      try {
        // 这个语句有两重作用
        // 一、接收上一个yield返回的值
        // 二、将调用之后的遍历器赋值给ret并传递到next函数中以判断gen调用是否结束
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      // 递归的调用next 也是是递归的执行gen函数的yield语句
      next(ret);
    }

    function onRejected(err) {
      var ret;
      try {
        // 这个函数主要是当yield后的语句不符合规定的类型的时候 向外抛出一个错误
        ret = gen.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    function next(ret) {
      // 如果generator函数运行结束 直接释放结果 这个结果就是gen函数中return的结果 这就可以在外部通过then方法接收
      if (ret.done) return resolve(ret.value);
      // 否则将遍历器对应的value转化成promise
      var value = toPromise.call(ctx, ret.value);
      // 如果能够成功的转化成promise 调用then方法 将值释放出来 并将其作为onFulfilled函数的参数  而在onFulfilled函数内部  又通过
      // gen.next()接收 这样 就可以把每次gen.next().value保存在gen函数内部的变量
      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
      // 这里表示传递给co函数的generator函数的yield后的语句必须是一个function, promise, generator, array, or object
      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
        + 'but the following object was passed: "' + String(ret.value) + '"'));
    }
  });
}

function toPromise(obj) {
  // 这个函数其实是对下面几种将元素转化成promise对象的几个函数的集合  这样做就不需要在各个函数中分别判断值的类型然后
  // 调用不同的方法  统一交给这个函数根据不同的值的类型调用不同的转换函数
  // obj是假值
  if (!obj) return obj;
  // obj是promise
  if (isPromise(obj)) return obj;
  // obj是generation
  if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
  // obj是thunk函数
  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
  // obj是数组
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
  // obj是对象
  if (isObject(obj)) return objectToPromise.call(this, obj);
  // obj是普通类型的数据且为真 如字符串  数字等
  return obj;
}

function thunkToPromise(fn) {
  // thunk函数转换成promise
  // js的thunk函数就是将多参数函数转换成单参数函数的一种方式
  // 约定俗成的也是第一个参数是error对象 后续的参数是函数的返回值
  var ctx = this;
  return new Promise(function (resolve, reject) {
    fn.call(ctx, function (err, res) {
      // error不为空 直接将promise转化成rejected状态
      if (err) return reject(err);
      // 否则将函数转化成resolve状态
      if (arguments.length > 2) res = slice.call(arguments, 1);
      resolve(res);
    });
  });
}

function arrayToPromise(obj) {
  // 数组转化成promise--
  // 先将数组中的各个元素转化成promise 然后通过Promise.all进行包装  转化成一个新的promise实例并返回
  return Promise.all(obj.map(toPromise, this));
}

/**
 * 这个函数是将一个对象转换成promise对象 从isPromise函数的内部可知
 * 把对象转换成promise对象的前提就是 这个对象必须具有then方法 也是是必须是一个thenable对象
 */

function objectToPromise(obj){
  // 通过obj的constructor 创建出一个新的对象 这个对象拥有obj所有继承的属性 这样就可以在这个对象上进行转化 从而防止了更改源对象
  var results = new obj.constructor();
  //获取到obj的所有非继承属性的键组成的数组
  var keys = Object.keys(obj);
  // 定义一个promise容器  并传递给Promise.all这个方法
  var promises = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    // 根据值的类型调用对应的转换函数转换成promise对象
    var promise = toPromise.call(this, obj[key]);
    // 这个if条件中的第一个条件 是容错处理 如果isPromise用的很多的情况下  建议将这个容错处理
    // 放在isPromise函数中 转换之后的值是promise 就调用then方法  取出promise对象中返回的值  
    // 然后其设置为对应键的值
    /**
     * 也就是说 如果一个对象是如下的形式：
     * var a = {
     *    p: new Promise((resolve, reject) => {
     *       resolve(2)
     * }) 
     * }
     * 
     * 经过defer函数的转换之后a.p = 3
     */
    if (promise && isPromise(promise)) defer(promise, key);
    // 如果不是promise就直接返回对应的值
    else results[key] = obj[key];
  }
  // 通过Promise.all将多个promise实例转化成一个新的实例 并返回
  return Promise.all(promises).then(function () {
    return results;
  });

  function defer(promise, key) {
    // predefine the key in the result
    results[key] = undefined;
    promises.push(promise.then(function (res) {
      results[key] = res;
    }));
  }
}

/**
 * 判断obj是不是一个promise对象 
 * 根据promise A+的规范
 * 一个合格的promise必须是一个thenable对象也就是其必须提供一个then方法来获取值
 * 所以我们可以通过判断一个对象是否具有then方法来判断是不是promise对象 但这不是绝对准确的方法 co内部通过Promise.all这个
 * 方法对isPromise()返回true的对象进行了封装  都可以将其转化成promise对象  所以在使用的时候不需要过多的担心
 */

function isPromise(obj) {
  return 'function' == typeof obj.then;
}

function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/** 
 * 判断参数obj是不是一个generator函数
 */
function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  if (!constructor) return false;
  /**
   * 判断是不是一个generator函数
   * function* gen() {}  ====> gen.constructor.name = 'GeneratorFunction'
   * 同时这个if条件也是对以下的这种情况作的判断
   * function* gen() {}  
   * var g = gen() ====> g.constructor.name = 'GeneratorFunction'
   * 
   * displayName是一个非标准的属性 用于返回函数显示的名称 不推荐使用
   *  */
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
   /**
   * obj是通过原生的generator函数操作得出  即
   * obj = generator()
   * obj = Object.create(generator)
   * obj = Object.create(generator())
   * 
   * 上面if条件都会返回true
   * 
   * 下面的这个isGenerator函数  笔者猜测
   * 一是对原生generator函数调用之后返回的迭代器的判断
   * 而是对自定义的generator函数的判断
   * 比如这种形式的返回结果也是true
   * function A() {}
   * A.prototype.next = function() {
   *    return {
   *        value: 1,
   *        done: false
   *     }
   * }
   * Aa.prototype.throw = function() {}
   *
   * var a = new A()
   * console.log(isGeneratorFunction(a))
   *  */
  return isGenerator(constructor.prototype);
}

/**
 * 用于判断一个对象是不是纯粹的js对象
 * js中纯粹的对象一般有三种创建方式
 * var obj = {}
 * var obj = new Object
 * var obj = Object.create(Object.prototype)
 */
function isObject(val) {
  return Object == val.constructor;
}
```
以上就是对`co`源码的大致分析,不理解的或者有异议的同学欢迎留言讨论。