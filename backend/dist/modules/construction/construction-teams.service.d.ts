import { Repository } from 'typeorm';
import { ConstructionTeam } from './entities/construction-team.entity';
export declare class ConstructionTeamsService {
    private readonly constructionTeamRepository;
    constructor(constructionTeamRepository: Repository<ConstructionTeam>);
    create(createDto: any): Promise<ConstructionTeam[]>;
    findByProject(constructionProjectId: string): Promise<ConstructionTeam[]>;
    findOne(id: string): Promise<ConstructionTeam>;
    update(id: string, updateDto: any): Promise<ConstructionTeam>;
    remove(id: string): Promise<void>;
}
