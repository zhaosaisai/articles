## web Notification接口的简单的封装--nf.js
   花了两个小时重温了一下html5的Web Notification接口，虽然简单，但我觉得还应该有更方便的使用方式，所以就对这个API的接口进行了简单的封装。源码放在了我的github上。加上注释也就90行，想看源码的同学请移步[seeyou404--nf.js](https://github.com/seeyou404/nf.js)。以下就是对这个小库的功能的一个简单的介绍。
## 基本使用

```javascript
  import NF from './nf';
  
  //创建一个实例对象
  const nf = new NF()
  //或者传入一个配置选项信息：options应该是一个对象
  const nf = new NF(options);
```

> 利用上面的方法就能创建了一个Notification通知窗口

## options选项

>options选项是Notification的基本配置选项，除了我们常规使用的一些选项外，我们还可以在这里面指定事件处理程序函数

```javascript
  {
    'title': "字符串， 弹窗的标题。默认是我的github名称：'seeyou404'",
    
    'body': "字符串，弹窗的提示信息。默认是我的github地址：'https://github.com/seeyou404'",
    
    'icon': "字符串，弹窗显示的图片的路径。默认是我的github头像：'https://avatars2.githubusercontent.com/u/12776545?v=3&s=466'",
    
    'tag': "字符串，当前弹窗的标识符。避免显示多个弹窗",
    
    'silent': "布尔值，弹窗出现的时候是否需要声音，不能和vibrate共存",
    
    'sound': "指定弹窗出现的时候的音频地址",
    
    'vibrate': "设置振动模式",
    
    'renotify': "布尔值，新弹窗出现的时候是否需要覆盖之前的，必须和tag参数共存",
    
    'click': "function 弹窗点击时候的事件监听器",
    
    'close': "function 弹窗关闭时候的事件监听器",
    
    'show': "function 弹窗出现时候的事件监听器",
    
    'error': "function 弹窗出现错误时候的事件监听器"
  }
```

## methods
NF的实例主要有五个基本的方法:
### click([callback])
添加点击事件，callback的默认值是options.click方法
```javascript
const nf = new NF();
nf.click();
或者
nf.click(() => {
  alert('clicked');
})
```

### show([callback])
添加show事件，callback的默认值是options.show方法
```javascript
const nf = new NF();
nf.show();
或者
nf.show(() => {
  alert('showed');
})
```

### close([callback])
添加点击事件，callback的默认值是options.close方法
```javascript
const nf = new NF();
nf.close();
或者
nf.close(() => {
  alert('closed');
})
```

### error([callback])
添加点击事件，callback的默认值是options.error方法
```javascript
const nf = new NF();
nf.error();
或者
nf.error(() => {
  alert('errored');
})
```

### shut()
关闭弹窗
```javascript
const nf = new NF();
nf.shut();
```

## 综述
上面的四个事件处理程序支持链式调用，同时，我们也应该知道，为添加事件处理程序有两种基本形式：在options中声明事件处理函数和显示调用事件处理方法。所以我们可以像下面这样使用。

```javascript
const nf = new NF({
  title: '你的标题',
  body: '你的内容',
  icon: '你的icon图片',
  click(){
    alert('clicked');
  },
  show(){
    alert('showd')
  },
  close(){
    alert('closeed');
  },
  error(){
    alert('errored');
  }
})
//声明的时候就指定了事件处理程序

//也可以这样使用
nf.show().click(function(){alert('你怎么又弹出来了')}).close();
```
