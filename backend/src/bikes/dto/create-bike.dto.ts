import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from "class-validator";

export class CreateBikeDto {
  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  frameMaterial: string;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  frameSizeCm: number;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  wheelSizeInches: number;

  @IsInt()
  @Min(1)
  gearCount: number;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  weightKg: number;

  @IsBoolean()
  electric: boolean;

  @IsInt()
  @Min(0)
  priceCents: number;
}
