import { PlusOutlined } from "@ant-design/icons";
import { Button, Pagination, Skeleton, Space } from "antd";
import Title from "antd/es/typography/Title";
import { useEffect, useState } from "react";
import { useBikesProvider } from "../providers/useBikesProvider";
import { BikeListItem } from "./BikeListItem";
import { BikeModal } from "./BikeModal";

export const BikesList = () => {
  const {
    bikes,
    totalCount,
    page,
    pageSize,
    isLoading,
    load,
    deleteBike,
    createBike,
  } = useBikesProvider();
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  useEffect(() => {
    load();
  }, []);

  return (
    <Space orientation="vertical" style={{ padding: ".25rem .5rem" }}>
      <Title level={2} style={{ margin: 0 }}>
        Bikes
      </Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsCreateOpen(true)}
      >
        New bike
      </Button>
      {isCreateOpen && (
        <BikeModal
          mode="create"
          onSubmit={createBike}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
      {isLoading ? (
        <Skeleton />
      ) : (
        bikes.map((bike) => (
          <BikeListItem key={bike.id} bike={bike} deleteBike={deleteBike} />
        ))
      )}
      <Pagination
        current={page}
        pageSize={pageSize}
        total={totalCount}
        onChange={load}
        showSizeChanger={false}
      />
    </Space>
  );
};
