export interface AiPrice {
  input: number;
  output: number;
}

export interface AiProvider<TName extends string = string, TGenericSchema = unknown> {
  name: TName;
  pricePer1M: AiPrice;
  countTokens: (text: string) => number;
  queryText: (input: string, abortSignal?: AbortSignal) => Promise<string>;
  queryObject: <TOutput = string, TSchema extends TGenericSchema = TGenericSchema>(
    input: string,
    schema: TSchema,
    abortSignal?: AbortSignal
  ) => Promise<TOutput>;
}
