"""
const $ = new Env("京东饭粒");
京东饭粒任务
活动入口：https://u.jd.com/ytWx4w0
每天60豆小毛，爱要不要

cron:
46 9 * * * jd_fanli.py
"""


import os
import time
import re
import requests
import random

proxies = {"http": None, "https": None}


def randomstr(num):
    randomstr = ""
    for i in range(num):
        randomstr = randomstr + random.choice("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
    return randomstr


def randomstr1():
    randomstr = ""
    for i in range(16):
        randomstr = randomstr + random.choice("0123456789")
    randomstr += "-"
    for i in range(16):
        randomstr = randomstr + random.choice("0123456789")
    return randomstr


def getheader(ck):
    return {
        "Host": "ifanli.m.jd.com",
        "Connection": "keep-alive",
        "Accept": "application/json, text/plain, */*",
        "Cache-Control": "no-cache",
        "User-Agent": "jdapp;android;10.2.2;11;%s;model/Mi 10;osVer/30;appBuild/91077;partner/xiaomi001;eufv/1;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 11; Mi 10 Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045715 Mobile Safari/537.36" % randomstr1(),
        "Sec-Fetch-Mode": "cors",
        "X-Requested-With": "com.jingdong.app.mall",
        "Sec-Fetch-Site": "same-origin",
        "Referer": "https://ifanli.m.jd.com/rebate/earnBean.html?paltform=null",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cookie": ck,
        "Content-Type": "application/json;charset=UTF-8"
    }


def getTaskList(ck):
    url = "https://ifanli.m.jd.com/rebateapi/task/getTaskList"
    headers = getheader(ck)
    r = requests.get(url, headers=headers, proxies=proxies)
    # print(r.text)
    return r.json()["content"]


def getTaskFinishCount(ck):
    url = "https://ifanli.m.jd.com/rebateapi/task/getTaskFinishCount"
    headers = getheader(ck)
    r = requests.get(url, headers=headers, proxies=proxies)
    print('已完成任务次数：', r.json()["content"]["finishCount"], '总任务次数：', r.json()["content"]["maxTaskCount"])
    return r.json()["content"]


def saveTaskRecord(ck, taskId):
    url = "https://ifanli.m.jd.com/rebateapi/task/saveTaskRecord"
    headers = getheader(ck)
    data = '{"taskId":%s,"taskType":4}' % taskId
    r = requests.post(url, headers=headers, data=data, proxies=proxies)
    # print(r.text)
    return r.json()["content"]["uid"], r.json()["content"]["tt"]


def saveTaskRecord1(ck, taskId, uid, tt):
    # tt=int(time.time()*1000)
    url = "https://ifanli.m.jd.com/rebateapi/task/saveTaskRecord"
    headers = getheader(ck)
    data = '{"taskId":%s,"taskType":4,"uid":"%s","tt":%s}' % (taskId, uid, tt)
    # print(data)
    r = requests.post(url, headers=headers, data=data, proxies=proxies)
    print(r.json()["content"]["msg"])


 # 适配各种平台环境ck
    def getckfile(self):
        global v4f
        curf = pwd + 'JDCookies.txt'
        v4f = '/jd/config/config.sh'
        ql_new = '/ql/config/env.sh'
        ql_old = '/ql/config/cookie.sh'
        if os.path.exists(curf):
            with open(curf, "r", encoding="utf-8") as f:
                cks = f.read()
                f.close()
            r = re.compile(r"pt_key=.*?pt_pin=.*?;", re.M | re.S | re.I)
            cks = r.findall(cks)
            if len(cks) > 0:
                return curf
            else:
                pass
        if os.path.exists(ql_new):
            print("当前环境青龙面板新版")
            return ql_new
        elif os.path.exists(ql_old):
            print("当前环境青龙面板旧版")
            return ql_old
        elif os.path.exists(v4f):
            print("当前环境V4")
            return v4f
        return curf

    # 获取cookie
    def getCookie(self):
        global cookies
        ckfile = self.getckfile()
        try:
            if os.path.exists(ckfile):
                with open(ckfile, "r", encoding="utf-8") as f:
                    cks = f.read()
                    f.close()
                if 'pt_key=' in cks and 'pt_pin=' in cks:
                    r = re.compile(r"pt_key=.*?pt_pin=.*?;", re.M | re.S | re.I)
                    cks = r.findall(cks)
                    if len(cks) > 0:
                        if 'JDCookies.txt' in ckfile:
                            print("当前获取使用 JDCookies.txt 的cookie")
                        cookies = ''
                        for i in cks:
                            if 'pt_key=xxxx' in i:
                                pass
                            else:
                                cookies += i
                        return
            else:
                with open(pwd + 'JDCookies.txt', "w", encoding="utf-8") as f:
                    cks = "#多账号换行，以下示例：（通过正则获取此文件的ck，理论上可以自定义名字标记ck，也可以随意摆放ck）\n账号1【Curtinlv】cookie1;\n账号2【TopStyle】cookie2;"
                    f.write(cks)
                    f.close()
            if "JD_COOKIE" in os.environ:
                if len(os.environ["JD_COOKIE"]) > 10:
                    cookies = os.environ["JD_COOKIE"]
                    print("已获取并使用Env环境 Cookie")
        except Exception as e:
            print(f"【getCookie Error】{e}")

        # 检测cookie格式是否正确

    def getUserInfo(self, ck, pinName, userNum):
        url = 'https://me-api.jd.com/user_new/info/GetJDUserInfoUnion?orgFlag=JD_PinGou_New&callSource=mainorder&channel=4&isHomewhite=0&sceneval=2&sceneval=2&callback='
        headers = {
            'Cookie': ck,
            'Accept': '*/*',
            'Connection': 'keep-alive',
            'Referer': 'https://home.m.jd.com/myJd/home.action',
            'Accept-Encoding': 'gzip, deflate, br',
            'Host': 'me-api.jd.com',
            'User-Agent': f'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1',
            'Accept-Language': 'zh-cn'
        }
        try:
            if sys.platform == 'ios':
                requests.packages.urllib3.disable_warnings()
                resp = requests.get(url=url, verify=False, headers=headers, timeout=60).json()
            else:
                resp = requests.get(url=url, headers=headers, timeout=60).json()
            if resp['retcode'] == "0":
                nickname = resp['data']['userInfo']['baseInfo']['nickname']
                return ck, nickname
            else:
                context = f"账号{userNum}【{pinName}】Cookie 已失效！请重新获取。"
                print(context)
                return ck, False
        except Exception:
            context = f"账号{userNum}【{pinName}】Cookie 已失效！请重新获取。"
            print(context)
            return ck, False

    def iscookie(self):
        """
        :return: cookiesList,userNameList,pinNameList
        """
        cookiesList = []
        userNameList = []
        pinNameList = []
        if 'pt_key=' in cookies and 'pt_pin=' in cookies:
            r = re.compile(r"pt_key=.*?pt_pin=.*?;", re.M | re.S | re.I)
            result = r.findall(cookies)
            if len(result) >= 1:
                print("您已配置{}个账号".format(len(result)))
                u = 1
                for i in result:
                    r = re.compile(r"pt_pin=(.*?);")
                    pinName = r.findall(i)
                    pinName = unquote(pinName[0])
                    # 获取账号名
                    ck, nickname = self.getUserInfo(i, pinName, u)
                    if nickname != False:
                        cookiesList.append(ck)
                        userNameList.append(nickname)
                        pinNameList.append(pinName)
                    else:
                        u += 1
                        continue
                    u += 1
                if len(cookiesList) > 0 and len(userNameList) > 0:
                    return cookiesList, userNameList, pinNameList
                else:
                    print("没有可用Cookie，已退出")
                    exit(3)
            else:
                print("cookie 格式错误！...本次操作已退出")
                exit(4)
        else:
            print("cookie 格式错误！...本次操作已退出")
            exit(4)
