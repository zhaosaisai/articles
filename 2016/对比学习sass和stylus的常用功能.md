## 对比学习sass和stylus的常用功能
在众多的`css`预处理器语言中，`sass`和`stylus`算是十分优秀的两个。本文主要针对两者的常用功能做个简单的对比分析。在对比中了解二者的差异，同时帮助大家更好的掌握这两种预处理语言。
本文涉及到的`sass`部分，均来自于[阮一峰](http://www.ruanyifeng.com/blog/)老师的[SASS用法指南](http://www.ruanyifeng.com/blog/2012/06/sass.html)
。同时不会对`sass`和`stylus`的具体用法做十分细致的介绍，感兴趣的同学可参考如下资料进行系统的学习。
> * [sass中文官网](http://sass.bootcss.com/docs/sass-reference/)
> * [sass用法指南](http://www.ruanyifeng.com/blog/2012/06/sass.html)
> * [stylus官网](http://stylus-lang.com/)
> * [stylus中文文档](http://www.zhangxinxu.com/jq/stylus/)


----------
下面就对二者的常用功能做一个简单的对比


----------
### 1、安装
`sass`时基于`Ruby`语言写的，所以安装`sass`之前，需要先安装`Ruby`。假设你已经安装了`Ruby`，在命令行直接运行。
```bash
    gem install sass
```
安装成功之后，就可以使用了。  

`stylus`是`nodejs`的一个模块，安装之前，请确保安装了`nodejs`。然后直接在命令行中运行。
```bash
    npm install stylus
```
然后，`npm`就会为你下载最新包到当前目录的`node_modules`目录中
### 2、使用
`sass`就是普通的文本文件，里面可以是`css`语法，根据后缀名的不同(`sas`s的后缀名可以是`.sass`或`.scss`)书写格式不同，具体的`sass`语法见阮一峰老师的[文章](http://www.ruanyifeng.com/blog/2012/06/sass.html)。

`stylus`也是普通的文本文件,里面也可以是`css`语法，`stylus`文件的后缀名一般是`.styl`。

两者都提供了基本的命令行语法，所以我们可以直接在命令行中使用命令对`sass`文件或者`style`文件进行编译。但相对来说`stylus`的命令行操作更为强大。

下面的命令可以直接在屏幕上显示`.scss`文件转化后的`css`代码(假设文件的名称就是*test*)
```bash
    sass test.scss
```
对应的`stylus`的操作就是:
```bash
    stylus test.styl
```
但是`stylus`的编译结果不会再屏幕上输出，而是生成同名的`css`文件。

如果要将显示结果保存成文件，`sass`需要在后面再跟一个`.css`文件名。
```bash
    sass test.scss test.css
```
`stylus`则直接如下，就生成了一个同名的文件。
```bash
    stylus test.styl
```

`sass`提供了四种编译风格:
1. `nested`：嵌套缩进的css代码，它是默认值。
2. `expanded`：没有缩进的、扩展的css代码。
3. `compact`：简洁格式的css代码。
4. `compressed`：压缩后的css代码。

`sass`的编译选项的使用,需要使用`--style`来指定:
```bash
    sass --style compressed test.sass test.css
```
`style`提供了`--compress`来压缩编译结果:
```bash
stylus --compress test.styl
```
`sass`可以监听某个文件或者目录，一旦源文件改变，就自动生成编译后的版本。
```bash
// watch a file
sass --watch input.scss:output.css
// watch a directory
sass --watch app/sass:public/stylesheets
```
`stylus`也是通过`--watch`的选项来监听源文件的变动,改变和自动编译。
```bash
stylus --watch test.styl
```
除此，`stylus`的命令行工具还提供了一些其它基本的功能:

**1. `repl`环境**
在命令行中直接输入`stylus`就得到了`stylus`的`repl`环境，我们可以直接在命令行中书写`stylus`的内容:
```stylus
    body
      color: red
```
 然后按下`ctrl+d`键，就直接在命令行中输出编译结果。

**2. stylus可以直接将css编译成stylus格式**
```bash
stylus --css test.css
```

### 3、变量
`sass`允许使用变量，所有的变量以`$`开头。
```sass
$blue: #1875e7;
div {
   color: $blue
 }
```
`stylus`也允许使用变量，变量名的`$`是可选的，变量值可以是表达式。
```css
color = blue 或者  $color = blue
div
    color: color
```
如果变量需要镶嵌在字符串中，`sass`需要写在`#{}`之中。
```css
$side: left;
.rounded {
    border-#{$side}-radius: 5px;
}
```
`stylus`则需要使用`{}`
```css
side = 5px
.roundeed 
    border-{side}-radius: 5px
```
### 4、计算功能
`sass`允许在代码中使用算式:
```css
body {
    margin: (14px/2);
    top: 50px + 100px;
    right: $var * 10%;
  }
```
`stylus`同样也支持在代码中使用算式:
```css
 body
    margin: (14px/2)
    top: 50px + 100px
    right: var * 10%
```
注意`%`也是`stylus`的一个运算符，所以上面的`right`实际的计算结果是`var * 10 % === var * 10`。

`stylus`的运算十分强大，给予了`css`的编程能力。有兴趣的同学可以张鑫旭大神翻译的[stylus文档](http://www.zhangxinxu.com/jq/stylus/)。

除此，`stylus`有一个更为强大的地方就是，`stylus`可以直接进行属性查找，使用`@`符号查找属性。如一个常见的垂直居中的例子:
```css
  div
    width: 100px
    height: 100px
    position: absolute
    top: 50%
    left: 50%
    margin-left: -(@width / 2)
    margin-top: -(@width / 2)
```
###5、嵌套
`sass`允许选择器嵌套。比如下面的`css`代码:
```css
  div h1 {
    color: red
  }
```
可以写成：
```css
div {
    h1{
      color: red
   }
 }
```
`stylus`同样支持选择器嵌套，上面的代码可以写成:
```css
div
  h1
    color: red
```
`sass`也支持属性嵌套,比如`border-color`属性可以写成:
```css
 p{
     border: {
       color: red;
     }
 }
```
`border`后面需要添加冒号。

**`stylus`对这个功能没有提供支持**

在嵌套的代码块内，两者都可以通过`&`引用父元素。比如`a:hover`伪类，可以写成:
```css
 a{
     &:hover {
         color: #ffb3ff
     }
}
```
```css
a
 &:hover
   color: #ffb3ff
```
###6、注释
`sass`提供了三种风格的注释:
* 标准的`css`注释 /\*  comment */，会保留到编译后的文件中。
* 单行注释 `// comment`，只保留在sass源文件中。编译后省略。
* 在`/*!` 后面加一个感叹号，表示这是"重要注释"。即使是压缩模式编译，也会保留这行注释，通常可以用于声明版权信息。
```css
 /*! 重要注释 */
```
`stylus`也提供了上述三种注释:
* `//` 单行注释，`css`不输出
* /*  多行注释只在compress选项未启用的时候输出到编译后的文件中 \*/
* /*! 多行注释，任何情况都输出到编译后的文件中  \*/
###7、继承
`sass`允许一个选择器，继承另一个选择器。比如，现在`class1`：
```css
.class1 {
    border: 1px solid #ddd
  }
```
`class2`要继承`class1`，就要使用`@extend`命令。
```css
.class2 {
    @extend .class1
    font-size: 120%
  }
```
`stylus`的继承方式和`sass`基本一致，但有一些稍微的不同。

`stylus`实现继承:
```css
.class1
    border: 1px solid #ddd
```
`class2`继承`class1`
```css
.class2
    @extend .class1
    font-size: 120%
```
**两者的区别主要在于`--sass`不允许`@extend`嵌套选择器:**
如下面的样式:
```css
div
  h1
   color: red
```
在`sass`中，如果按照下面这样写就会直接编译错误。
```css
 .div2 {
    @extend div h1
 }
```
而在`stylus`中却可以成功编译，因为`stylus`中，只要选择器匹配，继承就会生效。
```css
.div2
   @extend div h1
```
###8、Mixin
`sass`使用`@mixin`命令，定义一个代码块。
```css
@mixin left {
    float: left;
    margin-left: 10px;
  }
```
使用`@include`命令，调用这个`mixin`。
```css
div{
   @include left;
 }
```
`stylus`中的`mixin`和其函数的书写形式是一样的。但是应用却很大的不同！书写形式如下:
```css
left()
  float: left
  margin-left: 10px       
```
调用的时候直接通过名称调用:
```css
div
  left()
```
`sass`中的`mixin`可以传递参数，同时还可以为参数提供默认值。如下面是一个`mixin`实例，用来生成浏览器的前缀。
```css
@mixin rounded($vert, $horz, $radius: 10px){
  　border-#{$vert}-#{$horz}-radius: $radius;
　　-moz-border-radius-#{$vert}-#{$horz}: $radius;
　　-webkit-border-#{$vert}-#{$horz}-radius: $radius;
  }
```
使用的时候可以像下面这样调用:
```css
#navbar li {@include rounded(top, left)}
```
`stylus`也允许给`mixin`提供参数并提供默认值，所以上面的形式在`stylus`中的书写是这样的：
```css
rounded(vert, horz, radius = 10px)
     border-{vert}-{horz}-radius: radius
     -moz-border-radius-{vert}{horz}: radius;
　　　-webkit-border-{vert}-{horz}-radius: radius;
```
按照如下方式使用：
```css
#navbar
   li  
    rounded(top, left)
```
除此，`stylus`的`mixin`还提供了一些其他的很强大的功能: 

**1、`arguments`变量**  
这个变量更合理的解释是定义的`mixin`当作函数调用的时候(二者的定义是相同的)存在的局部变量。我们可以这样使用:
```css
radius()
   border-radius: arguments
```
调用：
```css
div
  radius(5px 10px/5px 5px)
```
**2、父级引用**
我们同样可以在`stylus`的`mixin`中使用父级引用操作符:`&`
```css
hover()
   a
     &:hover
        color: red
```
###9、颜色函数
`sass`提供了一些内置的颜色函数，以便生成系列颜色。
```css
lighten(#cc3, 10%) // #d6d65c
darken(#cc3, 10%) // #a3a329
grayscale(#cc3) // #808080
complement(#cc3) // #33c
```
在`stylus`中也提供了内置的颜色函数，使用也十分简单。如：
```css
red(#c00) //返回颜色的r色值
image-size(path) //获取指定path图片的width和height
```
更多的方法，请参考[stylus内置方法](http://www.zhangxinxu.com/jq/stylus/bifs.php)
###10、插入文件
`sass`的`@import`命令，用于插入外部的文件。
```css
 @import "path/filename.scss";
```
如果是`css`文件，则等同于`css`的`import`命令。
```css
@import "foo.css";
```
`stylus`也提供了`@import`命令用于插入外部的文件，和`sass`的用法基本一致，如下:
```css
@import "reset.css"
@import "reset.styl"
```
除了`@import`命令，`stylus`也提供了其他的几个比较实用的命令。

**1、`@media`**
工作原理和`css`中常规的媒体查询一样，实用`stylus`的书写形式:
```css
 @media print
    #header
     #footer
       display: none
```
**2、`@font-face`**
用法和常规`css`用法一致，同样使用`stylus`的格式书写:
```css
@font-face
  font-family Geo
  font-style normal
  src url(fonts/geo_sans_light/GensansLight.ttf)
```
**3、`@keyframes`**
写法和常规的`css`一致，但会默认编译成`@-webkit-keyframes`，即:
```css
@keyframes
   0%
     color: red
   100%
     color: green
```
会变编译成:
```css
@-webkit-keyframes{
   0%{
       color: red
   }
   100%{
       color: green
   }
 }
```
我们可以全局指定`vendors`变量进行标准解析:
```css
vendors = official
@keyframes
    0%
      color: red
    100%
      color: green
```
会编译成:
```css
@keyframes{
   0%{
       color: red
   }
   100%{
       color: green
   }
 }
```
###11、条件语句
`sass`中使用`@if`可以用来做判断，如下：
```css
p {
     @if 1 + 1 == 2 {border: 1px solid;}
     @if 5 < 3 {border: 2px dotted;}
 }
```
`stylus`中可以直接使用`if`关键字，级上面的写法在`stylus`中的书写方式如下：
```css
 p
     if 1 + 1 == 2
       border: 1px solid
     if 5 < 3
       border: 2px dotted
```
`sass`中也提供了`@else`关键字和`@if`搭配:
```css
@if lightness($color) > 30% {
　　background-color: #000;
} @else {
　　background-color: #fff;
}
```
`stylus`则可以直接在`if`语句后面跟上`else`语句:
```css
if red(color) > 50 {
  
 } else {
  
 }
```
除此，`stylus`也提供了`unless`关键字，同时支持条件后置语法，具体参考[stylus条件](http://www.zhangxinxu.com/jq/stylus/conditionals.php)

###12、循环语句
`sass`支持`for`循环:
```css
@for $i from 1 to 10 {
　.border-#{$i} {
　　　border: #{$i}px solid blue;
  }
}
```
也支持`while`循环:
```css
 $i: 6;
 @while $i > 0 {
　.item-#{$i} { width: 2em   $i; }
 　$i: $i - 2;
}
```
也可以使用`@each`命令进行循环:
```css
@each $member in a, b, c, d {
　.#{$member} {
  　　background-image: url("/image/#{$member}.jpg");
　　}
}
```
`stylus`只提供了一个`for/in`进行循环:
```css
for i in 1 2 3 4 5 6 7 8 9
  .border-{i}
      border: solid blue unit(i, 'px')
```
###13、自定义函数
`sass`允许用户编写自己的函数:
```css
@function double($n) {
　　@return $n * 2;
}
#sidebar {
　　width: double(5px);
}
```
`stylus`也允许用户编写自己的函数，函数的定义方式和`mixin`定义方式一样：
```css
double(n)
    n * 2
#sidebar
   width: double(5px)
```
除了可以给函数赋予默认参数之外，`stylus`的函数是允许返回多个值的：
```css
width()
   20px 10px
 
width()[0] // 20px
```
以上就是对sass和sylus常用功能的简单介绍，在对比中学习，相信读者会很快了解两者之间差异。大家只要掌握了以上提到的二者的常用功能，就能使用这两种预处理器应对日常的开发了。但这还有很多功能这里没有提到，尤其是`stylus`作为`nodejs`的一个模块，提供了强大的`javascript`编程的能力，想了解更多内容的同学可以通过以上提供的链接进行学习。