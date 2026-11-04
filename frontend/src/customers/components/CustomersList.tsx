import {
  Col,
  ConfigProvider,
  Pagination,
  Row,
  Skeleton,
  Space,
  theme,
  Typography,
} from "antd";
import { useEffect } from "react";
import { useCustomersProvider } from "../providers/useCustomersProvider";
import { AddCustomerButton } from "./AddCustomerButton";
import { CustomerListItem } from "./CustomerListItem";

export const CustomersList = () => {
  const {
    customers,
    totalCount,
    page,
    pageSize,
    deleteCustomer,
    createCustomer,
    isLoading,
    load,
  } = useCustomersProvider();

  useEffect(() => {
    load();
  }, []);

  // At least one page, so an empty list reads "Page 1 of 1"
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <>
      <Space orientation="vertical" style={{ padding: ".25rem .5rem" }}>
        <AddCustomerButton createCustomer={createCustomer} />
        {isLoading ? (
          <Skeleton />
        ) : (
          customers.map((customer) => (
            <CustomerListItem
              key={customer.id}
              customer={customer}
              deleteCustomer={deleteCustomer}
            />
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
