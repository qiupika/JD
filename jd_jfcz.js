/*
见缝插针
活动地址: 京东极速版-百元生活费-玩游戏现金可提现
活动时间：
更新时间：2021-11-30
脚本兼容: QuantumultX, Surge,Loon, JSBox, Node.js
=================================Quantumultx=========================
[task_local]
#见缝插针
15 10 * * * https://raw.githubusercontent.com/jiulan/platypus/main/scripts/jd_jfcz.js, tag=见缝插针, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true
=================================Loon===================================
[Script]
cron "15 10 * * *" script-path=https://raw.githubusercontent.com/jiulan/platypus/main/scripts/jd_jfcz.js,tag=见缝插针
===================================Surge================================
见缝插针 = type=cron,cronexp="15 10 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/jiulan/platypus/main/scripts/jd_jfcz.js
====================================小火箭=============================
见缝插针 = type=cron,script-path=https://raw.githubusercontent.com/jiulan/platypus/main/scripts/jd_jfcz.js, cronexpr="15 10 * * *", timeout=3600, enable=true
 */
const $ = new Env('见缝插针');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [];
let linkId = 'DYWV0DabsUxdj2FEBIkurg';
let needleLevel = 1;
let totalLevel = 400;
let allMessage = '';
$.cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
} else {
    cookiesArr = [
        $.getdata("CookieJD"),
        $.getdata("CookieJD2"),
        ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}

!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            totalLevel = 400
            $.cookie = cookiesArr[i];
            $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = $.UserName;
            $.hotFlag = false; //是否火爆
            await TotalBean();
            console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }
            //获取下关等级
            await getNeedleLevelInfo();
            console.log('当前关卡: ',needleLevel+"/"+totalLevel)
            await $.wait(500);
            for (let i = needleLevel; i <= totalLevel; i++) {
                await getNeedleLevelInfo();
                console.log('当前关卡: ',needleLevel+"/"+totalLevel)
                if (needleLevel ==undefined){
                    console.log('关卡异常下个')
                    break
                }
                await saveNeedleLevelInfo(needleLevel);
                await $.wait(3000);
            }
            await needleMyPrize()
        }
    }
    if ($.isNode() && allMessage) {
        await notify.sendNotify(`${$.name}`, `${allMessage}`,{ url: 'https://t.me/joinchat/DrHGFt-CvcE2ZmU1' })
    }
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })

function TotalBean() {
    return new Promise(async resolve => {
        const options = {
            url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
            headers: {
                Host: "me-api.jd.com",
                Accept: "*/*",
                Connection: "keep-alive",
                Cookie: $.cookie,
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                "Accept-Language": "zh-cn",
                "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
                "Accept-Encoding": "gzip, deflate, br"
            }
        }
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    $.logErr(err)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['retcode'] === "1001") {
                            $.isLogin = false; //cookie过期
                            return;
                        }
                        if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
                            $.nickName = data.data.userInfo.baseInfo.nickname;
                        }
                    } else {
                        $.log('京东服务器返回空数据');
                    }
                }
            } catch (e) {
                $.logErr(e)
            } finally {
                resolve();
            }
        })
    })
}

/**
 * 获取奖励列表
 * @returns {Promise<unknown>}
 */
function needleMyPrize() {
    return new Promise(async resolve => {
        let body = {"linkId":linkId,"pageNum":1,"pageSize":30};

        const options = {
            url: `https://api.m.jd.com/?functionId=needleMyPrize&body=${escape(JSON.stringify(body))}&_t=${+new Date()}&appid=activities_platform&clientVersion=3.5.0`,
            headers: {
                'Origin': 'https://joypark.jd.com',
                'Cookie': $.cookie,
                'Connection': `keep-alive`,
                'Accept': `application/json, text/plain, */*`,
                'Host': `api.m.jd.com`,
                'X-Requested-With': `com.jingdong.app.mall`,
                'User-Agent':  $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                'Accept-Encoding': `gzip, deflate, br`,
                'Accept-Language': `zh-CN,zh;q=0.9,en-CN;q=0.8,en;q=0.7,zh-TW;q=0.6,en-US;q=0.5`,
                'Referer': `https://joypark.jd.com/?activityId=${linkId}&channel=wlfc&sid=a05ade6f8abfce24dbbc74fw&un_area=2`,
                'Sec-Fetch-Site': `same-site`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = $.toObj(data);
                        if (data.code === 0) {
                            for(let item of data.data.items.filter(vo => vo.needleMyPrizeItemVO.prizeType===4)){
                                if(item.needleMyPrizeItemVO.prizeStatus===0 && item.status===1){
                                    await $.wait(500);
                                    console.log(`提现${item.needleMyPrizeItemVO.prizeValue}微信现金`)
                                    await apCashWithDraw(item.needleMyPrizeItemVO.id,item.needleMyPrizeItemVO.poolBaseId,item.needleMyPrizeItemVO.prizeGroupId,item.needleMyPrizeItemVO.prizeBaseId)
                                }
                            }
                        } else {
                            console.log(`提现异常:${JSON.stringify(data)}\n`);
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

/**
 * 获取下关等级
 * @returns {Promise<unknown>}
 */
function getNeedleLevelInfo() {
    return new Promise(async resolve => {
        let body = {"linkId":linkId};

        const options = {
            url: `https://api.m.jd.com/?functionId=getNeedleLevelInfo&body=${escape(JSON.stringify(body))}&_t=${+new Date()}&appid=activities_platform&clientVersion=3.5.0`,
            headers: {
                'Origin': 'https://h5platform.jd.com',
                'Cookie': $.cookie,
                'Connection': `keep-alive`,
                'Accept': `application/json, text/plain, */*`,
                'Host': `api.m.jd.com`,
                'X-Requested-With': `com.jingdong.app.mall`,
                'User-Agent':  $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                'Accept-Encoding': `gzip, deflate, br`,
                'Accept-Language': `zh-CN,zh;q=0.9,en-CN;q=0.8,en;q=0.7,zh-TW;q=0.6,en-US;q=0.5`,
                'Referer': `https://h5platform.jd.com/swm-static/jfcz/index.html?activityId=${linkId}&channel=wlfc&sid=a05ade6f8abfce24dbbc74fw&un_area=2`,
                'Sec-Fetch-Site': `same-site`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = $.toObj(data);
                        if (data.code === 0) {
                            if (data.data.currentLevel != data.data.totalLevel){
                                needleLevel =  data.data.needleConfig.level
                                totalLevel =  data.data.totalLevel
                            }else {
                                needleLevel = undefined
                                console.log(`关卡已全部通过`)
                            }
                        } else {
                            needleLevel = undefined
                            console.log(`获取下关等级异常:${JSON.stringify(data)}\n`);
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

/**
 * 通关
 * @returns {Promise<unknown>}
 */
function saveNeedleLevelInfo(currentLevel) {
    return new Promise(async resolve => {
        let body = {"currentLevel":currentLevel,"linkId":linkId};

        const options = {
            url: `https://api.m.jd.com/?functionId=saveNeedleLevelInfo&body=${JSON.stringify(body)}&_t=${+new Date()}&appid=activities_platform&clientVersion=3.5.0`,
            headers: {
                'Origin': 'https://h5platform.jd.com',
                'Cookie': $.cookie,
                'Connection': `keep-alive`,
                'Accept': `application/json, text/plain, */*`,
                'Host': `api.m.jd.com`,
                'X-Requested-With': `com.jingdong.app.mall`,
                'User-Agent':  $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                'Accept-Encoding': `gzip, deflate, br`,
                'Accept-Language': `zh-CN,zh;q=0.9,en-CN;q=0.8,en;q=0.7,zh-TW;q=0.6,en-US;q=0.5`,
                'Referer': `https://h5platform.jd.com/swm-static/jfcz/index.html?activityId=${linkId}&channel=wlfc&sid=a05ade6f8abfce24dbbc74fw&un_area=2`,
                'Sec-Fetch-Site': `same-site`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = $.toObj(data);
                        if (data.code === 0) {
                            console.log(`关卡[${currentLevel}]通关成功\n`);
                        } else {
                            needleLevel = undefined
                            console.log(`通关异常:${JSON.stringify(data)}\n`);
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}
/**
 * 提现
 * @param id
 * @param poolBaseId
 * @param prizeGroupId
 * @param prizeBaseId
 * @returns {Promise<unknown>}
 */
function apCashWithDraw(id, poolBaseId, prizeGroupId, prizeBaseId) {
    return new Promise(resolve => {
        const body = {
            "linkId": linkId,
            "businessSource": "NONE",
            "base": {
                "prizeType": 4,
                "business": "throwNeedleGame",
                "id": id,
                "poolBaseId": poolBaseId,
                "prizeGroupId": prizeGroupId,
                "prizeBaseId": prizeBaseId
            }
        }
        const options = {
            url: `https://api.m.jd.com/`,
            body: `functionId=apCashWithDraw&body=${JSON.stringify(body)}&_t=${+new Date()}&appid=activities_platform`,
            headers: {
                'Cookie': $.cookie,
                "Host": "api.m.jd.com",
                'Origin': 'https://joypark.jd.com',
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "*/*",
                "Connection": "keep-alive",
                'User-Agent':  $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                "Accept-Language": "zh-Hans-CN;q=1, en-CN;q=0.9, zh-Hant-CN;q=0.8",
                'Referer': `https://joypark.jd.com/?activityId=${linkId}&channel=wlfc5`,
                "Accept-Encoding": "gzip, deflate, br"
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = $.toObj(data);
                        if (data.code === 0) {
                            if (data.data.status === "310") {
                                console.log(`提现成功！`)
                                allMessage += `京东账号${$.index} ${$.UserName}见缝插针成功！\n`;
                            } else {
                                console.log(`提现：失败:${JSON.stringify(data)}\n`);
                            }
                        } else {
                            console.log(`提现：异常:${JSON.stringify(data)}\n`);
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}


function safeGet(data) {
    try {
        if (typeof JSON.parse(data) == "object") {
            return true;
        }
    } catch (e) {
        console.log(e);
        console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
        return false;
    }
}


// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}
