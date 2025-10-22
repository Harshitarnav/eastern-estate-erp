import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MaterialEntry } from './entities/material-entry.entity';
import { Material } from './entities/material.entity';
import { CreateMaterialEntryDto } from './dto/create-material-entry.dto';
import { UpdateMaterialEntryDto } from './dto/update-material-entry.dto';

@Injectable()
export class MaterialEntriesService {
  constructor(
    @InjectRepository(MaterialEntry)
    private entriesRepository: Repository<MaterialEntry>,
    @InjectRepository(Material)
    private materialsRepository: Repository<Material>,
    private dataSource: DataSource,
  ) {}

  async create(createDto: CreateMaterialEntryDto): Promise<MaterialEntry> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entry = this.entriesRepository.create(createDto);
      await queryRunner.manager.save(entry);

      // Update material stock
      const material = await queryRunner.manager.findOne(Material, {
        where: { id: createDto.materialId },
      });
      if (material) {
        material.currentStock = Number(material.currentStock) + createDto.quantity;
        await queryRunner.manager.save(material);
      }

      await queryRunner.commitTransaction();
      return entry;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filters?: { materialId?: string; vendorId?: string }): Promise<MaterialEntry[]> {
    const query = this.entriesRepository.createQueryBuilder('entry');

    if (filters?.materialId) {
      query.andWhere('entry.materialId = :materialId', { materialId: filters.materialId });
    }

    if (filters?.vendorId) {
      query.andWhere('entry.vendorId = :vendorId', { vendorId: filters.vendorId });
    }

    return await query.orderBy('entry.entryDate', 'DESC').getMany();
  }

  async findOne(id: string): Promise<MaterialEntry> {
    const entry = await this.entriesRepository.findOne({ where: { id } });
    if (!entry) {
      throw new NotFoundException(`Material entry with ID ${id} not found`);
    }
    return entry;
  }

  async update(id: string, updateDto: UpdateMaterialEntryDto): Promise<MaterialEntry> {
    const entry = await this.findOne(id);
    Object.assign(entry, updateDto);
    return await this.entriesRepository.save(entry);
  }

  async remove(id: string): Promise<void> {
    await this.entriesRepository.delete(id);
  }
}
