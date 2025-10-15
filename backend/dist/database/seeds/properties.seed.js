"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSeedSQL = exports.propertiesSeedData = void 0;
exports.propertiesSeedData = [
    {
        propertyCode: 'EECD-DC-001',
        name: 'Diamond City',
        description: 'Premium township project with modern amenities and excellent connectivity',
        address: 'Oyna, Behind Apollo Hospital',
        city: 'Ranchi',
        state: 'Jharkhand',
        pincode: '834001',
        latitude: 23.3441,
        longitude: 85.3096,
        totalArea: 28,
        areaUnit: 'Acres',
        launchDate: '2018-06-15',
        expectedCompletionDate: '2024-12-31',
        reraNumber: 'CNT Free',
        projectType: 'Township',
        status: 'Active',
        images: [
            '/uploads/properties/diamond-city-1.jpg',
            '/uploads/properties/diamond-city-2.jpg',
            '/uploads/properties/diamond-city-3.jpg'
        ],
        documents: [
            {
                name: 'Project Brochure',
                url: '/uploads/documents/diamond-city-brochure.pdf',
                type: 'brochure'
            },
            {
                name: 'Floor Plans',
                url: '/uploads/documents/diamond-city-floor-plans.pdf',
                type: 'floor_plan'
            }
        ],
        amenities: [
            'Club House',
            'Swimming Pool',
            'Gymnasium',
            'Children Play Area',
            'Landscaped Gardens',
            '70% Open Space',
            '24/7 Security',
            'Power Backup',
            'Rainwater Harvesting',
            'Gated Community'
        ],
        isActive: true
    },
    {
        propertyCode: 'EECD-ESC-002',
        name: 'Eastern Satellite City',
        description: 'Elite duplex villas with modern architecture and premium finishes',
        address: 'NH-28, Near City Center',
        city: 'Muzaffarpur',
        state: 'Bihar',
        pincode: '842001',
        latitude: 26.1225,
        longitude: 85.3906,
        totalArea: 15,
        areaUnit: 'Acres',
        launchDate: '2019-03-20',
        expectedCompletionDate: '2025-06-30',
        reraNumber: 'BRERAP00080-1/19/R-150/2018',
        projectType: 'Residential Township',
        status: 'Under Construction',
        images: [
            '/uploads/properties/esc-1.jpg',
            '/uploads/properties/esc-2.jpg'
        ],
        documents: [
            {
                name: 'Villa Brochure',
                url: '/uploads/documents/esc-brochure.pdf',
                type: 'brochure'
            }
        ],
        amenities: [
            'Gated Community',
            'Private Gardens',
            '24/7 Security',
            'Power Backup',
            'Water Supply',
            'Street Lighting',
            'Underground Drainage'
        ],
        isActive: true
    },
    {
        propertyCode: 'EECD-GV-003',
        name: 'Green Valley Residency',
        description: 'Affordable housing with excellent connectivity and modern amenities',
        address: 'Bailey Road, Near Patna Junction',
        city: 'Patna',
        state: 'Bihar',
        pincode: '800001',
        latitude: 25.5941,
        longitude: 85.1376,
        totalArea: 8,
        areaUnit: 'Acres',
        launchDate: '2020-01-10',
        expectedCompletionDate: '2023-12-31',
        actualCompletionDate: '2023-11-15',
        reraNumber: 'BRERA-PAT-2020-456',
        projectType: 'Residential Complex',
        status: 'Completed',
        images: [
            '/uploads/properties/gv-1.jpg',
            '/uploads/properties/gv-2.jpg',
            '/uploads/properties/gv-3.jpg'
        ],
        documents: [
            {
                name: 'Project Brochure',
                url: '/uploads/documents/gv-brochure.pdf',
                type: 'brochure'
            },
            {
                name: 'Completion Certificate',
                url: '/uploads/documents/gv-completion.pdf',
                type: 'certificate'
            }
        ],
        amenities: [
            'Parking',
            'Lift',
            'Power Backup',
            'Water Supply',
            'Children Play Area',
            'CCTV Surveillance',
            'Rainwater Harvesting',
            'Fire Safety Systems'
        ],
        isActive: true
    },
    {
        propertyCode: 'EECD-RH-004',
        name: 'Royal Heights',
        description: 'Luxury apartments with premium specifications and world-class amenities',
        address: 'Main Road, HEC Colony',
        city: 'Ranchi',
        state: 'Jharkhand',
        pincode: '834004',
        latitude: 23.3569,
        longitude: 85.3340,
        totalArea: 5,
        areaUnit: 'Acres',
        launchDate: '2017-08-15',
        expectedCompletionDate: '2021-03-31',
        actualCompletionDate: '2021-02-28',
        reraNumber: 'JRERA-RAN-2017-123',
        projectType: 'Premium Apartments',
        status: 'Completed',
        images: [
            '/uploads/properties/rh-1.jpg',
            '/uploads/properties/rh-2.jpg',
            '/uploads/properties/rh-3.jpg',
            '/uploads/properties/rh-4.jpg'
        ],
        documents: [
            {
                name: 'Project Brochure',
                url: '/uploads/documents/rh-brochure.pdf',
                type: 'brochure'
            },
            {
                name: 'Completion Certificate',
                url: '/uploads/documents/rh-completion.pdf',
                type: 'certificate'
            },
            {
                name: 'Occupancy Certificate',
                url: '/uploads/documents/rh-occupancy.pdf',
                type: 'certificate'
            }
        ],
        amenities: [
            'Luxury Clubhouse',
            'Infinity Pool',
            'State-of-the-art Gym',
            'Spa & Wellness Center',
            'Indoor Games Room',
            'Party Hall',
            'Concierge Service',
            'Smart Home Features',
            'High-speed Elevators',
            'Multi-level Parking',
            '24/7 Security',
            'CCTV Surveillance',
            'Fire Safety Systems',
            'Power Backup',
            'Water Softener Plant'
        ],
        isActive: true
    }
];
const generateSeedSQL = () => {
    const sql = exports.propertiesSeedData.map(property => {
        const images = JSON.stringify(property.images);
        const documents = JSON.stringify(property.documents);
        const amenities = JSON.stringify(property.amenities);
        return `
INSERT INTO properties (
  property_code, name, description, address, city, state, pincode,
  latitude, longitude, total_area, area_unit, launch_date,
  expected_completion_date, actual_completion_date, rera_number,
  project_type, status, images, documents, amenities, is_active
) VALUES (
  '${property.propertyCode}',
  '${property.name}',
  '${property.description}',
  '${property.address}',
  '${property.city}',
  '${property.state}',
  '${property.pincode}',
  ${property.latitude},
  ${property.longitude},
  ${property.totalArea},
  '${property.areaUnit}',
  '${property.launchDate}',
  '${property.expectedCompletionDate}',
  ${property.actualCompletionDate ? `'${property.actualCompletionDate}'` : 'NULL'},
  '${property.reraNumber}',
  '${property.projectType}',
  '${property.status}',
  '${images}'::jsonb,
  '${documents}'::jsonb,
  '${amenities}'::jsonb,
  ${property.isActive}
) ON CONFLICT (property_code) DO NOTHING;
    `;
    }).join('\n');
    return sql;
};
exports.generateSeedSQL = generateSeedSQL;
//# sourceMappingURL=properties.seed.js.map