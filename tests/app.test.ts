import request from "supertest";
import app from "../src/app.js";

describe("App", () => {
  it("GET / should respond with ok", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("trading-log-api");
  });

  it("GET /api/health should respond ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});


