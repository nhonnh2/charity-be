import { Injectable } from '@nestjs/common';
import { Model, Document } from 'mongoose';

@Injectable()
export class DatabaseService {
  /**
   * Create pagination query
   */
  createPaginationQuery(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return { skip, limit };
  }

  /**
   * Get paginated results
   */
  async getPaginatedResults<T extends Document>(
    model: Model<T>,
    query: any = {},
    page: number = 1,
    limit: number = 10,
    sort: any = { createdAt: -1 },
  ) {
    const { skip, limit: takeLimit } = this.createPaginationQuery(page, limit);
    
    const [data, total] = await Promise.all([
      model.find(query).sort(sort).skip(skip).limit(takeLimit).exec(),
      model.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  /**
   * Build search query
   */
  buildSearchQuery(searchTerm: string, fields: string[]) {
    if (!searchTerm || !fields.length) return {};
    
    const searchRegex = new RegExp(searchTerm, 'i');
    return {
      $or: fields.map(field => ({
        [field]: { $regex: searchRegex }
      }))
    };
  }
} 