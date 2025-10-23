import { Lead } from './entities/lead.entity';
interface ConversionPrediction {
    probability: number;
    category: string;
    color: string;
    emoji: string;
    reasons: string[];
}
export declare class AIConversionPredictor {
    predictConversionProbability(lead: Lead): ConversionPrediction;
    private getConversionCategory;
    suggestNextAction(lead: Lead, prediction: ConversionPrediction): string;
}
export {};
