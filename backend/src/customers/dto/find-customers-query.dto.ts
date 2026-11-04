import { Type } from "class-transformer";
import { IsInt, IsPositive, Max } from "class-validator";

export class FindCustomersQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(50)
  limit: number = 10;
}
