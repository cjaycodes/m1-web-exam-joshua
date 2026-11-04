import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { DataSource } from "typeorm";
import { AppModule } from "../src/app.module";
import type { BikeResponseDto } from "../src/bikes/dto/bike-response.dto";
import { BikeEntity } from "../src/bikes/entities/bike.entity";
import { configureApp } from "../src/configure-app";
import { BikeSellEntity } from "../src/customers/entities/bike-sell.entity";
import { CustomerEntity } from "../src/customers/entities/customer.entity";
import { databaseOptions } from "../src/database/database-options";
import { fixtureIds, populateShopFixture } from "./fixtures/shop-fixture";

const missingId = "90000000-0000-4000-8000-000000000009";
// Fixture bikes 0, 1 and 2 have sales; bike 3 (Cyclane Urban E) has none.
const soldBikeId = fixtureIds.bikes[0];
const unsoldBikeId = fixtureIds.bikes[3];
const validBike = {
  brand: "Nordik",
  model: "Gravel 700",
  description: "Gravel bike",
  category: "gravel",
  frameMaterial: "carbon",
  frameSizeCm: 56,
  wheelSizeInches: 28,
  gearCount: 22,
  weightKg: 9.2,
  electric: false,
  priceCents: 219900,
};

type PaginatedBikesBody = { totalCount: number; bikes: BikeResponseDto[] };

describe("Bike catalogue API", () => {
  let app: INestApplication;
  let database: DataSource;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useFactory({
        // Let Vitest/SWC compile entity classes rather than TypeORM importing
        // the TypeScript source files through its native glob loader.
        factory: () =>
          new DataSource({
            ...databaseOptions,
            database: ":memory:",
            entities: [CustomerEntity, BikeEntity, BikeSellEntity],
          }).initialize(),
      })
      .compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
    database = app.get(DataSource);
    await populateShopFixture(database);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it("paginates the bike list with defaults, explicit pages and out-of-range pages", async () => {
    const defaults = await request(app.getHttpServer())
      .get("/bikes")
      .expect(200);
    const defaultsBody = defaults.body as PaginatedBikesBody;
    expect(defaultsBody.totalCount).toBe(4);
    expect(
      defaultsBody.bikes.map((bike) => `${bike.brand} ${bike.model}`),
    ).toEqual([
      "Cyclane Road 300",
      "Cyclane Urban E",
      "Veloria City 100",
      "Veloria Trail 500",
    ]);
    expect(defaultsBody.bikes[2]).toEqual({
      id: soldBikeId,
      brand: "Veloria",
      model: "City 100",
      description: "Vélo City 100",
      category: "city",
      frameMaterial: "aluminium",
      frameSizeCm: 54,
      wheelSizeInches: 28,
      gearCount: 9,
      weightKg: 12.4,
      electric: false,
      priceCents: 49900,
    });

    const secondPage = await request(app.getHttpServer())
      .get("/bikes")
      .query({ page: 2, limit: 3 })
      .expect(200);
    const secondPageBody = secondPage.body as PaginatedBikesBody;
    expect(secondPageBody.totalCount).toBe(4);
    expect(secondPageBody.bikes.map((bike) => bike.model)).toEqual([
      "Trail 500",
    ]);

    await request(app.getHttpServer())
      .get("/bikes")
      .query({ page: 5, limit: 2 })
      .expect(200, { totalCount: 4, bikes: [] });
  });

  it("rejects invalid page and limit values", async () => {
    for (const query of [
      { page: 0 },
      { page: -1 },
      { page: 1.5 },
      { page: "abc" },
      { limit: 0 },
      { limit: -1 },
      { limit: 51 },
      { limit: "abc" },
    ])
      await request(app.getHttpServer()).get("/bikes").query(query).expect(400);
  });

  it("creates a bike and reads it back by id", async () => {
    const created = await request(app.getHttpServer())
      .post("/bikes")
      .send(validBike)
      .expect(201);
    const bike = created.body as BikeResponseDto;
    expect(bike).toEqual({ ...validBike, id: bike.id });
    expect(bike.id).toMatch(/^[0-9a-f-]{36}$/);
    await request(app.getHttpServer())
      .get(`/bikes/${bike.id}`)
      .expect(200, bike);
    const list = await request(app.getHttpServer()).get("/bikes").expect(200);
    expect((list.body as PaginatedBikesBody).totalCount).toBe(5);
  });

  it("validates bike creation input without inserting anything", async () => {
    const count = await database.getRepository(BikeEntity).count();
    const withoutBrand: Partial<typeof validBike> = { ...validBike };
    delete withoutBrand.brand;
    for (const input of [
      {},
      withoutBrand,
      { ...validBike, model: null },
      { ...validBike, description: 42 },
      { ...validBike, category: "" },
      { ...validBike, frameMaterial: "" },
      { ...validBike, frameSizeCm: 0 },
      { ...validBike, wheelSizeInches: -28 },
      { ...validBike, weightKg: "9.2" },
      { ...validBike, gearCount: 0 },
      { ...validBike, gearCount: 1.5 },
      { ...validBike, priceCents: -1 },
      { ...validBike, priceCents: 99.5 },
      { ...validBike, electric: "false" },
      { ...validBike, id: missingId },
      { ...validBike, unexpected: true },
    ])
      await request(app.getHttpServer()).post("/bikes").send(input).expect(400);
    expect(await database.getRepository(BikeEntity).count()).toBe(count);
  });

  it("returns 400 for invalid UUIDs and 404 for missing bikes", async () => {
    for (const id of ["invalid", missingId]) {
      const status = id === "invalid" ? 400 : 404;
      await request(app.getHttpServer()).get(`/bikes/${id}`).expect(status);
      await request(app.getHttpServer())
        .patch(`/bikes/${id}`)
        .send({ priceCents: 1000 })
        .expect(status);
      await request(app.getHttpServer()).delete(`/bikes/${id}`).expect(status);
    }
  });

  it("partially updates a bike and validates patches", async () => {
    const patched = await request(app.getHttpServer())
      .patch(`/bikes/${unsoldBikeId}`)
      .send({ priceCents: 239900, electric: true, model: "Urban E2" })
      .expect(200);
    expect(patched.body).toMatchObject({
      id: unsoldBikeId,
      brand: "Cyclane",
      model: "Urban E2",
      priceCents: 239900,
      electric: true,
      weightKg: 22.5,
    });
    await request(app.getHttpServer())
      .get(`/bikes/${unsoldBikeId}`)
      .expect(200, patched.body);

    for (const input of [
      { brand: null },
      { model: "" },
      { gearCount: 0 },
      { priceCents: -1 },
      { weightKg: 0 },
      { electric: "yes" },
      { id: missingId },
    ])
      await request(app.getHttpServer())
        .patch(`/bikes/${unsoldBikeId}`)
        .send(input)
        .expect(400);
  });

  it("deletes a bike without sales and refuses to delete a sold bike", async () => {
    const removed = await request(app.getHttpServer())
      .delete(`/bikes/${unsoldBikeId}`)
      .expect(204);
    expect(removed.text).toBe("");
    await request(app.getHttpServer())
      .get(`/bikes/${unsoldBikeId}`)
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/bikes/${unsoldBikeId}`)
      .expect(404);

    const salesCount = await database.getRepository(BikeSellEntity).count();
    await request(app.getHttpServer())
      .delete(`/bikes/${soldBikeId}`)
      .expect(409);
    await request(app.getHttpServer()).get(`/bikes/${soldBikeId}`).expect(200);
    expect(await database.getRepository(BikeSellEntity).count()).toBe(
      salesCount,
    );
  });
});
