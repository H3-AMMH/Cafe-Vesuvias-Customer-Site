require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../../index");
const db = require("../../database/testCafe");

beforeAll((done) => {
  db.run("DELETE FROM menu_items", done);
});

afterAll((done) => {
  db.close(done);
});

describe("Integration test: API + DB", () => {
  test("GET /api/menu returns menu items", async () => {
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("DELETE FROM menu_items");
        db.run(
          `INSERT INTO menu_items 
          (id, name, category_id, description_danish, description_english, price, isAvailable) 
          VALUES (1, 'Pizza Vesuvio', 1, 'En klassisk pizza med skinke og ost', 'A classic pizza with ham and cheese', 85, 1)`,
          (err) => (err ? reject(err) : resolve())
        );
      });
    });

    const res = await request(app)
      .get("/api/menu")
      .set("x-api-key", process.env.API_KEY);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, name: "Pizza Vesuvio" }),
      ])
    );
  });
});
