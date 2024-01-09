<script>
import { onMounted, reactive, onUnmounted, ref, defineComponent, inject} from 'vue';//组件导入
import function3 from "./js/function1.js"//导入进制转换代码
import getDate from './js/time.js'//导入时间函数
import parameter from './js/battparameter'//导入参数
import batt11 from './components/batt11.vue'
import batt12 from './components/batt12.vue'
import batt13 from './components/batt13.vue'
import batt14 from './components/batt14.vue'
import batt15 from './components/batt15.vue'
import batt16 from './components/batt16.vue'
export default defineComponent({
  name: 'HomeView',
  components: {
    batt11,
    batt12,
    batt13,
    batt14,
    batt15,
    batt16,
  },
  setup() {
    const worker = inject("worker");

    let flag
    // const router = useRouter();//路由，照抄
    const x_base = reactive
      ({
        msg: 0,//基础数据接驳
        msg_440_sum: 0,// 440V报文总数
        msg_24_sum: 0,// 24V报文总数
        symple: 0,//报文标志位
        data_valid_440: 0,// 报文有效位
        data_valid_440_sum: 0 // 报文有效总数
      })
    const x_Batt1_440 = reactive(parameter.battery1_440)//440v 1
    const x_Batt2_440 = reactive(parameter.battery2_440)//440v 2
    const x_Batt3_440 = reactive(parameter.battery3_440)//440v 3
    const x_Batt4_440 = reactive(parameter.battery4_440)//440v 4

    const x_Batt1_24 = reactive(parameter.battery1_24)//24V 1
    const x_Batt2_24 = reactive(parameter.battery2_24)//24V 2

    const x_array1 = reactive({//承接响应式数组的对象440v1 440v2
      total_volt_array: [0, 0, 0],
      current_array: [0, 0, 0],
      max_temp_array: [0, 0, 0],
      soc_array: [0, 0, 0],
      max_volt_array: [0, 0, 0],
      min_volt_array: [0, 0, 0]
    })

    const analysisBatt = (val, date_val) => {
      var batt = {
        max_volt: "", min_volt: "", max_temp: "", min_temp: "", soc: "", total_volt: "", current: "", fan_fault: "",
        overdischarge_alarm: "", overcharge_alarm: "", heating_state: "", relay_status: "", relay_fault: "", comm_fault: "",
        volt_acquisition_fault: "", low_temp_alarm: "", high_temp_alarm: "", c_overdischarge_alarm: "", c_overcharge_alarm: ""
      }

      batt.max_volt = ((function3.hexto10(date_val.substr((val + 8), 2))) * 256 + (function3.hexto10(date_val.substr((val + 6), 2)))).toFixed(2)
      //获取单体最高电压高8位转10进制后乘以256，然后加获取单体最高电压低8位转十进制
      batt.min_volt = ((function3.hexto10(date_val.substr((val + 12), 2))) * 256 + (function3.hexto10(date_val.substr((val + 10), 2)))).toFixed(2)
      //获取单体最低电压高8位转10进制后乘以256，然后加获取单体最低电压低8位转十进制
      batt.max_temp = ((function3.hexto10(date_val.substr((val + 14), 2))) - 40).toFixed(2)//获取电池最高温度转10进制减去40
      batt.min_temp = ((function3.hexto10(date_val.substr((val + 16), 2))) - 40).toFixed(2)//获取电池最低温度
      batt.soc = (function3.hexto10(date_val.substr((val + 18), 2)))//获取电池剩余容量转10进制
      batt.total_volt = (((function3.hexto10(date_val.substr((val + 28), 2))) * 256 + (function3.hexto10(date_val.substr((val + 26), 2)))) * 0.1).toFixed(2)
      //获取总电压高8位转10进制后乘以256，然后加获取总电压低8位转十进制，乘以系数0.1
      batt.current = ((((function3.hexto10(date_val.substr((val + 32), 2))) * 256 + (function3.hexto10(date_val.substr((val + 30), 2)))) * 0.1) - 500).toFixed(2)
      //获取电流高8位转10进制后乘以256，然后加获取电流低8位转十进制，乘以系数0.1
      var batt_fault1 = function3.binarytoarry2(function3.hexto2((val + 34), 2));//
      var batt_fault2 = function3.binarytoarry2(function3.hexto2((val + 36), 2));
      var batt_fault = [...batt_fault1, ...batt_fault2]
      batt.fan_fault = batt_fault[0]
      batt.overdischarge_alarm = (batt_fault[1] * 2 + batt_fault[2])
      batt.overcharge_alarm = (batt_fault[3] * 2 + batt_fault[4])
      batt.heating_state = batt_fault[5]
      batt.relay_status = batt_fault[6]
      batt.relay_fault = batt_fault[7]
      batt.comm_fault = batt_fault[8]
      batt.volt_acquisition_fault = batt_fault[9]
      batt.low_temp_alarm = (batt_fault[10] * 2 + batt_fault[11])
      batt.high_temp_alarm = (batt_fault[12] * 2 + batt_fault[13])
      batt.c_overdischarge_alarm = batt_fault[14]
      batt.c_overcharge_alarm = batt_fault[15]

      return batt
    }
    const addTime = (num) => {
      var curTime = new Date()
      console.log(curTime)
      var addSeconds = new Date(curTime.setSeconds(curTime.getSeconds() + num));
      return addSeconds
    }
    const Timedata = reactive({
      nowTime: "",
      nowWeek: "",
    })
    function timeToString(timeObj) {
      var str = "";
      var year = timeObj.getFullYear();
      var month = timeObj.getMonth();
      var date = timeObj.getDate();
      var time = timeObj.toTimeString().split(" ")[0];
      //var rex = new RegExp(/:/g);
      // str = year+"-"+month+"-"+date+" "+time.replace(rex,"-");
      str = time;
      console.log("------当前日期：" + str);
      return str;
    }
    const replaceObject = (newObject, oldObject) => {
      for (let key in oldObject) {
        newObject[key] = oldObject[key]
      }
      console.log(newObject)
    }

    const colorSig = (sig) => {
      if (sig) {
        return "#00ffff";
      } else {
        return '#00657F';
      };
    }//定义方法
    const colorSig2 = (sig) => {
      if (sig) {
        return "#ee1402";
      } else {
        return '#00657F';
      };
    }
    const formatDate = () => {
      var date = new Date()// 时间戳为10位需*1000，时间戳为13位的话不需乘1000
      // var year = date.getFullYear()
      // var month = ('0' + (date.getMonth() + 1)).slice(-2)
      // var sdate = ('0' + date.getDate()).slice(-2)
      var hour = ('0' + date.getHours()).slice(-2)
      var minute = ('0' + date.getMinutes()).slice(-2)
      var second = ('0' + date.getSeconds()).slice(-2)
      var milsec = date.getMilliseconds()
      // 拼接
      var result = hour + ':' + minute + ':' + second
      // 返回
      return result
    }
    //获取当前时间
    const currentTime = () => {
      setInterval(() => {
        Timedata.nowTime = getDate().nowTime;
        Timedata.nowWeek = getDate().nowWeek;
        //console.log(Timedata)
      }, 1000)
    };
    onMounted(() => {
      flag = formatDate()
      // webData()
      currentTime()
      
      worker.onmessage = (event) => {
        const message = event.data;
        // 在这里处理接收到的消息
        x_base.symple = message.substr(10, 2)//获取蓄电池报文的标志位字符串，04（440）  09（24）
        switch (x_base.symple) {
          case "04":
            x_base.msg_440_sum = x_base.msg_440_sum + 1; //计算报文总数
            x_base.data_valid_440 = function3.hexto10(data.substr(48, 2))//获取440V报文有效位并转换为十进制

            var batt1_440_port1canid = (function3.hexto10(data.substr(50, 2))) * 256 + function3.hexto10(data.substr(52, 2))
            var batt1_440_port2canid = (function3.hexto10(data.substr(210, 2))) * 256 + function3.hexto10(data.substr(212, 2))
            var batt2_440_port1canid = (function3.hexto10(data.substr(90, 2))) * 256 + function3.hexto10(data.substr(92, 2))
            var batt2_440_port2canid = (function3.hexto10(data.substr(250, 2))) * 256 + function3.hexto10(data.substr(252, 2))
            var batt3_440_port1canid = (function3.hexto10(data.substr(130, 2))) * 256 + function3.hexto10(data.substr(132, 2))
            var batt3_440_port2canid = (function3.hexto10(data.substr(290, 2))) * 256 + function3.hexto10(data.substr(292, 2))
            var batt4_440_port1canid = (function3.hexto10(data.substr(170, 2))) * 256 + function3.hexto10(data.substr(172, 2))
            var batt4_440_port2canid = (function3.hexto10(data.substr(330, 2))) * 256 + function3.hexto10(data.substr(332, 2))
            if (batt1_440_port1canid != 0) {
              var batt1_port1 = analysisBatt(50, data)
              replaceObject(x_Batt1_440, batt1_port1)
            }
            else if (batt1_440_port2canid != 0) {
              var batt1_port2 = analysisBatt(210, data)
              replaceObject(x_Batt1_440, batt1_port2)
            }
            else {
              console.log("440V蓄电池1数据丢失")
            }

            if (batt2_440_port1canid != 0) {
              var batt2_port1 = analysisBatt(90, data)
              replaceObject(x_Batt2_440, batt2_port1)
            }
            else if (batt2_440_port2canid != 0) {
              var batt2_port2 = analysisBatt(250, data)
              replaceObject(x_Batt2_440, batt2_port2)
            }
            else {
              console.log("440V蓄电池2数据丢失")
            }
            if (formatDate() > flag) {
              x_array1.total_volt_array = [formatDate(), x_Batt1_440.total_volt, x_Batt2_440.total_volt]
              x_array1.current_array = [formatDate(), x_Batt1_440.current, x_Batt2_440.current]
              x_array1.max_volt_array = [formatDate(), x_Batt1_440.max_volt, x_Batt2_440.max_volt]
              x_array1.max_temp_array = [formatDate(), x_Batt1_440.max_temp, x_Batt2_440.max_temp]
              x_array1.min_volt_array = [formatDate(), x_Batt1_440.min_temp, x_Batt2_440.min_temp]
              x_array1.soc_array = [formatDate(), x_Batt1_440.soc, x_Batt2_440.soc]
              console.log("%%%%%%%%%%%%%")
              console.log(x_array1.max_temp_array)
              flag = timeToString(addTime(1))
            }

            if (batt3_440_port1canid != 0) {
              var batt3_port1 = analysisBatt(130, data)
              replaceObject(x_Batt3_440, batt3_port1)
            }
            else if (batt3_440_port2canid != 0) {
              var batt3_port2 = analysisBatt(290, data)
              replaceObject(x_Batt3_440, batt3_port2)
            }
            else {
              console.log("440V蓄电池3数据丢失")
            }

            if (batt4_440_port1canid != 0) {
              var batt3_port1 = analysisBatt(170, data)
              replaceObject(x_Batt4_440, batt3_port1)
            }
            else if (batt4_440_port2canid != 0) {
              var batt4_port2 = analysisBatt(330, data)
              replaceObject(x_Batt4_440, batt4_port2)
            }
            else {
              console.log("440V蓄电池4数据丢失")
            }

            break;
          case "09":
            x_base.msg_24_sum = x_base.msg_24_sum + 1; //计算报文总数
            var batt1_24_canid = (function3.hexto10(data.substr(50, 2))) * 256 + function3.hexto10(data.substr(52, 2))
            var batt2_24_canid = (function3.hexto10(data.substr(90, 2))) * 256 + function3.hexto10(data.substr(92, 2))
            if (batt1_24_canid != 0) {
              var batt1_24 = analysisBatt(50, data)
              replaceObject(x_Batt1_24, batt1_24)
            }
            else {
              console.log("24V蓄电池1数据丢失")
            }

            if (batt2_24_canid != 0) {
              var batt2_24 = analysisBatt(90, data)
              replaceObject(x_Batt2_24, batt2_24)
            }
            else {
              console.log("24V蓄电池2数据丢失")
            }
            break;
        }
      };
    })
    onUnmounted(() => {
      if (getDate) {
        clearInterval(getDate) // 在Vue实例销毁前，清除时间定时器
      }
    })
    return {
      Timedata,
      x_base,
      x_Batt1_440,
      x_Batt2_440,
      x_Batt3_440,
      x_Batt4_440,
      x_Batt1_24,
      x_Batt2_24,
      x_array1,
      // x_array2,
      // x_array3,
      // x_array4,
      colorSig
    }
  }
})
</script>

<template>
  <!-- <div class="backG">
    </div> -->
  <svg class="block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%"
    height="100%" preserveAspectRatio="none" viewBox="0 0 1920 1080">
    <defs>
      <linearGradient x1="28.1148014%" y1="99.9994492%" x2="28.1148624%" y2="-15.9417764%" id="linearGradient-1">
        <stop stop-color="#0D98FF" offset="0%" />
        <stop stop-color="#0D98FF" stop-opacity="0" offset="100%" />
      </linearGradient>
      <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-2">
        <stop stop-color="#0E74B7" stop-opacity="0.583749624" offset="0%" />
        <stop stop-color="#1896E8" stop-opacity="0.147807515" offset="100%" />
      </linearGradient>
      <linearGradient x1="50%" y1="36.2928152%" x2="50%" y2="100%" id="linearGradient-3">
        <stop stop-color="#09446F" offset="0%" />
        <stop stop-color="#016CAB" offset="100%" />
      </linearGradient>
    </defs>
    <!-- 背景 -->
    <rect fill="#000000" x="0" y="0" width="1920px" height="1080px"></rect>
    <!-- 大标题 -->
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <rect id="矩形备份-2" fill="url(#linearGradient-2)" x="0" y="0" width="1920" height="59" />
      <polyline id="路径备份" fill="url(#linearGradient-3)" points="1303.50685 0 1240.76712 78 678.739726 78 616 0" />
      <g id="编组" transform="translate(591.000000, 52.000000)" fill="#4EB3FE">
        <polygon id="矩形" points="44 0 54 0 75 26 65 26" />
        <polygon id="矩形备份" opacity="0.597190494" points="22 0 32 0 53 26 43 26" />
        <polygon id="矩形备份-3" opacity="0.310084025" points="-9.09522457e-13 0 10 0 31 26 21 26" />
      </g>
      <g id="编组备份"
        transform="translate(1295.500000, 65.000000) scale(-1, 1) translate(-1295.500000, -65.000000) translate(1258.000000, 52.000000)"
        fill="#4EB3FE">
        <polygon id="矩形" points="44 0 54 0 75 26 65 26" />
        <polygon id="矩形备份" opacity="0.597190494" points="22 0 32 0 53 26 43 26" />
        <polygon id="矩形备份-3" opacity="0.310084025" points="-9.09522457e-13 0 10 0 31 26 21 26" />
      </g>
    </g>
    <!-- 时间模块 -->
    <text fill="#ffffff" font-family="SimHei" letter-spacing="1.81818182" font-size="40" font-weight="400" width="544"
      height="56">
      <tspan x="688.5" y="55">高速磁浮蓄电池状态诊断模块</tspan>
    </text>
    <g>
      <text fill="#ffffff" font-family="SimHei" font-size="22" font-weight="400">
        <tspan x="202" y="36">车号:CF002</tspan>
      </text>
      <text fill="#ffffff" font-family="SimHei" font-size="22">
        <tspan x="380" y="36">车厢:M1</tspan>
      </text>
      <text fill="#ffffff" font-family="SimHei" font-size="22">
        <tspan x="1648" y="36">{{ Timedata.nowTime }}</tspan>
      </text>
    </g>

    <!-- 中车图标 -->
    <image width="124" height="42" x="39" y="10"
      xlink:href="data:image/png;base64,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">
    </image>
    <!-- 基本信息标题 -->
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="高速磁浮蓄电池状态诊断模块" transform="translate(0, 0)">
        <g id="编组-5" transform="translate(24.000000, 102.000000)">
          <rect id="矩形" fill="#00A1FF" x="0" y="0" width="3" height="38" />
          <rect id="矩形备份-4" fill="url(#linearGradient-1)" opacity="0.369679769" x="3" y="0" width="605" height="38" />
          <text id="基本信息" font-family="PingFangSC-Regular, PingFang SC" font-size="20" font-weight="normal"
            fill="#FFFFFF">
            <tspan x="34" y="26">基本信息</tspan>
          </text>
          <g id="编组" transform="translate(566.146667, 13.000000)" fill="#4EB3FE">
            <polygon id="矩形" opacity="0.220115298" points="11.1466667 0 16.2133333 0 26.8533333 13 21.7866667 13" />
            <polygon id="矩形备份" points="-4.60824712e-13 0 5.06666667 0 15.7066667 13 10.64 13" />
          </g>
          <g id="上箭头"
            transform="translate(22.000000, 19.000000) rotate(-270.000000) translate(-22.000000, -19.000000) translate(16.000000, 13.000000)"
            fill="#FFFFFF" fill-rule="nonzero">
            <rect id="矩形" opacity="0" x="0" y="0" width="12" height="12" />
            <path
              d="M6.7155,3.1875 L10.33425,7.929 C10.5419684,8.2011872 10.5772501,8.56766184 10.4252743,8.874478 C10.2732984,9.18129416 9.96039265,9.37530038 9.618,9.37500035 L2.381625,9.37500035 C2.03936752,9.37500035 1.72672265,9.18089984 1.57493463,8.87414166 C1.42314661,8.56738348 1.45848879,8.20107975 1.666125,7.929 L5.284875,3.1875 C5.45513546,2.9645217 5.71963814,2.83369413 6.0001875,2.83369413 C6.28073686,2.83369413 6.54523954,2.9645217 6.7155,3.1875 Z"
              id="路径" />
          </g>
        </g>
      </g>
    </g>
    <!-- 基本信息内容 -->
    <g>
      <rect fill="#0B5D9D" fill-opacity="0.34" x="24" y="150" width="608px" height="38px"></rect>
      <rect fill="#00A1FF" fill-opacity="0.15" x="24" y="226" width="608px" height="38px"></rect>
      <rect fill="#00A1FF" fill-opacity="0.15" x="24" y="302" width="608px" height="38px"></rect>
      <rect fill="#00A1FF" fill-opacity="0.15" x="24" y="378" width="608px" height="38px"></rect>
      <text font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal" fill="#FFFFFF"
        transform="translate(0,16)">
        <tspan x="57" y="158">设备</tspan>
        <tspan x="147" y="158">最低/高温度</tspan>
        <tspan x="296" y="158">总电压</tspan>
        <tspan x="401" y="158">最低/高单体电压</tspan>
        <tspan x="577" y="158">电流</tspan>
      </text>
      <text font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal" fill="#FFFFFF"
        transform="translate(0,18)">
        <tspan x="43" y="196">440V-1</tspan>
        <tspan x="43" y="233">440V-2</tspan>
        <tspan x="43" y="274">440V-3</tspan>
        <tspan x="43" y="309">440V-4</tspan>
        <tspan x="46" y="347">24V-1</tspan>
        <tspan x="46" y="385">24V-2</tspan>
      </text>

      <text font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal" fill="#FFFFFF"
        transform="translate(0,18)">
        <tspan x="142" y="196">{{ x_Batt1_440.min_temp }}C°</tspan>
        <tspan x="142" y="233">{{ x_Batt2_440.min_temp }}C°</tspan>
        <tspan x="142" y="274">{{ x_Batt3_440.min_temp }}C°</tspan>
        <tspan x="142" y="309">{{ x_Batt4_440.min_temp }}C°</tspan>
        <tspan x="142" y="347">{{ x_Batt1_24.min_temp }}C°</tspan>
        <tspan x="142" y="385">{{ x_Batt2_24.min_temp }}C°</tspan>

        <tspan x="192" y="196">{{ x_Batt1_440.max_temp }}C°</tspan>
        <tspan x="192" y="233">{{ x_Batt2_440.max_temp }}C°</tspan>
        <tspan x="192" y="274">{{ x_Batt3_440.max_temp }}C°</tspan>
        <tspan x="192" y="309">{{ x_Batt4_440.max_temp }}C°</tspan>
        <tspan x="192" y="347">{{ x_Batt1_24.max_temp }}C°</tspan>
        <tspan x="192" y="385">{{ x_Batt2_24.max_temp }}C°</tspan>
      </text>

      <text font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal" fill="#FFFFFF"
        transform="translate(0,18)">
        <tspan x="400" y="196">{{ x_Batt1_440.max_volt }}KV</tspan>
        <tspan x="400" y="233">{{ x_Batt2_440.max_volt }}KV</tspan>
        <tspan x="400" y="274">{{ x_Batt3_440.max_volt }}KV</tspan>
        <tspan x="400" y="309">{{ x_Batt4_440.max_volt }}KV</tspan>
        <tspan x="400" y="347">{{ x_Batt1_24.max_volt }}KV</tspan>
        <tspan x="400" y="385">{{ x_Batt2_24.max_volt }}KV</tspan>

        <tspan x="464" y="196">{{ x_Batt1_440.min_volt }}KV</tspan>
        <tspan x="464" y="233">{{ x_Batt2_440.min_volt }}KV</tspan>
        <tspan x="464" y="274">{{ x_Batt3_440.min_volt }}KV</tspan>
        <tspan x="464" y="309">{{ x_Batt4_440.min_volt }}KV</tspan>
        <tspan x="464" y="347">{{ x_Batt1_24.min_volt }}KV</tspan>
        <tspan x="464" y="385">{{ x_Batt2_24.min_volt }}KV</tspan>
      </text>

      <text font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal" fill="#FFFFFF"
        transform="translate(0,18)">
        <tspan x="292" y="196">{{ x_Batt1_440.total_volt }}KV</tspan>
        <tspan x="292" y="233">{{ x_Batt2_440.total_volt }}KV</tspan>
        <tspan x="292" y="274">{{ x_Batt3_440.total_volt }}KV</tspan>
        <tspan x="292" y="309">{{ x_Batt4_440.total_volt }}KV</tspan>
        <tspan x="292" y="347">{{ x_Batt1_24.total_volt }}KV</tspan>
        <tspan x="292" y="385">{{ x_Batt2_24.total_volt }}KV</tspan>

        <tspan x="183" y="196">|</tspan>
        <tspan x="183" y="233">|</tspan>
        <tspan x="183" y="274">|</tspan>
        <tspan x="183" y="309">|</tspan>
        <tspan x="183" y="347">|</tspan>
        <tspan x="183" y="385">|</tspan>

        <tspan x="458" y="196">|</tspan>
        <tspan x="458" y="233">|</tspan>
        <tspan x="458" y="274">|</tspan>
        <tspan x="458" y="309">|</tspan>
        <tspan x="458" y="347">|</tspan>
        <tspan x="458" y="385">|</tspan>

        <tspan x="563" y="196">{{ x_Batt1_440.current }}A</tspan>
        <tspan x="563" y="233">{{ x_Batt2_440.current }}A</tspan>
        <tspan x="563" y="274">{{ x_Batt3_440.current }}A</tspan>
        <tspan x="563" y="309">{{ x_Batt4_440.current }}A</tspan>
        <tspan x="563" y="347">{{ x_Batt1_24.current }}A</tspan>
        <tspan x="563" y="385">{{ x_Batt2_24.current }}A</tspan>
      </text>
    </g>
    <rect fill="none" fill-rule="evenodd" stroke="#00A1FF" stroke-width="1" width="608px" height="322px" x="24px"
      y="102px"></rect>
    <!-- 状态曲线标题 -->
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="高速磁浮蓄电池状态诊断模块" transform="translate(0, 0)">
        <g id="编组-5备份-3" transform="translate(24.000000, 676.000000)">
          <rect id="矩形" fill="#0D98FF" x="0" y="0" width="3" height="38" />
          <rect id="矩形备份-4" fill="url(#linearGradient-1)" opacity="0.297396705" x="3" y="0" width="1869" height="38" />
          <text id="状态曲线" font-family="PingFangSC-Regular, PingFang SC" font-size="20" font-weight="normal"
            fill="#FFFFFF">
            <tspan x="34" y="26">状态曲线</tspan>
          </text>
          <g id="编组" transform="translate(1825.146667, 13.000000)" fill="#4EB3FE">
            <polygon id="矩形" opacity="0.220115298" points="11.1466667 0 16.2133333 0 26.8533333 13 21.7866667 13" />
            <polygon id="矩形备份" points="-4.60824712e-13 0 5.06666667 0 15.7066667 13 10.64 13" />
          </g>
          <g id="上箭头"
            transform="translate(22.000000, 19.000000) rotate(-270.000000) translate(-22.000000, -19.000000) translate(16.000000, 13.000000)"
            fill="#FFFFFF" fill-rule="nonzero">
            <rect id="矩形" opacity="0" x="0" y="0" width="12" height="12" />
            <path
              d="M6.7155,3.1875 L10.33425,7.929 C10.5419684,8.2011872 10.5772501,8.56766184 10.4252743,8.874478 C10.2732984,9.18129416 9.96039265,9.37530038 9.618,9.37500035 L2.381625,9.37500035 C2.03936752,9.37500035 1.72672265,9.18089984 1.57493463,8.87414166 C1.42314661,8.56738348 1.45848879,8.20107975 1.666125,7.929 L5.284875,3.1875 C5.45513546,2.9645217 5.71963814,2.83369413 6.0001875,2.83369413 C6.28073686,2.83369413 6.54523954,2.9645217 6.7155,3.1875 Z"
              id="路径" />
          </g>
        </g>
      </g>
    </g>
    <rect fill="none" fill-rule="evenodd" stroke="#00A1FF" stroke-width="1" width="1872px" height="380px" x="24px"
      y="676px"></rect>
    <!-- 蓄电池充放电状态 -->
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="高速磁浮蓄电池状态诊断模块" transform="translate(0, 0)">
        <g id="编组-5备份" transform="translate(656.000000, 102.000000)">
          <rect id="矩形" fill="#00A1FF" x="0" y="0" width="3.00242131" height="38" />
          <rect id="矩形备份-4" fill="url(#linearGradient-1)" opacity="0.295780727" x="3.00242131" y="0" width="1236.99758"
            height="38" />
          <text id="蓄电池充放电状态" font-family="PingFangSC-Regular, PingFang SC" font-size="20" font-weight="normal"
            fill="#FFFFFF">
            <tspan x="30.0242131" y="26">蓄电池充放电状态</tspan>
          </text>
          <g id="编组" transform="translate(1196.409201, 13.000000)" fill="#4EB3FE">
            <polygon id="矩形" opacity="0.220115298" points="9.97030472 0 14.5022614 0 24.0193705 13 19.4874138 13" />
            <polygon id="矩形备份" points="-4.12191639e-13 0 4.53195669 0 14.0490657 13 9.51710905 13" />
          </g>
          <g id="上箭头"
            transform="translate(19.515738, 19.000000) rotate(-270.000000) translate(-19.515738, -19.000000) translate(14.011299, 13.000000)"
            fill="#FFFFFF" fill-rule="nonzero">
            <rect id="矩形" opacity="0" x="0" y="0" width="11.0088781" height="12" />
            <path
              d="M6.16084342,3.1875 L9.48070823,7.929 C9.67127046,8.2011872 9.70363815,8.56766184 9.56421451,8.874478 C9.42479088,9.18129416 9.13772906,9.37530038 8.82361582,9.37500035 L2.18491828,9.37500035 C1.87092904,9.37500035 1.5841066,9.18089984 1.44485528,8.87414166 C1.30560396,8.56738348 1.33802712,8.20107975 1.52851392,7.929 L4.84837873,3.1875 C5.00457679,2.9645217 5.24723326,2.83369413 5.50461108,2.83369413 C5.76198889,2.83369413 6.00464537,2.9645217 6.16084342,3.1875 Z"
              id="路径" />
          </g>
        </g>
      </g>
    </g>
    <rect fill="none" fill-rule="evenodd" stroke="#00A1FF" stroke-width="1" width="1240px" height="550px" x="656px"
      y="102px"></rect>
    <!-- 高速磁浮蓄电池状态诊断模块 -->
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="高速磁浮蓄电池状态诊断模块" transform="translate(0, 0)">
        <g id="编组-21" transform="translate(75.000000, 490.000000)">
          <g id="编组-16" transform="translate(42.000000, 0.000000)">
            <g id="编组-3备份-19" transform="translate(0.000000, 2.000000)">
              <rect id="矩形" stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.98483378" fill-opacity="0.2"
                fill="#00A1FF" x="0.49241689" y="19.4924169" width="129.015166" height="47.0151662" />
              <text id="7L" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
                fill="#749DC0">
                <tspan x="56.84" y="17">7L</tspan>
              </text>
              <text id="440V_1" font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal"
                line-spacing="9.8483378" fill="#FFFFFF">
                <tspan x="35" y="57">440V_1</tspan>
              </text>
            </g>
            <g id="编组-3备份-20" transform="translate(0.000000, 76.000000)">
              <rect id="矩形" stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.98483378" fill-opacity="0.2"
                fill="#00A1FF" x="0.49241689" y="0.49241689" width="129.015166" height="47.0151662" />
              <text id="7R" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
                fill="#749DC0">
                <tspan x="55.432" y="65">7R</tspan>
              </text>
              <text id="440V_2" font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal"
                line-spacing="9.8483378" fill="#FFFFFF">
                <tspan x="33.5" y="38">440V_2</tspan>
              </text>
            </g>
            <g id="编组-3备份-21" transform="translate(146.000000, 76.000000)">
              <rect id="矩形" stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.98483378" fill-opacity="0.2"
                fill="#00A1FF" x="0.49241689" y="0.49241689" width="129.015166" height="47.0151662" />
              <text id="10R" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
                fill="#749DC0">
                <tspan x="48.168" y="65">10R</tspan>
              </text>
              <text id="440V_4" font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal"
                line-spacing="9.8483378" fill="#FFFFFF">
                <tspan x="33.5" y="38">440V_4</tspan>
              </text>
            </g>
            <g id="编组-3备份-22" transform="translate(292.000000, 76.000000)">
              <rect id="矩形" stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.98483378" fill-opacity="0.2"
                fill="#00A1FF" x="0.49241689" y="0.49241689" width="129.015166" height="47.0151662" />
              <text id="15R" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
                fill="#749DC0">
                <tspan x="48.168" y="65">15R</tspan>
              </text>
              <text id="24V_2" font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal"
                line-spacing="9.8483378" fill="#FFFFFF">
                <tspan x="39" y="38">24V_2</tspan>
              </text>
            </g>
            <g id="编组-8" transform="translate(146.000000, 20.000000)" fill="#00A1FF" fill-opacity="0.2" stroke="#FFFFFF"
              stroke-opacity="0.4">
              <rect id="矩形" x="0.5" y="0.5" width="129" height="47" />
            </g>
            <g id="编组-8备份" transform="translate(292.000000, 20.000000)" fill="#00A1FF" fill-opacity="0.2" stroke="#FFFFFF"
              stroke-opacity="0.4">
              <rect id="矩形" x="0.5" y="0.5" width="129" height="47" />
            </g>
            <text id="10L" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
              fill="#749DC0">
              <tspan x="196.16975" y="17">10L</tspan>
            </text>
            <text id="15L" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
              fill="#749DC0">
              <tspan x="342.16975" y="17">15L</tspan>
            </text>
            <text id="440V_2" font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal"
              line-spacing="9.8483378" fill="#FFFFFF">
              <tspan x="179" y="60">440V_2</tspan>
            </text>
            <text id="24V_1" font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal"
              line-spacing="9.8483378" fill="#FFFFFF">
              <tspan x="332" y="60">24V_1</tspan>
            </text>
          </g>
          <text id="一-位-端" font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal"
            line-spacing="28" fill="#FFFFFF">
            <tspan x="4" y="48">一</tspan>
            <tspan x="4" y="78.0171867">位</tspan>
            <tspan x="4" y="108.034373">端</tspan>
          </text>
          <text id="二-位-端" font-family="PingFangSC-Regular, PingFang SC" font-size="20" font-weight="normal"
            line-spacing="28" fill="#FFFFFF">
            <tspan x="487" y="50">二</tspan>
            <tspan x="487" y="80.0171867">位</tspan>
            <tspan x="487" y="110.034373">端</tspan>
          </text>
        </g>
      </g>
    </g>
    <rect fill="none" fill-rule="evenodd" stroke="#00A1FF" stroke-width="1" width="608px" height="204px" x="24px"
      y="446px"></rect>
    <!-- 部件位置 -->
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="高速磁浮蓄电池状态诊断模块" transform="translate(0, 0)">
        <g id="编组-5" transform="translate(24.000000, 446.000000)">
          <rect id="矩形" fill="#00A1FF" x="0" y="0" width="3" height="38" />
          <rect id="矩形备份-4" fill="url(#linearGradient-1)" opacity="0.369679769" x="3" y="0" width="605" height="38" />
          <text id="部件位置" font-family="PingFangSC-Regular, PingFang SC" font-size="20" font-weight="normal"
            fill="#FFFFFF">
            <tspan x="34" y="26">部件位置</tspan>
          </text>
          <g id="编组" transform="translate(566.146667, 13.000000)" fill="#4EB3FE">
            <polygon id="矩形" opacity="0.220115298" points="11.1466667 0 16.2133333 0 26.8533333 13 21.7866667 13" />
            <polygon id="矩形备份" points="-4.60824712e-13 0 5.06666667 0 15.7066667 13 10.64 13" />
          </g>
          <g id="上箭头"
            transform="translate(22.000000, 19.000000) rotate(-270.000000) translate(-22.000000, -19.000000) translate(16.000000, 13.000000)"
            fill="#FFFFFF" fill-rule="nonzero">
            <rect id="矩形" opacity="0" x="0" y="0" width="12" height="12" />
            <path
              d="M6.7155,3.1875 L10.33425,7.929 C10.5419684,8.2011872 10.5772501,8.56766184 10.4252743,8.874478 C10.2732984,9.18129416 9.96039265,9.37530038 9.618,9.37500035 L2.381625,9.37500035 C2.03936752,9.37500035 1.72672265,9.18089984 1.57493463,8.87414166 C1.42314661,8.56738348 1.45848879,8.20107975 1.666125,7.929 L5.284875,3.1875 C5.45513546,2.9645217 5.71963814,2.83369413 6.0001875,2.83369413 C6.28073686,2.83369413 6.54523954,2.9645217 6.7155,3.1875 Z"
              id="路径" />
          </g>
        </g>
      </g>
    </g>

    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="高速磁浮蓄电池状态诊断模块" transform="translate(0, 0)">
        <g id="编组-2备份" transform="translate(680.000000, 152.007741)">
          <g id="编组-11" transform="translate(0.000000, 39.060746)">
            <path d="M0,187.390254 L149.231527,187.390254 L149.231527,0 L0,0 L0,187.390254 Z" id="Fill-5"
              stroke-opacity="0.498381501" stroke="#FFFFFF" fill-opacity="0.1" fill="#00A1FF" stroke-dasharray="4" />
            <g id="编组-14" transform="translate(6.827586, 8.785424)">
              <rect id="矩形备份-6" stroke="#749DC0" x="0.5" y="0.5" width="30.2118227" height="27.3085883" />
              <rect id="矩形备份-6" stroke="#749DC0" x="35.6133005" y="0.5" width="30.2118227" height="27.3085883" />
              <rect id="矩形备份-6" stroke="#749DC0" x="70.726601" y="0.5" width="30.2118227" height="27.3085883" />
              <rect id="矩形备份-6" stroke="#749DC0" x="105.839901" y="0.5" width="30.2118227" height="27.3085883" />
              <text id="24" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
                fill="#FFFFFF">
                <tspan x="5" y="20">24</tspan>
              </text>
              <text id="6" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
                fill="#FFFFFF">
                <tspan x="46" y="20">6</tspan>
              </text>
              <text id="15" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
                fill="#FFFFFF">
                <tspan x="76.2983625" y="20">15</tspan>
              </text>
              <text id="31" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
                fill="#FFFFFF">
                <tspan x="111.298362" y="20">31</tspan>
              </text>
            </g>
            <g id="编组-14备份" transform="translate(6.827586, 129.829043)">
              <rect id="矩形备份-6" stroke="#749DC0" x="0.5" y="0.5" width="30.2118227" height="27.3085883" />
              <rect id="矩形备份-6" stroke="#749DC0" x="35.6133005" y="0.5" width="30.2118227" height="27.3085883" />
              <rect id="矩形备份-6" stroke="#749DC0" x="70.726601" y="0.5" width="30.2118227" height="27.3085883" />
              <rect id="矩形备份-6" stroke="#749DC0" x="105.839901" y="0.5" width="30.2118227" height="27.3085883" />
              <text id="22" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
                fill="#FFFFFF">
                <tspan x="5.41658907" y="20.9589513">22</tspan>
              </text>
              <text id="8" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
                fill="#FFFFFF">
                <tspan x="45.8683931" y="20.9589513">8</tspan>
              </text>
              <text id="3" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
                fill="#FFFFFF">
                <tspan x="80.9816936" y="20.9589513">3</tspan>
              </text>
              <text id="17" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
                fill="#FFFFFF">
                <tspan x="111.244175" y="20.9589513">17</tspan>
              </text>
            </g>
            <text id="HS" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
              letter-spacing="0.803200028" fill="#FFFFFF">
              <tspan x="60.4729064" y="179.145925">HS</tspan>
            </text>
            <ellipse id="椭圆形备份-4" fill="#749DC0" cx="22.3184286" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
            <ellipse id="椭圆形备份-5" fill="#749DC0" cx="57.4317291" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
            <ellipse id="椭圆形备份-6" fill="#749DC0" cx="91.5696601" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
            <ellipse id="椭圆形备份-7" fill="#749DC0" cx="127.65833" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
            <line x1="22.3694667" y1="37.4906536" x2="22.3694667" y2="129.95236" id="直线-2备份-3" stroke="#749DC0"
              stroke-width="1.1247032" stroke-linecap="square" />
            <line x1="57.4827672" y1="37.4906536" x2="57.4827672" y2="129.95236" id="直线-2备份-4" stroke="#749DC0"
              stroke-width="1.1247032" stroke-linecap="square" />
            <line x1="91.6206982" y1="37.4906536" x2="91.6206982" y2="129.95236" id="直线-2备份-5" stroke="#749DC0"
              stroke-width="1.1247032" stroke-linecap="square" />
            <line x1="127.709368" y1="37.4906536" x2="127.709368" y2="129.95236" id="直线-2备份-6" stroke="#749DC0"
              stroke-width="1.1247032" stroke-linecap="square" />
            <path id="直线-3"
              d="M160.724722,75.991535 L169.724236,80.4315682 L160.72375,84.8696289 L160.723,80.918 L23.3447827,80.9033373 L22.8569733,80.9032839 L22.8570802,79.9276651 L23.3448896,79.9277185 L160.724,79.942 L160.724722,75.991535 Z"
              fill="#749DC0" fill-rule="nonzero" />
          </g>
          <g id="编组-11" transform="translate(0.000000, 292.060746)">
            <path d="M0,187.390254 L149.231527,187.390254 L149.231527,0 L0,0 L0,187.390254 Z" id="Fill-5"
              stroke-opacity="0.498381501" stroke="#FFFFFF" fill-opacity="0.1" fill="#00A1FF" stroke-dasharray="4" />
            <g id="编组-14" transform="translate(6.827586, 8.785424)">
              <rect id="矩形备份-6" stroke="#749DC0" x="0.5" y="0.5" width="30.2118227" height="27.3085883" />
              <rect id="矩形备份-6" stroke="#749DC0" x="70.726601" y="0.5" width="30.2118227" height="27.3085883" />
              <rect id="矩形备份-6" stroke="#749DC0" x="105.839901" y="0.5" width="30.2118227" height="27.3085883" />
              <text id="18" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
                fill="#FFFFFF">
                <tspan x="5" y="20">18</tspan>
              </text>
              <text id="13" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
                fill="#FFFFFF">
                <tspan x="76.2983625" y="20">13</tspan>
              </text>
              <text id="29" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
                fill="#FFFFFF">
                <tspan x="111.298362" y="20">29</tspan>
              </text>
            </g>
            <g id="编组-14备份" transform="translate(6.827586, 129.829043)">
              <rect id="矩形备份-6" stroke="#749DC0" x="0.5" y="0.5" width="30.2118227" height="27.3085883" />
              <rect id="矩形备份-6" stroke="#749DC0" x="35.6133005" y="0.5" width="30.2118227" height="27.3085883" />
              <rect id="矩形备份-6" stroke="#749DC0" x="70.726601" y="0.5" width="30.2118227" height="27.3085883" />
              <rect id="矩形备份-6" stroke="#749DC0" x="105.839901" y="0.5" width="30.2118227" height="27.3085883" />
              <text id="20" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
                fill="#FFFFFF">
                <tspan x="5.41658907" y="20.9589513">20</tspan>
              </text>
              <text id="4" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
                fill="#FFFFFF">
                <tspan x="45.8683931" y="20.9589513">4</tspan>
              </text>
              <text id="11" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
                fill="#FFFFFF">
                <tspan x="76.7246248" y="20.9589513">11</tspan>
              </text>
              <text id="27" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
                fill="#FFFFFF">
                <tspan x="111.244175" y="20.9589513">27</tspan>
              </text>
            </g>
            <text id="HS" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
              letter-spacing="0.803200028" fill="#FFFFFF">
              <tspan x="60.4729064" y="179.145925">HS</tspan>
            </text>
            <ellipse id="椭圆形备份-4" fill="#749DC0" cx="22.3184286" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
            <ellipse id="椭圆形备份-5" fill="#749DC0" cx="57.4317291" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
            <ellipse id="椭圆形备份-6" fill="#749DC0" cx="91.5696601" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
            <ellipse id="椭圆形备份-7" fill="#749DC0" cx="127.65833" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
            <line x1="22.3694667" y1="37.4906536" x2="22.3694667" y2="129.95236" id="直线-2备份-3" stroke="#749DC0"
              stroke-width="1.1247032" stroke-linecap="square" />
            <line x1="57.5" y1="80.4315134" x2="57.4827672" y2="129.95236" id="直线-2备份-4" stroke="#749DC0"
              stroke-width="1.1247032" stroke-linecap="square" />
            <line x1="91.6206982" y1="37.4906536" x2="91.6206982" y2="129.95236" id="直线-2备份-5" stroke="#749DC0"
              stroke-width="1.1247032" stroke-linecap="square" />
            <line x1="127.709368" y1="37.4906536" x2="127.709368" y2="129.95236" id="直线-2备份-6" stroke="#749DC0"
              stroke-width="1.1247032" stroke-linecap="square" />
            <path id="直线-3"
              d="M152.37193,75.976481 L161.37193,80.4155279 L152.37193,84.8545749 L152.371,80.903 L22.8570268,80.9033373 L22.8570268,79.9277185 L152.371,79.927 L152.37193,75.976481 Z"
              fill="#749DC0" fill-rule="nonzero" />
          </g>
          <g id="编组-21" transform="translate(169.224236, 52.865672)">
            <g id="编组-17" transform="translate(0.775764, 48.126587)">
              <rect id="矩形" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF" x="0.5" y="0.5"
                width="101" height="29" />
              <text id="BV440" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
                fill="#FFFFFF">
                <tspan x="26.072" y="21">BV440</tspan>
              </text>
            </g>
            <g id="编组-19备份-7"
              transform="translate(15.130452, 137.382073) rotate(-270.000000) translate(-15.130452, -137.382073) translate(-24.859695, 122.251620)">
              <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
                points="0 30.2609048 79.9802956 30.2609048 79.9802956 0 0 0" />
              <text id="空-调"
                transform="translate(39.940865, 15.375138) rotate(-90.000000) translate(-39.940865, -15.375138) "
                font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal" line-spacing="23.414851"
                fill="#FFFFFF">
                <tspan x="30.943165" y="8.96028649">空</tspan>
                <tspan x="30.943165" y="32.3751375">调</tspan>
              </text>
            </g>
            <g id="编组-19备份-5"
              transform="translate(76.262364, 136.868836) rotate(-270.000000) translate(-76.262364, -136.868836) translate(36.257635, 107.788304)">
              <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
                points="0 58.1610643 80.0094562 58.1610643 80.0094562 2.52991039 0 2.52991039" />
              <text id="悬浮-导向-制动"
                transform="translate(42.468316, 22.929539) rotate(-90.000000) translate(-42.468316, -22.929539) "
                font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal" line-spacing="23.414851"
                fill="#FFFFFF">
                <tspan x="19.5387764" y="4.80726275">悬浮</tspan>
                <tspan x="19.5387764" y="28.2221138">导向</tspan>
                <tspan x="19.5387764" y="51.6369648">制动</tspan>
              </text>
            </g>
            <path id="直线-5备份-12"
              d="M41.6063858,26.4558408 L46.4181438,36.4558408 L42.168,36.455 L42.1687374,47.2154492 L41.0440342,47.2154492 L41.044,36.455 L36.7946278,36.4558408 L41.6063858,26.4558408 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <path id="直线-5备份-13"
              d="M30.3581285,26.4558408 L35.1698865,36.4558408 L30.92,36.455 L30.9204801,47.2154492 L29.7957769,47.2154492 L29.795,36.455 L25.5463705,36.4558408 L30.3581285,26.4558408 Z"
              transform="translate(30.248142, 36.492173) scale(1, -1) translate(-30.248142, -36.492173) " fill="#749DC0"
              fill-rule="nonzero" />
            <g id="编组-18" transform="translate(63.244579, 0.000000)" fill="#FFFFFF"
              font-family="LucidaGrande, Lucida Grande" font-size="16" font-weight="normal">
              <text id="440V_1">
                <tspan x="0" y="15">440V_1</tspan>
              </text>
            </g>
            <path id="路径-2"
              d="M9.33171122,77.7998947 L9.331,87.274 L13.5811176,87.2745471 L8.76935962,97.2745471 L3.95760161,87.2745471 L8.207,87.274 L8.20700801,77.7998947 L9.33171122,77.7998947 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <path id="路径-2备份-2"
              d="M75.1000264,77.7998947 L75.1,87.274 L79.3494328,87.2745471 L74.5376748,97.2745471 L69.7259168,87.2745471 L73.975,87.274 L73.9753232,77.7998947 L75.1000264,77.7998947 Z"
              fill="#749DC0" fill-rule="nonzero" />
          </g>
          <g id="编组-21备份" transform="translate(166.224236, 305.865672)">
            <g id="编组-17" transform="translate(0.012226, 48.575516)">
              <rect id="矩形" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF" x="0.5" y="0.5"
                width="107.26601" height="29.2609048" />
              <text id="BV440" font-family="PingFangSC-Regular, PingFang SC" font-size="17.5611383" font-weight="normal"
                fill="#FFFFFF">
                <tspan x="27.1397466" y="22">BV440</tspan>
              </text>
            </g>
            <g id="编组-19备份-7"
              transform="translate(15.130452, 138.382073) rotate(-270.000000) translate(-15.130452, -138.382073) translate(-24.859695, 123.251620)">
              <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
                points="0 30.2609048 79.9802956 30.2609048 79.9802956 0 0 0" />
              <text id="空-调"
                transform="translate(39.940865, 15.375138) rotate(-90.000000) translate(-39.940865, -15.375138) "
                font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal" line-spacing="23.414851"
                fill="#FFFFFF">
                <tspan x="30.943165" y="8.96028649">空</tspan>
                <tspan x="30.943165" y="32.3751375">调</tspan>
              </text>
            </g>
            <g id="编组-19备份-5"
              transform="translate(80.997408, 137.868836) rotate(-270.000000) translate(-80.997408, -137.868836) translate(40.992680, 110.053259)">
              <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
                points="0 55.6311539 80.0094562 55.6311539 80.0094562 0 0 0" />
              <text id="悬浮-导向-制动"
                transform="translate(42.468316, 24.399629) rotate(-90.000000) translate(-42.468316, -24.399629) "
                font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal" line-spacing="23.414851"
                fill="#FFFFFF">
                <tspan x="19.5387764" y="6.27735236">悬浮</tspan>
                <tspan x="19.5387764" y="29.6922034">导向</tspan>
                <tspan x="19.5387764" y="53.1070544">制动</tspan>
              </text>
            </g>
            <path id="直线-5备份-12"
              d="M47.6063858,27.4558408 L52.4181438,37.4558408 L48.168,37.455 L48.1687374,48.2154492 L47.0440342,48.2154492 L47.044,37.455 L42.7946278,37.4558408 L47.6063858,27.4558408 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <path id="直线-5备份-13"
              d="M36.3581285,27.4558408 L41.1698865,37.4558408 L36.92,37.455 L36.9204801,48.2154492 L35.7957769,48.2154492 L35.795,37.455 L31.5463705,37.4558408 L36.3581285,27.4558408 Z"
              transform="translate(36.248142, 37.492173) scale(1, -1) translate(-36.248142, -37.492173) " fill="#749DC0"
              fill-rule="nonzero" />
            <g id="编组-18" transform="translate(62.244579, 0.000000)" fill="#FFFFFF"
              font-family="LucidaGrande, Lucida Grande" font-size="16" font-weight="normal">
              <text id="440V_2">
                <tspan x="0" y="15">440V_2</tspan>
              </text>
            </g>
            <path id="路径-2"
              d="M15.3317112,78.7998947 L15.331,88.274 L19.5811176,88.2745471 L14.7693596,98.2745471 L9.95760161,88.2745471 L14.207,88.274 L14.207008,78.7998947 L15.3317112,78.7998947 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <path id="路径-2备份-2"
              d="M81.1000264,78.7998947 L81.1,88.274 L85.3494328,88.2745471 L80.5376748,98.2745471 L75.7259168,88.2745471 L79.975,88.274 L79.9753232,78.7998947 L81.1000264,78.7998947 Z"
              fill="#749DC0" fill-rule="nonzero" />
          </g>
          <g id="编组-21备份-3" transform="translate(917.224236, 52.865672)">
            <g id="编组-17" transform="translate(0.012226, 47.575516)">
              <rect id="矩形" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF" x="0.5" y="0.5"
                width="107.26601" height="29.2609048" />
              <text id="BV440" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
                fill="#FFFFFF">
                <tspan x="29" y="21">BV440</tspan>
              </text>
            </g>
            <g id="编组-19备份-7"
              transform="translate(15.130452, 137.382073) rotate(-270.000000) translate(-15.130452, -137.382073) translate(-24.859695, 122.251620)">
              <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
                points="0 30.2609048 79.9802956 30.2609048 79.9802956 0 0 0" />
              <text id="空-调"
                transform="translate(39.940865, 15.375138) rotate(-90.000000) translate(-39.940865, -15.375138) "
                font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal" line-spacing="23.414851"
                fill="#FFFFFF">
                <tspan x="30.943165" y="8.96028649">空</tspan>
                <tspan x="30.943165" y="32.3751375">调</tspan>
              </text>
            </g>
            <g id="编组-19备份-5"
              transform="translate(80.997408, 136.868836) rotate(-270.000000) translate(-80.997408, -136.868836) translate(40.992680, 109.053259)">
              <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
                points="0 55.6311539 80.0094562 55.6311539 80.0094562 0 0 0" />
              <text id="悬浮-导向-制动"
                transform="translate(42.468316, 24.399629) rotate(-90.000000) translate(-42.468316, -24.399629) "
                font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal" line-spacing="23.414851"
                fill="#FFFFFF">
                <tspan x="19.5387764" y="6.27735236">悬浮</tspan>
                <tspan x="19.5387764" y="29.6922034">导向</tspan>
                <tspan x="19.5387764" y="53.1070544">制动</tspan>
              </text>
            </g>
            <path id="直线-5备份-12"
              d="M47.6063858,26.4558408 L52.4181438,36.4558408 L48.168,36.455 L48.1687374,47.2154492 L47.0440342,47.2154492 L47.044,36.455 L42.7946278,36.4558408 L47.6063858,26.4558408 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <path id="直线-5备份-13"
              d="M36.3581285,26.4558408 L41.1698865,36.4558408 L36.92,36.455 L36.9204801,47.2154492 L35.7957769,47.2154492 L35.795,36.455 L31.5463705,36.4558408 L36.3581285,26.4558408 Z"
              transform="translate(36.248142, 36.492173) scale(1, -1) translate(-36.248142, -36.492173) " fill="#749DC0"
              fill-rule="nonzero" />
            <g id="编组-18" transform="translate(64.244579, 0.000000)" fill="#FFFFFF"
              font-family="LucidaGrande, Lucida Grande" font-size="16" font-weight="normal">
              <text id="440V_3">
                <tspan x="0" y="15">440V_3</tspan>
              </text>
            </g>
            <path id="路径-2"
              d="M15.3317112,77.7998947 L15.331,87.274 L19.5811176,87.2745471 L14.7693596,97.2745471 L9.95760161,87.2745471 L14.207,87.274 L14.207008,77.7998947 L15.3317112,77.7998947 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <path id="路径-2备份-2"
              d="M81.1000264,77.7998947 L81.1,87.274 L85.3494328,87.2745471 L80.5376748,97.2745471 L75.7259168,87.2745471 L79.975,87.274 L79.9753232,77.7998947 L81.1000264,77.7998947 Z"
              fill="#749DC0" fill-rule="nonzero" />
          </g>
          <g id="编组-21备份-4" transform="translate(917.224236, 298.865672)">
            <g id="编组-17" transform="translate(0.012226, 47.575516)">
              <rect id="矩形" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF" x="0.5" y="0.5"
                width="107.26601" height="29.2609048" />
              <text id="BV440" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
                fill="#FFFFFF">
                <tspan x="29" y="21">BV440</tspan>
              </text>
            </g>
            <g id="编组-19备份-7"
              transform="translate(15.130452, 137.382073) rotate(-270.000000) translate(-15.130452, -137.382073) translate(-24.859695, 122.251620)">
              <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
                points="0 30.2609048 79.9802956 30.2609048 79.9802956 0 0 0" />
              <text id="空-调"
                transform="translate(39.940865, 15.375138) rotate(-90.000000) translate(-39.940865, -15.375138) "
                font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal" line-spacing="23.414851"
                fill="#FFFFFF">
                <tspan x="30.943165" y="8.96028649">空</tspan>
                <tspan x="30.943165" y="32.3751375">调</tspan>
              </text>
            </g>
            <g id="编组-19备份-5"
              transform="translate(80.997408, 136.868836) rotate(-270.000000) translate(-80.997408, -136.868836) translate(40.992680, 109.053259)">
              <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
                points="0 55.6311539 80.0094562 55.6311539 80.0094562 0 0 0" />
              <text id="悬浮-导向-制动"
                transform="translate(42.468316, 24.399629) rotate(-90.000000) translate(-42.468316, -24.399629) "
                font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal" line-spacing="23.414851"
                fill="#FFFFFF">
                <tspan x="19.5387764" y="6.27735236">悬浮</tspan>
                <tspan x="19.5387764" y="29.6922034">导向</tspan>
                <tspan x="19.5387764" y="53.1070544">制动</tspan>
              </text>
            </g>
            <path id="直线-5备份-12"
              d="M47.6063858,26.4558408 L52.4181438,36.4558408 L48.168,36.455 L48.1687374,47.2154492 L47.0440342,47.2154492 L47.044,36.455 L42.7946278,36.4558408 L47.6063858,26.4558408 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <path id="直线-5备份-13"
              d="M36.3581285,26.4558408 L41.1698865,36.4558408 L36.92,36.455 L36.9204801,47.2154492 L35.7957769,47.2154492 L35.795,36.455 L31.5463705,36.4558408 L36.3581285,26.4558408 Z"
              transform="translate(36.248142, 36.492173) scale(1, -1) translate(-36.248142, -36.492173) " fill="#749DC0"
              fill-rule="nonzero" />
            <g id="编组-18" transform="translate(64.244579, 0.000000)" fill="#FFFFFF"
              font-family="LucidaGrande, Lucida Grande" font-size="16" font-weight="normal">
              <text id="440V_4">
                <tspan x="0" y="15">440V_4</tspan>
              </text>
            </g>
            <path id="路径-2"
              d="M15.3317112,77.7998947 L15.331,87.274 L19.5811176,87.2745471 L14.7693596,97.2745471 L9.95760161,87.2745471 L14.207,87.274 L14.207008,77.7998947 L15.3317112,77.7998947 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <path id="路径-2备份-2"
              d="M81.1000264,77.7998947 L81.1,87.274 L85.3494328,87.2745471 L80.5376748,97.2745471 L75.7259168,87.2745471 L79.975,87.274 L79.9753232,77.7998947 L81.1000264,77.7998947 Z"
              fill="#749DC0" fill-rule="nonzero" />
          </g>
          <g id="蓄电池备份" transform="translate(171.254576, 33.086272)" fill="#0DD6FF" fill-opacity="0.4" fill-rule="nonzero"
            stroke="#FFFFFF" stroke-opacity="0.4">
            <polygon id="形状"
              points="41.4728193 4.79890773e-15 40.870517 6.440483 19.7038913 6.440483 19.101589 4.79890773e-15 9.4647513 4.79890773e-15 8.86244895 6.440483 0 6.440483 0 46.8555945 60.4883651 46.8555945 60.4883651 6.440483 51.754981 6.440483 51.1526786 0" />
          </g>
          <g id="蓄电池备份-4" transform="translate(167.254576, 287.086272)" fill="#0DD6FF" fill-opacity="0.4"
            fill-rule="nonzero" stroke="#FFFFFF" stroke-opacity="0.4">
            <polygon id="形状"
              points="41.4728193 4.79890773e-15 40.870517 6.440483 19.7038913 6.440483 19.101589 4.79890773e-15 9.4647513 4.79890773e-15 8.86244895 6.440483 0 6.440483 0 46.8555945 60.4883651 46.8555945 60.4883651 6.440483 51.754981 6.440483 51.1526786 0" />
          </g>
          <g id="蓄电池备份-5" transform="translate(918.254576, 33.086272)" fill="#0DD6FF" fill-opacity="0.4"
            fill-rule="nonzero" stroke="#FFFFFF" stroke-opacity="0.4">
            <polygon id="形状"
              points="41.4728193 4.79890773e-15 40.870517 6.440483 19.7038913 6.440483 19.101589 4.79890773e-15 9.4647513 4.79890773e-15 8.86244895 6.440483 0 6.440483 0 46.8555945 60.4883651 46.8555945 60.4883651 6.440483 51.754981 6.440483 51.1526786 0" />
          </g>
          <g id="蓄电池备份-6" transform="translate(918.254576, 279.086272)" fill="#0DD6FF" fill-opacity="0.4"
            fill-rule="nonzero" stroke="#FFFFFF" stroke-opacity="0.4">
            <polygon id="形状"
              points="41.4728193 4.79890773e-15 40.870517 6.440483 19.7038913 6.440483 19.101589 4.79890773e-15 9.4647513 4.79890773e-15 8.86244895 6.440483 0 6.440483 0 46.8555945 60.4883651 46.8555945 60.4883651 6.440483 51.754981 6.440483 51.1526786 0" />
          </g>
          <text id="100%" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
            fill="#FFFFFF">
            <tspan x="182.75767" y="65.784622">100%</tspan>
          </text>
          <text id="100%备份-3" font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal"
            fill="#FFFFFF">
            <tspan x="173.75767" y="320.784622">100%</tspan>
          </text>
          <text id="100%备份-4" font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal"
            fill="#FFFFFF">
            <tspan x="924.75767" y="66.784622">100%</tspan>
          </text>
          <text id="100%备份-5" font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal"
            fill="#FFFFFF">
            <tspan x="924.75767" y="312.784622">100%</tspan>
          </text>
          <path id="直线-5"
            d="M350.131731,107.22931 L364.131731,114.107404 L350.131731,120.985498 L350.131,115.083 L274.572643,115.083022 L274.572643,113.131785 L350.131,113.131 L350.131731,107.22931 Z"
            fill="#028C13" fill-rule="nonzero" />
          <path id="直线-5备份-5"
            d="M325.330017,362.244486 L339.29698,369.189421 L325.264262,376.000516 L325.292,370.097 L275.543598,369.860306 L274.567991,369.855643 L274.577318,367.904427 L275.552925,367.909091 L325.302,368.146 L325.330017,362.244486 Z"
            fill="#2590A9" fill-rule="nonzero" />
          <g id="编组-19" transform="translate(405.000000, 144.086272)">
            <g id="编组-17备份-2" transform="translate(92.000000, 8.905988)">
              <rect id="矩形" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF" x="0.5" y="0.5"
                width="62" height="48" />
              <text id="BV24V" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
                fill="#FFFFFF">
                <tspan x="6" y="30">BV24V</tspan>
              </text>
            </g>
            <g id="编组-16备份-2" transform="translate(0.000000, 7.905988)">
              <polygon id="Fill-669" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
                points="0 50 56 50 56 0 0 0" />
              <line x1="55.5" y1="0.5" x2="0.5" y2="48.5" id="Stroke-792" stroke-opacity="0.4" stroke="#FFFFFF"
                stroke-linejoin="round" />
              <g id="＝" transform="translate(8.000000, 9.000000)" fill="#FFFFFF" fill-rule="nonzero">
                <path
                  d="M0,0 L0,1.93594306 L15,1.93594306 L15,0 L0,0 Z M0,6.09252669 L0,8 L15,8 L15,6.09252669 L0,6.09252669 Z"
                  id="形状" />
              </g>
              <g id="＝备份" transform="translate(35.000000, 29.000000)" fill="#FFFFFF" fill-rule="nonzero">
                <path
                  d="M0,0 L0,1.93594306 L15,1.93594306 L15,0 L0,0 Z M0,6.09252669 L0,8 L15,8 L15,6.09252669 L0,6.09252669 Z"
                  id="形状" />
              </g>
            </g>
            <path id="直线-5备份-9"
              d="M83.0555556,28.5942297 L93.0555556,33.4059877 L83.0555556,38.2177457 L83.055,33.968 L57.9376484,33.9683393 L57.9376484,32.8436361 L83.055,32.843 L83.0555556,28.5942297 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <path id="直线-5备份-10"
              d="M179.686121,29.4849942 L189.686121,34.2967522 L179.686121,39.1085102 L179.686,34.859 L154.739621,34.8591038 L154.739621,33.7344006 L179.686,33.734 L179.686121,29.4849942 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <path id="直线-5备份-11"
              d="M165.917824,18.2317437 L165.917,22.481 L190.864324,22.4811501 L190.864324,23.6058533 L165.917,23.605 L165.917824,27.8552597 L155.917824,23.0435017 L165.917824,18.2317437 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <g id="编组-15" transform="translate(192.254576, 0.000000)">
              <text id="24V_1" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
                fill="#FFFFFF">
                <tspan x="8.32240497" y="63.5901547">24V_1</tspan>
              </text>
              <g id="蓄电池备份" fill="#00A1FF" fill-opacity="0.2" fill-rule="nonzero" stroke="#FFFFFF" stroke-opacity="0.4">
                <polygon id="形状"
                  points="41.4728193 4.79890773e-15 40.870517 6.440483 19.7038913 6.440483 19.101589 4.79890773e-15 9.4647513 4.79890773e-15 8.86244895 6.440483 0 6.440483 0 46.8555945 60.4883651 46.8555945 60.4883651 6.440483 51.754981 6.440483 51.1526786 0" />
              </g>
              <text id="100%" font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal"
                fill="#FFFFFF">
                <tspan x="6.50309416" y="33.6983504">100%</tspan>
              </text>
            </g>
          </g>
          <g id="编组-19备份" transform="translate(405.000000, 410.086272)">
            <g id="编组-17备份-2" transform="translate(92.000000, 8.905988)">
              <rect id="矩形" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF" x="0.5" y="0.5"
                width="62" height="48" />
              <text id="BV24" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
                fill="#FFFFFF">
                <tspan x="12" y="30">BV24</tspan>
              </text>
            </g>
            <g id="编组-16备份-2" transform="translate(0.000000, 7.905988)">
              <polygon id="Fill-669" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
                points="0 50 56 50 56 0 0 0" />
              <line x1="55.5" y1="0.5" x2="0.5" y2="48.5" id="Stroke-792" stroke-opacity="0.4" stroke="#FFFFFF"
                stroke-linejoin="round" />
              <g id="＝" transform="translate(8.000000, 9.000000)" fill="#FFFFFF" fill-rule="nonzero">
                <path
                  d="M0,0 L0,1.93594306 L15,1.93594306 L15,0 L0,0 Z M0,6.09252669 L0,8 L15,8 L15,6.09252669 L0,6.09252669 Z"
                  id="形状" />
              </g>
              <g id="＝备份" transform="translate(35.000000, 29.000000)" fill="#FFFFFF" fill-rule="nonzero">
                <path
                  d="M0,0 L0,1.93594306 L15,1.93594306 L15,0 L0,0 Z M0,6.09252669 L0,8 L15,8 L15,6.09252669 L0,6.09252669 Z"
                  id="形状" />
              </g>
            </g>
            <path id="直线-5备份-9"
              d="M83.0555556,28.5942297 L93.0555556,33.4059877 L83.0555556,38.2177457 L83.055,33.968 L57.9376484,33.9683393 L57.9376484,32.8436361 L83.055,32.843 L83.0555556,28.5942297 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <path id="直线-5备份-10"
              d="M179.686121,29.4849942 L189.686121,34.2967522 L179.686121,39.1085102 L179.686,34.859 L154.739621,34.8591038 L154.739621,33.7344006 L179.686,33.734 L179.686121,29.4849942 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <path id="直线-5备份-11"
              d="M165.917824,18.2317437 L165.917,22.481 L190.864324,22.4811501 L190.864324,23.6058533 L165.917,23.605 L165.917824,27.8552597 L155.917824,23.0435017 L165.917824,18.2317437 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <g id="编组-15" transform="translate(192.254576, 0.000000)">
              <text id="24V_2" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
                fill="#FFFFFF">
                <tspan x="6.73040497" y="63.5901547">24V_2</tspan>
              </text>
              <g id="蓄电池备份" fill="#00A1FF" fill-opacity="0.2" fill-rule="nonzero" stroke="#FFFFFF" stroke-opacity="0.4">
                <polygon id="形状"
                  points="41.4728193 4.79890773e-15 40.870517 6.440483 19.7038913 6.440483 19.101589 4.79890773e-15 9.4647513 4.79890773e-15 8.86244895 6.440483 0 6.440483 0 46.8555945 60.4883651 46.8555945 60.4883651 6.440483 51.754981 6.440483 51.1526786 0" />
              </g>
              <text id="100%" font-family="PingFangSC-Regular, PingFang SC" font-size="18" font-weight="normal"
                fill="#FFFFFF">
                <tspan x="6.50309416" y="33.6983504">100%</tspan>
              </text>
            </g>
          </g>
          <line x1="434.5" y1="136.492259" x2="532.5" y2="136.492259" id="直线-6" stroke="#749DC0" stroke-width="1.1247032"
            stroke-linecap="square" />
          <line x1="433.5" y1="401.492259" x2="531.5" y2="401.492259" id="直线-6备份-3" stroke="#749DC0"
            stroke-width="1.1247032" stroke-linecap="square" />
          <path id="直线-6备份"
            d="M434.029427,122.139792 L438.841185,132.139792 L434.591,132.139 L434.591778,135.688289 L433.467075,135.688289 L433.467,132.139 L429.217669,132.139792 L434.029427,122.139792 Z"
            fill="#749DC0" fill-rule="nonzero" />
          <path id="直线-6备份-4"
            d="M433.029427,387.139792 L437.841185,397.139792 L433.591,397.139 L433.591778,400.688289 L432.467075,400.688289 L432.467,397.139 L428.217669,397.139792 L433.029427,387.139792 Z"
            fill="#749DC0" fill-rule="nonzero" />
          <path id="直线-6备份-2"
            d="M532.5,120.936704 L537.311758,130.936704 L533.062,130.936 L533.062352,154.054611 L531.937648,154.054611 L531.937,130.936 L527.688242,130.936704 L532.5,120.936704 Z"
            fill="#749DC0" fill-rule="nonzero" />
          <path id="直线-6备份-5"
            d="M531.5,385.936704 L536.311758,395.936704 L532.062,395.936 L532.062352,419.054611 L530.937648,419.054611 L530.937,395.936 L526.688242,395.936704 L531.5,385.936704 Z"
            fill="#749DC0" fill-rule="nonzero" />
          <g id="编组-16备份" transform="translate(405.000000, 26.992259)">
            <polygon id="Fill-669" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
              points="0 50 56 50 56 0 0 0" />
            <line x1="55.5" y1="0.5" x2="0.5" y2="48.5" id="Stroke-792" stroke-opacity="0.4" stroke="#FFFFFF"
              stroke-linejoin="round" />
            <g id="＝" transform="translate(8.000000, 9.000000)" fill="#FFFFFF" fill-rule="nonzero">
              <path
                d="M0,0 L0,1.93594306 L15,1.93594306 L15,0 L0,0 Z M0,6.09252669 L0,8 L15,8 L15,6.09252669 L0,6.09252669 Z"
                id="形状" />
            </g>
            <g id="＝备份" transform="translate(35.000000, 29.000000)" fill="#FFFFFF" fill-rule="nonzero">
              <path
                d="M0,0 L0,1.93594306 L15,1.93594306 L15,0 L0,0 Z M0,6.09252669 L0,8 L15,8 L15,6.09252669 L0,6.09252669 Z"
                id="形状" />
            </g>
          </g>
          <g id="编组-16备份-4" transform="translate(761.000000, 26.992259)">
            <polygon id="Fill-669" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
              points="0 50 56 50 56 0 0 0" />
            <line x1="55.5" y1="0.5" x2="0.5" y2="48.5" id="Stroke-792" stroke-opacity="0.4" stroke="#FFFFFF"
              stroke-linejoin="round" />
            <g id="＝" transform="translate(8.000000, 9.000000)" fill="#FFFFFF" fill-rule="nonzero">
              <path
                d="M0,0 L0,1.93594306 L15,1.93594306 L15,0 L0,0 Z M0,6.09252669 L0,8 L15,8 L15,6.09252669 L0,6.09252669 Z"
                id="形状" />
            </g>
            <g id="＝备份" transform="translate(35.000000, 29.000000)" fill="#FFFFFF" fill-rule="nonzero">
              <path
                d="M0,0 L0,1.93594306 L15,1.93594306 L15,0 L0,0 Z M0,6.09252669 L0,8 L15,8 L15,6.09252669 L0,6.09252669 Z"
                id="形状" />
            </g>
          </g>
          <g id="编组-16备份-7" transform="translate(761.000000, 416.992259)">
            <polygon id="Fill-669" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
              points="0 50 56 50 56 0 0 0" />
            <line x1="55.5" y1="0.5" x2="0.5" y2="48.5" id="Stroke-792" stroke-opacity="0.4" stroke="#FFFFFF"
              stroke-linejoin="round" />
            <g id="＝" transform="translate(8.000000, 9.000000)" fill="#FFFFFF" fill-rule="nonzero">
              <path
                d="M0,0 L0,1.93594306 L15,1.93594306 L15,0 L0,0 Z M0,6.09252669 L0,8 L15,8 L15,6.09252669 L0,6.09252669 Z"
                id="形状" />
            </g>
            <g id="＝备份" transform="translate(35.000000, 29.000000)" fill="#FFFFFF" fill-rule="nonzero">
              <path
                d="M0,0 L0,1.93594306 L15,1.93594306 L15,0 L0,0 Z M0,6.09252669 L0,8 L15,8 L15,6.09252669 L0,6.09252669 Z"
                id="形状" />
            </g>
          </g>
          <g id="编组-16备份-5" transform="translate(761.000000, 143.992259)">
            <polygon id="Fill-669" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
              points="0 50 56 50 56 0 0 0" />
            <line x1="55.5" y1="0.5" x2="0.5" y2="48.5" id="Stroke-792" stroke-opacity="0.4" stroke="#FFFFFF"
              stroke-linejoin="round" />
            <g id="＝" transform="translate(8.000000, 9.000000)" fill="#FFFFFF" fill-rule="nonzero">
              <path
                d="M0,0 L0,1.93594306 L15,1.93594306 L15,0 L0,0 Z M0,6.09252669 L0,8 L15,8 L15,6.09252669 L0,6.09252669 Z"
                id="形状" />
            </g>
            <text id="≈" font-family="MicrosoftSansSerif, Microsoft Sans Serif" font-size="29.8554145"
              font-weight="normal" fill="#FFFFFF">
              <tspan x="34" y="48">≈</tspan>
            </text>
          </g>
          <g id="编组-16备份-6" transform="translate(761.000000, 298.992259)">
            <polygon id="Fill-669" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
              points="0 50 56 50 56 0 0 0" />
            <line x1="55.5" y1="0.5" x2="0.5" y2="48.5" id="Stroke-792" stroke-opacity="0.4" stroke="#FFFFFF"
              stroke-linejoin="round" />
            <g id="＝" transform="translate(8.000000, 9.000000)" fill="#FFFFFF" fill-rule="nonzero">
              <path
                d="M0,0 L0,1.93594306 L15,1.93594306 L15,0 L0,0 Z M0,6.09252669 L0,8 L15,8 L15,6.09252669 L0,6.09252669 Z"
                id="形状" />
            </g>
            <text id="≈" font-family="MicrosoftSansSerif, Microsoft Sans Serif" font-size="29.8554145"
              font-weight="normal" fill="#FFFFFF">
              <tspan x="34" y="48">≈</tspan>
            </text>
          </g>
          <g id="编组-22" transform="translate(405.000000, 282.762641)">
            <g id="编组-16备份-3" transform="translate(0.000000, 7.229618)">
              <polygon id="Fill-669" stroke-opacity="0.4" stroke="#FFFFFF" fill-opacity="0.2" fill="#00A1FF"
                points="0 50 56 50 56 0 0 0" />
              <line x1="55.5" y1="0.5" x2="0.5" y2="48.5" id="Stroke-792" stroke-opacity="0.4" stroke="#FFFFFF"
                stroke-linejoin="round" />
              <g id="＝" transform="translate(8.000000, 9.000000)" fill="#FFFFFF" fill-rule="nonzero">
                <path
                  d="M0,0 L0,1.93594306 L15,1.93594306 L15,0 L0,0 Z M0,6.09252669 L0,8 L15,8 L15,6.09252669 L0,6.09252669 Z"
                  id="形状" />
              </g>
              <g id="＝备份" transform="translate(35.000000, 29.000000)" fill="#FFFFFF" fill-rule="nonzero">
                <path
                  d="M0,0 L0,1.93594306 L15,1.93594306 L15,0 L0,0 Z M0,6.09252669 L0,8 L15,8 L15,6.09252669 L0,6.09252669 Z"
                  id="形状" />
              </g>
            </g>
            <path id="直线-5备份-18"
              d="M85.2789768,9.88625161 L95.2450375,14.7679161 L85.2115886,19.5095317 L85.241,15.26 L56.9607977,15.0621916 L56.3984599,15.0582538 L56.4063355,13.9335781 L56.9686733,13.937516 L85.248,14.135 L85.2789768,9.88625161 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <path id="直线-5备份-19"
              d="M86.5466145,46.2593488 L96.5938223,50.9717398 L86.6420129,55.8823919 L86.6,51.633 L56.9703101,51.9269284 L56.4079862,51.932503 L56.3968369,50.8078551 L56.9591609,50.8022805 L86.588,50.508 L86.5466145,46.2593488 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <g id="Fill-692备份-7" transform="translate(95.300820, 0.000000)">
              <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.975618793" fill-opacity="0.2"
                fill="#00A1FF"
                points="3.55271368e-15 27.6586631 60.4883651 27.6586631 60.4883651 0.341336904 3.55271368e-15 0.341336904" />
              <text id="旅服" font-family="PingFangSC-Regular, PingFang SC" font-size="15.6099007" font-weight="normal"
                letter-spacing="1.56099009" fill="#FFFFFF">
                <tspan x="13.0121535" y="20.2748956">诊断</tspan>
              </text>
            </g>
            <g id="Fill-692备份-8" transform="translate(95.300820, 37.000000)">
              <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.975618793" fill-opacity="0.2"
                fill="#00A1FF"
                points="3.55271368e-15 27.6586631 60.4883651 27.6586631 60.4883651 0.341336904 3.55271368e-15 0.341336904" />
              <text id="旅服" font-family="PingFangSC-Regular, PingFang SC" font-size="15.6099007" font-weight="normal"
                letter-spacing="1.56099009" fill="#FFFFFF">
                <tspan x="13.0121535" y="20.2748956">定位</tspan>
              </text>
            </g>
          </g>
          <path id="直线-5备份"
            d="M391.404751,26.4906468 L405.435042,33.3067378 L391.465608,40.2467001 L391.439,34.343 L363.504316,34.4678686 L362.528707,34.4721847 L362.520075,32.5209662 L363.495684,32.5166501 L391.43,32.392 L391.404751,26.4906468 Z"
            fill="#028C13" fill-rule="nonzero" />
          <path id="直线-5备份-17"
            d="M391.404751,290.490647 L405.435042,297.306738 L391.465608,304.2467 L391.439,298.343 L363.504316,298.467869 L362.528707,298.472185 L362.520075,296.520966 L363.495684,296.51665 L391.43,296.392 L391.404751,290.490647 Z"
            fill="#028C13" fill-rule="nonzero" />
          <path id="直线-5备份-8"
            d="M391.404751,152.490647 L405.435042,159.306738 L391.465608,166.2467 L391.439,160.343 L363.504316,160.467869 L362.528707,160.472185 L362.520075,158.520966 L363.495684,158.51665 L391.43,158.392 L391.404751,152.490647 Z"
            fill="#028C13" fill-rule="nonzero" />
          <path id="直线-5备份-23"
            d="M391.404751,418.490647 L405.435042,425.306738 L391.465608,432.2467 L391.439,426.343 L363.504316,426.467869 L362.528707,426.472185 L362.520075,424.520966 L363.495684,424.51665 L391.43,424.392 L391.404751,418.490647 Z"
            fill="#028C13" fill-rule="nonzero" />
          <path id="直线-5备份-6"
            d="M490.278977,29.6488929 L500.245038,34.5305574 L490.211589,39.272173 L490.241,35.022 L461.960798,34.8248329 L461.39846,34.8208951 L461.406336,33.6962194 L461.968673,33.7001573 L490.248,33.898 L490.278977,29.6488929 Z"
            fill="#749DC0" fill-rule="nonzero" />
          <path id="直线-5备份-7"
            d="M491.546614,66.0219901 L501.593822,70.7343811 L491.642013,75.6450332 L491.6,71.396 L461.97031,71.6895697 L461.407986,71.6951443 L461.396837,70.5704964 L461.959161,70.5649218 L491.588,70.271 L491.546614,66.0219901 Z"
            fill="#749DC0" fill-rule="nonzero" />
          <g id="Fill-692" transform="translate(500.300820, 19.762641)">
            <polygon stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.975618793" fill-opacity="0.2" fill="#00A1FF"
              points="3.55271368e-15 27.6586631 60.4883651 27.6586631 60.4883651 0.341336904 3.55271368e-15 0.341336904" />
            <text id="旅服" font-family="PingFangSC-Regular, PingFang SC" font-size="15.6099007" font-weight="normal"
              letter-spacing="1.56099009" fill="#FFFFFF">
              <tspan x="13.0121535" y="20.2748956">旅服</tspan>
            </text>
          </g>
          <g id="Fill-692备份-8" transform="translate(500.300820, 56.762641)">
            <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.975618793" fill-opacity="0.2"
              fill="#00A1FF"
              points="3.55271368e-15 27.6586631 60.4883651 27.6586631 60.4883651 0.341336904 3.55271368e-15 0.341336904" />
            <text id="旅服" font-family="PingFangSC-Regular, PingFang SC" font-size="15.6099007" font-weight="normal"
              letter-spacing="1.56099009" fill="#FFFFFF">
              <tspan x="13.0121535" y="20.2748956">定位</tspan>
            </text>
          </g>
          <path id="直线-5备份-2"
            d="M391.824177,39.8227197 L405.797163,46.7555293 L391.770363,53.5788024 L391.793,47.676 L338.496183,47.4678706 L337.520572,47.464054 L337.528205,45.5128313 L338.503817,45.516648 L391.801,45.724 L391.824177,39.8227197 Z"
            fill="#2590A9" fill-rule="nonzero" />
          <path id="直线-5备份-20"
            d="M391.824177,303.82272 L405.797163,310.755529 L391.770363,317.578802 L391.793,311.676 L338.496183,311.467871 L337.520572,311.464054 L337.528205,309.512831 L338.503817,309.516648 L391.801,309.724 L391.824177,303.82272 Z"
            fill="#2590A9" fill-rule="nonzero" />
          <path id="直线-5备份-14"
            d="M391.824177,165.82272 L405.797163,172.755529 L391.770363,179.578802 L391.793,173.676 L338.496183,173.467871 L337.520572,173.464054 L337.528205,171.512831 L338.503817,171.516648 L391.801,171.724 L391.824177,165.82272 Z"
            fill="#2590A9" fill-rule="nonzero" />
          <path id="直线-5备份-24"
            d="M391.824177,431.82272 L405.797163,438.755529 L391.770363,445.578802 L391.793,439.676 L338.496183,439.467871 L337.520572,439.464054 L337.528205,437.512831 L338.503817,437.516648 L391.801,437.724 L391.824177,431.82272 Z"
            fill="#2590A9" fill-rule="nonzero" />
          <path id="直线-5备份-3"
            d="M391.429635,52.5553037 L405.43505,59.4223662 L391.440473,66.3114874 L391.435,60.409 L316.717698,60.4678778 L315.74208,60.4686464 L315.740543,58.5174094 L316.716161,58.5166408 L391.434,58.458 L391.429635,52.5553037 Z"
            fill="#0164AA" fill-rule="nonzero" />
          <path id="直线-5备份-21"
            d="M391.429635,316.555304 L405.43505,323.422366 L391.440473,330.311487 L391.435,324.409 L316.717698,324.467878 L315.74208,324.468646 L315.740543,322.517409 L316.716161,322.516641 L391.434,322.458 L391.429635,316.555304 Z"
            fill="#0164AA" fill-rule="nonzero" />
          <path id="直线-5备份-15"
            d="M391.429635,178.555304 L405.43505,185.422366 L391.440473,192.311487 L391.435,186.409 L316.717698,186.467878 L315.74208,186.468646 L315.740543,184.517409 L316.716161,184.516641 L391.434,184.458 L391.429635,178.555304 Z"
            fill="#0164AA" fill-rule="nonzero" />
          <path id="直线-5备份-25"
            d="M391.429635,444.555304 L405.43505,451.422366 L391.440473,458.311487 L391.435,452.409 L316.717698,452.467878 L315.74208,452.468646 L315.740543,450.517409 L316.716161,450.516641 L391.434,450.458 L391.429635,444.555304 Z"
            fill="#0164AA" fill-rule="nonzero" />
          <path id="直线-5备份-4"
            d="M391.456699,65.5598257 L405.435046,72.4818199 L391.41353,79.3159459 L391.431,73.413 L294.150622,73.1082143 L293.175008,73.1051527 L293.181131,71.1539247 L294.156745,71.1569863 L391.438,71.462 L391.456699,65.5598257 Z"
            fill="#749DC0" fill-rule="nonzero" />
          <path id="直线-5备份-22"
            d="M391.456699,329.559826 L405.435046,336.48182 L391.41353,343.315946 L391.431,337.413 L294.150622,337.108214 L293.175008,337.105153 L293.181131,335.153925 L294.156745,335.156986 L391.438,335.462 L391.456699,329.559826 Z"
            fill="#749DC0" fill-rule="nonzero" />
          <path id="直线-5备份-16"
            d="M391.456699,191.559826 L405.435046,198.48182 L391.41353,205.315946 L391.431,199.413 L294.150622,199.108214 L293.175008,199.105153 L293.181131,197.153925 L294.156745,197.156986 L391.438,197.462 L391.456699,191.559826 Z"
            fill="#749DC0" fill-rule="nonzero" />
          <path id="直线-5备份-26"
            d="M391.456699,457.559826 L405.435046,464.48182 L391.41353,471.315946 L391.431,465.413 L294.150622,465.108214 L293.175008,465.105153 L293.181131,463.153925 L294.156745,463.156986 L391.438,463.462 L391.456699,457.559826 Z"
            fill="#749DC0" fill-rule="nonzero" />
          <g id="编组-22备份-9"
            transform="translate(780.341975, 48.671934) scale(-1, 1) translate(-780.341975, -48.671934) translate(665.546114, 28.111176)">
            <path id="直线-5备份"
              d="M64.323487,-5.67807612 L78.2739565,1.29993045 L64.2251417,8.07776026 L64.267,2.175 L46.1707173,2.0460568 L45.1951235,2.03908193 L45.2090732,0.087894215 L46.1846671,0.0948690793 L64.281,0.224 L64.323487,-5.67807612 Z"
              fill="#028C13" fill-rule="nonzero" />
            <path id="直线-5备份-7"
              d="M159.346679,16.3579681 L169.390985,21.076541 L159.436156,25.9810682 L159.396,21.731 L136.643065,21.9434108 L136.080738,21.9486394 L136.070281,20.8239848 L136.632608,20.8187562 L159.386,20.606 L159.346679,16.3579681 Z"
              fill="#749DC0" fill-rule="nonzero" />
            <g id="编组" transform="translate(169.103358, 5.246155)">
              <g id="Fill-692备份"
                transform="translate(30.244183, 15.618531) scale(-1, 1) translate(-30.244183, -15.618531) ">
                <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.975618793" fill-opacity="0.2"
                  fill="#00A1FF"
                  points="-2.84217094e-14 29.2771946 60.4883651 29.2771946 60.4883651 1.95986839 -2.84217094e-14 1.95986839" />
                <text id="旅服" font-family="PingFangSC-Regular, PingFang SC" font-size="15.6099007" font-weight="normal"
                  letter-spacing="1.56099009" fill="#FFFFFF">
                  <tspan x="13.0121535" y="21.9252076">电视</tspan>
                </text>
              </g>
            </g>
            <path id="直线-5备份-2"
              d="M64.216118,7.58506288 L78.2739484,14.3441737 L64.3327859,21.3407561 L64.282,15.438 L32.0041484,15.7122617 L31.0285647,15.720536 L31.012016,13.7693686 L31.9875997,13.7610943 L64.266,13.486 L64.216118,7.58506288 Z"
              fill="#2590A9" fill-rule="nonzero" />
            <path id="直线-5备份-3"
              d="M64.2717662,20.5333269 L78.2739764,27.4069203 L64.276188,34.2895142 L64.274,28.386 L16.6325513,28.4023536 L15.6569325,28.4026672 L15.6563053,26.4514297 L16.631924,26.4511161 L64.273,26.435 L64.2717662,20.5333269 Z"
              fill="#0164AA" fill-rule="nonzero" />
            <path id="直线-5备份-4"
              d="M63.6827427,33.2386977 L77.6827427,40.1167917 L63.6827427,46.9948856 L63.682,41.092 L-0.888835684,41.0924104 L-0.888835684,39.1411729 L63.682,39.141 L63.6827427,33.2386977 Z"
              fill="#749DC0" fill-rule="nonzero" />
          </g>
          <g id="编组-22备份-10"
            transform="translate(780.341975, 438.671934) scale(-1, 1) translate(-780.341975, -438.671934) translate(665.546114, 418.111176)">
          <path id="直线-5备份"
            d="M64.323487,-5.67807612 L78.2739565,1.29993045 L64.2251417,8.07776026 L64.267,2.175 L46.1707173,2.0460568 L45.1951235,2.03908193 L45.2090732,0.087894215 L46.1846671,0.0948690793 L64.281,0.224 L64.323487,-5.67807612 Z"
            fill="#028C13" fill-rule="nonzero" />
          <path id="直线-5备份-7"
            d="M159.346679,16.3579681 L169.390985,21.076541 L159.436156,25.9810682 L159.396,21.731 L136.643065,21.9434108 L136.080738,21.9486394 L136.070281,20.8239848 L136.632608,20.8187562 L159.386,20.606 L159.346679,16.3579681 Z"
            fill="#749DC0" fill-rule="nonzero" />
          <g id="编组" transform="translate(169.103358, 5.246155)">
            <g id="Fill-692备份"
              transform="translate(30.244183, 15.618531) scale(-1, 1) translate(-30.244183, -15.618531) ">
              <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.975618793" fill-opacity="0.2"
                fill="#00A1FF"
                points="3.55271368e-15 29.2771946 60.4883651 29.2771946 60.4883651 1.95986839 3.55271368e-15 1.95986839" />
              <text id="旅服" font-family="PingFangSC-Regular, PingFang SC" font-size="15.6099007" font-weight="normal"
                letter-spacing="1.56099009" fill="#FFFFFF">
                <tspan x="13.0121535" y="21.9252076">车窗</tspan>
              </text>
            </g>
          </g>
          <path id="直线-5备份-2"
            d="M64.216118,7.58506288 L78.2739484,14.3441737 L64.3327859,21.3407561 L64.282,15.438 L32.0041484,15.7122617 L31.0285647,15.720536 L31.012016,13.7693686 L31.9875997,13.7610943 L64.266,13.486 L64.216118,7.58506288 Z"
            fill="#2590A9" fill-rule="nonzero" />
          <path id="直线-5备份-3"
            d="M64.2717662,20.5333269 L78.2739764,27.4069203 L64.276188,34.2895142 L64.274,28.386 L16.6325513,28.4023536 L15.6569325,28.4026672 L15.6563053,26.4514297 L16.631924,26.4511161 L64.273,26.435 L64.2717662,20.5333269 Z"
            fill="#0164AA" fill-rule="nonzero" />
          <path id="直线-5备份-4"
            d="M63.6827427,33.2386977 L77.6827427,40.1167917 L63.6827427,46.9948856 L63.682,41.092 L-0.888835684,41.0924104 L-0.888835684,39.1411729 L63.682,39.141 L63.6827427,33.2386977 Z"
            fill="#749DC0" fill-rule="nonzero" />
        </g>
        <path id="直线-5备份-7"
          d="M752.805872,163.92582 L762.756855,168.838147 L752.708854,173.548847 L752.751,169.299 L728.44323,169.054582 L727.880907,169.048913 L727.892246,167.924267 L728.454569,167.929936 L752.762,168.174 L752.805872,163.92582 Z"
          transform="translate(744.974450, 168.925533) scale(-1, 1) translate(-744.974450, -168.925533) " fill="#749DC0"
          fill-rule="nonzero" />
        <path id="直线-5备份-27"
          d="M752.805872,318.92582 L762.756855,323.838147 L752.708854,328.548847 L752.751,324.299 L728.44323,324.054582 L727.880907,324.048913 L727.892246,322.924267 L728.454569,322.929936 L752.762,323.174 L752.805872,318.92582 Z"
          transform="translate(744.974450, 323.925533) scale(-1, 1) translate(-744.974450, -323.925533) " fill="#749DC0"
          fill-rule="nonzero" />
        <g id="Fill-692备份" transform="translate(667.497351, 151.973153)">
          <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.975618793" fill-opacity="0.2"
            fill="#00A1FF"
            points="-1.42108547e-14 29.2771946 60.4883651 29.2771946 60.4883651 1.95986839 -1.42108547e-14 1.95986839" />
          <text id="旅服" font-family="PingFangSC-Regular, PingFang SC" font-size="15.6099007" font-weight="normal"
            letter-spacing="1.56099009" fill="#FFFFFF">
            <tspan x="13.0121535" y="21.9252076">插座</tspan>
          </text>
        </g>
        <g id="Fill-692备份" transform="translate(667.497351, 306.973153)">
          <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.975618793" fill-opacity="0.2"
            fill="#00A1FF"
            points="-1.42108547e-14 29.2771946 60.4883651 29.2771946 60.4883651 1.95986839 -1.42108547e-14 1.95986839" />
          <text id="旅服" font-family="PingFangSC-Regular, PingFang SC" font-size="15.6099007" font-weight="normal"
            letter-spacing="1.56099009" fill="#FFFFFF">
            <tspan x="13.0121535" y="21.9252076">插座</tspan>
          </text>
        </g>
        <path id="直线-5备份-2"
          d="M856.44543,161.5647 L870.419576,168.495172 L856.393917,175.320792 L856.415,169.418 L817.438044,169.272395 L816.462432,169.268742 L816.469738,167.317518 L817.44535,167.321171 L856.423,167.466 L856.44543,161.5647 Z"
          transform="translate(843.570902, 168.592663) scale(-1, 1) translate(-843.570902, -168.592663) " fill="#2590A9"
          fill-rule="nonzero" />
        <path id="直线-5备份-28"
          d="M856.44543,316.5647 L870.419576,323.495172 L856.393917,330.320792 L856.415,324.418 L817.438044,324.272395 L816.462432,324.268742 L816.469738,322.317518 L817.44535,322.321171 L856.423,322.466 L856.44543,316.5647 Z"
          transform="translate(843.570902, 323.592663) scale(-1, 1) translate(-843.570902, -323.592663) " fill="#2590A9"
          fill-rule="nonzero" />
        <g id="Fill-692备份-2" transform="translate(500.622126, 91.950666)">
          <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.975618793" fill-opacity="0.2"
            fill="#00A1FF"
            points="3.55271368e-15 29.2771946 60.4883651 29.2771946 60.4883651 1.95986839 3.55271368e-15 1.95986839" />
          <text id="旅服" font-family="PingFangSC-Regular, PingFang SC" font-size="15.6099007" font-weight="normal"
            letter-spacing="1.56099009" fill="#FFFFFF">
            <tspan x="13.0121535" y="21.9252076">定位</tspan>
          </text>
        </g>
        <g id="Fill-692备份-2" transform="translate(500.622126, 358.656435)">
          <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.975618793" fill-opacity="0.2"
            fill="#00A1FF"
            points="3.55271368e-15 29.2771946 60.4883651 29.2771946 60.4883651 1.95986839 3.55271368e-15 1.95986839" />
          <text id="旅服" font-family="PingFangSC-Regular, PingFang SC" font-size="15.6099007" font-weight="normal"
            letter-spacing="1.56099009" fill="#FFFFFF">
            <tspan x="13.0121535" y="21.9252076">定位</tspan>
          </text>
        </g>
        <g id="Fill-692备份-3" transform="translate(406.182153, 91.950666)">
          <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.975618793" fill-opacity="0.2"
            fill="#00A1FF"
            points="2.84217094e-14 29.2771946 60.4883651 29.2771946 60.4883651 1.95986839 2.84217094e-14 1.95986839" />
          <text id="旅服" font-family="PingFangSC-Regular, PingFang SC" font-size="15.6099007" font-weight="normal"
            letter-spacing="1.56099009" fill="#FFFFFF">
            <tspan x="13.0121535" y="21.9252076">烟火</tspan>
          </text>
        </g>
        <g id="Fill-692备份-5" transform="translate(402.425965, 358.656435)">
          <polygon id="Fill-692" stroke-opacity="0.4" stroke="#FFFFFF" stroke-width="0.975618793" fill-opacity="0.2"
            fill="#00A1FF"
            points="3.55271368e-15 29.2771946 60.4883651 29.2771946 60.4883651 1.95986839 3.55271368e-15 1.95986839" />
          <text id="旅服" font-family="PingFangSC-Regular, PingFang SC" font-size="15.6099007" font-weight="normal"
            letter-spacing="1.56099009" fill="#FFFFFF">
            <tspan x="13.0121535" y="21.9252076">照明</tspan>
          </text>
        </g>
        <g id="编组-22备份-4"
          transform="translate(899.456480, 116.059720) scale(-1, 1) translate(-899.456480, -116.059720) translate(882.383151, 115.083562)"
          fill="#096FAE" fill-rule="nonzero">
          <path id="直线-5备份-3"
            d="M20.5894296,-5.64660942 L34.5894296,1.23148454 L20.5894296,8.1095785 L20.589,2.207 L-0.808468001,2.20710333 L-0.808468001,0.255865748 L20.589,0.255 L20.5894296,-5.64660942 Z" />
        </g>
        <g id="编组-22备份-7"
          transform="translate(906.285811, 359.123116) scale(-1, 1) translate(-906.285811, -359.123116) translate(895.066195, 358.146958)"
          fill="#749DC0" fill-rule="nonzero">
          <path id="直线-5备份-3"
            d="M8.56182701,-5.80168196 L22.4799431,1.24063445 L8.39999684,7.95355403 L8.469,2.051 L-0.011477348,1.9517095 L-0.987028627,1.94023215 L-0.964073932,-0.0108704095 L0.011477348,0.000606938474 L8.491,0.1 L8.56182701,-5.80168196 Z" />
        </g>
        <text id="N1电网" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
          letter-spacing="1.6" fill="#749DC0">
          <tspan x="116.940945" y="32.2090827">N1电网</tspan>
        </text>
        <text id="N3电网" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
          letter-spacing="1.6" fill="#749DC0">
          <tspan x="1007.94095" y="32.2090827">N3电网</tspan>
        </text>
        <text id="N4电网" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
          letter-spacing="1.6" fill="#749DC0">
          <tspan x="1007.94095" y="280.209083">N4电网</tspan>
        </text>
        <text id="N2电网" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
          letter-spacing="1.6" fill="#749DC0">
          <tspan x="116.940945" y="285.209083">N2电网</tspan>
        </text>
        <g id="编组-11" transform="translate(1025.433498, 37.992259)">
          <path d="M17.5665025,187.390254 L166.79803,187.390254 L166.79803,0 L17.5665025,0 L17.5665025,187.390254 Z"
            id="Fill-5" stroke-opacity="0.498381501" stroke="#FFFFFF" fill-opacity="0.1" fill="#00A1FF"
            stroke-dasharray="4" />
          <g id="编组-14" transform="translate(24.394089, 8.785424)">
            <rect id="矩形备份-6" stroke="#749DC0" x="0.5" y="0.5" width="30.2118227" height="27.3085883" />
            <rect id="矩形备份-6" stroke="#749DC0" x="35.6133005" y="0.5" width="30.2118227" height="27.3085883" />
            <rect id="矩形备份-6" stroke="#749DC0" x="70.726601" y="0.5" width="30.2118227" height="27.3085883" />
            <rect id="矩形备份-6" stroke="#749DC0" x="105.839901" y="0.5" width="30.2118227" height="27.3085883" />
            <text id="16" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
              fill="#FFFFFF">
              <tspan x="5" y="20">16</tspan>
            </text>
            <text id="14" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
              fill="#FFFFFF">
              <tspan x="40" y="20">14</tspan>
            </text>
            <text id="9" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
              fill="#FFFFFF">
              <tspan x="81.1491812" y="20">9</tspan>
            </text>
            <text id="23" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
              fill="#FFFFFF">
              <tspan x="111.298362" y="20">23</tspan>
            </text>
          </g>
          <g id="编组-14备份" transform="translate(24.394089, 129.829043)">
            <rect id="矩形备份-6" stroke="#749DC0" x="0.5" y="0.5" width="30.2118227" height="27.3085883" />
            <rect id="矩形备份-6" stroke="#749DC0" x="35.6133005" y="0.5" width="30.2118227" height="27.3085883" />
            <rect id="矩形备份-6" stroke="#749DC0" x="70.726601" y="0.5" width="30.2118227" height="27.3085883" />
            <rect id="矩形备份-6" stroke="#749DC0" x="105.839901" y="0.5" width="30.2118227" height="27.3085883" />
            <text id="30" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
              fill="#FFFFFF">
              <tspan x="5.41658907" y="20.9589513">30</tspan>
            </text>
            <text id="2" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
              fill="#FFFFFF">
              <tspan x="45.8683931" y="20.9589513">2</tspan>
            </text>
            <text id="7" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
              fill="#FFFFFF">
              <tspan x="80.9816936" y="20.9589513">7</tspan>
            </text>
            <text id="25" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
              fill="#FFFFFF">
              <tspan x="111.244175" y="20.9589513">25</tspan>
            </text>
          </g>
          <text id="HS" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
            letter-spacing="0.803200028" fill="#FFFFFF">
            <tspan x="78.0394089" y="179.145925">HS</tspan>
          </text>
          <ellipse id="椭圆形备份-4" fill="#749DC0" cx="39.884931" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
          <ellipse id="椭圆形备份-5" fill="#749DC0" cx="74.9982315" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
          <ellipse id="椭圆形备份-6" fill="#749DC0" cx="109.136163" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
          <ellipse id="椭圆形备份-7" fill="#749DC0" cx="145.224833" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
          <line x1="39.9359692" y1="37.4906536" x2="39.9359692" y2="129.95236" id="直线-2备份-3" stroke="#749DC0"
            stroke-width="1.1247032" stroke-linecap="square" />
          <line x1="75.0492697" y1="37.4906536" x2="75.0492697" y2="129.95236" id="直线-2备份-4" stroke="#749DC0"
            stroke-width="1.1247032" stroke-linecap="square" />
          <line x1="109.187201" y1="37.4906536" x2="109.187201" y2="129.95236" id="直线-2备份-5" stroke="#749DC0"
            stroke-width="1.1247032" stroke-linecap="square" />
          <line x1="145.275871" y1="37.4906536" x2="145.275871" y2="129.95236" id="直线-2备份-6" stroke="#749DC0"
            stroke-width="1.1247032" stroke-linecap="square" />
          <path id="直线-3"
            d="M8.56650246,76.060953 L8.566,80.012 L148.554312,80.0121906 L148.554312,80.9878094 L8.566,80.987 L8.56650246,84.939047 L-0.433497537,80.5 L8.56650246,76.060953 Z"
            fill="#749DC0" fill-rule="nonzero" />
        </g>
        <g id="编组-11" transform="translate(1025.433498, 286.992259)">
          <path d="M17.5665025,187.390254 L166.79803,187.390254 L166.79803,0 L17.5665025,0 L17.5665025,187.390254 Z"
            id="Fill-5" stroke-opacity="0.498381501" stroke="#FFFFFF" fill-opacity="0.1" fill="#00A1FF"
            stroke-dasharray="4" />
          <g id="编组-14" transform="translate(24.394089, 8.785424)">
            <rect id="矩形备份-6" stroke="#749DC0" x="0.5" y="0.5" width="30.2118227" height="27.3085883" />
            <rect id="矩形备份-6" stroke="#749DC0" x="35.6133005" y="0.5" width="30.2118227" height="27.3085883" />
            <rect id="矩形备份-6" stroke="#749DC0" x="105.839901" y="0.5" width="30.2118227" height="27.3085883" />
            <text id="28" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
              fill="#FFFFFF">
              <tspan x="5" y="20">28</tspan>
            </text>
            <text id="10" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
              fill="#FFFFFF">
              <tspan x="40" y="20">10</tspan>
            </text>
            <text id="21" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
              fill="#FFFFFF">
              <tspan x="111.298362" y="20">21</tspan>
            </text>
          </g>
          <g id="编组-14备份" transform="translate(24.394089, 129.829043)">
            <rect id="矩形备份-6" stroke="#749DC0" x="0.5" y="0.5" width="30.2118227" height="27.3085883" />
            <rect id="矩形备份-6" stroke="#749DC0" x="35.6133005" y="0.5" width="30.2118227" height="27.3085883" />
            <rect id="矩形备份-6" stroke="#749DC0" x="70.726601" y="0.5" width="30.2118227" height="27.3085883" />
            <rect id="矩形备份-6" stroke="#749DC0" x="105.839901" y="0.5" width="30.2118227" height="27.3085883" />
            <text id="19" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
              fill="#FFFFFF">
              <tspan x="5.41658907" y="20.9589513">19</tspan>
            </text>
            <text id="12" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
              fill="#FFFFFF">
              <tspan x="41.0175743" y="20.9589513">12</tspan>
            </text>
            <text id="5" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
              fill="#FFFFFF">
              <tspan x="80.9816936" y="20.9589513">5</tspan>
            </text>
            <text id="19" font-family="ArialMT, Arial" font-size="16" font-weight="normal" letter-spacing="0.803200028"
              fill="#FFFFFF">
              <tspan x="111.244175" y="20.9589513">19</tspan>
            </text>
          </g>
          <text id="HS" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
            letter-spacing="0.803200028" fill="#FFFFFF">
            <tspan x="78.0394089" y="179.145925">HS</tspan>
          </text>
          <ellipse id="椭圆形备份-4" fill="#749DC0" cx="39.884931" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
          <ellipse id="椭圆形备份-5" fill="#749DC0" cx="74.9982315" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
          <ellipse id="椭圆形备份-6" fill="#749DC0" cx="109.136163" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
          <ellipse id="椭圆形备份-7" fill="#749DC0" cx="145.224833" cy="80.9059701" rx="2.81103942" ry="2.81331264" />
          <line x1="39.9359692" y1="37.4906536" x2="39.9359692" y2="129.95236" id="直线-2备份-3" stroke="#749DC0"
            stroke-width="1.1247032" stroke-linecap="square" />
          <line x1="75.0492697" y1="37.4906536" x2="75.0492697" y2="129.95236" id="直线-2备份-4" stroke="#749DC0"
            stroke-width="1.1247032" stroke-linecap="square" />
          <line x1="109.066502" y1="80.5" x2="109.187201" y2="129.95236" id="直线-2备份-5" stroke="#749DC0"
            stroke-width="1.1247032" stroke-linecap="square" />
          <line x1="145.275871" y1="37.4906536" x2="145.275871" y2="129.95236" id="直线-2备份-6" stroke="#749DC0"
            stroke-width="1.1247032" stroke-linecap="square" />
          <path id="直线-3"
            d="M8.56650246,76.060953 L8.566,80.012 L148.554312,80.0121906 L148.554312,80.9878094 L8.566,80.987 L8.56650246,84.939047 L-0.433497537,80.5 L8.56650246,76.060953 Z"
            fill="#749DC0" fill-rule="nonzero" />
        </g>
        <g id="编组-4" transform="translate(293.551928, 17.983250)" stroke-linecap="square" stroke-width="1.95123759">
          <line x1="69.0704093" y1="0" x2="69.0704093" y2="465.070735" id="路径" stroke="#028C13" />
          <path d="M45.9480716,0.00900903775 L45.9480716,466.009009" id="形状" stroke="#2590A9" />
          <line x1="23.3338215" y1="0" x2="23.3338215" y2="465.070735" id="路径" stroke="#096FAE" />
          <line x1="0.562351601" y1="0" x2="0.562351601" y2="465.070735" id="路径" stroke="#749DC0" />
        </g>
        <g id="编组-4备份"
          transform="translate(875.690452, 250.483250) scale(-1, 1) translate(-875.690452, -250.483250) translate(855.508353, 17.983250)"
          stroke-linecap="square" stroke-width="1.95123759">
          <line x1="39.8018455" y1="0" x2="39.8018455" y2="464.072729" id="路径" stroke="#028C13" />
          <path d="M26.3725501,0.00900903775 L26.3725501,465.009009" id="形状" stroke="#2590A9" />
          <line x1="13.5776336" y1="0" x2="13.5776336" y2="464.072729" id="路径" stroke="#096FAE" />
          <line x1="0.562351601" y1="0" x2="0.562351601" y2="464.072729" id="路径" stroke="#749DC0" />
        </g>
        <g id="编组-4备份-2"
          transform="translate(594.662638, 245.637834) rotate(-90.000000) translate(-594.662638, -245.637834) translate(575.129416, -53.687045)"
          stroke-width="1.95123759">
          <line x1="38.2399088" y1="67.2814696" x2="38.6041777" y2="561.82436" id="路径" stroke="#028C13"
            stroke-linecap="square" />
          <path
            d="M25.433324,44.948584 L25.433324,63.4955901 M25.433324,69.3525394 L25.433324,557.431648 M25.8681736,562.995999 L25.8681736,573.580959 M25.8681736,69.6945998 C27.4210647,69.6945998 28.6799316,68.4350368 28.6799316,66.8812872 C28.6799316,65.3275375 27.4210647,64.0679745 25.8681736,64.0679745 M25.8681736,562.777856 C27.4210647,562.777856 28.6799316,561.518293 28.6799316,559.964543 C28.6799316,558.410794 27.4210647,557.151231 25.8681736,557.151231"
            id="形状" stroke="#2590A9" stroke-linecap="square" />
          <g id="编组-10" transform="translate(11.809384, 20.899671)" stroke="#096FAE">
            <path
              d="M0.940896126,0.621116028 L0.940896126,20.1442804 M0.940896126,26.0012297 L0.940896126,43.5720776 M0.940896126,49.4290269 L0.940896126,535.555819 M0.562351601,543.046462 L0.562351601,550.558976 M0.562351601,556.413436 L0.562351601,566.32369"
              id="形状" stroke-linecap="square" />
            <path
              d="M0.562351601,25.5294462 C2.11524267,25.5294462 3.3741096,24.2698832 3.3741096,22.7161336 C3.3741096,21.1623839 2.11524267,19.9028209 0.562351601,19.9028209"
              id="路径" />
            <path
              d="M0.562351601,541.878185 C2.11524267,541.878185 3.3741096,540.618622 3.3741096,539.064873 C3.3741096,537.511123 2.11524267,536.25156 0.562351601,536.25156"
              id="路径备份-4" />
            <path
              d="M0.562351601,556.358244 C2.11524267,556.358244 3.3741096,555.098681 3.3741096,553.544931 C3.3741096,551.991182 2.11524267,550.731619 0.562351601,550.731619"
              id="路径备份-5" />
            <path
              d="M0.562351601,48.7949291 C2.11524267,48.7949291 3.3741096,47.5353661 3.3741096,45.9816164 C3.3741096,44.4278668 2.11524267,43.1683038 0.562351601,43.1683038"
              id="路径备份-2" />
          </g>
          <g id="编组-9" stroke="#749DC0">
            <line x1="0.562351601" y1="0" x2="0.555044834" y2="19.0803912" id="路径" stroke-linecap="square" />
            <line x1="0.555044834" y1="23.9611823" x2="0.562351601" y2="41.6400082" id="路径备份-8"
              stroke-linecap="square" />
            <line x1="0.555044834" y1="48.3651378" x2="0.555044834" y2="63.007511" id="路径备份-9"
              stroke-linecap="square" />
            <line x1="0.562351601" y1="70.3286977" x2="0.555044834" y2="556.575255" id="路径备份-10"
              stroke-linecap="square" />
            <path
              d="M0,562.20188 C1.55289107,562.20188 2.811758,560.942317 2.811758,559.388568 C2.811758,557.834818 1.55289107,556.575255 0,556.575255"
              id="路径" />
            <path
              d="M0,575.705781 C1.55289107,575.705781 2.811758,574.446218 2.811758,572.892468 C2.811758,571.338719 1.55289107,570.079156 0,570.079156"
              id="路径备份-11" />
            <path
              d="M0,589.209682 C1.55289107,589.209682 2.811758,587.950119 2.811758,586.396369 C2.811758,584.842619 1.55289107,583.583056 0,583.583056"
              id="路径备份-12" />
            <line x1="0.562351601" y1="562.20188" x2="0.562351601" y2="569.678973" id="直线-4" stroke-linecap="square" />
            <line x1="0.562351601" y1="575.705781" x2="0.562351601" y2="583.182874" id="直线-4备份"
              stroke-linecap="square" />
            <path d="M0.562351601,589.209682 C0.562351601,595.503065 0.562351601,598.649757 0.562351601,598.649757"
              id="直线-4备份-2" stroke-linecap="square" />
            <path
              d="M0,24.2889592 C1.55289107,24.2889592 2.811758,23.0293962 2.811758,21.4756465 C2.811758,19.9218968 1.55289107,18.6623339 0,18.6623339"
              id="路径" />
            <path
              d="M0,47.4052752 C1.55289107,47.4052752 2.811758,46.1457122 2.811758,44.5919625 C2.811758,43.0382129 1.55289107,41.7786499 0,41.7786499"
              id="路径备份-6" />
            <path
              d="M0,69.6945998 C1.55289107,69.6945998 2.811758,68.4350368 2.811758,66.8812872 C2.811758,65.3275375 1.55289107,64.0679745 0,64.0679745"
              id="路径备份-7" />
          </g>
        </g>
        <text id="N1" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
          letter-spacing="0.553086376" fill="#028C13">
          <tspan x="354.945335" y="17">N1</tspan>
        </text>
        <text id="N2" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
          letter-spacing="0.553086376" fill="#2590A9">
          <tspan x="328.863378" y="17">N2</tspan>
        </text>
        <text id="N3" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
          letter-spacing="0.553086376" fill="#096FAE">
          <tspan x="305.632335" y="17">N3</tspan>
        </text>
        <text id="N4" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal"
          letter-spacing="0.553086424" fill="#749DC0">
          <tspan x="281.525996" y="17">N4</tspan>
        </text>
      </g>
    </g>
  </g>
  <!-- 曲线框图 -->
  <g>
    <rect stroke="#00A1FF" stroke-width="1" fill="none" fill-rule="evenodd" width="591px" height="150px" x="40px"
      y="733px"></rect>
    <rect stroke="#00A1FF" stroke-width="1" fill="none" fill-rule="evenodd" width="591px" height="150px" x="656px"
      y="733px"></rect>
    <rect stroke="#00A1FF" stroke-width="1" fill="none" fill-rule="evenodd" width="591px" height="150px" x="1271px"
      y="733px"></rect>
    <rect stroke="#00A1FF" stroke-width="1" fill="none" fill-rule="evenodd" width="591px" height="150px" x="40px"
      y="891px"></rect>
    <rect stroke="#00A1FF" stroke-width="1" fill="none" fill-rule="evenodd" width="591px" height="150px" x="656px"
      y="891px"></rect>
    <rect stroke="#00A1FF" stroke-width="1" fill="none" fill-rule="evenodd" width="591px" height="150px" x="1271px"
      y="891px"></rect>
  </g>
  <foreignObject width="100%" height="100%">
    <div class="SpeedStyle0">
      <batt11 :total_volt="x_array1.total_volt_array" />
    </div>
    <div class="SpeedStyle1">
      <batt12 :current="x_array1.current_array" />
    </div>
    <div class="SpeedStyle2">
      <batt13 :max_temp="x_array1.max_temp_array" />
      <!-- 最高温度 -->
    </div>
    <div class="SpeedStyle11">
      <batt14 :soc="x_array1.soc_array" />
      <!-- 总电量 -->
    </div>
    <div class="SpeedStyle21">
      <batt15 :max_volt="x_array1.max_volt_array" />
      <!-- 总电压 -->
    </div>
    <div class="SpeedStyle31">
      <batt16 :min_volt="x_array1.min_volt_array" />
      <!-- 总电压 -->
    </div>
  </foreignObject>
</svg></template>

<style scoped>.backG {
  z-index: -100;
  background: #000;
  width: 1920px;
  height: 1080px;
  position: absolute;
  top: 0px;
  left: 0px;
}

.routeStep {
  position: absolute;
  top: 10px;
  left: 20px;
}

.bgBackground {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: -100;
  background-image: url(../assets/bg2.jpg);
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: 100% 100%;
}

.SpeedStyle0 {
  position: absolute;
  top: 740px;
  left: 30px;
}

.SpeedStyle1 {
  position: absolute;
  top: 740px;
  left: 656px;
}

.SpeedStyle2 {
  position: absolute;
  top: 740px;
  left: 1271px;
}

.SpeedStyle11 {
  position: absolute;
  top: 895px;
  left: 30px;
}

.SpeedStyle21 {
  position: absolute;
  top: 895px;
  left: 656px;
}

.SpeedStyle31 {
  position: absolute;
  top: 895px;
  left: 1271px;
}

#button1 {
  position: absolute;
  top: 575px;
  left: 1150px;
}</style>
