const http = require('http');
const { v4: uuidv4 } = require("uuid");
const errHandle = require("./errorHandle");
const todos = [];

const requestListener = (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json',
  };

  let body = "";
  req.on("data", (chunk) => {
    body += chunk; //將封包 Buffer 分次搬運組成資料
  });

  if (req.method == 'GET' && req.url === '/todos') {
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        data: todos,
      })
    );
    res.end();
  } else if (req.method == "POST" && req.url == "/todos") {
    req.on("end", () => {
      try {
        const title = JSON.parse(body).title;
        // 微調 if判斷：title 如是 null, undefined, 空字串...等等都視為錯誤，將對應的錯誤訊息丟到 catch error
        if(!title) throw 'key-value error'
        const todo = {
          title: title,
          id: uuidv4(),
        };
        todos.push(todo);
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: "success",
            data: todos
          })
        );
        res.end();
      } catch (error) {
        // 微調 errHandle 增加參數：將錯誤訊息也傳進 errHandle
        errHandle(res, error);
      }
    });
  } else if (req.method == "DELETE" && req.url == "/todos") {
    todos.length = 0; // 清除所有內容
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        data: todos,
      })
    );
    res.end();
  } else if (req.method == "DELETE" && req.url.startsWith("/todos/")) {
    try {
      const id = req.url.split("/").pop();
      const index = todos.findIndex((element) => element.id == id);
      // 微調 if判斷：當 index 是 -1 指定的 ID 不存在時，將對應的錯誤訊息丟到 catch error
      if(index === -1) throw 'ID not found'
      todos.splice(index, 1);
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: "success",
          data: todos,
        })
      );
      res.end();
    } catch (error) {
      // 微調 errHandle 增加參數：將錯誤訊息也傳進 errHandle
      errHandle(res, error);
    }
  } else if (req.method == "PATCH" && req.url.startsWith("/todos/")) {
    req.on("end", () => {
      try {
        const title = JSON.parse(body).title;
        const id = req.url.split("/").pop();
        const index = todos.findIndex((element) => element.id == id);
        // 微調 if判斷：title 如是 null, undefined, 空字串...等等都視為錯誤，將對應的錯誤訊息丟到 catch error
        if(!title) throw 'key-value error'
        // 微調 if判斷：當 index 是 -1 指定的 ID 不存在時，將對應的錯誤訊息丟到 catch error
        if(index === -1) throw 'ID not found'
        todos[index].title = title;
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: "success",
            data: todos,
          })
        );
        res.end();
      } catch (error) {
        // 微調 errHandle 增加參數：將錯誤訊息也傳進 errHandle
        errHandle(res, error);
      }
    });
  } else if (req.method == "OPTIONS") {
    // 應對CORS
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: "404",
        message: "無此網站路由",
      })
    );
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005); // 如雲端服務有預設port號，則優先使用雲端服務設定
