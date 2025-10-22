import { ConstructionTeamsService } from './construction-teams.service';
export declare class ConstructionTeamsController {
    private readonly constructionTeamsService;
    constructor(constructionTeamsService: ConstructionTeamsService);
    create(createDto: any): Promise<import("./entities/construction-team.entity").ConstructionTeam[]>;
    findByProject(projectId: string): Promise<import("./entities/construction-team.entity").ConstructionTeam[]>;
    findOne(id: string): Promise<import("./entities/construction-team.entity").ConstructionTeam>;
    update(id: string, updateDto: any): Promise<import("./entities/construction-team.entity").ConstructionTeam>;
    remove(id: string): Promise<void>;
}
