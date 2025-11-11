export interface AiPrice {
  input: number;
  output: number;
}

export interface AiProvider<TName extends string = string> {
  name: TName;
  pricePer1M: AiPrice;
  countTokens: (text: string) => number;
  query: (input: string) => Promise<string>;
}
