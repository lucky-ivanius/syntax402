export interface QueryBuilder<TInput, TOutput> {
  build: (input: TInput) => Promise<TOutput>;
}
