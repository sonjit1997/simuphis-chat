import { describe, it, expect } from "vitest";
import { middleware } from "./middleware";
import { NextRequest } from "next/server";

describe("Authentication Guard Middleware", () => {
  it("redirects unauthenticated user visiting protected route / to /login", () => {
    const req = new NextRequest("http://localhost:3000/");
    const res = middleware(req);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("redirects unauthenticated user visiting /conv-1 to /login", () => {
    const req = new NextRequest("http://localhost:3000/conv-1");
    const res = middleware(req);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("allows unauthenticated user visiting /login", () => {
    const req = new NextRequest("http://localhost:3000/login");
    const res = middleware(req);
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects authenticated user visiting /login to /conv-1", () => {
    const req = new NextRequest("http://localhost:3000/login", {
      headers: {
        cookie: "simuphish_session=user-1",
      },
    });
    const res = middleware(req);
    expect(res.headers.get("location")).toBe("http://localhost:3000/conv-1");
  });

  it("allows authenticated user visiting /conv-1", () => {
    const req = new NextRequest("http://localhost:3000/conv-1", {
      headers: {
        cookie: "simuphish_session=user-1",
      },
    });
    const res = middleware(req);
    expect(res.headers.get("location")).toBeNull();
  });
});
