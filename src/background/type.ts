export type BackgroundChromRequestType = LinesRequestType | WordRequestType

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

export type NodeType = {
  id: string,
  text: string
}