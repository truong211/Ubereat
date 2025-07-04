import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';

// Standard error responses
export class ApiErrorResponse {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: 'Invalid input provided' })
  message: string;

  @ApiProperty({ example: '2023-12-07T10:30:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/users' })
  path: string;

  @ApiProperty({ example: 'POST' })
  method: string;
}

export class ApiPaginatedResponse<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrev: boolean;
}

// Custom decorators for common API patterns
export function ApiStandardResponse<TModel extends Type<any>>(
  model: TModel,
  description: string = 'Success',
) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(model) },
        ],
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      type: ApiErrorResponse,
    }),
  );
}

export function ApiPaginatedResponseDecorator<TModel extends Type<any>>(
  model: TModel,
  description: string = 'Paginated list',
) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              total: { type: 'number', example: 100 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              totalPages: { type: 'number', example: 10 },
              hasNext: { type: 'boolean', example: true },
              hasPrev: { type: 'boolean', example: false },
            },
          },
        ],
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request',
      type: ApiErrorResponse,
    }),
  );
}

export function ApiOperationSummary(
  summary: string,
  description?: string,
  tags?: string[],
) {
  const decorators = [
    ApiOperation({ summary, description }),
  ];

  if (tags) {
    decorators.push(ApiTags(...tags));
  }

  return applyDecorators(...decorators);
}

export function ApiAuthenticatedEndpoint() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing token',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
      type: ApiErrorResponse,
    }),
  );
}

export function ApiCreateEndpoint<TModel extends Type<any>>(
  model: TModel,
  description: string = 'Resource created successfully',
) {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description,
      type: model,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid input',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Resource already exists',
      type: ApiErrorResponse,
    }),
  );
}

export function ApiUpdateEndpoint<TModel extends Type<any>>(
  model: TModel,
  description: string = 'Resource updated successfully',
) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      type: model,
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Resource does not exist',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid input',
      type: ApiErrorResponse,
    }),
  );
}

export function ApiDeleteEndpoint(description: string = 'Resource deleted successfully') {
  return applyDecorators(
    ApiResponse({
      status: 204,
      description,
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Resource does not exist',
      type: ApiErrorResponse,
    }),
  );
}

export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (starts from 1)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page',
      example: 10,
    }),
    ApiQuery({
      name: 'sort',
      required: false,
      type: String,
      description: 'Sort field and direction (e.g., "createdAt:desc")',
      example: 'createdAt:desc',
    }),
  );
}