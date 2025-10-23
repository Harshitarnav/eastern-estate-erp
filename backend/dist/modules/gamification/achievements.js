"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEVELS = exports.ACHIEVEMENTS = void 0;
exports.calculateLevel = calculateLevel;
exports.ACHIEVEMENTS = [
    {
        id: 'first-sale',
        name: 'First Blood',
        description: 'Close your first deal',
        xp: 100,
        icon: '🎯',
        tier: 'bronze',
    },
    {
        id: 'speed-demon',
        name: 'Speed Demon',
        description: 'Make 5 calls in 1 hour',
        xp: 50,
        icon: '⚡',
        tier: 'bronze',
    },
    {
        id: 'hot-streak',
        name: 'Hot Streak',
        description: '7 days consecutive bookings',
        xp: 200,
        icon: '🔥',
        tier: 'silver',
    },
    {
        id: 'century',
        name: 'Century Club',
        description: '100 successful follow-ups',
        xp: 300,
        icon: '💯',
        tier: 'gold',
    },
    {
        id: 'top-performer',
        name: 'Top Performer',
        description: '#1 for the month',
        xp: 500,
        icon: '👑',
        tier: 'platinum',
    },
    {
        id: 'master-closer',
        name: 'Master Closer',
        description: '50 bookings in one month',
        xp: 1000,
        icon: '🏆',
        tier: 'diamond',
    },
];
exports.LEVELS = [
    { level: 1, xpRequired: 0, title: 'Rookie' },
    { level: 2, xpRequired: 100, title: 'Trainee' },
    { level: 3, xpRequired: 300, title: 'Agent' },
    { level: 4, xpRequired: 600, title: 'Senior Agent' },
    { level: 5, xpRequired: 1000, title: 'Expert' },
    { level: 6, xpRequired: 1500, title: 'Master' },
    { level: 7, xpRequired: 2500, title: 'Legend' },
    { level: 8, xpRequired: 4000, title: 'Elite' },
    { level: 9, xpRequired: 6000, title: 'Champion' },
    { level: 10, xpRequired: 10000, title: 'Grand Master' },
];
function calculateLevel(totalXP) {
    let currentLevel = exports.LEVELS[0];
    let nextLevel = exports.LEVELS[1];
    for (let i = 0; i < exports.LEVELS.length; i++) {
        if (totalXP >= exports.LEVELS[i].xpRequired) {
            currentLevel = exports.LEVELS[i];
            nextLevel = exports.LEVELS[i + 1] || currentLevel;
        }
        else {
            break;
        }
    }
    const xpInCurrentLevel = totalXP - currentLevel.xpRequired;
    const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired;
    const progress = (xpInCurrentLevel / xpNeededForNext) * 100;
    return {
        level: currentLevel.level,
        title: currentLevel.title,
        progress: Math.min(progress, 100),
    };
}
//# sourceMappingURL=achievements.js.map