export type BikeModel = {
  id: string;
  brand: string;
  model: string;
  description: string;
  category: string;
  frameMaterial: string;
  frameSizeCm: number;
  wheelSizeInches: number;
  gearCount: number;
  weightKg: number;
  electric: boolean;
  priceCents: number;
};

// Shape of GET /bikes (paginated)
export type PaginatedBikesModel = {
  totalCount: number;
  bikes: BikeModel[];
};

export type CreateBikeModel = Omit<BikeModel, "id">;

// Only the fields sent are changed
export type UpdateBikeModel = Partial<CreateBikeModel>;
