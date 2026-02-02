export interface Feed {
  name: string
  url: string
}

export interface Article {
  title: string
  link: string
  description: string
  date: Date
  source: string
  feedUrl: string
}
