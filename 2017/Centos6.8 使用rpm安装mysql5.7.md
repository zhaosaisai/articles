## Centos6.8 使用rpm安装mysql5.7
使用`mysql`也有一段时间了，最近想深入的学习一下。所以嘞，打算从头到尾把知识点好好的梳理一下。不管怎么学，先把环境搞好再说。图个方便，在虚拟机上直接使用`rpm`安装了`mysql5.7`。不难，还是有坑的，简单的记录一下吧。

### 下载`rpm`包
首先到[mysql](https://dev.mysql.com/downloads/repo/yum/)官网下载页面，根据你自己的需求，选择适合自己的版本下载。这里我下载的是`64位的mysql@5.7`。
```bash
wget https://dev.mysql.com/get/Downloads/MySQL-5.7/mysql-5.7.19-1.el6.x86_64.rpm-bundle.tar
```
### 解压
在上述压缩包所在目录执行：
```bash
tar -xvf mysql-5.7.19-1.el6.x86_64.rpm-bundle.tar
```
### mysql-server安装
直接使用下面的命令进行安装。
```bash
rpm -ivh mysql-community-server-5.7.19-1.el6.x86_64.rpm
```
所以，你可能会遇到下面的`error`：

![图片描述][1]

先看一下最后一条错误提示，很明显，就是说我们没有安装`mysql-client`。所以，先把这个小东西给安装了。同样执行上述的命令。
```bash
rpm -ivh mysql-community-client-5.7.19-1.el6.x86_64.rpm
```
对于上面的三条错误，是因为系统中缺少`numactl`。所以，先使用`yum`进行安装。
```bash
yum install -y numactl
```
安装成功之后，再执行上述的`mysql-server`安装命令。bingo：

![图片描述][2]

当你看到这些输出，说明你已经成功的安装了`mysql-server`和`mysql-client`在你的系统中。

### 登录
执行以下命令登录`mysql`：
```bash
mysql -uroot -p
```
呃呃呃呃呃呃呃，什么鬼，报错了：

![图片描述][3]

提示告诉我们说，访问被拒绝了。什么，以前不都是这样登录的吗，为啥会被拒绝。哈哈哈😄，其实啊，不同的`mysql`版本，对待首次登录的操作是不一样的。对于`mysql@5.7`来说，可以通过下面的方式看看有什么玄机。

**打开mysql的配置文件**
```bash
vim /etc/my.conf
```
在第26行的位置，有如下配置。
```bash
26 log-error=/var/log/mysqld.log
```
这行配置指定了`mysql`的标准错误输出日志文件，打开这个文件(内容可能有点多，使用如下命令打开)。
```bash
head -100 /var/log/mysqld.log
```
找到这么一句话:
```bash
A temporary password is generated for root@localhost: oggcq!hnq6Ek
```
这句话就是说，我们在安装`mysql-server`的时候，`mysql`给我们生成了一个临时的密码，这个密码就是我们首次登录的时候需要输入的密码（你的可能和这个不一样）。所以，带上这个密码登录。
```bash
mysql -uroot -p'oggcq!hnq6Ek'
```
铛铛铛铛铛，登录成功，bingo。
既然登录成功了，来，简单的操作一下。
```bash
show databases;
```
什么鬼，怎么又错了。
```bash
ERROR 1820 (HY000): You must reset your password using ALTER USER statement before executing this statement.
```

但是这个错误很好理解，就是说，我们首次登录成功之后，`mysql`会强制我们修改登录密码的。好吧，那就修改吧。

```bash
alter user 'root'@'localhost' identified by '123456';
```
修改成功之后，退出客户端，用新密码重新登录`mysql`。
```bash
mysql -uroot -p123456
```
至此，`mysql`算是成功安装到你的系统中了。好了，我还能学，继续深入`mysql`了。

  [1]: /img/bVUHGZ
  [2]: /img/bVUHHF
  [3]: /img/bVUHH5