const headers = require('./headersSetting');

const errorMessages = {
  notfoundRouter: '無此網站路由',
  invalidJson: '無效的Json格式',
  wrongKeyValue: '鍵值資料錯誤',
  notfoundID: '查無此 ID',
};

const errorResHandle = (res, status, msg) => {
  const message = typeof msg === 'string' ? msg : errorMessages.invalidJson;
  res.writeHead(status, headers);
  res.write(JSON.stringify({ status, message }));
  res.end();
}

module.exports = { errorMessages, errorResHandle };
