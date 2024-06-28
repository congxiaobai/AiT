export const sourceLangOptions = [
    { label: "英文", value: "en" },
    { label: "中文", value: "zh" },
    { label: "日文", value: "ja" },
    { label: "法文", value: "fr" },
    { label: "德文", value: "de" }
]

export const sourceLangConfig ={
    en:'英文',
    ja:'日文',
    fr:'法文',
    de:'德文',
    zh:'中文'
} 


export const aiModalOptions = [
    { label: "星火3.5", value: "spark" },
    { label: "Kimi", value: "kimi" },
    { label: "通义", value: "tongyi" },
    { label: "豆包", value: "doubao" },
]

export const ChromeAction = {
    ContextMenuClicked: 'contextMenuClicked', // 右键菜单点击
    RequestTranslate: 'translateRequest',//PopUp请求 翻译请求
    NodeTranslated: 'nodeTranslate', // content接收 节点翻译返回
    
    TranslateNodesWithPipe: 'translateNodesWithPipe', // content发起 使用流式翻译
    TranslateNodeWithPort: 'translateNodesWithPort', // content发起 使用长连接翻译
    TranslateNodeWithHttp: 'translateNodeWithHttp', // content发起 使用一次性连接翻译
  
    TranslateWord: 'translateWord', // content发起  获取词义

    ForWordSource: 'ForWordSource', // content发起  获取词源
    CorrectLine: 'CorrectLine', // content发起  获取词源

}