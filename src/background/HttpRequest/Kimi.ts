import OpenAI from "openai";
export default async (promptArray: {
  role: string,
  content: string
}[], config: any) :Promise<string> => {
  const ttsWS = new OpenAI({
    apiKey: config.kimi_apiKey,
    baseURL: "https://api.moonshot.cn/v1",
    dangerouslyAllowBrowser: true,

  });

  const completion = await ttsWS.chat.completions.create({
    model: "moonshot-v1-8k",
    max_tokens: 1024 * 4,
    messages: promptArray as any,
    temperature: 0.3
  });
  const tmp = completion.choices[0]?.message?.content;
  return tmp ||''
}