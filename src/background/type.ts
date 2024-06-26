export type BackgroundChromRequestType = LinesRequestType | WordRequestType | WordCardType

export type LinesRequestType = {
  action: string,
  promptText: string,
  nodeArray: NodeType[]
}

export type WordRequestType = {
  action: string,
  selectionText: string,
  wordText: string
}
export type WordCardType = {
  action: string,
  payload:{
    word:string,
    line?:string
  }
}

export type NodeType = {
  id: string,
  text: string
}