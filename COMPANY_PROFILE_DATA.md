# COMPANY PROFILES & DATABASE SEED DATA

## Overview
The database has been successfully configured with comprehensive company profile data including:
- **1 Main Company**: MOHAMMAD SHAFIULALAM VEGETABLES & FRUITS TRADING L.L.C.
- **2 Trial Companies**: AL MARJAN INTERNATIONAL TRADING LLC & GOLDEN HORIZON ENTERPRISES L.L.C.

Each company has complete tax registration, VAT returns, corporate tax records, payments, and correspondence data.

---

## COMPANY 1: MOHAMMAD SHAFIULALAM VEGETABLES & FRUITS TRADING L.L.C. (MAIN)

### Company Details
- **Company ID**: company-admin
- **Legal Name**: MOHAMMAD SHAFIULALAM VEGETABLES & FRUITS TRADING L.L.C.
- **Email**: info@shafiulalamtrading.com
- **TRN (Tax Registration Number)**: 100354945600003
- **Status**: Active
- **Created By**: system
- **Creation Date**: 2026-03-26

### Admin User Account
- **Username**: admin
- **Password**: admin
- **Email**: info@shafiulalamtrading.com
- **Display Name**: MOHAMMAD SHAFIULALAM VEGETABLES & FRUITS TRADING L.L.C.
- **Role**: admin
- **User ID**: admin-id

### Tax Registrations
1. **VAT Registration**
   - TRN: 100354945600003
   - Status: Active
   - Effective Date: 2024-01-01
   - Tax Type: VAT

2. **Corporate Tax Registration**
   - TRN: 100354945600003
   - Status: Active
   - Effective Date: 2024-06-01
   - Tax Type: Corporate Tax

### VAT Returns Data (6 Returns)
1. **Q4 FY2026** (01/12/2025 - 28/02/2026)
   - VAT Ref: 230010165962
   - Status: Submitted
   - Total Sales: AED 3,121,416.78
   - Total VAT: AED 156,070.84
   - Expenses: AED 2,558,941.13
   - Recoverable VAT: AED 127,947.06
   - Net VAT Due: AED 28,123.78
   - Due Date: 30/03/2026 (OUTSTANDING)

2. **Q3 FY2026** (01/09/2025 - 30/11/2025)
   - VAT Ref: 230009650203
   - Status: Submitted
   - Total Sales: AED 0.00
   - Expenses: AED 445,976.20
   - Recoverable VAT: AED 22,298.81
   - Net VAT Due: AED 22,298.81
   - Due Date: 29/12/2025 (PAID)

3. **Q2 FY2026** (01/06/2025 - 31/08/2025)
   - VAT Ref: 230009007872
   - Status: Submitted
   - Total Sales: AED 0.00
   - Expenses: AED 123,245.60
   - Recoverable VAT: AED 6,162.28
   - Net VAT Due: AED 6,162.28
   - Due Date: 29/09/2025 (PAID)

4. **Q1 FY2026** (01/03/2025 - 31/05/2025)
   - VAT Ref: 230008349468
   - Status: Submitted
   - Total Sales: AED 132,939.60
   - VAT: AED 6,646.98
   - Net VAT Due: AED 6,646.98
   - Due Date: 30/06/2025 (PAID)

5. **Q4 FY2025** (01/12/2024 - 28/02/2025)
   - VAT Ref: 230007923042
   - Status: Submitted
   - Total Sales: AED 499,780.20
   - VAT: AED 24,989.01
   - Net VAT Due: AED 24,989.01
   - Due Date: 28/03/2025 (PAID)

6. **Q3 FY2025** (01/09/2024 - 30/11/2024)
   - VAT Ref: 230007123456
   - Status: **OVERDUE**
   - Total Sales: AED 250,000.00
   - VAT: AED 12,500.00
   - Due Date: 29/12/2024 (NOT FILED)

### Corporate Tax Returns (2 Returns)
1. **Year 2023**
   - Status: Submitted
   - Net Tax: AED 45,000.00
   - Due Date: 2024-09-30
   - Filed: 2024-08-15

2. **Year 2024**
   - Status: Draft
   - Due Date: 2025-09-30

### Payment Records (7 Payments)
| Type | Amount | Status | Due Date | Paid Date |
|------|--------|--------|----------|-----------|
| VAT Payment | 28,123.78 | Outstanding | 30/03/2026 | - |
| VAT Payment | 22,298.81 | Paid | 29/12/2025 | 27/12/2025 |
| VAT Payment | 6,162.28 | Paid | 29/09/2025 | 25/09/2025 |
| VAT Payment | 6,646.98 | Paid | 30/06/2025 | 28/06/2025 |
| VAT Payment | 24,989.01 | Paid | 28/03/2025 | 26/03/2025 |
| VAT Payment | 12,500.00 | Outstanding | 29/12/2024 | - |
| Corporate Tax | 45,000.00 | Outstanding | 30/09/2024 | - |

**Total Outstanding**: AED 85,623.78

### Correspondence (3 Messages)
1. **VAT Registration Approved** (2024-01-12)
   - From: FTA Admin
   - Status: Read
   - Message: Your VAT registration has been approved.

2. **Corporate Tax Deadline Reminder** (2024-08-01)
   - From: Tax System
   - Status: Unread
   - Message: Corporate Tax return deadline reminder.

3. **Tax Certificate Issued** (2024-05-15)
   - From: FTA Admin
   - Status: Read
   - Message: Your Tax Residency Certificate has been issued.

---

## COMPANY 2: AL MARJAN INTERNATIONAL TRADING LLC (TRIAL)

### Company Details
- **Company ID**: company-1
- **Legal Name**: AL MARJAN INTERNATIONAL TRADING LLC
- **Email**: contact@almarjantrading.ae
- **TRN (Tax Registration Number)**: 100465892376001
- **Status**: Active

### Corporate User Account
- **Username**: almarjan_user
- **Password**: password123
- **Role**: corporate

### Data Structure
- 2 Tax Registrations (VAT + Corporate Tax)
- 6 VAT Returns (same structure as main company)
- 2 Corporate Tax Returns
- 7 Payment Records
- 3 Correspondence Messages

---

## COMPANY 3: GOLDEN HORIZON ENTERPRISES L.L.C (TRIAL)

### Company Details
- **Company ID**: company-2
- **Legal Name**: GOLDEN HORIZON ENTERPRISES L.L.C
- **Email**: business@goldenhorizon.ae
- **TRN (Tax Registration Number)**: 100587234891002
- **Status**: Active

### Personal User Account
- **Username**: golden_user
- **Password**: password123
- **Role**: person

### Data Structure
- 2 Tax Registrations (VAT + Corporate Tax)
- 6 VAT Returns (same structure as main company)
- 2 Corporate Tax Returns
- 7 Payment Records
- 3 Correspondence Messages

---

## DATABASE TABLES

### Database Schema
The following tables are fully populated with seed data:

1. **companies** - 3 active companies
2. **users** - 3 user accounts (1 admin, 2 corporate)
3. **registrations** - 6 tax registrations (2 per company)
4. **vat_returns** - 18 VAT returns (6 per company)
5. **corporate_tax_returns** - 6 corporate tax returns (2 per company)
6. **payments** - 21 payment records (7 per company)
7. **correspondence** - 9 correspondence messages (3 per company)

### Total Data Records
- **Companies**: 3
- **Users**: 3
- **Registrations**: 6
- **VAT Returns**: 18
- **Corporate Tax Returns**: 6
- **Payments**: 21
- **Correspondence**: 9
- **TOTAL RECORDS**: 72

---

## KEY FEATURES DEMONSTRATED

### 1. Multi-Company Support
- Each company has isolated data
- Role-based access control (admin vs corporate vs person)
- Company-specific registrations and filings

### 2. Complete Tax Filing History
- Multiple years of VAT returns
- Different filing statuses (Submitted, Draft, Overdue)
- Realistic amounts and calculations

### 3. Payment Tracking
- Mix of outstanding and paid payments
- Multiple payment types (VAT, Corporate Tax)
- Due date management

### 4. Tax Registration Management
- Active VAT and Corporate Tax registrations
- TRN assignment
- Effective dates

### 5. Communication Log
- Official correspondence from FTA
- Status tracking (Read/Unread)
- Historical records

---

## CREDENTIALS QUICK REFERENCE

### Main Company (MOHAMMAD SHAFIULALAM)
- **URL**: http://localhost:3000
- **Username**: admin
- **Password**: admin
- **Role**: admin
- **TRN**: 100354945600003

### Trial Company 1 (AL MARJAN)
- **Username**: almarjan_user
- **Password**: password123
- **Role**: corporate
- **TRN**: 100465892376001

### Trial Company 2 (GOLDEN HORIZON)
- **Username**: golden_user
- **Password**: password123
- **Role**: person
- **TRN**: 100587234891002

---

## DATABASE LOCATION
**File**: `database.db` (SQLite format)
**Location**: `c:\Users\jinzs\OneDrive\Desktop\EMARAFTA\EFTAXAE-1\database.db`

---

## NOTES
- All timestamps use UTC ISO 8601 format
- Currency figures are in AED (Arab Emirates Dirham)
- Database is automatically seeded on first run
- Seed data is skipped if data already exists in the database
- To re-seed, delete `database.db` and restart the server

