
import TongYiConnect from './HttpRequest/TongYi';
import { generateWs } from './HttpRequest/Spark';
import KimiConnect from './HttpRequest/Kimi';
import DoubaoConnect from './HttpRequest/Doubao';
export const WordTranslate: {
        [key: string]: (promptArray: any[], config: any, sendResponse: Function) => Promise<void>
} = {
        tongyi: tongyiTranslate,
        spark: sparkTranslate,
        kimi: kimiTranslate,
        doubao: doubaoTranslate,
}

async function doubaoTranslate(promptArray: any[], config: any, sendResponse: Function) {
        try {
                const response = await DoubaoConnect(promptArray, config);

                if (response?.data?.choices) {
                        const allRes = response.data.choices.map(s => s.message?.content).join('')
                        sendResponse(allRes)

                } else {
                        sendResponse([])
                }
        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return
        }
}
async function tongyiTranslate(promptArray: any[], config: any, sendResponse: Function) {
        try {
                const response = await TongYiConnect(promptArray, config);

                if (response?.data?.output?.choices) {
                        const allRes = response.data.output.choices.map(s => s.message?.content).join('')
                        sendResponse(allRes)

                } else {
                        sendResponse([])
                }
        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return
        }
}

async function sparkTranslate(promptArray: any[], config: any, sendResponse: Function) {
        try {
                const allRes: any = [];
                const onEnd = () => {
                        console.log('spark请求', allRes)
                        sendResponse(allRes)
                }
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