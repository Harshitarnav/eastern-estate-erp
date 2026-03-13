#!/usr/bin/env node
/**
 * migrate-uploads-to-minio.js  — plain CommonJS, no TypeScript
 * Run from inside the backend container:
 *   node scripts/migrate-uploads-to-minio.js
 */

'use strict';

const path   = require('path');
const fs     = require('fs/promises');
const { S3Client, PutObjectCommand, HeadObjectCommand,
        CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');
const { Pool } = require('pg');

// ── Load .env if available (local dev) ────────────────────────────────────────
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
} catch {
  // dotenv may not be installed in prod container — that's fine,
  // Docker Compose injects all env vars directly.
}

// ── Config ────────────────────────────────────────────────────────────────────
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT  || 'minio';
const MINIO_PORT     = parseInt(process.env.MINIO_PORT || '9000', 10);
const MINIO_ACCESS   = process.env.MINIO_ACCESS_KEY || '';
const MINIO_SECRET   = process.env.MINIO_SECRET_KEY || '';
const MINIO_USE_SSL  = process.env.MINIO_USE_SSL === 'true';
const MINIO_BUCKET   = process.env.MINIO_BUCKET    || 'eastern-estate';
const UPLOADS_DIR    = process.env.UPLOAD_LOCATION
  ? path.resolve(__dirname, '..', process.env.UPLOAD_LOCATION)
  : path.resolve(__dirname, '../uploads');

// ── Clients ───────────────────────────────────────────────────────────────────
const s3 = new S3Client({
  endpoint:    `${MINIO_USE_SSL ? 'https' : 'http'}://${MINIO_ENDPOINT}:${MINIO_PORT}`,
  credentials: { accessKeyId: MINIO_ACCESS, secretAccessKey: MINIO_SECRET },
  region:      'us-east-1',
  forcePathStyle: true,
});

const db = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432', 10),
  user:     process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'postgres',
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// ── MIME map ──────────────────────────────────────────────────────────────────
const MIME_MAP = {
  '.pdf':  'application/pdf',
  '.jpg':  'image/jpeg', '.jpeg': 'image/jpeg',
  '.png':  'image/png',  '.gif':  'image/gif', '.webp': 'image/webp',
  '.doc':  'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls':  'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function keyFromUrl(url) {
  const match = url.match(/\/uploads\/(.+)$/);
  return match ? match[1] : path.basename(url);
}

async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: MINIO_BUCKET }));
    console.log(`ℹ️   Bucket '${MINIO_BUCKET}' already exists`);
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: MINIO_BUCKET }));
    console.log(`✅  Created bucket '${MINIO_BUCKET}'`);
  }
  const policy = JSON.stringify({
    Version: '2012-10-17',
    Statement: [{ Effect: 'Allow', Principal: { AWS: ['*'] }, Action: ['s3:GetObject'], Resource: [`arn:aws:s3:::${MINIO_BUCKET}/*`] }],
  });
  await s3.send(new PutBucketPolicyCommand({ Bucket: MINIO_BUCKET, Policy: policy })).catch(() => {});
}

async function existsInMinio(key) {
  try { await s3.send(new HeadObjectCommand({ Bucket: MINIO_BUCKET, Key: key })); return true; }
  catch { return false; }
}

async function uploadToMinio(localPath, key) {
  const buffer = await fs.readFile(localPath);
  const ext = path.extname(key).toLowerCase();
  await s3.send(new PutObjectCommand({
    Bucket: MINIO_BUCKET, Key: key, Body: buffer,
    ContentType: MIME_MAP[ext] || 'application/octet-stream',
    ContentLength: buffer.length,
  }));
  return buffer.length;
}

// ── Tables to migrate ─────────────────────────────────────────────────────────
const TABLES = [
  { label: 'Documents',          table: 'documents',          idCol: 'id', urlCol: 'file_url'        },
  { label: 'Employee photos',    table: 'employees',          idCol: 'id', urlCol: 'profile_picture'  },
  { label: 'Employee documents', table: 'employee_documents', idCol: 'id', urlCol: 'document_url'    },
];

async function migrateTable(spec) {
  // Check table exists
  const check = await db.query(
    `SELECT 1 FROM information_schema.tables WHERE table_name = $1`, [spec.table]
  );
  if (check.rowCount === 0) {
    console.log(`  ⏭️  Table '${spec.table}' not found — skipping.\n`);
    return { migrated: 0, skipped: 0, failed: 0 };
  }

  const { rows } = await db.query(
    `SELECT ${spec.idCol} AS id, ${spec.urlCol} AS url
     FROM ${spec.table}
     WHERE ${spec.urlCol} IS NOT NULL
       AND ${spec.urlCol} != ''
       AND ${spec.urlCol} NOT LIKE '/files/%'
     ORDER BY created_at`
  );

  console.log(`  Found ${rows.length} row(s) to migrate.\n`);
  if (rows.length === 0) return { migrated: 0, skipped: 0, failed: 0 };

  let migrated = 0, skipped = 0, failed = 0;

  for (const row of rows) {
    const key       = keyFromUrl(row.url);
    const localPath = path.join(UPLOADS_DIR, key);
    const newUrl    = `/files/${key}`;

    process.stdout.write(`    [${row.id.slice(0, 8)}]  ${key}  →  `);

    try { await fs.access(localPath); }
    catch {
      console.log(`⚠️  SKIP (local file missing)`);
      skipped++; continue;
    }

    if (await existsInMinio(key)) {
      await db.query(
        `UPDATE ${spec.table} SET ${spec.urlCol} = $1, updated_at = NOW() WHERE ${spec.idCol} = $2`,
        [newUrl, row.id]
      );
      console.log(`⏭️  Already in MinIO → URL updated`);
      migrated++; continue;
    }

    try {
      const bytes = await uploadToMinio(localPath, key);
      await db.query(
        `UPDATE ${spec.table} SET ${spec.urlCol} = $1, updated_at = NOW() WHERE ${spec.idCol} = $2`,
        [newUrl, row.id]
      );
      console.log(`✅  Uploaded (${(bytes / 1024).toFixed(1)} KB)`);
      migrated++;
    } catch (err) {
      console.log(`❌  FAILED: ${err.message}`);
      failed++;
    }
  }

  return { migrated, skipped, failed };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n📦  MinIO Full Migration');
  console.log('═'.repeat(55));
  console.log(`MinIO   → ${MINIO_ENDPOINT}:${MINIO_PORT}  bucket=${MINIO_BUCKET}`);
  console.log(`Uploads → ${UPLOADS_DIR}`);
  console.log(`DB      → ${process.env.DB_HOST}/${process.env.DB_DATABASE}`);
  console.log('═'.repeat(55) + '\n');

  await ensureBucket();
  console.log('');

  let totalMigrated = 0, totalSkipped = 0, totalFailed = 0;

  for (const spec of TABLES) {
    console.log(`── ${spec.label} (${spec.table}.${spec.urlCol}) ──`);
    const r = await migrateTable(spec);
    totalMigrated += r.migrated;
    totalSkipped  += r.skipped;
    totalFailed   += r.failed;
    console.log('');
  }

  console.log('═'.repeat(55));
  console.log(`✅  Migrated : ${totalMigrated}`);
  console.log(`⏭️  Skipped  : ${totalSkipped}  (local file missing)`);
  console.log(`❌  Failed   : ${totalFailed}`);
  console.log('═'.repeat(55));

  if (totalMigrated > 0) {
    console.log(`\n🎉  Done! ${totalMigrated} file(s) are now in MinIO.`);
    console.log(`   Once verified, delete old files with:  rm -rf /app/uploads/*`);
  }

  await db.end();
}

main().catch(err => {
  console.error('\n💥  Migration failed:', err.message);
  process.exit(1);
});
