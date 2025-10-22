# Construction Module Integration Roadmap

## Overview
This document outlines the plan to integrate the Construction Module with Properties and Customers modules, plus add photo upload capabilities for progress tracking.

---

## 🎯 Phase 1: Property-Construction Integration (CURRENT STATUS)

### ✅ Already Implemented
- Construction projects are linked to properties via `propertyId`
- Projects can be filtered by property
- Property information displayed in project details

### 🔧 Enhancements Needed

#### 1.1 Property Dashboard Integration
**Goal:** Show construction status on property pages

**Implementation:**
```typescript
// On Property Detail Page
- Show construction projects for this property
- Display overall construction progress
- Link to construction dashboard filtered by property
```

**Files to Modify:**
- `frontend/src/app/(dashboard)/properties/[id]/page.tsx`
- Add construction summary section
- Show active projects, completion %, budget spent

#### 1.2 Tower-Floor Construction Tracking
**Goal:** Track which towers/floors are under construction

**Database Changes Needed:**
```sql
-- Add construction status to towers table
ALTER TABLE towers ADD COLUMN construction_status VARCHAR(50) DEFAULT 'NOT_STARTED';
-- Values: NOT_STARTED, IN_PROGRESS, COMPLETED

-- Add construction status to flats table  
ALTER TABLE flats ADD COLUMN construction_status VARCHAR(50) DEFAULT 'NOT_STARTED';
ALTER TABLE flats ADD COLUMN construction_start_date DATE;
ALTER TABLE flats ADD COLUMN construction_completion_date DATE;
```

---

## 🎯 Phase 2: Customer-Construction Integration (NEW FEATURE)

### 2.1 Automated Payment Milestone System

**Goal:** When a floor is completed, automatically:
1. Update customer payment schedule
2. Send email notification to customers with flats on that floor
3. Create payment reminder

#### Backend Implementation Required

**Step 1: Create Floor Completion Event System**

```typescript
// backend/src/modules/construction/construction-projects.service.ts

async markFloorCompleted(projectId: string, floorNumber: number) {
  // 1. Update floor status
  await this.updateFloorStatus(projectId, floorNumber, 'COMPLETED');
  
  // 2. Get all customers with flats on this floor
  const customers = await this.getCustomersOnFloor(projectId, floorNumber);
  
  // 3. For each customer, create payment milestone
  for (const customer of customers) {
    await this.createPaymentMilestone(customer.id, {
      milestone: `Floor ${floorNumber} Completion`,
      amount: customer.booking.constructionLinkedPayment,
      dueDate: new Date(), // Immediate payment due
      status: 'PENDING'
    });
    
    // 4. Send email notification
    await this.emailService.sendFloorCompletionNotification(customer);
  }
  
  // 5. Create event log
  await this.eventService.create({
    type: 'FLOOR_COMPLETED',
    projectId,
    floorNumber,
    customersNotified: customers.length
  });
}
```

**Step 2: Email Service Integration**

```typescript
// backend/src/modules/notifications/email.service.ts

async sendFloorCompletionNotification(customer: Customer) {
  const template = {
    to: customer.email,
    subject: `Great News! Floor ${customer.flat.floorNumber} Construction Completed`,
    body: `
      Dear ${customer.name},
      
      We're pleased to inform you that construction of Floor ${customer.flat.floorNumber} 
      at ${customer.property.name} has been completed.
      
      As per your payment schedule, the construction-linked payment of 
      ₹${customer.constructionPayment} is now due.
      
      Project Details:
      - Property: ${customer.property.name}
      - Tower: ${customer.tower.name}
      - Flat: ${customer.flat.flatNumber}
      - Floor: ${customer.flat.floorNumber}
      
      Please proceed with the payment at your earliest convenience.
      
      View Progress Photos: [Link to construction photos]
      Make Payment: [Link to payment portal]
      
      Thank you for your patience and trust!
      
      Eastern Estate Team
    `
  };
  
  await this.mailer.send(template);
}
```

**Step 3: Payment Schedule Integration**

```typescript
// backend/src/modules/customers/customers.service.ts

async createConstructionMilestonePayment(customerId: string, data: any) {
  // Create payment record
  const payment = await this.paymentsRepo.create({
    customerId,
    type: 'CONSTRUCTION_MILESTONE',
    amount: data.amount,
    dueDate: data.dueDate,
    status: 'PENDING',
    description: data.milestone,
    linkedToFloor: data.floorNumber
  });
  
  // Update customer notification preferences
  await this.notificationsService.createReminder({
    customerId,
    paymentId: payment.id,
    reminderDate: data.dueDate
  });
  
  return payment;
}
```

### 2.2 Database Schema Changes

```sql
-- Create construction milestones table
CREATE TABLE construction_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES construction_projects(id),
  floor_number INTEGER NOT NULL,
  tower_id UUID REFERENCES towers(id),
  milestone_type VARCHAR(100) NOT NULL, -- FLOOR_START, FLOOR_COMPLETE, TOWER_COMPLETE
  completion_date TIMESTAMP,
  notified_customers_count INTEGER DEFAULT 0,
  photos_uploaded INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add construction payment tracking to bookings
ALTER TABLE bookings 
ADD COLUMN construction_payment_amount DECIMAL(15,2),
ADD COLUMN construction_payment_due_date DATE,
ADD COLUMN construction_payment_status VARCHAR(50) DEFAULT 'PENDING';

-- Create payment reminders table
CREATE TABLE payment_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  booking_id UUID REFERENCES bookings(id),
  milestone_type VARCHAR(100),
  amount DECIMAL(15,2),
  due_date DATE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'PENDING'
);
```

---

## 🎯 Phase 3: Photo Upload for Progress Tracking

### 3.1 Progress Photos Infrastructure

**Goal:** Allow photo uploads for:
- Daily progress logs
- Floor completion
- Milestone achievements
- Quality checks

#### Backend Implementation

**Step 1: File Upload Service**

```typescript
// backend/src/common/upload/upload.service.ts

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(ProgressPhoto)
    private photosRepo: Repository<ProgressPhoto>
  ) {}
  
  async uploadProgressPhoto(
    file: Express.Multer.File,
    data: {
      projectId: string;
      category: string; // DAILY_PROGRESS, FLOOR_COMPLETE, MILESTONE
      floorNumber?: number;
      description?: string;
      uploadedBy: string;
    }
  ) {
    // 1. Save file to storage (S3, local, etc.)
    const filePath = await this.saveFile(file);
    
    // 2. Create database record
    const photo = await this.photosRepo.create({
      projectId: data.projectId,
      category: data.category,
      floorNumber: data.floorNumber,
      filePath,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      description: data.description,
      uploadedBy: data.uploadedBy,
      uploadedAt: new Date()
    });
    
    return photo;
  }
  
  async getProjectPhotos(projectId: string, filters?: any) {
    return await this.photosRepo.find({
      where: { projectId, ...filters },
      order: { uploadedAt: 'DESC' }
    });
  }
}
```

**Step 2: Progress Photos Entity**

```typescript
// backend/src/modules/construction/entities/progress-photo.entity.ts

@Entity('construction_progress_photos')
export class ProgressPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @Column()
  category: string; // DAILY_PROGRESS, FLOOR_COMPLETE, MILESTONE, QUALITY_CHECK

  @Column({ nullable: true })
  floorNumber: number;

  @Column()
  filePath: string;

  @Column()
  fileName: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  uploadedBy: string;

  @Column()
  uploadedAt: Date;

  @Column({ default: true })
  isPublic: boolean; // Show to customers?

  @Column({ nullable: true })
  thumbnailPath: string;
}
```

**Step 3: Database Schema**

```sql
CREATE TABLE construction_progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES construction_projects(id),
  category VARCHAR(50) NOT NULL,
  floor_number INTEGER,
  file_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100),
  description TEXT,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  is_public BOOLEAN DEFAULT TRUE,
  thumbnail_path TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_progress_photos_project ON construction_progress_photos(project_id);
CREATE INDEX idx_progress_photos_category ON construction_progress_photos(category);
```

### 3.2 Frontend Photo Upload Components

**Component 1: Photo Upload Button**

```typescript
// frontend/src/components/upload/PhotoUploadButton.tsx

export function PhotoUploadButton({ projectId, category, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async (files: FileList) => {
    setUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    formData.append('projectId', projectId);
    formData.append('category', category);
    
    try {
      await api.post('/construction-photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess();
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <label className="cursor-pointer">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleUpload(e.target.files)}
        className="hidden"
      />
      <div className="px-4 py-2 bg-blue-500 text-white rounded">
        {uploading ? 'Uploading...' : '📸 Upload Photos'}
      </div>
    </label>
  );
}
```

**Component 2: Photo Gallery**

```typescript
// frontend/src/components/gallery/ProgressPhotoGallery.tsx

export function ProgressPhotoGallery({ projectId }) {
  const [photos, setPhotos] = useState([]);
  
  useEffect(() => {
    loadPhotos();
  }, [projectId]);
  
  const loadPhotos = async () => {
    const response = await api.get(`/construction-photos/${projectId}`);
    setPhotos(response.data);
  };
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {photos.map(photo => (
        <div key={photo.id} className="relative group">
          <img 
            src={photo.thumbnailPath || photo.filePath}
            alt={photo.description}
            className="w-full h-48 object-cover rounded"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white p-2 text-sm">{photo.description}</p>
            <p className="text-white/80 p-2 text-xs">
              {new Date(photo.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 3.3 Photo Upload Integration Points

**1. Progress Logs Modal** - Add photo upload
```typescript
// In AddProgressLogModal.tsx
<PhotoUploadButton 
  projectId={projectId}
  category="DAILY_PROGRESS"
  onSuccess={() => loadPhotos()}
/>
```

**2. Floor Completion** - Mandatory photos
```typescript
// Before marking floor complete, require photos
if (photos.length < 5) {
  alert('Please upload at least 5 photos before marking floor as complete');
  return;
}
```

**3. Customer View** - Show progress photos
```typescript
// In customer portal, show construction photos
<ProgressPhotoGallery 
  projectId={customer.flat.project.id}
  filterPublic={true}
/>
```

---

## 📋 Implementation Checklist

### Phase 1: Property Integration
- [ ] Add construction summary to property detail page
- [ ] Show active projects on property dashboard
- [ ] Link property selector to construction dashboard
- [ ] Add tower/floor construction status fields

### Phase 2: Customer Integration
- [ ] Create construction milestones table
- [ ] Implement floor completion event handler
- [ ] Set up email service for notifications
- [ ] Create payment milestone creation logic
- [ ] Add customer notification system
- [ ] Implement payment reminders
- [ ] Test email delivery
- [ ] Add customer portal construction view

### Phase 3: Photo Upload
- [ ] Set up file storage (S3 or local)
- [ ] Create progress photos entity
- [ ] Implement upload API endpoints
- [ ] Create photo upload components
- [ ] Add photo gallery component
- [ ] Integrate with progress logs
- [ ] Add thumbnail generation
- [ ] Implement photo categorization
- [ ] Add customer-facing photo gallery
- [ ] Add photo description/tagging

---

## 🔧 Technical Requirements

### Infrastructure Needed
1. **Email Service:** SendGrid, AWS SES, or SMTP server
2. **File Storage:** AWS S3, Azure Blob, or local filesystem
3. **Image Processing:** Sharp library for thumbnails
4. **Queue System:** Bull/Redis for async processing
5. **Cron Jobs:** For payment reminders

### Environment Variables
```env
# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@eastern-estate.com
SMTP_PASS=your-password
FROM_EMAIL=noreply@eastern-estate.com

# File Upload
UPLOAD_DIRECTORY=./uploads/construction
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

# AWS S3 (if using)
AWS_S3_BUCKET=eastern-estate-construction
AWS_S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

---

## 📊 Expected Benefits

### For Management
- Real-time construction status visibility
- Automated customer payment tracking
- Visual progress documentation
- Reduced manual notification work

### For Customers
- Transparency in construction progress
- Timely payment notifications
- Photo evidence of work quality
- Build trust through visibility

### For Site Team
- Easy progress documentation
- Photo-based milestone tracking
- Automated reporting
- Quality assurance records

---

## ⚠️ Important Notes

1. **Testing Required:** Thoroughly test email delivery before going live
2. **Data Privacy:** Ensure photos don't reveal sensitive information
3. **Storage Costs:** Monitor S3/storage usage and implement cleanup policies
4. **Performance:** Optimize image loading with lazy loading and CDN
5. **Backup:** Regular backups of construction photos
6. **Legal:** Terms for photo usage and customer data

---

## 🚀 Recommended Implementation Order

1. **Week 1-2:** Photo upload infrastructure (most impactful for immediate use)
2. **Week 3-4:** Property-construction integration (improves navigation)
3. **Week 5-6:** Customer payment automation (requires careful testing)
4. **Week 7:** Email notifications setup and testing
5. **Week 8:** Integration testing and deployment

---

**Total Estimated Timeline:** 8-10 weeks
**Priority:** Medium-High
**Complexity:** High (requires multiple system integrations)

---

*This roadmap provides a complete plan for integrating construction with other modules. Implementation should be done iteratively with thorough testing at each phase.*
