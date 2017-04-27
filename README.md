# update-wechat-user-to-mongodb
同步服务号关注人员列表信息保存到mongodb

#### 安装依赖
    npm i

#### 运行脚本
    npm run start

# warn

使用查看model中UserPro模型是否正确

更改 config.js 中的mongodb地址

config.js 未传到github

其中有 mongouri，tokenuri，nextopenid=null 3项内容

# tips

如果需要从某个openid开始查起，则修改 config 中的 nextopenid

脚本运行会有部分记录写入 record.log 中