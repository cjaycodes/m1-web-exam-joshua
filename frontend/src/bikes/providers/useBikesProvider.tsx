import axios from "axios";
import { useState } from "react";
import type {
  BikeModel,
  CreateBikeModel,
  PaginatedBikesModel,
} from "../models/BikeModel";

const PAGE_SIZE = 10;

export const useBikesProvider = () => {
  const [bikes, setBikes] = useState<BikeModel[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const load = (targetPage: number = page) => {
    setIsLoading(true);
    axios
      .get<PaginatedBikesModel>("http://localhost:3000/bikes", {
        params: { page: targetPage, limit: PAGE_SIZE },
      })
      .then((result) => {
        setBikes(result.data.bikes);
        setTotalCount(result.data.totalCount);
        setPage(targetPage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Returns the request so the caller can react to errors (e.g. bike has sales)
  const deleteBike = (id: string) =>
    axios.delete(`http://localhost:3000/bikes/${id}`).then(() => {
      // Deleting the last bike of a page: go back to the previous page
      load(bikes.length === 1 && page > 1 ? page - 1 : page);
    });

  // Returns the request so the caller can react to errors (e.g. invalid input)
  // The new bike may land on any page, so reload the current one from the backend
  const createBike = (input: CreateBikeModel) =>
    axios
      .post<BikeModel>("http://localhost:3000/bikes", input)
      .then(() => load());

  return {
    bikes,
    totalCount,
    page,
    pageSize: PAGE_SIZE,
    load,
    isLoading,
    deleteBike,
    createBike,
  };
};
