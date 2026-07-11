import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaginationQueryDto } from '../dtos/pagination-quey.dto';
import { ObjectLiteral, Repository } from 'typeorm';
import type { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { IPaginated } from '../interfaces/pagination.interface';

@Injectable()
export class PaginationProvider {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}

  public async paginateQuery<T extends ObjectLiteral>(
    paginationQuery: PaginationQueryDto,
    repository: Repository<T>,
  ) {
    const { page = 1, limit = 10 } = paginationQuery;
    const baseUrl = `${this.request.protocol}://${this.request.get('host')}`;
    const url = new URL(this.request.url, baseUrl);

    const totalItems = await repository.count();
    const totalPages = Math.ceil(totalItems / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;
    const firstPage = 1;
    const lastPage = totalPages;

    let data: T[] = [];
    try {
      data = await repository.find({
        take: limit,
        skip: (page - 1) * limit,
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }

    const response: IPaginated<T> = {
      data,
      meta: {
        itemsPerPage: limit,
        totalItems,
        currentPage: page,
        totalPages,
      },
      links: {
        first: `${url.origin}${url.pathname}?page=${firstPage}&limit=${limit}`,
        last: `${url.origin}${url.pathname}?page=${lastPage}&limit=${limit}`,
        current: `${url.origin}${url.pathname}?page=${page}&limit=${limit}`,
        next: nextPage
          ? `${url.origin}${url.pathname}?page=${nextPage}&limit=${limit}`
          : null,
        prev: prevPage
          ? `${url.origin}${url.pathname}?page=${prevPage}&limit=${limit}`
          : null,
      },
    };

    return response;
  }
}
