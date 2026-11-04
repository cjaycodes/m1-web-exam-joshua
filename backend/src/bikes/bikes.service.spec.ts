import { ConflictException, NotFoundException } from "@nestjs/common";
import { BikesRepository } from "./bikes.repository";
import { BikesService } from "./bikes.service";
import type { BikeModel } from "./models/bike.model";
import {
  BikeHasSalesError,
  BikeNotFoundError,
} from "./models/persistence-error.model";

const bike: BikeModel = {
  id: "bike-id",
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
};

function setup() {
  const repository = {
    findAll: vi.fn<BikesRepository["findAll"]>(),
    findById: vi.fn<BikesRepository["findById"]>(),
    create: vi.fn<BikesRepository["create"]>(),
    update: vi.fn<BikesRepository["update"]>(),
    delete: vi.fn<BikesRepository["delete"]>(),
  };
  // The double implements every public repository operation, without ORM state.
  const service = new BikesService(repository as unknown as BikesRepository);
  return { repository, service };
}

describe("BikesService", () => {
  it("passes pagination queries and created bikes through", async () => {
    const { repository, service } = setup();
    const paginated = { totalCount: 1, bikes: [bike] };
    repository.findAll.mockResolvedValue(paginated);
    expect(await service.findAll({ page: 2, limit: 5 })).toEqual(paginated);
    expect(repository.findAll).toHaveBeenCalledWith({ page: 2, limit: 5 });

    const input: Partial<BikeModel> = { ...bike };
    delete input.id;
    repository.create.mockResolvedValue(bike);
    expect(await service.create(input as Omit<BikeModel, "id">)).toEqual(bike);
    expect(repository.create).toHaveBeenCalledWith(input);
  });

  it("returns the bike by id or 404 when it is missing", async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(bike);
    expect(await service.findById(bike.id)).toEqual(bike);
    repository.findById.mockResolvedValue(null);
    await expect(service.findById(bike.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("passes updates through and translates missing bikes", async () => {
    const { repository, service } = setup();
    repository.update.mockResolvedValue({ ...bike, priceCents: 45900 });
    expect(await service.update(bike.id, { priceCents: 45900 })).toEqual({
      ...bike,
      priceCents: 45900,
    });
    expect(repository.update).toHaveBeenCalledWith(bike.id, {
      priceCents: 45900,
    });

    repository.update.mockRejectedValue(new BikeNotFoundError());
    await expect(
      service.update(bike.id, { priceCents: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("deletes, returns 404 for missing bikes and 409 for bikes with sales", async () => {
    const { repository, service } = setup();
    repository.delete.mockResolvedValue(true);
    await expect(service.delete(bike.id)).resolves.toBeUndefined();
    repository.delete.mockResolvedValue(false);
    await expect(service.delete(bike.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    repository.delete.mockRejectedValue(new BikeHasSalesError());
    await expect(service.delete(bike.id)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("rethrows unexpected repository errors unchanged", async () => {
    const { repository, service } = setup();
    const failure = new Error("database down");
    repository.delete.mockRejectedValue(failure);
    await expect(service.delete(bike.id)).rejects.toBe(failure);
  });
});
