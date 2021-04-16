/* eslint-disable */
import "swiper/swiper.min.css";
import "@/views/cubicpi/cubicpi.css";
import configs from "@/config.js";
import mqtt from "mqtt";
import lightImgPng from "../../assets/light.png";
import lightShutImgPng from "../../assets/light_shut.png";
var client;
const mqttoptions = {
  port: "mqtt端口",
  connectTimeout: 40000,
  clientId:
    "mqttjs_" +
    Math.random()
      .toString(16)
      .substr(2, 8),
  username: "username",
  password: "password",
  clean: true
};
client = mqtt.connect("你的mqtt地址", mqttoptions);
export default {
  data() {
    return {
      time: "",
      date: "",
      week: "",
      swiperOption: {
        slidesPerView: 1
      },
      countFans: "0",
      fansChange: "-",
      t_img: "",
      t_text: "",
      t_wind: "",
      lightImg: lightShutImgPng,
      lightImg2: lightImgPng,
      uCountFans: "0",
      uFansChange: "-"
    };
  },
  created() {
    //
    this.formatTime(2);
    setInterval(
      function() {
        this.formatTime(2);
      }.bind(this),
      1000
    );

    // mqtt连接
    client.on("connect", e => {
      console.log("连接成功:");
      client.subscribe("/home/r/cubicpi", { qos: 1 }, error => {
        if (!error) {
          console.log("订阅成功");
          client.publish(
            "/home/r/cubicpi",
            JSON.stringify({ action: "init" }),
            { qos: 0 }
          );
          client.publish(
            "/home/r/cubicpi",
            JSON.stringify({ action: "currentPage", page: 0 }),
            { qos: 0 }
          );
        } else {
          console.log("订阅失败");
        }
      });
    });
    // 接收消息处理
    let page = 0;
    let block = 0;
    client.on("message", (topic, message) => {
      var arr = JSON.parse(message.toString());
      console.log(arr);
      if (arr["action"] == "swiper") {
        this.sw(arr["page"]);
      } else if (arr["action"] == "fansData") {
        this.countFans = arr["countFans"];
        this.fansChange = arr["fansChange"];
        this.uCountFans = arr["youtube"]["fans"];
        this.uFansChange = arr["youtube"]["change"];
      } else if (arr["action"] == "weather") {
        this.t_img = require(`@/assets/a_weather/` + arr["icon"] + `.svg`);
        this.t_text = arr["text"] + " " + arr["temp"] + "℃";
        this.t_wind = "风力 " + arr["windScale"] + "级";
      } else if (arr["action"] == "act") {
        // if(page == 0)
        // let current = page
        console.log(page);
        if (arr["direction"] == "right") {
          if (page <= 2) {
            page++;
            this.sw(page);
          }
        } else if (arr["direction"] == "left") {
          if (page > 0) {
            // page = page --
            page--;
            this.sw(page);
          }
        }

        client.publish(
          "/home/r/cubicpi",
          JSON.stringify({ action: "currentPage", page: page }),
          { qos: 0 }
        );
      } else if (arr["action"] == "pushbut") {
        // if(page == 0)
        // let current = page
        console.log(page);
        if (arr["but"] == "r" && block == 0) {
          if (page <= 3) {
            page++;
            this.sw(page);
          }
        } else if (arr["but"] == "l" && block == 0) {
          if (page > 0) {
            // page = page --
            page--;
            this.sw(page);
          }
        }
        if (block == 0) {
          block = 1;
          setTimeout(() => {
            block = 0;
          }, 300);
          client.publish(
            "/home/r/cubicpi",
            JSON.stringify({ action: "currentPage", page: page }),
            { qos: 0 }
          );
        }
        if (page == 3 && arr["but"] == "3") {
          client.publish(
            "/home/r/cubicpi",
            JSON.stringify({ action: "croomlight", res: "1on" }),
            { qos: 0 }
          );
          client.publish("/home/r/croomlight", "1on", { qos: 0 });
        } else if (page == 3 && arr["but"] == "2") {
          client.publish(
            "/home/r/cubicpi",
            JSON.stringify({ action: "croomlight", res: "1off" }),
            { qos: 0 }
          );
          client.publish("/home/r/croomlight", "1off", { qos: 0 });
        } else if (page == 4 && arr["but"] == "4") {
          client.publish("/home/r/croomlight", "cama1", { qos: 0 });
        } else if (page == 4 && arr["but"] == "3") {
          client.publish("/home/r/croomlight", "cama2", { qos: 0 });
        } else if (page == 4 && arr["but"] == "2") {
          client.publish("/home/r/croomlight", "cama3", { qos: 0 });
        } else if (page == 4 && arr["but"] == "1") {
          client.publish("/home/r/croomlight", "cama4", { qos: 0 });
        }
      } else if (arr["action"] == "croomlight") {
        if (arr["res"] == "1off") {
          this.lightImg = lightShutImgPng;
        } else if (arr["res"] == "1on") {
          this.lightImg = lightImgPng;
        }
      }
    });
    // 断开发起重连
    client.on("reconnect", error => {
      console.log("正在重连:", error);
    });
    // 链接异常处理
    client.on("error", error => {
      console.log("连接失败:", error);
    });
  },
  methods: {
    formatTime(type) {
      var myDate = new Date();
      this.date =
        myDate.getFullYear() +
        "-" +
        this.PrefixZero(myDate.getMonth(), 2) +
        "-" +
        this.PrefixZero(myDate.getDate(), 2);
      this.time =
        this.PrefixZero(myDate.getHours(), 2) +
        ":" +
        this.PrefixZero(myDate.getMinutes(), 2) +
        ":" +
        this.PrefixZero(myDate.getSeconds(), 2);
      this.week = this.getWeek(myDate.getDay());
    },
    PrefixZero(num, n) {
      return (Array(n).join(0) + num).slice(-n);
    },
    sw(page) {
      this.$refs.mySwiper.$swiper.slideTo(page, 1000, false);
    },
    getWeek(num) {
      let weekday = [];
      weekday[0] = "Sunday";
      weekday[1] = "Monday";
      weekday[2] = "Tuesday";
      weekday[3] = "Wednesday";
      weekday[4] = "Thursday";
      weekday[5] = "Friday";
      weekday[6] = "Saturday";
      return weekday[num];
    }
  }
};
