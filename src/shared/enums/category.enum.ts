/**
 * Campaign categories with keywords for multi-language support
 * These keywords can be mapped to different languages on the client side
 */
export enum CampaignCategory {
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  DISASTER_RELIEF = 'disaster_relief',
  POVERTY = 'poverty',
  ENVIRONMENT = 'environment',
  CHILDREN = 'children',
  ELDERLY = 'elderly',
  DISABILITY = 'disability',
  SICK_PEOPLE = 'sick_people',
  CONSTRUCTION = 'construction',
  OTHER = 'other'
}

/**
 * Category metadata with display information
 * This can be used for client-side localization
 */
export interface CategoryMetadata {
  keyword: CampaignCategory;
  displayName: string;
  description: string;
  icon?: string;
  color?: string;
}

/**
 * Default category metadata for all supported categories
 * Client can override these with localized versions
 */
export const CATEGORY_METADATA: Record<CampaignCategory, CategoryMetadata> = {
  [CampaignCategory.EDUCATION]: {
    keyword: CampaignCategory.EDUCATION,
    displayName: 'Giáo dục',
    description: 'Các chiến dịch liên quan đến giáo dục và học tập',
    icon: 'school',
    color: '#4CAF50'
  },
  [CampaignCategory.HEALTHCARE]: {
    keyword: CampaignCategory.HEALTHCARE,
    displayName: 'Y tế',
    description: 'Các chiến dịch liên quan đến chăm sóc sức khỏe',
    icon: 'medical',
    color: '#F44336'
  },
  [CampaignCategory.DISASTER_RELIEF]: {
    keyword: CampaignCategory.DISASTER_RELIEF,
    displayName: 'Thiên tai',
    description: 'Các chiến dịch cứu trợ thiên tai và khẩn cấp',
    icon: 'warning',
    color: '#FF9800'
  },
  [CampaignCategory.POVERTY]: {
    keyword: CampaignCategory.POVERTY,
    displayName: 'Người nghèo',
    description: 'Các chiến dịch hỗ trợ người nghèo và khó khăn',
    icon: 'home',
    color: '#9C27B0'
  },
  [CampaignCategory.ENVIRONMENT]: {
    keyword: CampaignCategory.ENVIRONMENT,
    displayName: 'Môi trường',
    description: 'Các chiến dịch bảo vệ môi trường và phát triển bền vững',
    icon: 'leaf',
    color: '#4CAF50'
  },
  [CampaignCategory.CHILDREN]: {
    keyword: CampaignCategory.CHILDREN,
    displayName: 'Trẻ em',
    description: 'Các chiến dịch hỗ trợ trẻ em và thanh thiếu niên',
    icon: 'child',
    color: '#2196F3'
  },
  [CampaignCategory.ELDERLY]: {
    keyword: CampaignCategory.ELDERLY,
    displayName: 'Người cao tuổi',
    description: 'Các chiến dịch hỗ trợ người cao tuổi',
    icon: 'elderly',
    color: '#607D8B'
  },
  [CampaignCategory.DISABILITY]: {
    keyword: CampaignCategory.DISABILITY,
    displayName: 'Người khuyết tật',
    description: 'Các chiến dịch hỗ trợ người khuyết tật',
    icon: 'accessibility',
    color: '#795548'
  },
  [CampaignCategory.SICK_PEOPLE]: {
    keyword: CampaignCategory.SICK_PEOPLE,
    displayName: 'Người bệnh',
    description: 'Các chiến dịch hỗ trợ người bệnh và điều trị y tế',
    icon: 'medical',
    color: '#E91E63'
  },
  [CampaignCategory.CONSTRUCTION]: {
    keyword: CampaignCategory.CONSTRUCTION,
    displayName: 'Xây dựng',
    description: 'Các chiến dịch xây dựng cơ sở hạ tầng và nhà ở',
    icon: 'construction',
    color: '#FF9800'
  },
  [CampaignCategory.OTHER]: {
    keyword: CampaignCategory.OTHER,
    displayName: 'Khác',
    description: 'Các chiến dịch khác không thuộc danh mục trên',
    icon: 'more',
    color: '#9E9E9E'
  }
};

/**
 * Get all available categories as keywords
 */
export function getAllCategoryKeywords(): CampaignCategory[] {
  return Object.values(CampaignCategory);
}

/**
 * Get category metadata by keyword
 */
export function getCategoryMetadata(keyword: CampaignCategory): CategoryMetadata {
  return CATEGORY_METADATA[keyword];
}

/**
 * Check if a category keyword is valid
 */
export function isValidCategoryKeyword(keyword: string): keyword is CampaignCategory {
  return Object.values(CampaignCategory).includes(keyword as CampaignCategory);
}
