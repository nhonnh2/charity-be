import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsBoolean, Min, Max, MaxLength } from 'class-validator';

export class CreateProgressUpdateDto {
  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @IsNumber()
  @Min(0)
  milestoneIndex: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercentage: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  workCompleted?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  challengesFaced?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  nextSteps?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  resourcesUsed?: string;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean = true;
} 