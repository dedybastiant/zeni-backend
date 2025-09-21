import { Type } from 'class-transformer';

export class BaseResponseDto {
  status: string;
  message: string;
}

export class DataResponseDto<T> extends BaseResponseDto {
  data: T;
}

export class PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
}

export class PaginatedResponseDto<T> extends DataResponseDto<T> {
  @Type(() => PaginationMetaDto)
  pagination: PaginationMetaDto;
}
