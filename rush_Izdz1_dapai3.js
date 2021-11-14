/*
大牌联合 11.11狂欢购

https://lzdz1-isv.isvjcloud.com/dingzhi/dz/openCard/activity/8743676?activityId=8tbv4uc5g8lb34g1orei354wwky1109&shareUuid=41d55e87b91e4b61983f9c3f1691e16f

默认执行脚本。如果需要不执行
环境变量 NO_RUSH=false
*/
const $ = new Env("大牌联合 11.11狂欢购");
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
let cookiesArr = [], cookie = '', message = '';
let ownCode = null;
let isRush = true;
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
    let cookiesData = $.getdata('CookiesJD') || "[]";
    cookiesData = JSON.parse(cookiesData);
    cookiesArr = cookiesData.map(item => item.cookie);
    cookiesArr.reverse();
    cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
    cookiesArr.reverse();
    cookiesArr = cookiesArr.filter(item => !!item);
}
if (process.env.NO_RUSH && process.env.NO_RUSH != "") {
    isRush = process.env.NO_RUSH;
}
!(async () => {
    $.getAuthorCodeListerr = false
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
    
    authorCodeList = await getAuthorCodeList('https://gitee.com/fatelight/dongge/raw/master/dongge/lzdz1_dapai3.json')
    if($.getAuthorCodeListerr === true){
        authorCodeList = [
            '41d55e87b91e4b61983f9c3f1691e16f',
        ]
    }

    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i]
            originCookie = cookiesArr[i]
            newCookie = ''
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            await checkCookie();
            console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }
            $.bean = 0;
            $.ADID = getUUID('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 1);
            $.UUID = getUUID('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
            // $.authorCode = authorCodeList[random(0, authorCodeList.length)]
            $.authorCode = ownCode ? ownCode : authorCodeList[random(0, authorCodeList.length)]
            $.authorNum = `${random(1000000, 9999999)}`
            $.randomCode = random(1000000, 9999999)
            $.activityId = '8tbv4uc5g8lb34g1orei354wwky1109'
            $.activityShopId = '1000310642'
            $.activityUrl = `https://lzdz1-isv.isvjd.com/dingzhi/dz/openCard/activity/${$.authorNum}?activityId=${$.activityId}&shareUuid=${encodeURIComponent($.authorCode)}&adsource=null&shareuserid4minipg=null&shopid=${$.activityShopId}&lng=00.000000&lat=00.000000&sid=&un_area=`
            if (isRush) {
                console.log("未检测到不执行环境变量，执行任务")
                await rush();
            } else {
                console.log("检测到不执行环境变量，退出任务，环境变量 NO_RUSH")
                break
            }
            await $.wait(3000)
            if ($.bean > 0) {
                message += `\n【京东账号${$.index}】${$.nickName || $.UserName} \n       └ 获得 ${$.bean} 京豆。`
            }
        }
    }
    if (message !== '') {
        if ($.isNode()) {
            await notify.sendNotify($.name, message, '', `\n`);
        } else {
            $.msg($.name, '有点儿收获', message);
        }
    }
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })


async function rush() {
    $.token = null;
    $.secretPin = null;
    $.openCardActivityId = null
    await getFirstLZCK()
    await getToken();
    if ($.token) {
        await getMyPing();
        if ($.secretPin) {
            console.log("去助力 -> "+$.authorCode)
            await task('common/accessLogWithAD', `venderId=${$.activityShopId}&code=99&pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&pageUrl=${$.activityUrl}&subType=app&adSource=null`, 1);
            await task('wxActionCommon/getUserInfo', `pin=${encodeURIComponent($.secretPin)}`, 1)
            if ($.index === 1) {
                await task('dz/openCard/activityContent', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&pinImg=&nick=${encodeURIComponent($.pin)}&cjyxPin=&cjhyPin=&shareUuid=${encodeURIComponent($.authorCode)}`, 0, 1)
            } else {
                await task('dz/openCard/activityContent', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&pinImg=&nick=${encodeURIComponent($.pin)}&cjyxPin=&cjhyPin=&shareUuid=${encodeURIComponent($.authorCode)}`)
            }
            await task('dz/openCard/checkOpenCard', `activityId=${$.activityId}&actorUuid=${$.actorUuid}&shareUuid=${$.authorCode}&pin=${encodeURIComponent($.secretPin)}`)
            $.log("->关注店铺")
            if ($.shopTask) {
                if (!$.shopTask.allStatus) {
                    await task('dz/openCard/followShop', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&actorUuid=${encodeURIComponent($.actorUuid)}&taskType=23&taskValue=1000002520`)
                } else {
                    $.log("    >>>已经关注过了\n")
                    await $.wait(2000)
                    return
                }
            } else {
                $.log("没有获取到对应的任务。\n")
            }
            $.log("->->->> 加入店铺会员")
            if ($.openCardStatus) {
                for (let i = 0; i < ($.openCardStatus.cardList1.length + $.openCardStatus.cardList2.length); i++) {
                    $.log("模拟上报访问记录")
                    await task('crm/pageVisit/insertCrmPageVisit', `venderId=1000004065&pageId=dz20211013skcnurdk11jhdue84752hp&elementId=${encodeURIComponent(`去开卡${i}`)}&pin=${encodeURIComponent($.secretPin)}`, 1)
                    await $.wait(2000)
                }
                t1TaskList = []
                $.openCardStatus.cardList1.filter((x) => { if (x.status === 0) { t1TaskList.push(x) } })
                t2TaskList = []
                $.openCardStatus.cardList2.filter((x) => { if (x.status === 0) { t2TaskList.push(x) } })
                if (t1TaskList.length < 1) {
                    console.log("    >>>已经完成入会任务")

                } else {
                    for (const vo of t1TaskList) {
                        $.log(`    >>>去加入${vo.name}`)
                        await getShopOpenCardInfo({ "venderId": `${vo.value}`, "channel": "401" }, vo.value)
                        await bindWithVender({ "venderId": `${vo.value}`, "bindByVerifyCodeFlag": 1, "registerExtend": {}, "writeChildFlag": 0, "activityId": $.openCardActivityId, "channel": 401 }, vo.value)
                        await $.wait(2000)
                    }
                    for (const vo of t2TaskList) {
                        $.log(`    >>>${vo.name}`)
                        await getShopOpenCardInfo({ "venderId": `${vo.value}`, "channel": "401" })
                        await bindWithVender({ "venderId": `${vo.value}`, "bindByVerifyCodeFlag": 1, "registerExtend": {}, "writeChildFlag": 0, "activityId": $.openCardActivityId, "channel": 401 }, vo.value)
                        await $.wait(2000)
                    }
                }

                await task("taskact/openCardcommon/drawContent", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}`)
                await $.wait(2000)
                await task('dz/openCard/checkOpenCard', `activityId=${$.activityId}&actorUuid=${$.actorUuid}&shareUuid=${$.authorCode}&pin=${encodeURIComponent($.secretPin)}`)
                await $.wait(2000)
                await task("dz/openCard/startDraw", `activityId=${$.activityId}&actorUuid=${$.actorUuid}&type=1&pin=${encodeURIComponent($.secretPin)}`)
                await $.wait(2000)
                await task("dz/openCard/startDraw", `activityId=${$.activityId}&actorUuid=${$.actorUuid}&type=2&pin=${encodeURIComponent($.secretPin)}`)

            } else {
                $.log("没有获取到对应的任务。\n")
            }
            $.log("->->->> 加购物车")
            await task("dz/openCard/saveTask", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&actorUuid=${$.actorUuid}&type=2&taskValue=100025232454`)
        }
    }
}

function task(function_id, body, isCommon = 0, own = 0) {
    return new Promise(resolve => {
        $.post(taskUrl(function_id, body, isCommon), async (err, resp, data) => {
            try {
                if (err) {
                    $.log(err)
                } else {

                    if (data) {
                        data = JSON.parse(data);
                        if (data.result) {
                            switch (function_id) {
                                case 'wxActionCommon/getUserInfo':
                                    break;
                                case 'dz/openCard/activityContent':
                                    if (!data.data.hasEnd) {
                                        $.log(`开启【${data.data.activityName}】活动`)
                                        $.log("-------------------")
                                        if ($.index === 1) {
                                            ownCode = data.data.actorUuid
                                            console.log(ownCode)
                                        }
                  
