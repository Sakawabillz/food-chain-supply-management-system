# Food Supply Chain API

Backend API for a food traceability workflow:

1. Users authenticate and receive JWT tokens.
2. Farmers create food batches.
3. Distributors ship and deliver batches.
4. Inspectors approve or reject delivered batches.
5. Audit logs record important actions across the system.

## Setup

Install dependencies:

```bash
npm install
```

Create `.env` from `.env.example`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/food-supply-chain
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=1d
```

Start MongoDB, then start the API:

```bash
npm start
```

Health check:

```http
GET http://localhost:3000/health
```

Most routes are available under both `/api/...` and `/api/v1/...`.

## Postman Auth

For protected routes, use:

```text
Authorization: Bearer YOUR_TOKEN_HERE
```

Recommended test users:

- `ADMIN`
- `FARMER`
- `DISTRIBUTOR`
- `INSPECTOR`

## Auth Endpoints

### Register

```http
POST /api/auth/register
```

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "ADMIN"
}
```

Allowed roles:

```text
ADMIN, FARMER, DISTRIBUTOR, INSPECTOR
```

### Login

```http
POST /api/auth/login
```

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Copy the returned `token` into Postman Authorization as a Bearer token.

## User Management

Admin only.

```http
GET /api/users
GET /api/users/:id
PATCH /api/users/:id/role
PATCH /api/users/:id/deactivate
PATCH /api/users/:id/activate
```

Update role body:

```json
{
  "role": "INSPECTOR"
}
```

## Batch Endpoints

### Create Batch

Farmer only.

```http
POST /api/batch
```

```json
{
  "batchCode": "BATCH-001",
  "productName": "Tomatoes",
  "quantity": 500,
  "unit": "kg",
  "harvestDate": "2026-05-18"
}
```

Expected batch status:

```text
HARVESTED
```

### List Batches

```http
GET /api/batch?page=1&limit=10
```

Farmers see their own batches. Admins, distributors, and inspectors can read batches.

### Get Batch Detail

```http
GET /api/batch/:id
```

### Get Batch History

```http
GET /api/batch/:id/history
```

### Update Batch Status

```http
PATCH /api/batch/:id/status
```

```json
{
  "status": "IN_TRANSIT"
}
```

Role rules:

- `ADMIN`: can set any valid batch status.
- `DISTRIBUTOR`: can set `IN_TRANSIT`.
- `INSPECTOR`: can set `INSPECTED` or `REJECTED`.

Valid batch statuses:

```text
HARVESTED, IN_TRANSIT, DELIVERED, REJECTED, INSPECTED
```

## Shipment Endpoints

### Create Shipment

Distributor only. The linked batch must be `HARVESTED`.

```http
POST /api/shipment
```

```json
{
  "shipmentCode": "SHIP-001",
  "batchId": "PASTE_BATCH_ID_HERE",
  "origin": "Farm A",
  "destination": "Distribution Center B",
  "transportCompany": "XYZ Logistics",
  "departureDate": "2026-05-19"
}
```

Expected:

- Shipment status becomes `IN_TRANSIT`.
- Linked batch status becomes `IN_TRANSIT`.

### List Shipments

```http
GET /api/shipment
```

Read rules:

- `ADMIN`: all shipments
- `INSPECTOR`: all shipments
- `DISTRIBUTOR`: own shipments
- `FARMER`: shipments for their own batches

### Get Shipment Detail

```http
GET /api/shipment/:id
```

### Mark Shipment Delivered

Distributor assigned to the shipment only.

```http
PATCH /api/shipment/:id/deliver
```

Expected:

- Shipment status becomes `DELIVERED`.
- Linked batch status becomes `DELIVERED`.

## Inspection Endpoints

### Create Inspection

Inspector only. The linked batch must be `DELIVERED`.

```http
POST /api/inspection
```

Pass body:

```json
{
  "batchId": "PASTE_BATCH_ID_HERE",
  "result": "PASSED",
  "remarks": "Quality checks passed"
}
```

Fail body:

```json
{
  "batchId": "PASTE_BATCH_ID_HERE",
  "result": "FAILED",
  "remarks": "Contamination detected"
}
```

Expected:

- `PASSED` updates batch status to `INSPECTED`.
- `FAILED` updates batch status to `REJECTED`.
- A batch cannot be inspected twice.

### List Inspections

```http
GET /api/inspection
```

Read rules:

- `ADMIN`: all inspections
- `DISTRIBUTOR`: all inspections
- `FARMER`: inspections for their own batches
- `INSPECTOR`: own inspections

### Get Inspection Detail

```http
GET /api/inspection/:id
```

## Audit Endpoints

Admin only.

### List Audit Logs

```http
GET /api/audit
```

Pagination:

```http
GET /api/audit?page=1&limit=20
```

Filters:

```http
GET /api/audit?action=CREATE_BATCH
GET /api/audit?entity=Batch
GET /api/audit?userId=USER_ID
GET /api/audit?entityId=ENTITY_ID
```

### Get Audit Log Detail

```http
GET /api/audit/:id
```

Audit logs are intentionally immutable. The model blocks update and delete operations.

## G5 Audit Test Flow

Use Postman and complete this sequence:

1. Register/login an `ADMIN`, `FARMER`, `DISTRIBUTOR`, and `INSPECTOR`.
2. Farmer creates a batch.
3. Distributor creates a shipment for that batch.
4. Distributor marks the shipment delivered.
5. Inspector creates an inspection for the delivered batch.
6. Admin calls:

```http
GET /api/audit
```

You should see actions such as:

```text
REGISTER_USER
LOGIN
CREATE_BATCH
CREATE_SHIPMENT
DELIVER_SHIPMENT
INSPECTION_PASS
INSPECTION_FAIL
UPDATE_USER_ROLE
DEACTIVATE_USER
ACTIVATE_USER
UPDATE_BATCH_STATUS
```

## Full Happy Path Test

1. `POST /api/auth/register` as `FARMER`.
2. `POST /api/auth/login` and copy farmer token.
3. `POST /api/batch` with farmer token.
4. `POST /api/auth/register` as `DISTRIBUTOR`.
5. `POST /api/auth/login` and copy distributor token.
6. `POST /api/shipment` with distributor token and batch ID.
7. `PATCH /api/shipment/:id/deliver` with distributor token.
8. `POST /api/auth/register` as `INSPECTOR`.
9. `POST /api/auth/login` and copy inspector token.
10. `POST /api/inspection` with inspector token and batch ID.
11. `POST /api/auth/register` as `ADMIN`.
12. `POST /api/auth/login` and copy admin token.
13. `GET /api/audit` with admin token.

## Useful Negative Tests

- Create batch with non-farmer token: expect `403`.
- Create shipment with non-distributor token: expect `403`.
- Create shipment for a non-`HARVESTED` batch: expect `400`.
- Deliver shipment with wrong distributor: expect `403`.
- Inspect with non-inspector token: expect `403`.
- Inspect a batch before delivery: expect `400`.
- Inspect the same batch twice: expect `400`.
- View audit logs with non-admin token: expect `403`.
