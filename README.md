# AttendyCert Backend

AttendyCert Backend adalah REST API untuk event management, participant registration, attendance check-in, dan asynchronous certificate distribution.

## Business Capabilities

- Panitia dapat menyiapkan event dari tahap draft sampai selesai.
- Peserta dapat mendaftar melalui formulir yang disesuaikan dengan kebutuhan setiap event.
- Setiap peserta menerima ticket unik setelah berhasil mendaftar.
- Panitia dapat memvalidasi kehadiran peserta saat event berlangsung.
- Sistem dapat membatasi pendaftaran berdasarkan deadline dan kapasitas peserta.
- Panitia dapat mengatur template dan informasi yang tampil pada certificate.
- Certificate dapat dibuat dan dikirim ke banyak peserta tanpa membuat dashboard menunggu proses email selesai.
- Panitia dapat mengirim ulang certificate untuk peserta tertentu.
- Data registration, attendance, dan certificate tersimpan terpusat untuk kebutuhan operasional event.

## Tech Stack

- **Node.js 22 LTS**: application runtime.
- **Express 5**: REST API framework.
- **Prisma ORM**: type-safe database access and migrations.
- **PostgreSQL**: relational database dengan JSON fields untuk dynamic form data.
- **Redis**: message broker untuk background jobs.
- **BullMQ**: queue management, rate limiting, dan retry handling.
- **JWT**: admin authentication.
- **bcrypt**: password hashing.
- **Multer**: multipart file upload processing.
- **Cloudinary**: external media storage.
- **pdf-lib**: in-memory PDF certificate processing.
- **Nodemailer**: SMTP email delivery.
- **Zod**: request dan dynamic form validation.

## Architecture

```text
Admin Dashboard / Public Frontend
              |
              v
        Express REST API
          |           |
          v           v
     PostgreSQL      Redis
          |           |
          |           v
          |       BullMQ Queue
          |           |
          |           v
          +----> Email Worker
                    |
                    +--> Cloudinary
                    +--> SMTP Provider
```

### Main components

| Component     | Responsibility                                                        |
| ------------- | --------------------------------------------------------------------- |
| Express API   | Request handling, validation, authentication, dan response formatting |
| PostgreSQL    | Admin, event, participant, status, dan certificate data               |
| Prisma        | ORM, schema mapping, transaction, dan migration                       |
| Redis/BullMQ  | Background email jobs dan retry mechanism                             |
| Email Worker  | Ticket email dan certificate generation/delivery                      |
| Cloudinary    | Certificate template dan participant file storage                     |
| SMTP Provider | Email delivery                                                        |

## Project Structure

```text
.
├── prisma/
│   ├── migrations/                 # Database migration history
│   ├── schema.prisma               # Prisma schema
│   └── seed.js                     # Development admin seed
├── src/
│   ├── app.js                      # Express application entry point
│   ├── config/                     # Prisma, Redis, Cloudinary, SMTP config
│   ├── controllers/                # HTTP request/response handlers
│   ├── middlewares/                # Auth, validation, upload middleware
│   ├── queues/                     # BullMQ queue definitions
│   ├── repositories/               # Database access layer
│   ├── routes/                     # API route definitions
│   ├── services/                   # Business logic
│   ├── templates/email/             # Ticket and certificate email templates
│   ├── utils/                      # PDF utilities
│   ├── validations/                # Zod validation schemas
│   └── workers/                    # Background worker processes
├── docker-compose.dev.yml          # Development PostgreSQL and Redis services
├── docker-compose.yml              # Production API, worker, PostgreSQL, and Redis
├── package.json
└── prisma.config.ts
```

## Requirements

Sebelum menjalankan project, siapkan:

- Node.js `22.x` atau compatible version.
- npm.
- PostgreSQL `17` dan Redis `7`, atau Docker.
- Cloudinary account untuk file upload.
- SMTP account untuk ticket dan certificate email.

## Installation

Clone repository dan install dependencies:

```bash
git clone <repository-url>
cd attendycert-backend
npm install
```

Buat file `.env` di root project. Jangan commit file ini ke repository.

### Environment Variables

```env
# Application
PORT=3000

# PostgreSQL
DATABASE_URL="postgresql://attendycert:attendycert@localhost:5432/attendycert?schema=public"
DB_USER=attendycert
DB_PASSWORD=attendycert
DB_NAME=attendycert
DB_PORT=5432

# JWT
JWT_SECRET="replace-with-a-long-random-secret"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# SMTP
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
SMTP_FROM='"AttendyCert" <no-reply@example.com>'
```

Gunakan nilai secret yang berbeda untuk setiap environment. Jangan menggunakan seed password atau secret development di production.

## Start Infrastructure with Docker

### Development

Gunakan `docker-compose.dev.yml` untuk local development. File ini menjalankan PostgreSQL dan Redis, mengekspos port ke host, serta memiliki healthcheck untuk kedua service.

```bash
docker compose -f docker-compose.dev.yml up -d
```

Periksa status container:

```bash
docker compose -f docker-compose.dev.yml ps
```

Hentikan infrastructure:

```bash
docker compose -f docker-compose.dev.yml down
```

Development database dan Redis menggunakan persistent Docker volumes. Jika ingin menghapus seluruh data local juga, jalankan:

```bash
docker compose -f docker-compose.dev.yml down -v
```

> Perintah terakhir bersifat destructive terhadap local database volume.

Setelah PostgreSQL dan Redis siap, jalankan API dan worker dari host:

```bash
npm run dev
npm run worker:dev
```

Jalankan keduanya pada terminal yang berbeda.

### Production

`docker-compose.yml` menjalankan seluruh production stack:

- `postgres`
- `redis`
- `app`
- `worker`

Pastikan production `.env` sudah dikonfigurasi, terutama `JWT_SECRET`, database credentials, Cloudinary, dan SMTP variables. Kemudian jalankan:

```bash
docker compose up -d --build
```

Production compose akan menjalankan migration melalui container `app` sebelum API start. Periksa service logs dengan:

```bash
docker compose logs -f app worker
```

Untuk menghentikan production stack:

```bash
docker compose down
```

## Database Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Untuk development, apply migration dan buat migration baru bila schema berubah:

```bash
npx prisma migrate dev
```

Jalankan seed admin:

```bash
npx prisma db seed
```

Untuk deployment atau environment yang sudah memiliki migration history:

```bash
npx prisma migrate deploy
npx prisma generate
```

Development seed membuat admin berikut:

```text
Email:    admin@company.com
Password: password123
```

Credentials tersebut hanya untuk local development. Ganti atau hapus akun tersebut sebelum production deployment.

## Running the Application

API server dan email worker dijalankan sebagai dua process terpisah.

### Development

Terminal 1, jalankan API:

```bash
npm run dev
```

Terminal 2, jalankan worker:

```bash
npm run worker:dev
```

### Production

```bash
npm start
```

Pada terminal atau process terpisah:

```bash
npm run worker
```

Default API URL:

```text
http://localhost:3000
```

Health check:

```bash
curl http://localhost:3000/api/health
```

## NPM Scripts

| Script               | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| `npm run dev`        | Run API with Nodemon                                               |
| `npm start`          | Run API with Node.js                                               |
| `npm run worker`     | Run email worker                                                   |
| `npm run worker:dev` | Run email worker with Nodemon                                      |
| `npm test`           | Belum tersedia; command saat ini mengembalikan `no test specified` |

## Business Flow

### 1. Event Preparation

1. Admin melakukan login dan menerima JWT token.
2. Admin membuat event baru dengan status `DRAFT`.
3. Admin mengatur `title`, `slug`, registration deadline, quota, dan `form_schema`.
4. Admin mengunggah PDF certificate template dan certificate text coordinates.
5. Admin mengubah status event menjadi `PUBLISHED`.

Setelah event berstatus `PUBLISHED` atau `COMPLETED`, `form_schema` tidak dapat diubah. Event `PUBLISHED` juga tidak dapat dikembalikan ke `DRAFT`.

### 2. Participant Registration

1. Public frontend mengambil published event berdasarkan `slug`.
2. Frontend membangun registration form berdasarkan `form_schema`.
3. Participant mengirim data menggunakan `multipart/form-data`.
4. File upload dikirim ke Cloudinary.
5. Backend membuat participant dengan unique `ticket_id` dan status `REGISTERED`.
6. Ticket email dimasukkan ke Redis queue.

### 3. Attendance Check-in

1. Frontend dapat mengubah `ticket_id` menjadi QR code.
2. Admin dashboard mengirim `ticket_id` ke check-in endpoint.
3. Backend memvalidasi ticket untuk event terkait.
4. Status participant berubah menjadi `ATTENDED`.

QR code rendering dan camera scanning bukan bagian dari repository backend ini.

### 4. Certificate Distribution

1. Admin memanggil certificate generation endpoint.
2. Participant dengan status `ATTENDED` atau `FAILED` diproses.
3. Certificate number diberikan dalam database transaction.
4. Participant diubah menjadi `PROCESSING`.
5. Certificate jobs dimasukkan ke Redis queue.
6. Worker mengambil job, mengunduh template PDF, menambahkan nama dan certificate number, lalu mengirim email.
7. Jika berhasil, status berubah menjadi `CERTIFICATE_SENT`.
8. Setelah seluruh retry gagal, status berubah menjadi `FAILED`.

Email queue memakai maksimal 3 attempts dengan exponential backoff. Worker memiliki concurrency `2` dan limiter maksimal `5` jobs per detik.

## API Reference

### Base URL

```text
http://localhost:3000/api
```

### Response Format

Successful response:

```json
{
  "success": true,
  "message": "Operation successful.",
  "data": {}
}
```

Paginated event response juga memiliki `meta`:

```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Error message."
}
```

### Authentication

Admin endpoints membutuhkan header berikut:

```http
Authorization: Bearer <jwt_token>
```

JWT token berisi admin `id` dan `email`, dengan expiration `24h`.

### Health Check

#### `GET /health`

Public endpoint untuk memeriksa service status.

```bash
curl http://localhost:3000/api/health
```

Response `200`:

```json
{
  "success": true,
  "message": "Service is healthy",
  "server_time": "2026-09-06T10:00:00.000Z"
}
```

### Admin Login

#### `POST /admin/login`

Public endpoint untuk admin authentication.

Request body:

```json
{
  "email": "admin@company.com",
  "password": "password123"
}
```

Validation rules:

- `email` harus valid email address.
- `password` minimal 6 characters.

Response `200`:

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "<jwt_token>",
    "admin": {
      "id": "admin-uuid",
      "name": "Super Admin",
      "email": "admin@company.com"
    }
  }
}
```

### Event Management

Semua endpoint pada bagian ini membutuhkan JWT kecuali public event lookup.

#### `POST /events`

Membuat event baru dengan status `DRAFT`.

Request body:

```json
{
  "title": "Workshop Node.js",
  "slug": "workshop-nodejs",
  "registration_deadline": "2026-10-01T23:59:59.000Z",
  "max_quota": 100,
  "form_schema": [
    {
      "name": "institution",
      "label": "Institution",
      "type": "text",
      "required": true
    },
    {
      "name": "occupation",
      "label": "Occupation",
      "type": "select",
      "required": true,
      "options": ["Student", "Professional"]
    }
  ]
}
```

Fields:

| Field                   | Required | Description                                    |
| ----------------------- | -------: | ---------------------------------------------- |
| `title`                 |      Yes | Event title, maximum 255 characters            |
| `slug`                  |      Yes | Lowercase letters, numbers, and single hyphens |
| `registration_deadline` |       No | UTC ISO datetime atau `null`                   |
| `max_quota`             |       No | Positive integer atau `null`                   |
| `form_schema`           |       No | Array of dynamic form fields; default `[]`     |

Response `201`:

```json
{
  "success": true,
  "message": "Event created successfully.",
  "data": {
    "id": "event-uuid",
    "title": "Workshop Node.js",
    "slug": "workshop-nodejs",
    "status": "DRAFT"
  }
}
```

#### `GET /events/:slug`

Public endpoint untuk mengambil event dengan status `PUBLISHED`.

```bash
curl http://localhost:3000/api/events/workshop-nodejs
```

Jika event tidak ditemukan atau belum published, response adalah `404`.

#### `GET /events/admin`

Mengambil daftar event untuk admin.

Query parameters:

| Parameter | Default | Description                            |
| --------- | ------: | -------------------------------------- |
| `page`    |     `1` | Page number                            |
| `limit`   |    `10` | Items per page                         |
| `search`  |       - | Case-insensitive title search          |
| `status`  |       - | `DRAFT`, `PUBLISHED`, atau `COMPLETED` |

Example:

```bash
curl "http://localhost:3000/api/events/admin?page=1&limit=10&status=PUBLISHED" \
  -H "Authorization: Bearer <jwt_token>"
```

#### `GET /events/admin/:id`

Mengambil event berdasarkan UUID. Membutuhkan JWT.

#### `PATCH /events/:id`

Memperbarui event. Endpoint ini menggunakan `multipart/form-data` karena dapat menerima certificate PDF template.

Form fields yang didukung:

```text
title
slug
registration_deadline
max_quota
form_schema
status
cert_name_x
cert_name_y
cert_number_x
cert_number_y
template_pdf
```

Contoh:

```bash
curl -X PATCH "http://localhost:3000/api/events/<event_id>" \
  -H "Authorization: Bearer <jwt_token>" \
  -F "status=PUBLISHED" \
  -F "template_pdf=@./certificate-template.pdf" \
  -F "cert_name_x=250" \
  -F "cert_name_y=330" \
  -F "cert_number_x=250" \
  -F "cert_number_y=290"
```

`template_pdf` harus PDF dengan ukuran maksimal `5 MB`.

Business rules:

- `PUBLISHED` tidak dapat diubah kembali menjadi `DRAFT`.
- `COMPLETED` tidak dapat mengubah status.
- `form_schema` tidak dapat diubah setelah event `PUBLISHED` atau `COMPLETED`.
- `slug` harus unique.

### Participant Registration

#### `POST /events/:slug/register`

Public endpoint untuk participant registration.

Gunakan `multipart/form-data`, bukan JSON.

Required form fields:

| Key                    | Type | Description                                 |
| ---------------------- | ---- | ------------------------------------------- |
| `name`                 | Text | Participant name, maximum 255 characters    |
| `email`                | Text | Valid email address                         |
| `custom_answers`       | Text | JSON object sebagai string, optional        |
| `<dynamic_file_field>` | File | File dengan field name sesuai `form_schema` |

Example `form_schema` dengan file field:

```json
[
  {
    "name": "institution",
    "label": "Institution",
    "type": "text",
    "required": true
  },
  {
    "name": "identity_card",
    "label": "Identity Card",
    "type": "file",
    "required": true
  }
]
```

Kirim form-data berikut:

```text
name             Text  Budi Santoso
email            Text  budi@example.com
custom_answers   Text  {"institution":"Universitas Indonesia"}
identity_card    File  kartu-identitas.pdf
```

Contoh cURL:

```bash
curl -X POST "http://localhost:3000/api/events/workshop-nodejs/register" \
  -F "name=Budi Santoso" \
  -F "email=budi@example.com" \
  -F 'custom_answers={"institution":"Universitas Indonesia"}' \
  -F "identity_card=@./kartu-identitas.pdf"
```

Upload rules:

- Allowed extensions dan MIME types: JPG, JPEG, PNG, PDF.
- Maximum file size: `3 MB` per file.
- Maximum number of files: `10`.
- Dynamic file field name harus sama persis dengan `form_schema[].name`.
- File akan di-upload ke Cloudinary dan URL-nya disimpan pada `custom_answers`.
- Email hanya dapat terdaftar sekali pada event yang sama.
- Registration hanya tersedia untuk event berstatus `PUBLISHED` dan belum melewati deadline atau quota.

Response `201`:

```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "participant": {
      "id": "participant-uuid",
      "ticket_id": "ticket-uuid",
      "eventId": "event-uuid",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "custom_answers": {
        "institution": "Universitas Indonesia",
        "identity_card": "https://res.cloudinary.com/..."
      },
      "status": "REGISTERED",
      "createdAt": "2026-09-06T10:00:00.000Z"
    },
    "event": {
      "title": "Workshop Node.js",
      "slug": "workshop-nodejs"
    }
  }
}
```

Ticket email diproses secara asynchronous. API response tidak menunggu email selesai dikirim.

### Attendance Check-in

#### `POST /events/:eventId/check-in`

Admin-only endpoint untuk check-in participant.

Request body:

```json
{
  "ticket_id": "ticket-uuid"
}
```

`ticket_id` harus valid UUID.

Response `200`:

```json
{
  "success": true,
  "message": "Check-in successful. Welcome to the event!",
  "data": {
    "participant": {
      "id": "participant-uuid",
      "ticket_id": "ticket-uuid",
      "status": "ATTENDED"
    }
  }
}
```

Participant yang sudah berstatus `ATTENDED` tidak dapat check-in ulang.

### Participant List

#### `GET /events/:eventId/participants`

Admin-only endpoint untuk mengambil participant list.

Query parameters:

| Parameter | Default | Description                           |
| --------- | ------: | ------------------------------------- |
| `page`    |     `1` | Page number                           |
| `limit`   |    `10` | Items per page                        |
| `search`  |       - | Search by name, email, atau ticket ID |
| `status`  |       - | Participant status filter             |

Available participant statuses:

```text
REGISTERED
ATTENDED
PROCESSING
CERTIFICATE_SENT
FAILED
```

Response:

```json
{
  "success": true,
  "message": "Participants fetched successfully.",
  "data": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "participants": []
  }
}
```

### Certificate Generation

#### `POST /events/:eventId/certificates/generate`

Admin-only endpoint untuk queue certificate distribution.

Request body optional:

```json
{
  "prefix": "CERT/AC/2026"
}
```

Default prefix adalah `CERT/AC/2026`.

Certificate number dibuat dalam format:

```text
001/CERT/AC/2026/EVENT-SLUG/2026
```

Hanya participant dengan status `ATTENDED` atau `FAILED` yang diproses.

Response:

```json
{
  "success": true,
  "message": "Certificate distribution queued for 2 participants.",
  "data": {
    "queued_count": 2
  }
}
```

Endpoint ini hanya memasukkan jobs ke queue. Pastikan email worker sedang berjalan untuk memproses pengiriman.

### Resend Certificate

#### `POST /events/:eventId/participants/:participantId/resend-certificate`

Admin-only endpoint untuk mengirim ulang certificate ke participant tertentu.

Participant harus sudah check-in. Jika belum memiliki certificate number, backend akan membuat certificate number baru dengan `RESEND` marker.

Response:

```json
{
  "success": true,
  "message": "Resend certificate job queued for budi@example.com"
}
```

## Dynamic Form Schema

Setiap form field menggunakan format berikut:

```json
{
  "name": "occupation",
  "label": "Occupation",
  "type": "select",
  "required": true,
  "options": ["Student", "Professional"]
}
```

Supported field types:

| Type       | Answer format                           |
| ---------- | --------------------------------------- |
| `text`     | String                                  |
| `textarea` | String                                  |
| `number`   | Number                                  |
| `select`   | One value from `options`                |
| `file`     | Uploaded file, stored as Cloudinary URL |

`options` digunakan terutama untuk `select` fields. Required text, textarea, dan file fields harus memiliki value. Optional fields dapat bernilai `null` atau tidak dikirim.

## Data Model

### Admin

- `id`: UUID primary key.
- `name`: Admin name.
- `email`: Unique email.
- `password`: bcrypt hash.

### Event

- `id`: UUID primary key.
- `slug`: Unique public identifier.
- `title`: Event title.
- `status`: `DRAFT`, `PUBLISHED`, atau `COMPLETED`.
- `form_schema`: JSON dynamic form definition.
- `registration_deadline`: Optional UTC datetime.
- `max_quota`: Optional positive integer.
- `template_url`: Cloudinary PDF URL.
- `cert_name_x`, `cert_name_y`: Certificate name coordinates.
- `cert_number_x`, `cert_number_y`: Certificate number coordinates.
- `adminId`: Owner admin UUID.

### Participant

- `id`: UUID primary key.
- `ticket_id`: Unique UUID.
- `name`: Participant name.
- `email`: Unique per event.
- `custom_answers`: JSON dynamic form answers.
- `status`: Participant processing status.
- `certificate_number`: Unique per event when assigned.
- `eventId`: Related event UUID.

Database constraints:

- Event `slug` harus unique.
- Participant `ticket_id` harus unique.
- Kombinasi `eventId` dan `email` harus unique.
- Kombinasi `eventId` dan `certificate_number` harus unique.
- Menghapus event juga menghapus participant terkait (`onDelete: Cascade`).

## Queue and Worker Operations

Queue name:

```text
emailQueue
```

Supported job types:

- `SEND_TICKET`: mengirim registration ticket email.
- `SEND_CERTIFICATE`: generate PDF certificate dan mengirim certificate email.

Queue configuration:

- Maximum attempts: `3`.
- Backoff: exponential, initial delay `3000 ms`.
- Completed jobs: removed automatically.
- Failed jobs: retained up to `1000`.
- Worker concurrency: `2`.
- Rate limiter: maximum `5` jobs per `1000 ms`.

Worker wajib memiliki akses ke:

- PostgreSQL.
- Redis.
- Cloudinary untuk certificate template download.
- SMTP provider untuk email delivery.

Jika worker tidak berjalan, API tetap dapat mengembalikan successful queue response, tetapi ticket atau certificate tidak akan terkirim sampai worker dijalankan.

## Error Handling

| HTTP Status | Meaning                             |
| ----------: | ----------------------------------- |
|       `200` | Request berhasil                    |
|       `201` | Resource berhasil dibuat            |
|       `400` | Validation atau business rule gagal |
|       `401` | Missing, invalid, atau expired JWT  |
|       `404` | Resource tidak ditemukan            |
|       `500` | Internal server error               |

Common errors:

```json
{
  "success": false,
  "message": "Authorization token is required."
}
```

```json
{
  "success": false,
  "message": "Email is already registered for this event."
}
```

```json
{
  "success": false,
  "message": "Event registration quota is full."
}
```

## Troubleshooting

### `Invalid value for argument status. Expected ParticipantStatus.`

Prisma Client belum di-generate ulang setelah perubahan enum. Jalankan:

```bash
npx prisma migrate deploy
npx prisma generate
```

Kemudian restart API dan worker.

### Certificate queued tetapi email tidak terkirim

Pastikan:

1. Redis sedang berjalan.
2. SMTP variables sudah benar.
3. Email worker sedang berjalan dengan `npm run worker`.
4. Worker tidak menampilkan error pada terminal.
5. Certificate template URL masih dapat diakses dari Cloudinary.

### Registration file upload ditolak

Periksa hal berikut:

- File harus JPG, JPEG, PNG, atau PDF.
- Ukuran file maksimal 3 MB.
- Nama form-data file harus sama dengan `form_schema[].name`.
- Request harus menggunakan `multipart/form-data`.

### Event tidak muncul pada public endpoint

Public event lookup hanya mengembalikan event dengan status `PUBLISHED`. Event `DRAFT` dan `COMPLETED` tidak tersedia melalui public endpoint tersebut.

### Migration gagal dijalankan

Pastikan `DATABASE_URL` menunjuk ke database yang benar dan PostgreSQL sedang aktif:

```bash
docker compose -f docker-compose.dev.yml ps
npx prisma migrate status
```
