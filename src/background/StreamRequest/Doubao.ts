// 导入必要的库，如axios用于发送HTTP请
const url = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';



async function handleStreamResponse(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return;

  let receivedData = ''; // 缓冲区，用于累加接收到的字符串数据

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      // 所有数据已接收完毕
      console.log('完整数据:', receivedData);
      break;
    }

    // 确保数据按顺序累加
    const chunkText = new TextDecoder().decode(value);
    const dataRegex = /data:(.*?)(?=\n|$)/s;

    const jsonDataMatch = chunkText.match(dataRegex);
    if (jsonDataMatch) {
      const jsonString = jsonDataMatch[1].trim();
      const jsonData = JSON.parse(jsonString);

      const tmp = jsonData.choices[0].delta.content;
      receivedData += tmp;

      console.log('当前数据块:', tmp);
    }
  
    // 根据需要处理每个数据块，例如打印出来
    // 注意：这里直接累加数据，确保数据顺序
   
  }
}
export default (promptArray: {
  role: string,
  content: string
}[], config: any, onResult: (res: any) => void) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.doubao_apiKey}`, // 使用process.env访问环境变量

    'Accept': 'text/event-stream',
    responseType: 'stream'
  };
  const body = {
    model: config.doubao_endpoint,
    messages: promptArray,
    stream: true
  };


  fetch(url, { method: 'POST', headers, body: JSON.stringify(body) }).then(handleStreamResponse)
}