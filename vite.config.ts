import { existsSync } from "node:fs";
import path from "node:path";
import {
  createServer,
  defineConfig,
  loadEnv,
  type Plugin,
  type UserConfig,
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
 * It runs in the dev server and in `vite preview`, so both `npm run dev` and
 * the built bundle served by `npm run preview` can hold a real conversation.
 * `npx vercel dev` remains the run closest to production.
 *
 * Environment: the handlers read `process.env` (SAWA_MODEL_PROVIDER and the
 * NVIDIA_* / MISTRAL_* / OPENAI_* sets). Vite only exposes `VITE_`-prefixed
 * variables through `import.meta.env`, so `.env.local` is copied into
 * `process.env` here, never overriding an already-exported value. Keys never
 * reach the client bundle because these modules load server-side only.
 */

const API_ROUTE = /^\/api\/[A-Za-z0-9_-]+$/;

// Where the handlers are imported from and which directory they live in. The
// dev server loads them through its own SSR loader; the preview server has no
// loader of its own, so it gets one (see createPreviewLoader).
type ApiRuntime = {
  root: string;
  loadModule: (modulePath: string) => Promise<{ default?: unknown }>;
};

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

const NOT_FOUND_MESSAGE = "Not found.";

/*
 * Runs one handler with the Vercel-shaped `res`, and owns every way a request
 * can fail: a module that will not load, and a handler that throws. Both fail
 * closed with the generic message rather than a stack, in dev as in production.
 */
const runHandler = async (
  handler: ((request: any, response: any) => Promise<void>) | undefined,
  request: any,
  res: any
) => {
  if (!handler) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ message: "Sawa is unavailable right now. Please try again." }));
    return;
  }

  try {
    await handler(request, res);
  } catch {
    if (!res.writableEnded) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ message: "Sawa is unavailable right now. Please try again." }));
    }
  }
};

const CORS_METHODS = "GET, POST, OPTIONS";

/*
 * Local `/api/*` is a convenience for `npm run dev` and `npm run preview` and
 * must never behave more permissively than the deployed function. Vercel
 * answers CORS preflights on this project, so the local middleware does the
 * same, and no `Access-Control-Allow-Origin` is ever sent, which is what keeps
 * a browser on another origin from reading a reply. Both are bad to discover
 * only after deploying, so both are mirrored here.
 */
const applyApiCors = (res: any) => {
  res.setHeader?.("Access-Control-Allow-Methods", CORS_METHODS);
};

const createApiMiddleware =
  (runtime: ApiRuntime) => async (req: any, res: any, next: () => void) => {
    const pathname: string = (req.url ?? "").split("?")[0] ?? "";
    if (!pathname.startsWith("/api/")) return next();

    const name = pathname.slice("/api/".length);
    if (!API_ROUTE.test(pathname)) return next();

    const file = path.join(runtime.root, "api", `${name}.ts`);
    if (!existsSync(file)) {
      applyApiCors(res);
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ message: NOT_FOUND_MESSAGE }));
      return;
    }

    // A preflight is answered the way the platform answers it, and no page or
    // handler runs: an unrecognised /api/* path is not a page, so a mistyped
    // endpoint must not be answered with index.html.
    if (req.method === "OPTIONS") {
      applyApiCors(res);
      res.statusCode = 204;
      res.end();
      return;
    }

    let handler: ((request: any, response: any) => Promise<void>) | undefined;
    try {
      const mod = await runtime.loadModule(`/api/${name}.ts`);
      if (typeof mod.default === "function") {
        handler = mod.default as (request: any, response: any) => Promise<void>;
      }
    } catch {
      handler = undefined;
    }

    const request = { method: req.method, headers: req.headers, body: "" };
    if (handler) request.body = await readBody(req);

    applyApiCors(res);
    await runHandler(handler, request, adaptResponse(res));
  };

/*
 * `vite preview` serves the built bundle and owns no SSR module loader, so one
 * is created lazily in middleware mode, purely to import the api/ handlers.
 * It is created on the first API request, so a preview run that never calls
 * the endpoint pays nothing, and it uses no config file, which keeps it from
 * re-entering this plugin.
 */
const createPreviewLoader = (root: string) => {
  let loader: Promise<ViteDevServer> | undefined;
  return async (modulePath: string) => {
    loader ??= createServer({
      root,
      configFile: false,
      appType: "custom",
      logLevel: "silent",
      server: { middlewareMode: true },
    });
    return (await loader).ssrLoadModule(modulePath);
  };
};

const localApiPlugin = (): Plugin => ({
  name: "local-api",
  apply: (config, env) => env.command === "serve",
  // `vite preview` has one behaviour this project cannot use for a local test:
  // an unmatched path is answered with index.html and a 200. The deployed site
  // answers /api/* with a function or a 404, never a page, so the preview
  // server runs with `appType: "mpa"` instead, which drops only the SPA
  // fallback and leaves the short-code rule in `vercel.json` to serve
  // /api/sawa-escalate during a local test.
  config() {
    return { preview: { appType: "mpa" } } as UserConfig;
  },
  configureServer(server) {
    loadApiEnv(server.config.mode, server.config.root);
    server.middlewares.use(
      createApiMiddleware({
        root: server.config.root,
        loadModule: (modulePath) => server.ssrLoadModule(modulePath),
      })
    );
  },
  configurePreviewServer(server) {
    // `npm run preview` serves the production bundle, so the handlers read the
    // production .env set. .env.local still applies, which is where the local
    // provider keys live.
    loadApiEnv("production", server.config.root);
    server.middlewares.use(
      createApiMiddleware({
        root: server.config.root,
        loadModule: createPreviewLoader(server.config.root),
      })
    );
  },
});

export default defineConfig({
  plugins: [react(), localApiPlugin()],
});
