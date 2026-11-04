import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BikesRepository } from "./bikes.repository";
import type {
  BikeModel,
  CreateBikeModel,
  FindBikesQuery,
  PaginatedBikesModel,
  UpdateBikeModel,
} from "./models/bike.model";
import {
  BikeHasSalesError,
  BikeNotFoundError,
} from "./models/persistence-error.model";

@Injectable()
export class BikesService {
  constructor(
    @Inject(BikesRepository)
    private readonly repository: BikesRepository,
  ) {}

  findAll(query: FindBikesQuery): Promise<PaginatedBikesModel> {
    return this.repository.findAll(query);
  }

  async findById(id: string): Promise<BikeModel> {
    const bike = await this.repository.findById(id);
    if (!bike) throw new NotFoundException("Bike not found");
    return bike;
  }

  create(input: CreateBikeModel): Promise<BikeModel> {
    return this.repository.create(input);
  }

  async update(id: string, input: UpdateBikeModel): Promise<BikeModel> {
    try {
      return await this.repository.update(id, input);
    } catch (error) {
      this.translateError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!(await this.repository.delete(id)))
        throw new NotFoundException("Bike not found");
    } catch (error) {
      this.translateError(error);
    }
  }

  private translateError(error: unknown): never {
    if (error instanceof BikeNotFoundError)
      throw new NotFoundException("Bike not found");
    if (error instanceof BikeHasSalesError)
      throw new ConflictException("Bike has sales and cannot be deleted");
    throw error;
  }
}
