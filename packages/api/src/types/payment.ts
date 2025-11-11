export interface Payment<TMetadata = unknown> {
  id: string;
  externalId?: string;
  description: string;
  price: number;
  redirectUrl: string;
  metadata: TMetadata;
}
