"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptySalesBreakdown = exports.FlatInventorySummaryDto = exports.FlatInventoryUnitDto = exports.emptyFlatCompleteness = void 0;
const property_inventory_summary_dto_1 = require("../../properties/dto/property-inventory-summary.dto");
Object.defineProperty(exports, "emptySalesBreakdown", { enumerable: true, get: function () { return property_inventory_summary_dto_1.emptySalesBreakdown; } });
const emptyFlatCompleteness = () => ({
    notStarted: 0,
    inProgress: 0,
    needsReview: 0,
    complete: 0,
});
exports.emptyFlatCompleteness = emptyFlatCompleteness;
class FlatInventoryUnitDto {
}
exports.FlatInventoryUnitDto = FlatInventoryUnitDto;
class FlatInventorySummaryDto {
}
exports.FlatInventorySummaryDto = FlatInventorySummaryDto;
//# sourceMappingURL=flat-inventory-summary.dto.js.map