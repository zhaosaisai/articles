## 从react-start到co源码(二)
react作为当前十分流行的前端框架，相信很多前端er都有蠢蠢欲动的学习它的想法。工欲善其事，必先利其器。这篇文章就简单的给大家介绍一下如何我快速的搭建一个`react`前端开发环境。主要针对于`react`小白，大神不喜勿喷。
从标题可以看出，这里不会仅仅只介绍一下`react`的开发环境如何搭建。我将这个系列分成三篇介绍:
* 第一篇--[快速搭建一个`react`开发环境。](https://segmentfault.com/a/1190000008123927)
* 第二篇--[快速开发一个`react`开发环境脚手架工具](https://segmentfault.com/a/1190000008129293)。有了这个工具，在任何地方都能够一键生成环境。
* 第三篇--[脚手架依赖的核心库`co`的源码解析。](https://segmentfault.com/a/1190000008189685)
这三篇文章都是我在日常学习中总结出来的，文章中涉及到的所有代码可以从我的`github`--[Pavooo](https://github.com/pavoooo/template)上找到。

-----
接下来就开始介绍如何去开发一个简单的`react-start`脚手架，从而一键生成`react`开发环境。

### 目录结构
首先来看一下脚手架的目录结构，基本结构如下：
```bash
-bin
  |--reactGenerator
-commander
  |--init.js
-config.json
-package.json
```
> `bin/reactGenerator`：定义基本的命令

> `commander/init.js`：定义命令所对应的操作

> `config.json`：脚手架的一些配置文件

> `package.json`：项目的包文件

### 项目依赖
从`package.json`文件中可以看出，项目的基本依赖主要有如下几个：
```js
"dependencies": {
  "chalk": "^1.1.3",
  "co": "^4.6.0",
  "co-prompt": "^1.0.0",
  "commander": "^2.9.0",
  "ora": "^0.4.1"
}
```
> `chalk`：给命令行输出添加颜色

> `co`：执行`generator`函数

> `co-prompt`：用于命令行交互

> `commander`：定义命令行操作和执行指定的命令

> `ora`：一个很有趣的命令行`loading`动画

### 定义命令
命令的基本定义主要是在`reactGenerator`中，了解该文件之前，请确保自己对`commander`这个库有基本的了解，不了解的同学请自行前往`github`。
下面就是`reactGenerator`的完整内容：
```js
#!/usr/bin/env node

const program = require('commander')
const package = require('../package')

// 定义版本号
program.version(package.version)

// 定义使用的方法
program.usage('<command>')

// 定义脚手架的初始化工作
program
  .command('init')
  .alias('i')
  .description('generator a react project')
  .action(() => {
    require('../commander/init')()
  })

// 解析参数
program.parse(process.argv)

// 如果没有输入命令 显示帮助的内容
if (!program.args.length) {
  program.help()
}
```
在这个文件中我们只定义一个`init`操作，当我们全局安装脚手架工具的时候，我们就可以通过如下命令创建我们的项目。
```bash
react-to-start init 或者 react-to-start i
```
其中`react-to-start`是你在`package.json`的`bin`字段中指定的。
```js
"bin": {
  "react-to-start": "bin/reactGenerator"
}
```

### 初始化项目
初始化项目主要使用的是`init`命令，这个命令的基本定义如下：
```js
const co = require('co')
const chalk = require('chalk')
const prompt = require('co-prompt')
const ora = require('ora')
const fs = require('fs')
const exec = require('child_process').exec
const config = require('../config.json')

const init = () => {
  co(function* () {
    let templateName = yield prompt('what is your template name?  ')
    let projectName =  yield prompt('what is your project name?  ')
    let branchesName = config.branchesName

    if (!branchesName.includes(templateName)) {
      process.stdout.write(chalk.red(`\n ${templateName} does not exit, you can choose one of the template  listed below`))
      branchesName.forEach((name, index) => {
        process.stdout.write(chalk.green(` \n ${index + 1}. ${name} \n`))
      })
      process.exit(1)
    }

    // 如果说有对应的template 拼接git url进行下载
    let git = ''

    fs.exists('./.git', function(exists) {
      if (exists) {
        git = `git clone ${config.templateUrl} ${projectName} && cd ${projectName} && git checkout ${templateName}`
      } else {
        git = `git init && git clone ${config.templateUrl} ${projectName} && cd ${projectName} && git checkout ${templateName}`
      }

      // 使用 ora 打印出 loading + log
      let spinner = ora(`is downloading the template for ${templateName}...`)
      // 开始 loading 动画
      spinner.start()

      exec(git, (error, stdout, stderr) => {
        spinner.stop()
        if (error) {
          console.log(error)
          process.exit()
        }
        process.stdout.write(chalk.green('\n $$$ Generation completed! To use step by step as following: '))
        process.stdout.write(chalk.green(`\n 1. cd ${projectName} `))
        process.stdout.write(chalk.green(`\n 2. npm install \n`))
        process.exit(0)
      })
    })
  })
}

module.exports = init
```
这个初始化命令的定义十分简单，有点`nodejs`基础且了解`co`的同学都会很轻松的读懂，这里就不在多述(感冒好难受的说)。

### 脚手架配置
脚手架所对应的模板目录就是在上篇文章中所讲的内容，不了解的同学请戳[从react-start到co源(一)](https://segmentfault.com/a/1190000008123927)如下就是配置文件：
```js
{
  "templateUrl": "https://github.com/pavoooo/template.git",
  "branchesName": ["react"]
}
```
`templateUrl`就是模板地址(暂存在我的[github](https://github.com/pavoooo/template)上)，`branchesName`就是项目的名称，在`github`中以分支表示。

以上就是脚手架的基本架构，有点头晕，有的地方写的可能有点粗糙。有疑问的同学欢迎留言或者到我的[github](https://github.com/pavoooo/template)提`issue`。晚安。
