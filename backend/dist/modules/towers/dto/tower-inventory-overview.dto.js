"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptySalesBreakdown = exports.emptyChecklistInsights = exports.TowerInventoryOverviewDto = void 0;
const data_completeness_status_enum_1 = require("../../../common/enums/data-completeness-status.enum");
const property_inventory_summary_dto_1 = require("../../properties/dto/property-inventory-summary.dto");
Object.defineProperty(exports, "emptySalesBreakdown", { enumerable: true, get: function () { return property_inventory_summary_dto_1.emptySalesBreakdown; } });
class TowerInventoryOverviewDto {
}
exports.TowerInventoryOverviewDto = TowerInventoryOverviewDto;
const emptyChecklistInsights = () => [
    { status: data_completeness_status_enum_1.DataCompletenessStatus.NOT_STARTED, count: 0 },
    { status: data_completeness_status_enum_1.DataCompletenessStatus.IN_PROGRESS, count: 0 },
    { status: data_completeness_status_enum_1.DataCompletenessStatus.NEEDS_REVIEW, count: 0 },
    { status: data_completeness_status_enum_1.DataCompletenessStatus.COMPLETE, count: 0 },
];
exports.emptyChecklistInsights = emptyChecklistInsights;
//# sourceMappingURL=tower-inventory-overview.dto.js.map