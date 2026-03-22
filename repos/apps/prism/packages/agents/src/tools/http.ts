type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions<TBody> = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  body?: TBody;
};

type HttpResponse<T> = {
  status: number;
  headers: Record<string, string>;
  data: T;
};

function buildUrl(base: string, path: string, query?: RequestOptions<any>["query"]): string {
  const url = new URL(path, base.endsWith("/") ? base : `${base}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export class HttpClient {
  constructor(private baseUrl: string, private defaultHeaders: Record<string, string> = {}) {}

  async request<TResponse = any, TBody = any>(
    path: string,
    options: RequestOptions<TBody> = {}
  ): Promise<HttpResponse<TResponse>> {
    const method = options.method ?? "GET";
    const headers: Record<string, string> = { ...this.defaultHeaders, ...options.headers };
    let body: any;
    if (options.body !== undefined) {
      const blobCtor = (globalThis as any).Blob;
      if (typeof options.body === "string" || (blobCtor && options.body instanceof blobCtor)) {
        body = options.body as any;
      } else if (headers["content-type"]?.includes("application/x-www-form-urlencoded")) {
        body = new URLSearchParams(options.body as any).toString();
      } else {
        headers["content-type"] = headers["content-type"] ?? "application/json";
        body = JSON.stringify(options.body);
      }
    }

    const response = await fetch(buildUrl(this.baseUrl, path, options.query), {
      method,
      headers,
      body,
    });

    const contentType = response.headers.get("content-type") ?? "";
    let data: any;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headersObj[key.toLowerCase()] = value;
    });

    return {
      status: response.status,
      headers: headersObj,
      data,
    };
  }

  get<T = any>(path: string, query?: RequestOptions<any>["query"]): Promise<HttpResponse<T>> {
    return this.request<T>(path, { method: "GET", query });
  }

  post<T = any, TBody = any>(path: string, body?: TBody): Promise<HttpResponse<T>> {
    return this.request<T, TBody>(path, { method: "POST", body });
  }
}
