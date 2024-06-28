import { NodeType } from "./type"
import { sourceLangConfig } from '../constant'

export const generateLinsModalPromot = (nodeArray: NodeType[], promptText: string, config: {
  sourceLang: string,
  targetLang: string
}) => {
  return [
    {
      role: "system",
      content: `你是一个语言专家，精通${sourceLangConfig[config.sourceLang]||"英文"}译${sourceLangConfig[config.targetLang]||"中文"}。下面将会问一下翻译的问题，请尽量避免对一些术语进行翻译。并将结果以${sourceLangConfig[config.targetLang]||'中文'}输出。`
    },
    {
      role: "user",
      content: `下面是一个数组,包含了id和text两个字段。
        请忽略id,将text对应的英文，翻译成中文。然后依然按照数组的格式返回，
        保持其中的字段不变，仅仅把英文替换成中文，使返回的结果能够被JSON反序列化。注意，id字段不要发生任何变化！
        这些数组中的英文，来自于一篇完整的文章，翻译的时候，请前后结合起来翻译。` + `${promptText ? '注意，本文由以下特质，可以参考：' + promptText : ''}` + JSON.stringify(nodeArray)
    }
  ]
}

export const generateWordModalPromot = (wordText: string, selectiontext: string, config: {
  sourceLang: string,
  targetLang: string
}) => {
  return [
    {
      role: "system",
      content: `你是一个语言专家，精通${sourceLangConfig[config.sourceLang]||"英文"}译${sourceLangConfig[config.targetLang]||"中文"}。下面将会问一下翻译的问题，请尽量避免对一些术语进行翻译。并将结果以${sourceLangConfig[config.targetLang]||'中文'}输出。`
    },
    {
      role: "user",
      content: wordText ? `请解析“${wordText}”这句文本中${selectiontext}的释义。尽量简略一点,100字以内。` :
        `请分析"${selectiontext}"的一般释义和用法，如果有词源可以讲一下词源。尽量简略一点,100字以内。`
    }
  ]
}

export const generateWordSourcePromot = (wordText: string, config: {
  sourceLang: string,
  targetLang: string
}) => {

  return [
    {
      role: "system",
      content: `你是一个语言专家，精通${sourceLangConfig[config.sourceLang]||"英文"}译${sourceLangConfig[config.targetLang]||"中文"}。下面将会问一下翻译的问题，请尽量避免对一些术语进行翻译。并将结果以${sourceLangConfig[config.targetLang]||'中文'}输出。`
    },
    {
      role: "user",
      content: `请讲一下"${wordText}"这个单词，如果它有近义词，反义词，原型词，请列出一部分。如果有词源，可以说一下词源。如果有一些帮助记忆的办法，可以说一下。整体150字以内。`
    }
  ]
}

export const generateCorrectLinePromot = (line: string ,config: {
  sourceLang: string,
  targetLang: string
}) => {
  
  return [
    {
      role: "system",
      content: `你是一个语言专家，精通${sourceLangConfig[config.sourceLang]||"英文"}译${sourceLangConfig[config.targetLang]||"中文"}。下面将会问一下翻译的问题，请尽量避免对一些术语进行翻译。并将结果以${sourceLangConfig[config.targetLang]||'中文'}输出。`

    },
    {
      role: "user",
      content: `请帮我看一下"${line}" 是否存在错误，并给出建议。150字以内。`
    }
  ]
}