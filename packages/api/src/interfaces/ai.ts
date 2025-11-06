export interface AiPrice {
  input: number;
  output: number;
}

export interface AiProvider<TName extends string = string> {
  name: TName;
  pricePer1m: AiPrice;

  query: (input: string) => Promise<string>;
}
