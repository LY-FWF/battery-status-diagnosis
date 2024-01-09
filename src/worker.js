let websocketUrl = null;
let socket = null;

// 在 web worker 中创建一个 WebSocket 客户端
self.onmessage = function (event) {
  websocketUrl = event.data;

  // 初始连接
  connectWebSocket();
};

// 建立 WebSocket 连接
function connectWebSocket() {
  socket = new WebSocket(websocketUrl);

  // 处理 WebSocket 连接事件
  socket.onopen = function () {
    console.log("WebSocket 连接已建立");
  };

  // 处理 WebSocket 接收到的消息
  socket.onmessage = function (event) {
    const processedData = handleReceivedData(event.data);
    postMessage(processedData);
  };

  // 处理 WebSocket 关闭事件
  socket.onclose = function () {
    console.log("WebSocket 连接已关闭");
    // 断开后重新连接
    setTimeout(connectWebSocket, 2000);
  };

  // 处理 WebSocket 错误事件
  socket.onerror = function (error) {
    console.error("WebSocket 错误:", error);
    // 出错后重新连接
    setTimeout(connectWebSocket, 2000);
  };
}

// 处理接收到的数据
function handleReceivedData(data) {
    // ...
      var data1 = data.toString('hex');
      var data2 = data1.replaceAll(' ','')   
      
      let str = JSON.stringify(data2);
      return str;
              
    var Batt_faultsum = {
      Batt0_faultsum:{fan_fault:0,overdischarge_alarm:0,overcharge_alarm:0,relay_fault:0,comm_fault:0,volt_acquisition_fault:0,low_temp_alarm:0,high_temp_alarm:0,c_overdischarge_alarm:0,c_overcharge_alarm:0},
      Batt1_faultsum:{fan_fault:0,overdischarge_alarm:0,overcharge_alarm:0,relay_fault:0,comm_fault:0,volt_acquisition_fault:0,low_temp_alarm:0,high_temp_alarm:0,c_overdischarge_alarm:0,c_overcharge_alarm:0},
      Batt2_faultsum:{fan_fault:0,overdischarge_alarm:0,overcharge_alarm:0,relay_fault:0,comm_fault:0,volt_acquisition_fault:0,low_temp_alarm:0,high_temp_alarm:0,c_overdischarge_alarm:0,c_overcharge_alarm:0},
      Batt3_faultsum:{fan_fault:0,overdischarge_alarm:0,overcharge_alarm:0,relay_fault:0,comm_fault:0,volt_acquisition_fault:0,low_temp_alarm:0,high_temp_alarm:0,c_overdischarge_alarm:0,c_overcharge_alarm:0},
      //风扇故障  ,过放报警,  过充报警, 充电继电器故障,  内部通信故障,  单体电压采集故障,  电池低温报警,  电池高温报警,  放电过流报警,   充电过流报警
    }
    var lastmsg1 = ['00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000'];
    var g_batt0123fault_arr = ['00000000','00000000','00000000','00000000','00000000','00000000','00000000','00000000']  //故障数组值（全局变量）
    function dataProcess(batt_arr) {   //截取故障数组方法
      var batt0comid_port1_msg2=Number(batt_arr.slice(35,36)*256)+Number(batt_arr.slice(36,37))//获取蓄电池0接口1报文2 canid
      var batt1comid_port1_msg2=Number(batt_arr.slice(55,56)*256)+Number(batt_arr.slice(56,57))//获取蓄电池1接口1报文2 canid
      var batt2comid_port1_msg2=Number(batt_arr.slice(75,76)*256)+Number(batt_arr.slice(76,77))//获取蓄电池2接口1报文2 canid
      var batt3comid_port1_msg2=Number(batt_arr.slice(95,96)*256)+Number(batt_arr.slice(96,97))//获取蓄电池3接口1报文2 canid
      var batt0comid_port2_msg2=Number(batt_arr.slice(115,116)*256)+Number(batt_arr.slice(116,117))//获取蓄电池0接口2报文2 canid
      var batt1comid_port2_msg2=Number(batt_arr.slice(135,136)*256)+Number(batt_arr.slice(136,137))//获取蓄电池1接口2报文2 canid
      var batt2comid_port2_msg2=Number(batt_arr.slice(155,156)*256)+Number(batt_arr.slice(156,157))//获取蓄电池2接口2报文2 canid
      var batt3comid_port2_msg2=Number(batt_arr.slice(175,176)*256)+Number(batt_arr.slice(176,177))//获取蓄电池3接口2报文2 canid
      var batt0fault_arr;
      var batt1fault_arr;
      var batt2fault_arr;
      var batt3fault_arr;
      if(batt0comid_port1_msg2!=0){    //先判断蓄电池0接口1报文2的CANID是否为0，若为0，则继续判断接口2报文2的CANID是否为0，若还为0，则数据无效，故障数组值（全局变量）不变。
        batt0fault_arr = batt_arr.slice(42,44)// 获取对应故障位数组
      }
      else if(batt0comid_port2_msg2!=0){
        batt0fault_arr = batt_arr.slice(122,124)// 获取对应故障位数组
      }
      else{
        batt0fault_arr = g_batt0123fault_arr.slice(0,2)
      }
     
      if(batt1comid_port1_msg2!=0){  //先判断蓄电池1接口1报文2的CANID是否为0，若为0，则继续判断接口2报文2的CANID是否为0，若还为0，则数据无效，故障数组值（全局变量）不变。
        batt1fault_arr = batt_arr.slice(62,64) // 获取对应故障位数组
      }
      else if(batt1comid_port2_msg2!=0){
        batt1fault_arr = batt_arr.slice(142,144) // 获取对应故障位数组
      }
      else{
        batt1fault_arr = g_batt0123fault_arr.slice(2,4)
      }
    
      if(batt2comid_port1_msg2!=0){  //先判断蓄电池2接口1报文2的CANID是否为0，若为0，则继续判断接口2报文2的CANID是否为0，若还为0，则数据无效，故障数组值（全局变量）不变。
        batt2fault_arr = batt_arr.slice(82,84)// 获取对应故障位数组
      }
      else if(batt2comid_port2_msg2!=0){
        batt2fault_arr = batt_arr.slice(162,164)// 获取对应故障位数组
      }
      else{
        batt2fault_arr = g_batt0123fault_arr.slice(4,6)
      }
    
      if(batt3comid_port1_msg2!=0){  //先判断蓄电池3接口1报文2的CANID是否为0，若为0，则继续判断接口2报文2的CANID是否为0，若还为0，则数据无效，故障数组值（全局变量）不变。
        batt3fault_arr = batt_arr.slice(102,104)// 获取对应故障位数组
      }
      else if(batt3comid_port2_msg2!=0){
        batt3fault_arr = batt_arr.slice(182,184)// 获取对应故障位数组
      }
      else{
        batt3fault_arr = g_batt0123fault_arr.slice(-1,5)
      }
    
      g_batt0123fault_arr = [...batt0fault_arr,...batt1fault_arr,...batt2fault_arr,...batt3fault_arr]  // 合并故障位数组
      return g_batt0123fault_arr
    }
    
    function compareMsg(ele, index, lastmsg,Batt_faultsum) {
      let lastStr = lastmsg[index];//取出00000000，与17（00010001）作对比
      if (lastStr != ele) {
        for (let i = 0; i < 8; i++) {
          if (lastStr[i] != ele[i]) {
            if (ele[i] == 1) {//就是故障从0到1
              battFaultSumCount(index,i,Batt_faultsum)
              
            } 
          }
        }
        lastmsg[index] = ele;
      }
    }
    
    function battFaultSumCount(index,i,Batt_faultsum) {   //故障总数计算方法
      switch(index){
        case 0:
          switch(i){
            case 0:
              Batt_faultsum.Batt0_faultsum.fan_fault = Batt_faultsum.Batt0_faultsum.fan_fault + 1;
              break;
            case 1:
              Batt_faultsum.Batt0_faultsum.overdischarge_alarm = Batt_faultsum.Batt0_faultsum.overdischarge_alarm + 1;
              break;
            case 3:
              Batt_faultsum.Batt0_faultsum.overcharge_alarm = Batt_faultsum.Batt0_faultsum.overcharge_alarm + 1;
              break;
            case 7:
              Batt_faultsum.Batt0_faultsum.relay_fault = Batt_faultsum.Batt0_faultsum.relay_fault + 1;
              break;
          }
          break;
        case 1:
          switch(i){
            case 0:
              Batt_faultsum.Batt0_faultsum.comm_fault  = Batt_faultsum.Batt0_faultsum.comm_fault + 1;
              break;
            case 1:
              Batt_faultsum.Batt0_faultsum.volt_acquisition_fault = Batt_faultsum.Batt0_faultsum.volt_acquisition_fault +1;
              break;
            case 2:
              Batt_faultsum.Batt0_faultsum.low_temp_alarm = Batt_faultsum.Batt0_faultsum.low_temp_alarm +1;
              break;
            case 4:
              Batt_faultsum.Batt0_faultsum.high_temp_alarm = Batt_faultsum.Batt0_faultsum.high_temp_alarm +1;
              break;
            case 6:
              Batt_faultsum.Batt0_faultsum.c_overdischarge_alarm = Batt_faultsum.Batt0_faultsum.c_overdischarge_alarm +1;
              break;
            case 7:
              Batt_faultsum.Batt0_faultsum.c_overcharge_alarm = Batt_faultsum.Batt0_faultsum.c_overcharge_alarm +1;
              break;
          }
          break;
        case 2:
          switch(i){
            case 0:
              Batt_faultsum.Batt1_faultsum.fan_fault = Batt_faultsum.Batt1_faultsum.fan_fault + 1;
              break;
            case 1:
              Batt_faultsum.Batt1_faultsum.overdischarge_alarm = Batt_faultsum.Batt1_faultsum.overdischarge_alarm + 1;
              break;
            case 3:
              Batt_faultsum.Batt1_faultsum.overcharge_alarm = Batt_faultsum.Batt1_faultsum.overcharge_alarm + 1;
              break;
            case 7:
              Batt_faultsum.Batt1_faultsum.relay_fault = Batt_faultsum.Batt1_faultsum.relay_fault + 1;
              break;
          }
          break;
        case 3:
          switch(i){
            case 0:
              Batt_faultsum.Batt1_faultsum.comm_fault  = Batt_faultsum.Batt1_faultsum.comm_fault + 1;
              break;
            case 1:
              Batt_faultsum.Batt1_faultsum.volt_acquisition_fault = Batt_faultsum.Batt1_faultsum.volt_acquisition_fault +1;
              break;
            case 2:
              Batt_faultsum.Batt1_faultsum.low_temp_alarm = Batt_faultsum.Batt1_faultsum.low_temp_alarm +1;
              break;
            case 4:
              Batt_faultsum.Batt1_faultsum.high_temp_alarm = Batt_faultsum.Batt1_faultsum.high_temp_alarm +1;
              break;
            case 6:
              Batt_faultsum.Batt1_faultsum.c_overdischarge_alarm = Batt_faultsum.Batt1_faultsum.c_overdischarge_alarm +1;
              break;
            case 7:
              Batt_faultsum.Batt1_faultsum.c_overcharge_alarm = Batt_faultsum.Batt1_faultsum.c_overcharge_alarm +1;
              break;
          }
          break;
        case 4:
          switch(i){
            case 0:
              Batt_faultsum.Batt2_faultsum.fan_fault = Batt_faultsum.Batt2_faultsum.fan_fault + 1;
              break;
            case 1:
              Batt_faultsum.Batt2_faultsum.overdischarge_alarm = Batt_faultsum.Batt2_faultsum.overdischarge_alarm + 1;
              break;
            case 3:
              Batt_faultsum.Batt2_faultsum.overcharge_alarm = Batt_faultsum.Batt2_faultsum.overcharge_alarm + 1;
              break;
            case 7:
              Batt_faultsum.Batt2_faultsum.relay_fault = Batt_faultsum.Batt2_faultsum.relay_fault + 1;
              break;
          }
          break;
        case 5:
          switch(i){
            case 0:
              Batt_faultsum.Batt2_faultsum.comm_fault  = Batt_faultsum.Batt2_faultsum.comm_fault + 1;
              break;
            case 1:
              Batt_faultsum.Batt2_faultsum.volt_acquisition_fault = Batt_faultsum.Batt2_faultsum.volt_acquisition_fault +1;
              break;
            case 2:
              Batt_faultsum.Batt2_faultsum.low_temp_alarm = Batt_faultsum.Batt2_faultsum.low_temp_alarm +1;
              break;
            case 4:
              Batt_faultsum.Batt2_faultsum.high_temp_alarm = Batt_faultsum.Batt2_faultsum.high_temp_alarm +1;
              break;
            case 6:
              Batt_faultsum.Batt2_faultsum.c_overdischarge_alarm = Batt_faultsum.Batt2_faultsum.c_overdischarge_alarm +1;
              break;
            case 7:
              Batt_faultsum.Batt2_faultsum.c_overcharge_alarm = Batt_faultsum.Batt2_faultsum.c_overcharge_alarm +1;
              break;
          }
          break;
    
        case 6:
          switch(i){
            case 0:
              Batt_faultsum.Batt3_faultsum.fan_fault = Batt_faultsum.Batt3_faultsum.fan_fault + 1;
              break;
            case 1:
              Batt_faultsum.Batt3_faultsum.overdischarge_alarm = Batt_faultsum.Batt3_faultsum.overdischarge_alarm + 1;
              break;
            case 3:
              Batt_faultsum.Batt3_faultsum.overcharge_alarm = Batt_faultsum.Batt3_faultsum.overcharge_alarm + 1;
              break;
            case 7:
              Batt_faultsum.Batt3_faultsum.relay_fault = Batt_faultsum.Batt3_faultsum.relay_fault + 1;
              break;
          }
          break;
        case 7:
          switch(i){
            case 0:
              Batt_faultsum.Batt3_faultsum.comm_fault  = Batt_faultsum.Batt3_faultsum.comm_fault + 1;
              break;
            case 1:
              Batt_faultsum.Batt3_faultsum.volt_acquisition_fault = Batt_faultsum.Batt3_faultsum.volt_acquisition_fault +1;
              break;
            case 2:
              Batt_faultsum.Batt3_faultsum.low_temp_alarm = Batt_faultsum.Batt3_faultsum.low_temp_alarm +1;
              break;
            case 4:
              Batt_faultsum.Batt3_faultsum.high_temp_alarm = Batt_faultsum.Batt3_faultsum.high_temp_alarm +1;
              break;
            case 6:
              Batt_faultsum.Batt3_faultsum.c_overdischarge_alarm = Batt_faultsum.Batt3_faultsum.c_overdischarge_alarm +1;
              break;
            case 7:
              Batt_faultsum.Batt3_faultsum.c_overcharge_alarm = Batt_faultsum.Batt3_faultsum.c_overcharge_alarm +1;
              break;
          }
         break;
        }
        return Batt_faultsum;
      }
    /* * 对二进制字符串进行补0
     * 1010 ==> 00001010
     * @param {*} ele2String 
     * @returns 
     */
      function fillZero(ele2String) {
        if (ele2String.length < 8) {
          let zeroNum = 8 - ele2String.length;
          for (let i = 0; i < zeroNum; i++) {
            ele2String = '0' + ele2String;
          }
        }
        return ele2String;
      }
}