import { NextRequest } from "next/server";

export function logRequest(req: NextRequest, handlerName: string) {
  const start = Date.now();
  const method = req.method;
  const url = req.nextUrl.pathname;
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  return {
    end: (status: number) => {
      const duration = Date.now() - start;
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          handler: handlerName,
          method,
          url,
          status,
          durationMs: duration,
          ip,
        })
      );
    },
  };
}
