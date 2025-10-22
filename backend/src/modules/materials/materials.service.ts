import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private materialsRepository: Repository<Material>,
  ) {}

  /**
   * Create a new material
   */
  async create(createMaterialDto: CreateMaterialDto): Promise<Material> {
    // Check for duplicate material code
    const existing = await this.materialsRepository.findOne({
      where: { materialCode: createMaterialDto.materialCode },
    });

    if (existing) {
      throw new ConflictException(
        `Material with code ${createMaterialDto.materialCode} already exists`,
      );
    }

    const material = this.materialsRepository.create(createMaterialDto);
    return await this.materialsRepository.save(material);
  }

  /**
   * Get all materials with optional filtering
   */
  async findAll(filters?: {
    category?: string;
    isActive?: boolean;
    lowStock?: boolean;
  }): Promise<Material[]> {
    const query = this.materialsRepository.createQueryBuilder('material');

    if (filters?.category) {
      query.andWhere('material.category = :category', { category: filters.category });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('material.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.lowStock) {
      query.andWhere('material.currentStock < material.minimumStockLevel');
    }

    return await query.orderBy('material.materialName', 'ASC').getMany();
  }

  /**
   * Get material by ID
   */
  async findOne(id: string): Promise<Material> {
    const material = await this.materialsRepository.findOne({ where: { id } });

    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }

    return material;
  }

  /**
   * Get material by code
   */
  async findByCode(materialCode: string): Promise<Material> {
    const material = await this.materialsRepository.findOne({
      where: { materialCode },
    });

    if (!material) {
      throw new NotFoundException(`Material with code ${materialCode} not found`);
    }

    return material;
  }

  /**
   * Update material
   */
  async update(id: string, updateMaterialDto: UpdateMaterialDto): Promise<Material> {
    const material = await this.findOne(id);

    // Check for duplicate material code if updating
    if (updateMaterialDto.materialCode && updateMaterialDto.materialCode !== material.materialCode) {
      const existing = await this.materialsRepository.findOne({
        where: { materialCode: updateMaterialDto.materialCode },
      });

      if (existing) {
        throw new ConflictException(
          `Material with code ${updateMaterialDto.materialCode} already exists`,
        );
      }
    }

    Object.assign(material, updateMaterialDto);
    return await this.materialsRepository.save(material);
  }

  /**
   * Delete material (soft delete)
   */
  async remove(id: string): Promise<void> {
    const material = await this.findOne(id);
    material.isActive = false;
    await this.materialsRepository.save(material);
  }

  /**
   * Get low stock materials
   */
  async getLowStockMaterials(): Promise<Material[]> {
    return await this.materialsRepository
      .createQueryBuilder('material')
      .where('material.currentStock < material.minimumStockLevel')
      .andWhere('material.isActive = :isActive', { isActive: true })
      .orderBy('material.category', 'ASC')
      .getMany();
  }

  /**
   * Update stock level
   */
  async updateStock(id: string, quantity: number, operation: 'add' | 'subtract'): Promise<Material> {
    const material = await this.findOne(id);

    if (operation === 'add') {
      material.currentStock = Number(material.currentStock) + quantity;
    } else {
      const newStock = Number(material.currentStock) - quantity;
      if (newStock < 0) {
        throw new ConflictException('Insufficient stock');
      }
      material.currentStock = newStock;
    }

    return await this.materialsRepository.save(material);
  }

  /**
   * Get material statistics
   */
  async getStatistics() {
    const materials = await this.materialsRepository.find({
      where: { isActive: true },
    });

    const totalMaterials = materials.length;
    const lowStockCount = materials.filter(m => m.isLowStock).length;
    const totalValue = materials.reduce((sum, m) => sum + m.stockValue, 0);

    const byCategory = materials.reduce((acc, material) => {
      const category = material.category;
      if (!acc[category]) {
        acc[category] = { count: 0, value: 0 };
      }
      acc[category].count++;
      acc[category].value += material.stockValue;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    return {
      totalMaterials,
      lowStockCount,
      totalValue: Math.round(totalValue * 100) / 100,
      byCategory,
    };
  }
}
