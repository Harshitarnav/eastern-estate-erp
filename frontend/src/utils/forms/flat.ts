import { CreateFlatDto } from '@/services/flats.service';

const toList = (val: any): string[] =>
  Array.isArray(val)
    ? val
    : val
    ? String(val)
        .split(',')
        .map((x: string) => x.trim())
        .filter(Boolean)
    : [];

export const mapFlatFormToPayload = (data: any): Partial<CreateFlatDto> => {
  const payload: Partial<CreateFlatDto> = {
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

  // Document URLs and lists
  const docFields = [
    'saleAgreementUrl',
    'allotmentLetterUrl',
    'possessionLetterUrl',
    'paymentPlanUrl',
    'nocUrl',
    'reraCertificateUrl',
    'snagListUrl',
    'handoverChecklistUrl',
  ] as const;

  docFields.forEach((field) => {
    if (data[field]) {
      // @ts-ignore dynamic assign
      payload[field] = data[field];
    }
  });

  const kycDocs = toList(data.kycDocsUrls);
  if (kycDocs.length) payload.kycDocsUrls = kycDocs;

  const paymentReceipts = toList(data.paymentReceiptUrls);
  if (paymentReceipts.length) payload.paymentReceiptUrls = paymentReceipts;

  const demandLetters = toList(data.demandLetterUrls);
  if (demandLetters.length) payload.demandLetterUrls = demandLetters;

  const registrationReceipts = toList(data.registrationReceiptUrls);
  if (registrationReceipts.length) payload.registrationReceiptUrls = registrationReceipts;

  const otherDocs = toList(data.otherDocuments);
  if (otherDocs.length) payload.otherDocuments = otherDocs;

  if (Array.isArray(data.issues)) {
    payload.issues = data.issues;
    payload.issuesCount = data.issues.length;
  }

  return payload;
};
