
import TongYiConnect from '../HttpRequest/TongYi';
import { generateWs } from '../HttpRequest/Spark';
import KimiConnect from '../HttpRequest/Kimi';
import DouBaoConnect from '../HttpRequest/Doubao';
const jsonPattern = /```json\n([\s\S]*?)\n```/
export const LinesTranslate: {
        [key: string]: (promptArray: any[], config: any, sendResponse: Function) => Promise<void>
} = {
        tongyi: tongyiTranslate,
        spark: sparkTranslate,
        kimi: kimiTranslate,
        doubao: doubaoConnect,
}

async function doubaoConnect(promptArray: any[], config: any, sendResponse: Function) {
        try {
                const response = await DouBaoConnect(promptArray, config)

                if (response?.data?.choices) {
                        const allRes = response.data.choices.map(s => s.message?.content).join('')
                        const jsonData = JSON.parse(allRes.replace(/'/g, '"'));
                        console.log({ jsonData })
                        sendResponse(jsonData)

                } else {
                        sendResponse(['error'])
                }

        } catch (error) {
                console.error('Error parsing the translated text:', error);
                sendResponse(['error'])
                return
        }
}
async function tongyiTranslate(promptArray: any[], config: any, sendResponse: Function) {
        try {
                const response = await TongYiConnect(promptArray, config)

                if (response?.data?.output?.choices) {
                        const allRes = response.data.output.choices.map(s => s.message?.content).join('')
                        const match = jsonPattern.exec(allRes);
                        if (match) {
                                // 提取并解析JSON字符串
                                const jsonString = match[1];
                                const jsonData = JSON.parse(jsonString.replace(/'/g, '"'));
                                console.log({ jsonData })
                                sendResponse(jsonData)
                        }
                } else {
                        sendResponse(['error'])
                }

        } catch (error) {
                console.error('Error parsing the translated text:', error);
                sendResponse(['error'])
                return
        }
}

async function sparkTranslate(promptArray: any[], config: any, sendResponse: Function) {

        try {
                let total_res: string[] = []
                const allRes: any = [];
                const onEnd = () => {
                        console.log('spark请求', allRes);
                        sendResponse(allRes)
                }
                const onMessage = (tmp: string) => {
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
                                        allRes.push(JSON.parse(total_res.join('')))

                                        total_res = [];
                                        continue;
                                }
                        }
                }
                await generateWs(promptArray, config, onEnd, onMessage)
        } catch (error) {
                console.error('Error parsing the translated text:', error);
                sendResponse()
                return
        }
}


async function kimiTranslate(promptArray: any[], config: any, sendResponse: Function) {
        try {
                const onEnd = (res: any) => sendResponse(res)
                await KimiConnect(promptArray, config, onEnd)
        } catch (error) {
                console.error('Error parsing the translated text:', error);
                sendResponse()
                return
        }
}