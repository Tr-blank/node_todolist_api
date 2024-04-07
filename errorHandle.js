const errorHandle = (res, error) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
    'Content-Type': 'application/json',
  };
  // 微調 透過 error 參數將對應的錯誤原因字串放到 message 變數中，在 API 400 錯誤時輸出顯示
  let message = ''
  switch (error) {
    case 'ID not found':
      message = '查無此 ID'
      break;
    case 'key-value error':
      message = '鍵值資料錯誤'
      break;
    default:
      message = 'Json資料格式錯誤'
      break;
  }
  res.writeHead(400, headers);
  res.write(
    JSON.stringify({
      status: "400",
      message
    })
  );
  res.end();
}

module.exports = errorHandle;
