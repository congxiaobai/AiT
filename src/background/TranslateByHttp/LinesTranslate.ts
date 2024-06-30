
import TongYiConnect from '../HttpRequest/TongYi';
import { generateWs } from '../HttpRequest/Spark';
import KimiConnect from '../HttpRequest/Kimi';
import DouBaoConnect from '../HttpRequest/Doubao';
const regex = /\[([\s\S]*?)\]/; // 正则表达式，匹配以 "[" 开头，以 "]" 结尾的内容，非贪婪匹配
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
                        sendResponse(jsonParse(allRes))
                } else {
                        sendResponse(['error'])
                }

        } catch (error) {
                console.error('Error parsing the translated text:', error);
                sendResponse('error')
                return
        }
}
async function tongyiTranslate(promptArray: any[], config: any, sendResponse: Function) {
        try {
                const response = await TongYiConnect(promptArray, config)

                if (response?.data?.output?.choices) {
                        const allRes = response.data.output.choices.map(s => s.message?.content).join('')
                        sendResponse(jsonParse(allRes))


                } else {
                        sendResponse(['error'])
                }

        } catch (error) {
                console.error('Error parsing the translated text:', error);
                sendResponse('error')
                return
        }
}

async function sparkTranslate(promptArray: any[], config: any, sendResponse: Function) {

        try {
                let total_res: string = ''
                const onEnd = () => {
                        sendResponse(jsonParse(total_res))


                }
                const onMessage = (tmp: string) => {
                        total_res += tmp
                }
                await generateWs(promptArray, config, onEnd, onMessage)
        } catch (error) {
                console.error('Error parsing the translated text:', error);
                sendResponse('error')
                return
        }
}


async function kimiTranslate(promptArray: any[], config: any, sendResponse: Function) {
        try {

                const allRes = await KimiConnect(promptArray, config);
                sendResponse(jsonParse(allRes))
        } catch (error) {
                console.error('Error parsing the translated text:', error);
                sendResponse()
                return
        }
}

const jsonParse = (allRes: string) => {
        const matchResult = allRes.match(regex); // 使用match方法查找匹配项

        if (matchResult) {
                const arrayStr = matchResult[1]; // 获取完整的匹配内容，包含 [ 和 ]
                return JSON.parse(`[${arrayStr}]`)
        } else {
                return [allRes]
        }
}