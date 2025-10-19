"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flatStatusToBreakdownKey = exports.emptyTowersCompleteness = exports.emptySalesBreakdown = exports.PropertyInventorySummaryDto = exports.TowerInventorySummaryDto = void 0;
const flat_entity_1 = require("../../flats/entities/flat.entity");
class TowerInventorySummaryDto {
}
exports.TowerInventorySummaryDto = TowerInventorySummaryDto;
class PropertyInventorySummaryDto {
}
exports.PropertyInventorySummaryDto = PropertyInventorySummaryDto;
const emptySalesBreakdown = () => ({
    available: 0,
    onHold: 0,
    booked: 0,
    sold: 0,
    blocked: 0,
    underConstruction: 0,
    total: 0,
});
exports.emptySalesBreakdown = emptySalesBreakdown;
const emptyTowersCompleteness = () => ({
    notStarted: 0,
    inProgress: 0,
    needsReview: 0,
    complete: 0,
});
exports.emptyTowersCompleteness = emptyTowersCompleteness;
const flatStatusToBreakdownKey = (status) => {
    switch (status) {
        case flat_entity_1.FlatStatus.AVAILABLE:
            return 'available';
        case flat_entity_1.FlatStatus.BOOKED:
            return 'booked';
        case flat_entity_1.FlatStatus.SOLD:
            return 'sold';
        case flat_entity_1.FlatStatus.BLOCKED:
            return 'blocked';
        case flat_entity_1.FlatStatus.ON_HOLD:
            return 'onHold';
        case flat_entity_1.FlatStatus.UNDER_CONSTRUCTION:
        default:
            return 'underConstruction';
    }
};
exports.flatStatusToBreakdownKey = flatStatusToBreakdownKey;
//# sourceMappingURL=property-inventory-summary.dto.js.map