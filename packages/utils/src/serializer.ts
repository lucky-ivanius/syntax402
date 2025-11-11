import { deserialize as _deserialize, serialize as _serialize } from "bun:jsc";

export const serialize = <TData>(data: TData): Buffer => _serialize(data, { binaryType: "nodebuffer" });
export const deserialize = <TData>(data: Buffer): TData => _deserialize(data) as TData;
