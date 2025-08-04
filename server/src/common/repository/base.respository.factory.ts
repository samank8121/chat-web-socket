import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { PrismaClient } from '@prisma/client';

export function createRepositoryClass<T, C, U>(modelName: keyof PrismaClient) {
  @Injectable()
  class DynamicRepository extends BaseRepository<T, C, U> {
    constructor(prisma: PrismaService) {
      super(prisma, modelName);
    }
  }
  return DynamicRepository;
}
