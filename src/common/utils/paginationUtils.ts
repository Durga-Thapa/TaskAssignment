import { Model } from 'mongoose';
import { PaginationResult } from '../interface/paginationInterface';
export async function Pagination<T>(
  model: Model<T>,
  pagination: { page?: number; limit?: number },
  sort: Record<string, 1 | -1>,
  filter: Record<string, unknown> = {},
  populate: any[] = [],
): Promise<PaginationResult<T>> {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 10;
  const skip = (page - 1) * limit;

  let query = model.find(filter).sort(sort).skip(skip).limit(limit);

  for (const p of populate) {
    query = query.populate(p);
  }

  const [total, data] = await Promise.all([
    model.countDocuments(filter),
    query.lean(),
  ]);

  return {
    data,
    total,
    page,
    limit,
    skip,
    totalPages: Math.ceil(total / limit),
  };
}
