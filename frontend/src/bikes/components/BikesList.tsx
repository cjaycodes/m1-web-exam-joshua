import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  ConfigProvider,
  Pagination,
  Row,
  Skeleton,
  Space,
  theme,
  Typography,
} from "antd";
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

  // At least one page, so an empty list reads "Page 1 of 1"
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <>
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
      </Space>
      <Row
        justify="space-between"
        align="middle"
        wrap={false}
        style={{
          width: "100%",
          padding: "12px 16px",
          marginTop: 16,
          background: "#16171d",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8,
          position: "sticky",
          bottom: 0,
          zIndex: 10,
        }}
      >
        <Col>
          <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={totalCount}
              onChange={load}
              showSizeChanger={false}
            />
          </ConfigProvider>
        </Col>
        <Col>
          <Typography.Text style={{ fontWeight: 500, color: "#E4B158" }}>
            {`Page ${page} of ${totalPages}`}
          </Typography.Text>
        </Col>
      </Row>
    </>
  );
};
