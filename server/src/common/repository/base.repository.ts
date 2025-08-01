import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

@Injectable()
export abstract class BaseRepository<
  T = any,
  CreateDto = any,
  UpdateDto = any,
> {
  protected model: any;

  constructor(
    protected readonly prisma: PrismaService,
    modelName: keyof PrismaClient,
  ) {
    this.model = (prisma as any)[modelName];
  }

  async findById(id: string, include?: any): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      include,
    });
  }

  async findOne(where: any, include?: any): Promise<T | null> {
    return this.model.findUnique({
      where,
      include,
    });
  }

  async findMany(
    where?: any,
    include?: any,
    orderBy?: any,
    take?: number,
  ): Promise<T[]> {
    return this.model.findMany({
      where,
      include,
      orderBy,
      take,
    });
  }

  async create(data: CreateDto, include?: any): Promise<T> {
    return this.model.create({
      data,
      include,
    });
  }

  async update(id: string, data: UpdateDto, include?: any): Promise<T> {
    return this.model.update({
      where: { id },
      data,
      include,
    });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  async transaction(operations: any[]): Promise<any> {
    return this.prisma.$transaction(operations);
  }
}
