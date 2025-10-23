export declare const ACHIEVEMENTS: {
    id: string;
    name: string;
    description: string;
    xp: number;
    icon: string;
    tier: string;
}[];
export declare const LEVELS: {
    level: number;
    xpRequired: number;
    title: string;
}[];
export declare function calculateLevel(totalXP: number): {
    level: number;
    title: string;
    progress: number;
};
