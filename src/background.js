chrome.runtime.onInstalled.addListener(() => {
        console.log('Extension installed and running.');
});


const basePrompt = "You will be given an array of text to translate into english.";

let runningTotalRequest = 0;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === "translate") {
                translateText(request.text).then(translatedText => {
                        sendResponse({ translatedText: translatedText });
                }).catch(error => {
                        sendResponse(request.text);
                });
                return true; // Indicates an asynchronous response is expected
        }
});

async function translateText(textArray) {

        console.log("Translating text: ", textArray);
        try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                      
                },
                body: JSON.stringify({
          
                        messages: [
                                { role: "system", content: basePrompt },
                                { role: "user", content: JSON.stringify(textArray) }
                        ],
                        response_format: { "type": "json_object" }
                })
        });

        const data = await response.json();
        console.log(JSON.stringify(data));
        console.log("Total requests made: ", runningTotalRequest++);
        const translatedText = data.choices[0].message.content.trim();

       
                const parsedTranslation = JSON.parse(translatedText);
                if (parsedTranslation.messages && Array.isArray(parsedTranslation.messages)) {
                        return parsedTranslation.messages;
                } else {
                        console.error('Invalid response format from the API');
                        return textArray;
                }
        } catch (error) {
                console.error('Error parsing the translated text:', error);
                return JSON.stringify({ messages: textArray });
        }
}
