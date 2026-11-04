import axios from "axios";
import { useState } from "react";
import type {
  CreateCustomerModel,
  CustomerModel,
  PaginatedCustomersModel,
} from "../models/CustomerModel";

const PAGE_SIZE = 10;

export const useCustomersProvider = () => {
  const [customers, setCustomers] = useState<CustomerModel[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const load = (targetPage: number = page) => {
    setIsLoading(true);
    axios
      .get<PaginatedCustomersModel>("http://localhost:3000/customers", {
        params: { page: targetPage, limit: PAGE_SIZE },
      })
      .then((result) => {
        setCustomers(result.data.customers);
        setTotalCount(result.data.totalCount);
        setPage(targetPage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const deleteCustomer = (id: string) => {
    axios.delete(`http://localhost:3000/customers/${id}`).then(() => {
      // Deleting the last customer of a page: go back to the previous page
      load(customers.length === 1 && page > 1 ? page - 1 : page);
    });
  };

  // Returns the request so the caller can react to errors (e.g. email already in use)
  const createCustomer = (input: CreateCustomerModel) =>
    axios
      .post<CustomerModel>("http://localhost:3000/customers", input)
      .then(() => load());

  return {
    customers,
    totalCount,
    page,
    pageSize: PAGE_SIZE,
    load,
    isLoading,
    deleteCustomer,
    createCustomer,
  };
};
