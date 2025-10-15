import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tower } from '../entities/tower.entity';
import { Floor } from '../entities/floor.entity';
import { CreateTowerDto } from '../dto/create-tower.dto';
import { UpdateTowerDto } from '../dto/update-tower.dto';

@Injectable()
export class TowersService {
  constructor(
    @InjectRepository(Tower)
    private towersRepository: Repository<Tower>,
    @InjectRepository(Floor)
    private floorsRepository: Repository<Floor>,
  ) {}

  async create(createTowerDto: CreateTowerDto, userId: string) {
    const tower = this.towersRepository.create({
      ...createTowerDto,
      property: { id: createTowerDto.propertyId } as any,
      createdBy: userId, // ✅ FIXED: Just the string, not { id: userId }
    });

    const savedTower = await this.towersRepository.save(tower);

    // Auto-create floors
    if (createTowerDto.totalFloors) {
      const floors = [];
      for (let i = 0; i < createTowerDto.totalFloors; i++) {
        floors.push(
          this.floorsRepository.create({
            tower: { id: savedTower.id } as any,
            floorNumber: i,
            floorName: `Floor ${i}`,
            totalFlats: createTowerDto.flatsPerFloor || 0,
          }),
        );
      }
      await this.floorsRepository.save(floors);
    }

    return savedTower;
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 10, propertyId, status } = query;

    const queryBuilder = this.towersRepository
      .createQueryBuilder('tower')
      .leftJoinAndSelect('tower.property', 'property')
      .leftJoinAndSelect('tower.floors', 'floors')
      .leftJoinAndSelect('tower.flats', 'flats');

    if (propertyId) {
      queryBuilder.where('tower.property.id = :propertyId', { propertyId });
    }

    if (status) {
      queryBuilder.andWhere('tower.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('tower.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tower = await this.towersRepository.findOne({
      where: { id },
      relations: ['property', 'floors', 'flats'],
    });

    if (!tower) {
      throw new NotFoundException(`Tower with ID ${id} not found`);
    }

    return tower;
  }

  async update(id: string, updateTowerDto: UpdateTowerDto, userId: string) {
    const tower = await this.findOne(id);
    Object.assign(tower, updateTowerDto);
    tower.updatedBy = userId;
    return await this.towersRepository.save(tower);
  }

  async remove(id: string) {
    const tower = await this.findOne(id);
    await this.towersRepository.remove(tower);
    return { message: 'Tower deleted successfully' };
  }
}