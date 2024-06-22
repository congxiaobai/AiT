import OpenAI from "openai";
export default async (promptArray: {
  role: string,
  content: string
}[], config: any, onResult: (res: any) => void) => {
  const ttsWS = new OpenAI({
    apiKey: config.kimi_apiKey,
    baseURL: "https://api.moonshot.cn/v1",
    dangerouslyAllowBrowser: true,

  });

  let total_res: string[] = []
  const allRes: any = [];
  const completion = await ttsWS.chat.completions.create({
    model: "moonshot-v1-8k",
    max_tokens: 1024 * 4,
    messages: promptArray as any,
    temperature: 0.3
  });
  const tmp = completion.choices[0]?.message?.content;
  if (tmp) {
    for (let i = 0; i < tmp.length; i++) {
      if (tmp[i] === '{' && total_res.length === 0) {
        total_res.push('{')
        continue;
      }
      if (total_res[0] === '{' && tmp[i] !== '}') {
        total_res.push(tmp[i]);
        continue;
      }
      if (tmp[i] === '}' && total_res[0] === '{') {
        total_res.push('}')
        allRes.push(JSON.parse(total_res.join('')));
        total_res = [];
        continue;
      }
    }
  }
  onResult(allRes)
}