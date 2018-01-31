## 服务器开启80端口

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

## linux查看系统的版本

```bash
uname -a
```

## linux查看端口占用

```bash
netstat -nap | grep 80
```

## linux查看电脑打开的最大的文件数

```bash
cat /proc/sys/fs/file-max
```

## Mac命令启动mysql

```bash
mysql.server start
mysql.server stop
mysql.server restart
```

## Mac查看端口占用

- **netstat**

```bash
$linux> netstat -nap | grep 端口
$mac> netstat -na | grep 端口
```

- **lsof**

```bash
lsof -i:端口
```

## React相关

- 父组件中，可以通过`this.props.children.type`来直接访问构建子组件的类。
- 使用`async`函数，在打包的时候需要使用`babel-preset-stage-3`预设。