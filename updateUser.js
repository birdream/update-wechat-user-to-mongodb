let { mongouri, tokenuri, nextopenid } = require('./config')
let winston = require('winston')
winston.add(winston.transports.File, { filename: 'record.log' })

let mongoose = require('mongoose')
mongoose.connect(mongouri)
mongoose.connection.on('error', function(err) {
    winston.error('MongoDB connection error: ' + err)
    process.exit(-1)
})

const rq = require('request-promise')
const _ = require('lodash')

const User = require('./model/UserPro')


~async function() {
    let TOKEN = null
    try {
        TOKEN = await rq({
            uri: tokenuri,
            json: true
        })
        winston.info('-----------getToken-------------')
    } catch (error) {
        winston.error(error.message)
        return
    }

    let token = TOKEN.accessToken

    let rquri_1 = 'https://api.weixin.qq.com/cgi-bin/user/get?access_token=' + token
    let rquri_2 = 'https://api.weixin.qq.com/cgi-bin/user/get?access_token=' + token + '&next_openid='

    // let infouri = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + token +'&openid='
    let infossUri = 'https://api.weixin.qq.com/cgi-bin/user/info/batchget?access_token=' + token

    let getOPENID = async function(nextId) {
        let rqURL = ''
        if (!nextId) rqURL = rquri_1
        else rqURL = rquri_2 + nextId

        let OPENIDS = await rq({
            uri: rqURL,
            json: true
        })
        return OPENIDS
    }

    let getInfoAndUpdate = async function(reqOpenids, next_openid, count) {
        let data = null
        try {
            data = await rq({
                    method: 'POST',
                    uri: infossUri,
                    body: { user_list: reqOpenids },
                    json: true
                })
                // winston.info('-----------getUsersData-------------')
        } catch (error) {
            winston.error(error.message)
            return
        }


        let WCUSERINFOS = data.user_info_list

        for (let i = 0, len = WCUSERINFOS.length; i < len; i++) {
            let user = null

            try {
                user = await User.findOne({ openid: WCUSERINFOS[i].openid })
            } catch (error) {
                winston.error(error.message)
                return
            }

            if (!user) {
                console.info('-----create: ' + reqOpenids[i].openid + ' -------------')
                User.create(WCUSERINFOS[i]).then((err, user) => {
                    if (err) {
                        winston.error('createERROR: ' + err.message + ' openid: ' + WCUSERINFOS[i].openid)
                    }
                })
            } else {
                console.info('----------updated----' + reqOpenids[i].openid)
                let newUser = _.mergeWith(user, WCUSERINFOS, (x, y) => {
                    if (_.isArray(x)) {
                        return y
                    }
                })
                newUser.save().then((err, data) => {
                    if (err) {
                        winston.error('updateERROR: ' + err.message + ' openid: ' + WCUSERINFOS[i].openid)
                    }
                })
            }

            if (reqOpenids[i].openid === next_openid) {
                winston.info('----------------------------------------------go---')
                main(next_openid)
            }
        }
    }

    let main = async function(nextId) {

        let rs = await getOPENID(nextId)
        if (rs.count === 0) {
            winston.info('---------allEnd-------')
            process.exit(-1)
            return
        }
        // console.log(rs)
        let next_openid = rs.next_openid
        let openids = rs.data.openid
        winston.info('------total: ' + rs.total + ' ------------')
        winston.info('------count: ' + rs.count + ' ------------')
        winston.info('------next_openid: ' + next_openid + ' ---------')
            // return 
        let reqbody = []
        for (let i = 0, len = openids.length; i < len; i++) {
            reqbody.push({
                openid: openids[i],
                lang: 'zh_CN'
            })
            if (reqbody.length === 100 || i === (len - 1)) {
                getInfoAndUpdate(reqbody, next_openid, rs.count)
                reqbody = []
            }
        }
    }

    main(nextopenid)
}()