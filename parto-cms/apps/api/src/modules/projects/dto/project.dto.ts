import { ArrayUnique, IsArray, IsString, IsOptional, IsBoolean, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
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
  titleFa?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionFa?: string | null;

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
  year?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationEn?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationFa?: string | null;

  @ApiPropertyOptional({ type: [String], description: 'Related Client ids' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  clientIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitleEn?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitleFa?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescEn?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescFa?: string | null;
}

// Every field optional, including `titleEn`, so a partial edit is valid.
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ProjectQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isFeatured?: boolean;
}
