# Multi-Company API Routes Update Guide

## Overview
All API routes that access user data need to be updated to filter by both `userId` AND `companyId`. The companyId is available in `req.user.companyId` after authentication.

## Updated Routes Summary

### Pattern
Change from:
```typescript
db.prepare('SELECT * FROM table WHERE userId = ?').all(req.user.id)
```

To:
```typescript
db.prepare('SELECT * FROM table WHERE userId = ? AND companyId = ?').all(req.user.id, req.user.companyId)
```

## Routes to Update

### VAT Returns
- ✅ GET /api/vat_returns - DONE
- [ ] GET /api/vat_returns/:id - Update WHERE clause
- [ ] POST /api/vat_returns - Add companyId to INSERT
- [ ] PUT /api/vat_returns/:id - Add companyId to WHERE
- [ ] DELETE /api/vat_returns/:id - Add companyId to WHERE

### Payments
- [ ] GET /api/payments - Add companyId filter
- [ ] POST /api/payments - Add companyId to INSERT
- [ ] PUT /api/payments/:id - Add companyId to WHERE

### Corporate Tax Returns
- [ ] GET /api/corporate_tax_returns - Add companyId filter
- [ ] POST /api/corporate_tax_returns - Add companyId to INSERT
- [ ] DELETE /api/corporate_tax_returns/:id - Add companyId to WHERE

### Correspondence
- [ ] GET /api/correspondence - Add companyId filter

### Registrations
- [ ] GET /api/registrations - Add companyId filter

### Documents
- [ ] GET /api/documents - Add companyId filter (JOIN with vat_returns)
- [ ] GET /api/documents/:vatReturnId - Add companyId filter
- [ ] GET /api/documents/download/:id - Add companyId filter
- [ ] POST /api/documents/upload - Add companyId to INSERT

### Receipt/Email
- [ ] POST /api/send-receipt - Add companyId to INSERT

## Example Updates

### GET /api/payments
```typescript
// Before
app.get('/api/payments', authenticateToken, (req: any, res) => {
  const payments = db.prepare('SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);
  res.json(payments);
});

// After
app.get('/api/payments', authenticateToken, (req: any, res) => {
  const payments = db.prepare('SELECT * FROM payments WHERE userId = ? AND companyId = ? ORDER BY createdAt DESC').all(req.user.id, req.user.companyId);
  res.json(payments);
});
```

### POST /api/payments
```typescript
// Before
stmt.run(id, req.user.id, type, amount, status, dueDate, status === 'Paid' ? now : null, now);

// After
stmt.run(id, req.user.id, req.user.companyId, type, amount, status, dueDate, status === 'Paid' ? now : null, now);
```

### GET /api/documents (with JOIN)
```typescript
// Before
const docs = db.prepare(`
  SELECT d.id, d.userId, d.vatReturnId, d.fileName, d.fileType, d.createdAt, v.vatRef 
  FROM documents d
  JOIN vat_returns v ON d.vatReturnId = v.id
  WHERE d.userId = ?`).all(req.user.id);

// After
const docs = db.prepare(`
  SELECT d.id, d.userId, d.vatReturnId, d.fileName, d.fileType, d.createdAt, v.vatRef 
  FROM documents d
  JOIN vat_returns v ON d.vatReturnId = v.id
  WHERE d.userId = ? AND d.companyId = ?`).all(req.user.id, req.user.companyId);
```

## Step-by-Step Instructions

1. Search for all database queries in server.ts that reference data tables
2. For each SELECT query: add `AND companyId = ?` to WHERE clause
3. For each INSERT query: add `companyId` column and `?, req.user.companyId` to VALUES
4. For each UPDATE query: add `AND companyId = ?` to WHERE clause  
5. For each DELETE query: add `AND companyId = ?` to WHERE clause
6. Update all parameter counts in prepared statements

## Test Cases After Update

1. Login as admin/admin - should see admin company data only
2. Login as corporate_user/password123 - should see company-1 data only
3. Login as person_user/password123 - should see company-2 data only
4. Register a new company and create a user - verify data isolation
5. Verify no cross-company data leakage

## Notes
- JWT token includes `companyId` from login response
- `req.user.companyId` is available in all authenticated routes
- All data is automatically scoped to the user's company
- Users cannot access data from other companies
