import { DeleteOutlined } from "@ant-design/icons";
import { Button, message, Popconfirm } from "antd";
import { isAxiosError } from "axios";
import type { BikeModel } from "../models/BikeModel";

interface DeleteBikeButtonProps {
  bike: BikeModel;
  deleteBike: (id: string) => Promise<void>;
}

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error) && error.response?.status === 409)
    return "This bike has sales and cannot be deleted";
  if (isAxiosError(error) && error.response?.status === 404)
    return "Bike not found";
  return "Could not delete the bike";
};

export const DeleteBikeButton = ({
  bike,
  deleteBike,
}: DeleteBikeButtonProps) => {
  // Returning the request keeps the confirm button loading until it settles
  const onConfirm = () =>
    deleteBike(bike.id).catch((error) => {
      message.error(getErrorMessage(error));
    });

  return (
    <Popconfirm
      title={`Deleting ${bike.brand} ${bike.model}`}
      description="Are you sure?"
      okText="Yes, delete"
      okButtonProps={{ danger: true }}
      onConfirm={onConfirm}
    >
      <Button danger aria-label={`Delete ${bike.brand} ${bike.model}`}>
        <DeleteOutlined />
      </Button>
    </Popconfirm>
  );
};
