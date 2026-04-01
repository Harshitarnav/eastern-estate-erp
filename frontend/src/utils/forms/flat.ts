import type { Flat } from '@/services/flats.service';

const toList = (val: any): string[] =>
  Array.isArray(val)
    ? val
    : val
    ? String(val)
        .split(',')
        .map((x: string) => x.trim())
        .filter(Boolean)
    : [];

export const mapFlatFormToPayload = (data: any): Partial<Flat> => {
  const payload: Partial<Flat> = {
    propertyId: data.propertyId,
    towerId: data.towerId,
    flatNumber: data.flatNumber,
    flatCode: data.flatCode || data.flatNumber,
    name: data.name,
    description: data.description,
    type: data.type,
    floor: data.floor,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    balconies: data.balconies,
    servantRoom: data.servantRoom || false,
    studyRoom: data.studyRoom || false,
    poojaRoom: data.poojaRoom || false,
    superBuiltUpArea: data.superBuiltUpArea,
    builtUpArea: data.builtUpArea,
    carpetArea: data.carpetArea,
    balconyArea: data.balconyArea || 0,
    basePrice: data.basePrice,
    pricePerSqft: data.pricePerSqft || 0,
    registrationCharges: data.registrationCharges || 0,
    maintenanceCharges: data.maintenanceCharges || 0,
    parkingCharges: data.parkingCharges || 0,
    totalPrice: data.totalPrice,
    discountAmount: data.discountAmount || 0,
    finalPrice: data.finalPrice,
    status: data.status || 'AVAILABLE',
    isAvailable: data.isAvailable !== false,
    availableFrom: data.availableFrom || undefined,
    expectedPossession: data.expectedPossession || undefined,
    facing: data.facing || undefined,
    vastuCompliant: data.vastuCompliant || false,
    cornerUnit: data.cornerUnit || false,
    roadFacing: data.roadFacing || false,
    parkFacing: data.parkFacing || false,
    parkingSlots: data.parkingSlots || 0,
    coveredParking: data.coveredParking || false,
    furnishingStatus: data.furnishingStatus,
    amenities: toList(data.amenities),
    specialFeatures: data.specialFeatures,
    floorPlanUrl: data.floorPlanUrl || undefined,
    images: toList(data.images),
    virtualTourUrl: data.virtualTourUrl || undefined,
    bookingDate: data.bookingDate || undefined,
    soldDate: data.soldDate || undefined,
    tokenAmount: data.tokenAmount || undefined,
    paymentPlan: data.paymentPlan,
    remarks: data.remarks,
    isActive: data.isActive !== false,
    displayOrder: data.displayOrder || 0,
  };

  // Dates
  if (data.agreementDate) payload.agreementDate = data.agreementDate;
  if (data.registrationDate) payload.registrationDate = data.registrationDate;
  if (data.handoverDate) payload.handoverDate = data.handoverDate;

  // Statuses
  if (data.loanStatus) payload.loanStatus = data.loanStatus;
  if (data.handoverStatus) payload.handoverStatus = data.handoverStatus;
  if (data.verificationStatus) payload.verificationStatus = data.verificationStatus;

  // Assignments
  if (data.salespersonId) payload.salespersonId = data.salespersonId;
  if (data.serviceContactId) payload.serviceContactId = data.serviceContactId;

  // Co-buyer
  if (data.coBuyerName) payload.coBuyerName = data.coBuyerName;
  if (data.coBuyerEmail) payload.coBuyerEmail = data.coBuyerEmail;
  if (data.coBuyerPhone) payload.coBuyerPhone = data.coBuyerPhone;

  // Parking / storage extras
  if (data.parkingNumber) payload.parkingNumber = data.parkingNumber;
  if (data.parkingType) payload.parkingType = data.parkingType;
  if (data.storageId) payload.storageId = data.storageId;
  if (data.furnishingPack) payload.furnishingPack = data.furnishingPack;
  // appliancePack is a boolean — always include if present
  if (data.appliancePack !== undefined) payload.appliancePack = data.appliancePack;

  if (Array.isArray(data.issues)) {
    payload.issues = data.issues;
    payload.issuesCount = data.issues.length;
  }

  return payload;
};
