import { existsSync } from "node:fs";
import path from "node:path";
import {
  defineConfig,
  loadEnv,
  type Plugin,
  type ViteDevServer,
} from "vite";
import react from "@vitejs/plugin-react";

/*
 * Local `/api/*` for `npm run dev`.
 *
 * On Vercel, `api/*.ts` are serverless functions. Vite knows nothing about
 * them, so under a plain dev server every chat message POSTed to
 * `/api/sawa` came back as an SPA 404 and the UI showed the fail-closed
 * notice: "Sawa is unavailable right now." The code was fine; the handler
 * simply never ran. That gap is the reason the site can be green in
 * verification and broken in a browser.
 *
 * This plugin closes it by executing the *same* handler modules Vercel
 * deploys, through Vite's SSR module loader. There is no second
 * implementation of the endpoint: same file, same guards, same caps, same
 * streaming, so what works locally is what ships. Only the transport
 * differs - Node's `IncomingMessage`/`ServerResponse` are adapted to the
 * `{ method, headers, body }` / `status().json()` shape the handlers take.
 *
 * It runs in the dev server only: `vite preview` has no SSR module loader,
 * so `npm run preview` still serves a bundle without an API. `npx vercel
 * dev` is the local run that most closely matches production.
 *
 * Environment: the handlers read `process.env` (SAWA_MODEL_PROVIDER and the
 * NVIDIA_* / MISTRAL_* / OPENAI_* sets). Vite only exposes `VITE_`-prefixed
 * variables through `import.meta.env`, so `.env.local` is copied into
 * `process.env` here, never overriding an already-exported value. Keys never
 * reach the client bundle because these modules load server-side only.
 */

const API_ROUTE = /^\/api\/[A-Za-z0-9_-]+$/;

const loadApiEnv = (mode: string, root: string) => {
  // Prefix "" loads every variable in .env / .env.local / .env.[mode], which
  // is what the handlers expect. Real process.env always wins.
  const env = loadEnv(mode, root, "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
};

// Node's response has write/end/setHeader/on/off but not Express's
// `status()` and `json()`, which every handler uses. Patch them on rather
// than wrap, so `res.on("close")` and the SSE writes behave exactly as on
// Vercel.
const adaptResponse = (res: any) => {
  if (typeof res.status !== "function") {
    res.status = (code: number) => {
      res.statusCode = code;
      return res;
    };
  }
  if (typeof res.json !== "function") {
    res.json = (data: unknown) => {
      if (!res.hasHeader("Content-Type")) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      res.end(JSON.stringify(data));
      return res;
    };
  }
  return res;
};

const readBody = async (req: any): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
};

const createApiMiddleware =
  (server: ViteDevServer) => async (req: any, res: any, next: () => void) => {
    const pathname: string = (req.url ?? "").split("?")[0] ?? "";
    if (!pathname.startsWith("/api/")) return next();

    const name = pathname.slice("/api/".length);
    if (!API_ROUTE.test(pathname)) return next();

    const root = server.config.root;
    const file = path.join(root, "api", `${name}.ts`);
    if (!existsSync(file)) return next();

    let handler: ((request: any, response: any) => Promise<void>) | undefined;
    try {
      const mod = (await server.ssrLoadModule(`/api/${name}.ts`)) as {
        default?: unknown;
      };
      if (typeof mod.default === "function") {
        handler = mod.default as (request: any, response: any) => Promise<void>;
      }
    } catch {
      handler = undefined;
    }

    if (!handler) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ message: "Sawa is unavailable right now. Please try again." }));
      return;
    }

    const body = await readBody(req);
    const request = { method: req.method, headers: req.headers, body };

    try {
      await handler(request, adaptResponse(res));
    } catch {
      // Handlers fail closed with a generic message on purpose; do not
      // surface the stack to the browser in dev either.
      if (!res.writableEnded) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ message: "Sawa is unavailable right now. Please try again." }));
      }
    }
  };

const localApiPlugin = (): Plugin => ({
  name: "local-api",
  configureServer(server) {
    loadApiEnv(server.config.mode, server.config.root);
    server.middlewares.use(createApiMiddleware(server));
  },
});

export default defineConfig({
  plugins: [react(), localApiPlugin()],
});
