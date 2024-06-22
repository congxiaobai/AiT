
import TongYiConnect from './HttpRequest/TongYi';
import { generateWs } from './HttpRequest/Spark';
import KimiConnect from './HttpRequest/Kimi';
export const WordTranslate: {
        [key: string]: (promptArray: any[], config: any, sendResponse: Function) => Promise<void>
} = {
        tongyi: tongyiTranslate,
        spark: sparkTranslate,
        kimi: kimiTranslate,
}

async function tongyiTranslate(promptArray: any[], config: any, sendResponse: Function) {
        try {
                const onResult = (response: any) => {
                        if (response?.data?.output?.choices) {
                                const allRes = response.data.output.choices.map(s => s.message?.content).join('')
                                sendResponse(allRes)
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
                const allRes: any = [];
                const onEnd = () => sendResponse(allRes)
                const onMessage = (tmp: string) => {
                        allRes.push(tmp)
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