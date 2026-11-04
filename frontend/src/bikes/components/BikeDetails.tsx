import {
  ArrowLeftOutlined,
  EditOutlined,
  EuroOutlined,
  ShoppingOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import type { DescriptionsProps } from "antd";
import { Button, Card, Col, Descriptions, Row, Skeleton, Space } from "antd";
import Title from "antd/es/typography/Title";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ButtonLink } from "../../shared/components/ButtonLink";
import { useBikeDetailsProvider } from "../providers/useBikeDetailsProvider";
import { BikeModal } from "./BikeModal";

interface BikeDetailsProps {
  bikeId: string;
}

const formatPrice = (cents: number) =>
  (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "EUR",
  });

export const BikeDetails = ({ bikeId }: BikeDetailsProps) => {
  const { bike, isLoading, load, updateBike } = useBikeDetailsProvider(bikeId);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  useEffect(() => {
    load();
  }, [bikeId]);

  const isNotFound = !isLoading && !bike;

  const value = (content: ReactNode) =>
    isLoading ? <Skeleton.Input active size="small" /> : (content ?? "—");

  const identityItems: DescriptionsProps["items"] = [
    { key: "brand", label: "Brand", children: value(bike?.brand) },
    { key: "model", label: "Model", children: value(bike?.model) },
    { key: "category", label: "Category", children: value(bike?.category) },
    {
      key: "description",
      label: "Description",
      children: value(bike?.description),
    },
    { key: "id", label: "Reference", children: value(bike?.id) },
  ];

  const frameItems: DescriptionsProps["items"] = [
    {
      key: "frameMaterial",
      label: "Frame material",
      children: value(bike?.frameMaterial),
    },
    {
      key: "frameSizeCm",
      label: "Frame size",
      children: value(bike && `${bike.frameSizeCm} cm`),
    },
    {
      key: "wheelSizeInches",
      label: "Wheel size",
      children: value(bike && `${bike.wheelSizeInches}"`),
    },
    {
      key: "weightKg",
      label: "Weight",
      children: value(bike && `${bike.weightKg} kg`),
    },
    {
      key: "gearCount",
      label: "Gears",
      children: value(bike?.gearCount),
    },
  ];

  const priceItems: DescriptionsProps["items"] = [
    {
      key: "electric",
      label: (
        <Space>
          <ThunderboltOutlined />
          Electric
        </Space>
      ),
      children: value(bike && (bike.electric ? "Yes" : "No")),
    },
    {
      key: "priceCents",
      label: (
        <Space>
          <EuroOutlined />
          Price
        </Space>
      ),
      children: value(bike && formatPrice(bike.priceCents)),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 16,
        padding: ".25rem .5rem",
      }}
    >
      <ButtonLink to="/bikes" icon={<ArrowLeftOutlined />}>
        Back to bikes
      </ButtonLink>

      <Space align="center">
        <ShoppingOutlined style={{ fontSize: "1.5rem" }} />
        {isLoading ? (
          <Skeleton.Input active size="large" />
        ) : (
          <Title level={2} style={{ margin: 0 }}>
            {bike ? `${bike.brand} ${bike.model}` : "Bike not found"}
          </Title>
        )}
        {bike && (
          <Button icon={<EditOutlined />} onClick={() => setIsEditOpen(true)}>
            Edit
          </Button>
        )}
      </Space>

      {isEditOpen && bike && (
        <BikeModal
          mode="edit"
          bike={bike}
          onSubmit={updateBike}
          onClose={() => setIsEditOpen(false)}
        />
      )}

      {!isNotFound && (
        <Row gutter={[16, 16]} style={{ alignSelf: "stretch" }}>
          <Col xs={24} md={12}>
            <Card title="Identity" style={{ height: "100%" }}>
              <Descriptions column={1} items={identityItems} />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Frame & specs" style={{ height: "100%" }}>
              <Descriptions column={1} items={frameItems} />
            </Card>
          </Col>
          <Col span={24}>
            <Card title="Price">
              <Descriptions column={{ xs: 1, md: 2 }} items={priceItems} />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};
