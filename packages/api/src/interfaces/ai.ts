export interface AiPrice {
  input: number;
  output: number;
}

export interface AiProvider<TName extends string = string> {
  name: TName;
  pricePer1m: AiPrice;

  estimatePrice: (input: string) => Promise<number>;

  query: (input: string) => Promise<string>;
}
