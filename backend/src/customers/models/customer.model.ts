export interface CustomerModel {
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
}

export interface CreateCustomerModel {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  birthDate?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
}

export type UpdateCustomerModel = Partial<CreateCustomerModel>;

export interface FindAllCustomersQuery {
  page: number;
  limit: number;
}

export interface PaginatedCustomersModel {
  totalCount: number;
  customers: CustomerModel[];
}
