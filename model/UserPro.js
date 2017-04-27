'use strict';

const mongoose = require('mongoose');
//用户表
var UserProSchema = new mongoose.Schema({
  openid: {type:String, unique:true },//微信openid
  mobile: {type: Number, default:0},//手机号码
  ilTotal: {type: Number, default:0}, //会员总积分
  subscribe: Number, //用户是否订阅该公众号标识，值为0时
  nickname: String, //用户的昵称
  sex: Number, //用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
  language: String, //用户的语言，简体中文为zh_CN
  city: String, //用户所在城市
  province: String,//用户所在省份
  country: String, //用户所在国家	
  headimgurl: String, //用户头像
  subscribe_time: Number, //用户关注时间
  unionid: {type: String, default: ''}, //只有在用户将公众号绑定到微信开放平台帐号后，才会出现该字段。
  remark: String, //公众号运营者对粉丝的备注
  groupid: Number, //用户所在的分组ID
  groupTags: [String], //用户被打上的标签ID列表
  createTime: {type: Date, default: Date.now} //创建时间
});

module.exports = mongoose.model('UserPro', UserProSchema);
