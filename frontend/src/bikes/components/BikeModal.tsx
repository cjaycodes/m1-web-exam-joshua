import type { InputNumberProps } from "antd";
import {
  Col,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Switch,
  Typography,
} from "antd";
import { isAxiosError } from "axios";
import { useState } from "react";
import type { BikeModel, CreateBikeModel } from "../models/BikeModel";

interface BikeModalProps {
  mode: "create" | "edit";
  // The bike to prefill the form with, in edit mode
  bike?: BikeModel;
  onSubmit: (input: CreateBikeModel) => Promise<void>;
  onClose: () => void;
}

type TextField =
  "brand" | "model" | "description" | "category" | "frameMaterial";

type NumberField =
  "frameSizeCm" | "wheelSizeInches" | "weightKg" | "gearCount" | "priceEuros";

// The price is edited in euros and sent to the backend in cents
type BikeFormValues = Record<TextField, string> &
  Record<NumberField, number | null> & { electric: boolean };

type BikeFormErrors = Partial<Record<TextField | NumberField, string>>;

const emptyValues: BikeFormValues = {
  brand: "",
  model: "",
  description: "",
  category: "",
  frameMaterial: "",
  frameSizeCm: null,
  wheelSizeInches: null,
  weightKg: null,
  gearCount: null,
  priceEuros: null,
  electric: false,
};

const toValues = (bike: BikeModel): BikeFormValues => ({
  brand: bike.brand,
  model: bike.model,
  description: bike.description,
  category: bike.category,
  frameMaterial: bike.frameMaterial,
  frameSizeCm: bike.frameSizeCm,
  wheelSizeInches: bike.wheelSizeInches,
  weightKg: bike.weightKg,
  gearCount: bike.gearCount,
  priceEuros: bike.priceCents / 100,
  electric: bike.electric,
});

const textLabels: Record<TextField, string> = {
  brand: "Brand",
  model: "Model",
  description: "Description",
  category: "Category",
  frameMaterial: "Frame material",
};

const validate = (values: BikeFormValues): BikeFormErrors => {
  const errors: BikeFormErrors = {};
  for (const name of Object.keys(textLabels) as TextField[])
    if (!values[name].trim()) errors[name] = `${textLabels[name]} is required`;
  for (const name of ["frameSizeCm", "wheelSizeInches", "weightKg"] as const) {
    const value = values[name];
    if (value === null || value <= 0) errors[name] = "Must be greater than 0";
  }
  if (
    values.gearCount === null ||
    !Number.isInteger(values.gearCount) ||
    values.gearCount < 1
  )
    errors.gearCount = "Must be a whole number of at least 1";
  if (values.priceEuros === null || values.priceEuros < 0)
    errors.priceEuros = "Must be 0 or more";
  return errors;
};

// Only called once validate() passed, so every number is set
const toCreateBikeModel = (values: BikeFormValues): CreateBikeModel => ({
  brand: values.brand.trim(),
  model: values.model.trim(),
  description: values.description.trim(),
  category: values.category.trim(),
  frameMaterial: values.frameMaterial.trim(),
  frameSizeCm: values.frameSizeCm ?? 0,
  wheelSizeInches: values.wheelSizeInches ?? 0,
  weightKg: values.weightKg ?? 0,
  gearCount: values.gearCount ?? 0,
  priceCents: Math.round((values.priceEuros ?? 0) * 100),
  electric: values.electric,
});

// The backend validation pipe answers 400 with { message: string | string[] }
const getServerMessage = (error: unknown) => {
  if (!isAxiosError(error) || error.response?.status !== 400) return null;
  const data = error.response.data as { message?: string | string[] };
  return Array.isArray(data.message)
    ? data.message.join(", ")
    : (data.message ?? "Invalid bike");
};

// Mounted only while open, so its state starts fresh (empty or prefilled)
// every time and Cancel needs no explicit reset
export const BikeModal = ({
  mode,
  bike,
  onSubmit,
  onClose,
}: BikeModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [values, setValues] = useState<BikeFormValues>(() =>
    bike ? toValues(bike) : emptyValues,
  );
  const [errors, setErrors] = useState<BikeFormErrors>({});

  const onConfirm = () => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    onSubmit(toCreateBikeModel(values))
      .then(onClose)
      .catch((error) => {
        // On failure, keep the modal open so the input is not lost
        message.error(getServerMessage(error) ?? "Could not save the bike");
      })
      .finally(() => setIsSubmitting(false));
  };

  const fieldError = (name: TextField | NumberField) =>
    errors[name] && (
      <Typography.Text type="danger">{errors[name]}</Typography.Text>
    );

  const textField = (name: TextField) => (
    <>
      <label htmlFor={`bike-${name}`}>{textLabels[name]} *</label>
      <Input
        id={`bike-${name}`}
        value={values[name]}
        status={errors[name] && "error"}
        onChange={(event) => {
          setValues({ ...values, [name]: event.target.value });
          setErrors({ ...errors, [name]: undefined });
        }}
      />
      {fieldError(name)}
    </>
  );

  const numberField = (
    name: NumberField,
    label: string,
    props: InputNumberProps<number> = {},
  ) => (
    <>
      <label htmlFor={`bike-${name}`}>{label} *</label>
      <InputNumber<number>
        id={`bike-${name}`}
        style={{ width: "100%" }}
        value={values[name]}
        status={errors[name] && "error"}
        onChange={(value) => {
          setValues({ ...values, [name]: value });
          setErrors({ ...errors, [name]: undefined });
        }}
        {...props}
      />
      {fieldError(name)}
    </>
  );

  return (
    <Modal
      open
      title={
        mode === "create" ? "New bike" : `Editing ${bike?.brand} ${bike?.model}`
      }
      okText={mode === "create" ? "Add bike" : "Save"}
      onCancel={onClose}
      onOk={onConfirm}
      confirmLoading={isSubmitting}
      okButtonProps={{ disabled: isSubmitting }}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>{textField("brand")}</Col>
        <Col span={12}>{textField("model")}</Col>
        <Col span={12}>{textField("category")}</Col>
        <Col span={12}>{textField("frameMaterial")}</Col>
        <Col span={24}>{textField("description")}</Col>
        <Col span={8}>
          {numberField("frameSizeCm", "Frame size (cm)", { min: 0, step: 0.5 })}
        </Col>
        <Col span={8}>
          {numberField("wheelSizeInches", "Wheel size (in)", {
            min: 0,
            step: 0.5,
          })}
        </Col>
        <Col span={8}>
          {numberField("weightKg", "Weight (kg)", { min: 0, step: 0.1 })}
        </Col>
        <Col span={8}>
          {numberField("gearCount", "Gears", { min: 1, precision: 0 })}
        </Col>
        <Col span={8}>
          {numberField("priceEuros", "Price", {
            min: 0,
            precision: 2,
            suffix: "€",
          })}
        </Col>
        <Col span={8}>
          <label htmlFor="bike-electric">Electric</label>
          <div>
            <Switch
              id="bike-electric"
              checked={values.electric}
              onChange={(checked) =>
                setValues({ ...values, electric: checked })
              }
            />
          </div>
        </Col>
      </Row>
    </Modal>
  );
};
