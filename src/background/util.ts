import { NodeType } from "./type"


export const generateTongyiLinsModalPromot = (nodeArray: NodeType[], promptText: string) => {
  return [
    {
      role: "system",
      content: "你是一个翻译专家。尽量避免对一些术语进行翻译。"
    },
    {
      role: "user",
      content: `下面是一个数组,包含了id和text两个字段。
        请忽略id,将text对应的英文，翻译成中文。然后依然按照数组的格式返回，
        保持其中的字段不变，仅仅把英文替换成中文，使返回的结果能够被JSON反序列化。
        这些数组中的英文，来自于一篇完整的文章，翻译的时候，请前后结合起来翻译。` + `${promptText ? '注意，本文由以下特质，可以参考：' + promptText : ''}` + JSON.stringify(nodeArray)
    }
  ]
}
export const generateSparkLinsModalPromot = (nodeArray: NodeType[], promptText: string) => {
 return [{
    "role": "user", "content":
      `下面是一个数组,包含了id和text两个字段。
                请忽略id,将text对应的英文，翻译成中文。然后依然按照数组的格式返回，
                保持其中的字段不变，仅仅把英文替换成中文，使返回的结果能够被JSON反序列化。
                这些数组中的英文，来自于一篇完整的文章，翻译的时候，请前后结合起来翻译。` + `${promptText ? '注意，本文由以下特质，可以参考：' + promptText : ''}` + JSON.stringify(nodeArray)
  }]
}
export const generateKimiLinsModalPromot = (nodeArray: NodeType[], promptText: string) => {

}

export const LinsModalPromotRecord : Record<string, (nodeArray: NodeType[], promptText: string) => any> = {
  kimi: generateKimiLinsModalPromot,
  tongyi: generateTongyiLinsModalPromot,
  spark: generateSparkLinsModalPromot
}