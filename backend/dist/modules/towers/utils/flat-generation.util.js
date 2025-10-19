"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFloorsDescriptor = parseFloorsDescriptor;
exports.parseUnitsPerFloor = parseUnitsPerFloor;
exports.generateFlatNumber = generateFlatNumber;
exports.buildDefaultFlatPayloads = buildDefaultFlatPayloads;
const flat_entity_1 = require("../../flats/entities/flat.entity");
const DEFAULT_BEDROOMS = 2;
const DEFAULT_BATHROOMS = 2;
function parseFloorsDescriptor(descriptor, fallback = 1) {
    if (!descriptor) {
        return fallback;
    }
    const numericParts = descriptor.match(/\d+/g);
    if (!numericParts || numericParts.length === 0) {
        return fallback;
    }
    const lastValue = Number(numericParts[numericParts.length - 1]);
    return Number.isFinite(lastValue) && lastValue > 0 ? lastValue : fallback;
}
function parseUnitsPerFloor(unitsDescriptor, fallback = 1) {
    if (!unitsDescriptor) {
        return fallback;
    }
    const numericParts = unitsDescriptor.match(/\d+/g);
    if (!numericParts || numericParts.length === 0) {
        return fallback;
    }
    const firstValue = Number(numericParts[0]);
    return Number.isFinite(firstValue) && firstValue > 0 ? firstValue : fallback;
}
function generateFlatNumber(towerNumber, floor, unitIndex) {
    const towerPrefix = (towerNumber ?? 'T').replace(/\s+/g, '').toUpperCase();
    const floorPart = floor.toString().padStart(2, '0');
    const unitPart = unitIndex.toString().padStart(2, '0');
    return `${towerPrefix}-${floorPart}${unitPart}`;
}
function buildDefaultFlatPayloads(input) {
    const { propertyId, towerId, towerNumber, totalUnits, totalFloors, unitsPerFloorText, expectedPossessionDate, startDisplayOrder = 1, } = input;
    const normalizedTotalUnits = Math.max(totalUnits, 1);
    const normalizedFloors = Math.max(totalFloors, 1);
    const inferredUnitsPerFloor = Math.max(parseUnitsPerFloor(unitsPerFloorText, Math.ceil(normalizedTotalUnits / normalizedFloors)), 1);
    const flats = [];
    let createdUnits = 0;
    let displayOrder = startDisplayOrder;
    for (let floor = 1; floor <= normalizedFloors && createdUnits < normalizedTotalUnits; floor++) {
        for (let unitIndex = 1; unitIndex <= inferredUnitsPerFloor && createdUnits < normalizedTotalUnits; unitIndex++) {
            createdUnits += 1;
            const flatNumber = generateFlatNumber(towerNumber, floor, unitIndex);
            flats.push({
                propertyId,
                towerId,
                flatNumber,
                name: `Unit ${flatNumber}`,
                description: null,
                type: flat_entity_1.FlatType.TWO_BHK,
                floor,
                bedrooms: DEFAULT_BEDROOMS,
                bathrooms: DEFAULT_BATHROOMS,
                balconies: 1,
                servantRoom: false,
                studyRoom: false,
                poojaRoom: false,
                superBuiltUpArea: 0,
                builtUpArea: 0,
                carpetArea: 0,
                balconyArea: null,
                basePrice: 0,
                pricePerSqft: null,
                registrationCharges: null,
                maintenanceCharges: null,
                parkingCharges: null,
                totalPrice: 0,
                discountAmount: null,
                finalPrice: 0,
                status: flat_entity_1.FlatStatus.UNDER_CONSTRUCTION,
                isAvailable: true,
                availableFrom: expectedPossessionDate ?? null,
                expectedPossession: expectedPossessionDate ?? null,
                facing: null,
                vastuCompliant: true,
                cornerUnit: false,
                roadFacing: false,
                parkFacing: false,
                parkingSlots: 0,
                coveredParking: false,
                furnishingStatus: 'Unfurnished',
                amenities: null,
                specialFeatures: null,
                floorPlanUrl: null,
                images: null,
                virtualTourUrl: null,
                customerId: null,
                bookingDate: null,
                soldDate: null,
                tokenAmount: null,
                paymentPlan: null,
                remarks: null,
                isActive: true,
                displayOrder,
                createdBy: null,
                updatedBy: null,
            });
            displayOrder += 1;
        }
    }
    return flats;
}
//# sourceMappingURL=flat-generation.util.js.map