import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MaterialExit } from './entities/material-exit.entity';
import { Material } from './entities/material.entity';
import { CreateMaterialExitDto } from './dto/create-material-exit.dto';
import { UpdateMaterialExitDto } from './dto/update-material-exit.dto';

@Injectable()
export class MaterialExitsService {
  constructor(
    @InjectRepository(MaterialExit)
    private exitsRepository: Repository<MaterialExit>,
    @InjectRepository(Material)
    private materialsRepository: Repository<Material>,
    private dataSource: DataSource,
  ) {}

  async create(createDto: CreateMaterialExitDto): Promise<MaterialExit> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const material = await queryRunner.manager.findOne(Material, {
        where: { id: createDto.materialId },
      });
      
      if (!material) {
        throw new NotFoundException('Material not found');
      }

      if (Number(material.currentStock) < createDto.quantity) {
        throw new ConflictException('Insufficient stock');
      }

      const exit = this.exitsRepository.create(createDto);
      await queryRunner.manager.save(exit);

      material.currentStock = Number(material.currentStock) - createDto.quantity;
      await queryRunner.manager.save(material);

      await queryRunner.commitTransaction();
      return exit;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filters?: { materialId?: string; projectId?: string }): Promise<MaterialExit[]> {
    const query = this.exitsRepository.createQueryBuilder('exit');

    if (filters?.materialId) {
      query.andWhere('exit.materialId = :materialId', { materialId: filters.materialId });
    }

    if (filters?.projectId) {
      query.andWhere('exit.constructionProjectId = :projectId', { projectId: filters.projectId });
    }

    return await query.orderBy('exit.exitDate', 'DESC').getMany();
  }

  async findOne(id: string): Promise<MaterialExit> {
    const exit = await this.exitsRepository.findOne({ where: { id } });
    if (!exit) {
      throw new NotFoundException(`Material exit with ID ${id} not found`);
    }
    return exit;
  }

  async update(id: string, updateDto: UpdateMaterialExitDto): Promise<MaterialExit> {
    const exit = await this.findOne(id);
    Object.assign(exit, updateDto);
    return await this.exitsRepository.save(exit);
  }

  async remove(id: string): Promise<void> {
    await this.exitsRepository.delete(id);
  }
}
