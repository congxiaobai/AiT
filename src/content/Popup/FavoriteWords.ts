export function getFavoriteWords() {
    chrome.storage.local.get(null, function (items) {
        if (chrome.runtime.lastError) {
            console.error('Error getting items: ' + chrome.runtime.lastError);
        } else {
            let filteredItems: any = [];

            for (let key in items) {
                if (key.startsWith('*word*')) {
                    filteredItems.push(items[key]);
                }
            }
            // 现在filteredItems只包含符合条件的键值对
            console.log(filteredItems);
        }
    });
}

export function addFavoriteWords(word: string, line: string, translated: string) {
    // 获取特定键的值
    const wordKey = '*word*' + word;
    chrome.storage.local.get([wordKey], function (result) {
        if (!result.count) {
            chrome.storage.local.set({
                [wordKey]: {
                    word,
                    lines: [`${line}`],
                    translated: [translated],
                    count: 1,
                }
            }, () => console.log('setValue'))
        } else {
            if (!result.lines.includes(s => s.startsWith(line)) || result.lines.length < 5) {
                result.lines.push(`${line}`);
                result.translated.push(translated);
            }
            // 
            result.count++;
            chrome.storage.local.set({
                [wordKey]: result
            })
        }
    });
}

export function deleteFavoriteWords(word: string) {
    const wordKey = '*word*' + word;
    chrome.storage.local.remove(wordKey)
}
