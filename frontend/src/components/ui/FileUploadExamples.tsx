// FileUpload Usage Examples for Eastern Estate ERP
// This shows how to use FileUpload in different scenarios

import React, { useState } from 'react';
import FileUpload, { UploadedFile } from '@/components/ui/FileUpload';

// ============================================
// EXAMPLE 1: Simple Image Upload
// ============================================
export function PropertyImageUpload() {
  const [images, setImages] = useState<UploadedFile[]>([]);

  const handleUpload = async (files: File[]): Promise<string[]> => {
    // Upload to your backend
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });

    const response = await fetch('/api/v1/upload/images', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();
    return data.urls; // Array of uploaded file URLs
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Property Images</h3>
      <FileUpload
        accept="image/*"
        multiple
        maxSize={5}
        maxFiles={10}
        onUpload={handleUpload}
        onChange={setImages}
        showPreview
        uploadText="Upload property images"
      />
    </div>
  );
}

// ============================================
// EXAMPLE 2: Document Upload (PDF, DOC)
// ============================================
export function DocumentUpload() {
  const [documents, setDocuments] = useState<UploadedFile[]>([]);

  const handleUpload = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('documents', file));

    const response = await fetch('/api/v1/upload/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();
    return data.urls;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Project Documents</h3>
      <FileUpload
        accept=".pdf,.doc,.docx"
        multiple
        maxSize={20}
        maxFiles={5}
        onUpload={handleUpload}
        onChange={setDocuments}
        showPreview={false}
        uploadText="Upload brochures, plans, or documents"
      />
    </div>
  );
}

// ============================================
// EXAMPLE 3: Customer KYC Documents
// ============================================
export function KYCDocumentUpload() {
  const [aadhar, setAadhar] = useState<UploadedFile[]>([]);
  const [pan, setPan] = useState<UploadedFile[]>([]);

  const handleUpload = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('kyc', file));

    const response = await fetch('/api/v1/customers/kyc/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();
    return data.urls;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Aadhar Card</h3>
        <p className="text-sm text-gray-600 mb-3">Upload front and back of Aadhar card</p>
        <FileUpload
          accept="image/*,.pdf"
          multiple
          maxSize={5}
          maxFiles={2}
          onUpload={handleUpload}
          onChange={setAadhar}
          uploadText="Upload Aadhar (max 2 files)"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">PAN Card</h3>
        <p className="text-sm text-gray-600 mb-3">Upload PAN card image</p>
        <FileUpload
          accept="image/*,.pdf"
          multiple={false}
          maxSize={5}
          maxFiles={1}
          onUpload={handleUpload}
          onChange={setPan}
          uploadText="Upload PAN card"
        />
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 4: Payment Receipt Upload
// ============================================
export function PaymentReceiptUpload({ paymentId }: { paymentId: string }) {
  const [receipt, setReceipt] = useState<UploadedFile[]>([]);

  const handleUpload = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    formData.append('receipt', files[0]);
    formData.append('paymentId', paymentId);

    const response = await fetch('/api/v1/payments/upload-receipt', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();
    return [data.url];
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Upload Receipt</h3>
      <FileUpload
        accept="image/*,.pdf"
        multiple={false}
        maxSize={10}
        maxFiles={1}
        onUpload={handleUpload}
        onChange={setReceipt}
        uploadText="Upload payment receipt (image or PDF)"
      />
    </div>
  );
}

// ============================================
// EXAMPLE 5: In a Form (with Form Component)
// ============================================
export function PropertyFormWithUpload() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: [] as UploadedFile[],
    brochure: [] as UploadedFile[],
  });

  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    // Upload logic
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const response = await fetch('/api/v1/upload/property-images', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data.urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get uploaded file URLs
    const imageUrls = formData.images
      .filter(f => f.status === 'success')
      .map(f => f.url);

    const brochureUrl = formData.brochure[0]?.url;

    // Submit form with file URLs
    const response = await fetch('/api/v1/properties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description,
        images: imageUrls,
        brochure: brochureUrl,
      }),
    });

    if (response.ok) {
      alert('Property created successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Images
        </label>
        <FileUpload
          accept="image/*"
          multiple
          maxSize={5}
          maxFiles={10}
          onUpload={handleImageUpload}
          onChange={(files) => setFormData({ ...formData, images: files })}
          showPreview
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brochure (Optional)
        </label>
        <FileUpload
          accept=".pdf"
          multiple={false}
          maxSize={10}
          maxFiles={1}
          onUpload={handleImageUpload}
          onChange={(files) => setFormData({ ...formData, brochure: files })}
        />
      </div>

      <button
        type="submit"
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Create Property
      </button>
    </form>
  );
}

// ============================================
// BACKEND API ENDPOINT EXAMPLE (Node.js/NestJS)
// ============================================

/*
// upload.controller.ts (NestJS Backend)

import { Controller, Post, UseInterceptors, UploadedFiles, UseGuards } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  
  @Post('images')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads/properties',
        filename: (req, file, cb) => {
          const uniqueName = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only images allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = files.map(file => 
      `${process.env.APP_URL}/uploads/properties/${file.filename}`
    );
    
    return { urls };
  }

  @Post('documents')
  @UseInterceptors(
    FilesInterceptor('documents', 5, {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const uniqueName = `${uuid()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx'];
        const ext = extname(file.originalname).toLowerCase();
        if (!allowed.includes(ext)) {
          return cb(new Error('Only PDF and DOC files allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
      },
    }),
  )
  async uploadDocuments(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = files.map(file => 
      `${process.env.APP_URL}/uploads/documents/${file.filename}`
    );
    
    return { urls };
  }
}
*/

// ============================================
// QUICK REFERENCE
// ============================================

/*
Basic Usage:
------------
<FileUpload
  accept="image/*"              // File type filter
  multiple={true}               // Allow multiple files
  maxSize={5}                   // Max size in MB
  maxFiles={10}                 // Max number of files
  onUpload={handleUpload}       // Upload function
  onChange={setFiles}           // Track uploaded files
  showPreview={true}            // Show image previews
  uploadText="Upload files"     // Custom text
/>

File Types:
-----------
accept="image/*"               - All images
accept=".pdf"                  - Only PDF
accept=".pdf,.doc,.docx"       - PDF and Word docs
accept="image/*,.pdf"          - Images and PDF
accept="*"                     - All files

Upload Function:
----------------
const handleUpload = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  return data.urls; // Return array of URLs
};

Get Uploaded URLs:
------------------
const urls = files
  .filter(f => f.status === 'success')
  .map(f => f.url);
*/