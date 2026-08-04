import { IsString, IsOptional, IsBoolean, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ContentStatus } from '../../../../generated/prisma';

// The API runs with `forbidNonWhitelisted: true`, so any property the admin
// form sends that is missing here is rejected with a 400. These fields mirror
// `model Project` in schema.prisma exactly — keep the two in sync.
export class CreateProjectDto {
  @ApiProperty({ example: 'LED Stage Setup' })
  @IsString()
  titleEn!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleFa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionFa?: string;

  @ApiPropertyOptional({ description: 'Media id of the thumbnail' })
  @IsOptional()
  @IsString()
  thumbnailId?: string | null;

  @ApiPropertyOptional({ description: 'Media id of the cover image' })
  @IsOptional()
  @IsString()
  coverImageId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2200)
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationFa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientNameEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientNameFa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitleFa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescFa?: string;
}

// Every field optional, including `titleEn`, so a partial edit is valid.
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ProjectQueryDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  search?: string;

  @IsOptional()
  status?: ContentStatus;

  @IsOptional()
  isFeatured?: boolean;
}
