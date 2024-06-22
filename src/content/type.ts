export type CustomNode = Node & {
    isTranslate: boolean
    _$id: string,
    _$translate: string,
    _$sortIndex: number
}

export type CacheNode = {
    [key: string]: string
}

export type ChormePaylodtype = RequestTranslatType | NodeTranslatedNodeType | MenuContentType

export type RequestTranslatType = {
    promptText: string,
}

export type NodeTranslatedNodeType = {
    id: string,
    text: string
}

export type MenuContentType = {

    selectionText: string
}