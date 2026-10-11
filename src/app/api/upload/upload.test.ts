import { describe, expect, it } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

describe("/api/upload Server-Side MIME & Size Validation", () => {
  it("rejects uploads with no file provided", async () => {
    const formData = new FormData();
    const req = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("No file provided in form data");
  });

  it("rejects forbidden/dangerous MIME types (e.g. application/exe)", async () => {
    const formData = new FormData();
    const fakeFile = new File(["malicious"], "virus.exe", {
      type: "application/x-msdownload",
    });
    formData.append("file", fakeFile);

    const req = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(415);
    const body = await res.json();
    expect(body.error).toContain("Unsupported media format");
  });

  it("accepts valid image uploads (image/png)", async () => {
    const formData = new FormData();
    const validFile = new File(["fake-image-bytes"], "preview.png", {
      type: "image/png",
    });
    formData.append("file", validFile);

    const req = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.type).toBe("image");
    expect(body.mediaUrl).toBeDefined();
    expect(body.fileSize).toBeGreaterThan(0);
  });
});
