
import TongYiConnect from '../StreamRequest/TongYi';
import DoubaoConnect from '../StreamRequest/Doubao';

import { generateWs } from '../HttpRequest/Spark';
import { RunStepsPage } from 'openai/resources/beta/threads/runs/steps';
const jsonPattern = /```json\n([\s\S]*?)\n```/
export const LinesTranslateStream: {
        [key: string]: (promptArray: any[], config: any, sendResponse: Function) => Promise<void>
} = {
        tongyi: tongyiTranslate,
        spark: sparkTranslate,
        doubao: doubaoTranslate
}

async function doubaoTranslate(promptArray: any[], config: any, sendResponse: Function) {
        try {
                const onResult = (response: any) => {
                        sendResponse(response)
                }
                DoubaoConnect(promptArray, config, onResult)

        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return
        }
}
async function tongyiTranslate(promptArray: any[], config: any, sendResponse: Function) {
        try {
                const onResult = (response: any) => {
                        sendResponse(response)
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
                sendResponse('异常')
                return
        }
}
