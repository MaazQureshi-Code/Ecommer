import {
  clearAuthenticatedSession,
  getAccessToken,
} from "../auth/authSession.js";

// IMPORTANT:
// Admin frontend always uses relative URLs.
// Browser -> localhost:5174 -> Vite proxy -> Shopera backend
//
// Do NOT put localhost:5208 or localhost:7169 here.
export const API_BASE_URL = "";

export class ApiError extends Error {
  constructor(
    message,
    {
      status = 0,
      title = "",
      detail = "",
      instance = "",
      errors = null,
    } = {},
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.instance = instance;
    this.errors = errors;
  }
}

const readBody = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("json")) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const apiRequest = async (
  path,
  {
    method = "GET",
    body,
    query,
    token = getAccessToken(),
    headers = {},
  } = {},
) => {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  // ALWAYS use Admin frontend origin (5174).
  // Vite handles forwarding /api to the backend.
  const requestOrigin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "http://localhost:5174";

  const url = new URL(
    normalizedPath,
    requestOrigin,
  );

  Object.entries(query || {}).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        url.searchParams.set(
          key,
          String(value),
        );
      }
    },
  );

  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization =
      `Bearer ${token}`;
  }

  if (body !== undefined) {
    requestHeaders["Content-Type"] =
      "application/json";
  }

  let response;

  try {
    response = await fetch(url.toString(), {
      method,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    });
  } catch (error) {
    console.error(
      "Shopera API connection error:",
      error,
    );

    throw new ApiError(
      "Unable to connect to the Shopera server. Please make sure the backend is running.",
      {
        status: 0,
      },
    );
  }

  const payload = await readBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthenticatedSession();
    }

    const details =
      payload &&
      typeof payload === "object"
        ? payload
        : {};

    const message =
      details.detail ||
      details.message ||
      details.title ||
      (typeof payload === "string"
        ? payload
        : `Request failed with status ${response.status}.`);

    throw new ApiError(message, {
      status: response.status,
      title: details.title || "",
      detail: details.detail || "",
      instance: details.instance || "",
      errors: details.errors || null,
    });
  }

  return payload;
};

export const api = {
  get: (path, options) =>
    apiRequest(path, {
      ...options,
      method: "GET",
    }),

  post: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: "POST",
      body,
    }),

  put: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: "PUT",
      body,
    }),

  patch: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: "PATCH",
      body,
    }),

  delete: (path, options) =>
    apiRequest(path, {
      ...options,
      method: "DELETE",
    }),
};