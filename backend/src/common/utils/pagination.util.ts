import {
  PaginationOptions,
  PaginatedResult,
} from '../interfaces/pagination.interface';

export class PaginationUtil {
  static calculatePagination(
    page: number,
    limit: number,
    total: number,
  ): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    offset: number;
  } {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;
    const offset = (page - 1) * limit;

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrevious,
      offset,
    };
  }

  static createPaginatedResult<T>(
    data: T[],
    total: number,
    options: PaginationOptions,
  ): PaginatedResult<T> {
    const pagination = this.calculatePagination(
      options.page,
      options.limit,
      total,
    );

    return {
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
        hasNext: pagination.hasNext,
        hasPrevious: pagination.hasPrevious,
      },
    };
  }

  static getSkipTake(
    page: number,
    limit: number,
  ): { skip: number; take: number } {
    const skip = (page - 1) * limit;
    return { skip, take: limit };
  }
}
