
import TongYiConnect from './PipeRequest/TongYi';

import { generateWs } from './HttpRequest/Spark';
const jsonPattern = /```json\n([\s\S]*?)\n```/
export const LinesTranslatePipe: {
        [key: string]: (promptArray: any[], config: any, sendResponse: Function) => Promise<void>
} = {
        tongyi: tongyiTranslate,
        spark: sparkTranslate,


}

async function doubaoTranslate(promptArray: any[], config: any, sendResponse: Function) {
        try {
                const onResult = (response: any) => {
                        if (response?.data?.output?.choices) {
                                const allRes = response.data.output.choices.map(s => s.message?.content).join('')
                                const match = jsonPattern.exec(allRes);
                                if (match) {
                                        // 提取并解析JSON字符串
                                        const jsonString = match[1];
                                        const jsonData = JSON.parse(jsonString.replace(/'/g, '"'));

                                        sendResponse(JSON.parse(jsonData))

                                }
                        } else {
                                sendResponse([])
                        }
                }
                TongYiConnect(promptArray, config, onResult)

        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return
        }
}
async function tongyiTranslate(promptArray: any[], config: any, sendResponse: Function) {
        try {
                const onResult = (response: any) => {
                        if (response?.data?.output?.choices) {
                                const allRes = response.data.output.choices.map(s => s.message?.content).join('')
                                const match = jsonPattern.exec(allRes);
                                if (match) {
                                        // 提取并解析JSON字符串
                                        const jsonString = match[1];
                                        const jsonData = JSON.parse(jsonString.replace(/'/g, '"'));

                                        sendResponse(JSON.parse(jsonData))

                                }
                        } else {
                                sendResponse([])
                        }
                }
                TongYiConnect(promptArray, config, onResult)

        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return
        }
}

async function sparkTranslate(promptArray: any[], config: any, sendResponse: Function) {

        try {
                let total_res: string[] = []
                const onEnd = () => { }
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

                                        sendResponse(JSON.parse(total_res.join('')))
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
