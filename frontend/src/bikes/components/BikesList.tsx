import { Pagination, Skeleton, Space } from "antd";
import Title from "antd/es/typography/Title";
import { useEffect } from "react";
import { useBikesProvider } from "../providers/useBikesProvider";
import { BikeListItem } from "./BikeListItem";

export const BikesList = () => {
  const { bikes, totalCount, page, pageSize, isLoading, load } =
    useBikesProvider();

  useEffect(() => {
    load();
  }, []);

  return (
    <Space orientation="vertical" style={{ padding: ".25rem .5rem" }}>
      <Title level={2} style={{ margin: 0 }}>
        Bikes
      </Title>
      {isLoading ? (
        <Skeleton />
      ) : (
        bikes.map((bike) => <BikeListItem key={bike.id} bike={bike} />)
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
