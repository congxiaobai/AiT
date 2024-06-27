// 导入必要的库，如axios用于发送HTTP请
import axios from 'axios';
const url = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

export default async (promptArray: {
  role: string,
  content: string
}[], config: any) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.doubao_apiKey}`,
  };
  const body = {
    model: config.doubao_endpoint,
    messages: promptArray
  };

  const response = await axios.post(url, body, {
    headers
  })
  return response
}
