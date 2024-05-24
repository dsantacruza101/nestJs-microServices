import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  
  private readonly logger = new Logger('ProductsService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }
  
  create(createProductDto: CreateProductDto) {
    
    return this.product.create({
      data: createProductDto
    });

  }

  async findAll( paginationDto: PaginationDto ) {

    const { page, limit } = paginationDto;

    const totalPages = await this.product.count({ where: { available: true }});
    const lastPage = Math.ceil( totalPages / limit );

    return {
      data: this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true },
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage
      }
    } 
  }

  async findOne(id: number) {
    const product =  await this.product.findFirst({
      where: { id: id, available: true}
    })

    if ( !product ) {
      throw new NotFoundException(`Product with ${id} not found`)
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: __, ...data } = updateProductDto;
    
    await this.findOne(id);

    return await this.product.update({
      where: { id: id },
      data: updateProductDto
    })

  }

  async remove(id: number) {

    await this.findOne(id);

    // return await this.product.delete({
    //   where: {id: id}
    // })

    const product = await this.product.update({
      where: {id: id},
      data: { available: false }
    })
  }
}
