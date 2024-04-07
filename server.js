const http = require('http');
const { v4: uuidv4 } = require("uuid");
const { errorMessages, errorResHandle } = require("./errorHandle"); // 微調 新增 module：將多個檔案都會用上的 headers 設定抽出一個新的 module
const headers = require('./headersSetting'); // 微調 新增 module：將多個檔案都會用上的 headers 設定抽出一個新的 module
const todos = [];

const successResHandle = (res, hasSendData) => { // 微調 新增 function：將重複的 code 抽出寫成 function
  const successRes = JSON.stringify({
    status: 'success',
    data: todos,
  });
  res.writeHead(200, headers);
  if (hasSendData) res.write(successRes)
  res.end();
}

const requestListener = (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk; //將封包 Buffer 分次搬運組成資料
  });
  
  if (req.method === "OPTIONS") { // 微調 if判斷：先確認不是(CORS) OPTIONS 請求後，再去判斷 URL
    successResHandle(res, false)
  } else if (req.url === '/todos') {
    switch (req.method) {  // 微調 換成 switch-case 判斷 method：方便瀏覽 code

      case 'GET':
        successResHandle(res, true)
        break;

      case 'POST':
        req.on("end", () => {
          try {
            const title = JSON.parse(body).title;
            if(!title) throw errorMessages.wrongKeyValue // 微調 if判斷：title 如是 null, undefined, 空字串...等等都視為錯誤，將對應的錯誤訊息丟到 catch error
            const todo = {
              title: title,
              id: uuidv4(),
            };
            todos.push(todo);
            successResHandle(res, true)
          } catch (error) {
            errorResHandle(res, 400, error); // 微調 errorHandle 改名及增加參數：將錯誤碼及訊息也傳進 errorResHandle
          }
        });
        break;

      case 'DELETE':
        todos.length = 0; // 清除所有內容
        successResHandle(res, true)
        break;
    }
  } else if (req.url.startsWith("/todos/")) {
    switch (req.method) {

      case 'DELETE':
        try {
          const id = req.url.split("/").pop();
          const index = todos.findIndex((element) => element.id == id);
          if(index === -1) throw errorMessages.notfoundID // 微調 if判斷：當 index 是 -1 指定的 ID 不存在時，將對應的錯誤訊息丟到 catch error
          todos.splice(index, 1);
          successResHandle(res, true)
        } catch (error) {
          errorResHandle(res, 400, error);
        }
        break;

      case 'PATCH':
        req.on("end", () => {
          try {
            const title = JSON.parse(body).title;
            const id = req.url.split("/").pop();
            const index = todos.findIndex((element) => element.id == id);
            if(!title) throw errorMessages.wrongKeyValue
            if(index === -1) throw errorMessages.notfoundID
            todos[index].title = title;
            successResHandle(res, true)
          } catch (error) {
            errorResHandle(res, 400, error);
          }
        });
        break;
    }
  } else {
    errorResHandle(res, 404, errorMessages.notfoundRouter);
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005); // 如雲端服務有預設port號，則優先使用雲端服務設定
