import type { Env as HonoEnv } from "hono";

import type { WithPinoLogger } from "./lib/logger";

export interface Env<TVariables extends object | undefined = undefined> extends HonoEnv {
  Bindings: CloudflareBindings & WithPinoLogger;
  Variables: TVariables;
}
