import type {
  CustomerModel,
  PaginatedCustomersModel,
} from "../models/customer.model";

export class CustomerResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  country: string | null;

  static fromModel(model: CustomerModel): CustomerResponseDto {
    return Object.assign(new CustomerResponseDto(), model);
  }
}

export class PaginatedCustomersResponseDto {
  totalCount: number;
  customers: CustomerResponseDto[];

  static fromModel(
    model: PaginatedCustomersModel,
  ): PaginatedCustomersResponseDto {
    return Object.assign(new PaginatedCustomersResponseDto(), {
      totalCount: model.totalCount,
      customers: model.customers.map((customer) =>
        CustomerResponseDto.fromModel(customer),
      ),
    });
  }
}
