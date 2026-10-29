let websocketUrl = null;
let socket = null;

// 在 web worker 中创建一个 WebSocket 客户端
self.onmessage = function (event) {
  websocketUrl = event.data;

  // 初始连接
  connectWebSocket();
};

async function blobToHexstring(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = function () {
      if (this.result instanceof ArrayBuffer) {
        const byteArray = new Uint8Array(this.result);
        const hexString = Array.from(byteArray).map(byte => byte.toString(16).padStart(2, '0')).join('');
        resolve(hexString);
      } else {
        reject(new Error('Invalid result type'));
      }

    };
    reader.onerror = reject
    reader.readAsArrayBuffer(blob);
  })
}

// 使用示例
async function handleBlobData(blob) {
  try {
    const hexString = await blobToHexstring(blob);
    const processedData = handleReceivedData(hexString);
    postMessage(processedData);
  } catch (error) {
    // console.error(error);
  }
}

// 建立 WebSocket 连接
function connectWebSocket() {
  socket = new WebSocket(websocketUrl);

  // 处理 WebSocket 连接事件
  socket.onopen = function () {
    console.log("WebSocket 连接已建立");
  };

  // 处理 WebSocket 接收到的消息
  socket.onmessage = function (event) {
    // const processedData = handleReceivedData(event.data);
    // postMessage(processedData);
    handleBlobData(event.data)
  };

  // 处理 WebSocket 关闭事件
  socket.onclose = function () {
    console.log("WebSocket 连接已关闭");
    // 断开后重新连接
    setTimeout(connectWebSocket, 2000);
  };

  // 处理 WebSocket 错误事件
  socket.onerror = function (error) {
    // console.error("WebSocket 错误:", error);
    // 出错后重新连接
    setTimeout(connectWebSocket, 2000);
  };
}

// 处理接收到的数据
function handleReceivedData(data) {
    // ...
      let data1 = data.toString('hex');
      let data2 = data1.replaceAll(' ','')   
      
      let str = JSON.stringify(data2);
      return str;
    
}