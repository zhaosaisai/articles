## String.prototype.repeat的几种polyfill

`String.prototype.repeat`的主要作用就是重复字符串特定的次数，下面是几种`polyfill`的实现。

### 1. 利用空数组的join方法

```js
String.prototype.repeat = function(n) {
    return (new Array(n + 1)).join(this)
}
```

### 2. 省去创建数组的步骤，提升性能。

```js
String.prototype.repeat = function(n) {
    return Array.prototype.join.call({
        length: n + 1
    }, this)
}
```

### 3. 利用闭包，缓存join方法

```js
String.prototype.repeat = function(){
    const join = Array.prototype.join
    const obj = {}
    return function(n) {
        obj['length'] = n + 1
        return join.call(obj, this)
    }
}()
```

### 4. 类二分法

```js
String.prototype.repeat = function(n) {
    let r = this
    const total = []
    while(n > 0) {
        if(n % 2 === 1) {
            total[total.length] = r
        }
        if(n === 1) {
            break
        }
        r += r
        n = Math.floor(n / 2)
    }
    return total.join('')
}
```

### 5. 类二分法改进版

```js
String.prototype.repeat = function(n) {
    let r = this
    let total = ""
    while(n > 0) {
        if(n % 2 === 1) {
            total += r
        }
        if(n === 1) {
            break
        }
        r += r
        n = Math.floor(n / 2)
    }
    return total
}
```

### 6. 递归

```js
String.prototype.repeat = function(n) {
    if(n === 1) {
        return this
    }
    let s = this.repeat(Math.floor(n / 2))
    s += s
    if(n % 2) {
        s += this
    }
    return s
}
```

### 7. 另一种递归

```js
String.prototype.repeat = function(n) {
    return n <= 0 ? "" : this.concat(this.repeat(--n))
}
```