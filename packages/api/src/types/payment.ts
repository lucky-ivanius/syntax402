export interface Payment<TMetadata = unknown> {
  id: string;
  price: number;
  redirectUrl: string;
  metadata: TMetadata;
}
