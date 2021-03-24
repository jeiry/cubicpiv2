#!/usr/bin/env python
# -*- coding: utf-8 -*-
from apds9960.const import *
from apds9960 import APDS9960
import RPi.GPIO as GPIO
import smbus
port = 1
bus = smbus.SMBus(port)

import requests
import time
import paho.mqtt.client as mqtt
import json
import os
import threading
client = mqtt.Client()
# 连接mqtt
def on_connect(client, userdata, flags, rc):
    print("Connected with result code: " + str(rc))
    client.subscribe('/home/r/cubicpi', qos=0)
def on_message(client, userdata, msg):
    data = msg.payload.decode()
    if len(data)> 5:
        dic = json.loads(data)
        print(dic)
        if dic['action'] == "init":
            f = open('weatherData.log')
            txt = f.read()
            f.close()
            print(txt)
            client.publish("/home/r/cubicpi", txt, qos=0, retain=False)
            # ---
            f = open('bbFansData.log')
            txt = f.read()
            f.close()
            print(txt)
            client.publish("/home/r/cubicpi", txt, qos=0, retain=False)
    # print(dic)
def updateFansData():
    global client
    try:
        # 获取粉
        r = requests.get('https://api.bilibili.com/x/relation/stat?vmid=46891041')
        fans = r.json()['data']['follower']
        file = "bblog.log"
        # 记录6小时内粉变动
        if os.path.exists(file):
            print('logs')
            with open(file, "r") as f:
                data = json.load(f)
            arr = []
            for obj in data:
                if obj['t'] + 3600 * 6 > int(time.time()):
                    arr.append(obj)
            arr.append({'t': int(time.time()), 'f': fans})
            with open(file, "w+") as f:
                f.write(json.dumps(arr))
        else:
            with open(file, "w+") as f:
                f.write(json.dumps([{'t': int(time.time()), 'f': fans}]))
        with open(file, "r") as f:
            data = json.load(f)
        countFans = data[len(data) - 1]['f'] - data[0]['f']
        fansChange = '+%d' % countFans if countFans >= 0 else '%d' % countFans
        print(json.dumps({"countFans":fans,"fansChange":fansChange}))
        saveJson = json.dumps({"action":"fansData","countFans":fans,"fansChange":fansChange})
        client.publish("/home/r/cubicpi", saveJson, qos=0, retain=False)
        with open("bbFansData.log", "w+") as f:
            f.write(saveJson)
    except Exception as e:
        print(e)

def updateWeather():
    global client
    # 获取天气
    try:
        ##https://dev.qweather.com/ 我使用这个天气接口，自己去申请吧。免费版够用了 一天可以有1w次访问
        r = requests.get(
            'https://devapi.qweather.com/v7/weather/now?location=城市代码&key=xxxxx')
        data = r.json()
        print(data)
        arr = data['now']
        arr['action'] = "weather"
        client.publish("/home/r/cubicpi",json.dumps(arr), qos=0, retain=False)
        with open("weatherData.log", "w+") as f:
            f.write(json.dumps(arr))
    except Exception as e:
        print(e)

def loop():
    time.sleep(5)
    while True:
        updateFansData()
        if time.localtime().tm_min == 2:
            updateWeather()
        else:
            f = open('weatherData.log')
            txt = f.read()
            f.close()
            print(txt)
            client.publish("/home/r/cubicpi", txt, qos=0, retain=False)
        time.sleep(60)

def apds():
    apds = APDS9960(bus)
    global client
    def intH(channel):
        print("INTERRUPT")

    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(7, GPIO.IN)

    dirs = {
        APDS9960_DIR_NONE: "none",
        APDS9960_DIR_LEFT: "left",
        APDS9960_DIR_RIGHT: "right",
        APDS9960_DIR_UP: "up",
        APDS9960_DIR_DOWN: "down",
        APDS9960_DIR_NEAR: "near",
        APDS9960_DIR_FAR: "far",
    }
    try:
        # Interrupt-Event hinzufuegen, steigende Flanke
        GPIO.add_event_detect(7, GPIO.FALLING, callback=intH)

        apds.setProximityIntLowThreshold(50)

        print("Gesture Test")
        print("============")
        apds.enableGestureSensor()
        while True:
            time.sleep(0.5)
            if apds.isGestureAvailable():
                motion = apds.readGesture()
                print("Gesture={}".format(dirs.get(motion, "unknown")))
                client.publish("/home/r/cubicpi", json.dumps({"action":"act","direction":format(dirs.get(motion, "unknown"))}), qos=0,
                               retain=False)


    finally:
        GPIO.cleanup()
        print("Bye")
if __name__ == '__main__':
    dataLoop = threading.Thread(target=loop)
    dataLoop.start()

    apdsLoop = threading.Thread(target=apds)
    apdsLoop.start()

    client.on_connect = on_connect
    client.on_message = on_message
    client.connect('xx.xxxxx.com', 1883, 600)  # 600为keepalive的时间间隔
    client.username_pw_set('xxxxx', password='xxxxx')
    client.loop_forever()  # 保持连接
