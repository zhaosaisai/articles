### 服务器开启80端口

1. ```bash
   vim /etc/sysconfig/iptables
   ```

2. 将下面这行配置添加到`22`端口的配置下面

```bash
-A INPUT -m state --state NEW -m tcp -p tcp --dport 80 -j ACCEPT     （允许80端口）
```

3. 重启

```bash
/etc/init.d/iptables restart
```

4. 启动nohup命令

```bash
nohup command > myout.file 2>&1 &
```

如：

```bash
nohup ./bin/metabase_plus -Dhttp.port=19909 > ./logs/metabase_plus.log 2>&1 &
```

### linux查看系统的版本

```bash
uname -a
```

### linux查看端口占用

```bash
netstat -nap | grep 80
```

### linux查看电脑打开的最大的文件数

```bash
cat /proc/sys/fs/file-max
```

### Mac命令启动mysql

```bash
mysql.server start
mysql.server stop
mysql.server restart
```

### Mac查看端口占用

- **netstat**

```bash
$linux> netstat -nap | grep 端口
$mac> netstat -na | grep 端口
```

- **lsof**

```bash
lsof -i:端口
```

### git添加本地文件夹作为远程仓库

本地`git`除了可以添加服务器上的`git`仓库作为远程仓库，也可以添加本地的一个文件夹作为远程仓库。比如：

```bash
git remote add origin /Users/pavoooo/Documents/Pavoooo/job/new_metabase/.git
```

### git标签

- 打标签

```bash
git tag <tagName>
git tag -a <tagName> -m "tag message"
```

- 查看标签

```bash
git tag 
git tag -l
git show <tagName>
```
- 删除标签

```bash
git tag -d <tagName>
git push origin :refs/tags/<tagName> # delete local and remote tags
```

- 远程推送

```bash
git push origin --tags
```

- 远程获取指定版本的tag内容

```bash
git fetch origin tag <tagName>
```

### python(v2)万能开头

```python
#!/usr/bin/env python
# -*- coding:utf-8 -*-
import sys
reload(sys)
sys.setdefaultencoding('utf-8')
```

### React相关

- 父组件中，可以通过`this.props.children.type`来直接访问构建子组件的类。
- 使用`async`函数，在打包的时候需要使用`babel-preset-stage-3`预设。