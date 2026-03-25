import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.db');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE,
    email TEXT UNIQUE,
    trn TEXT,
    status TEXT,
    createdBy TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    displayName TEXT,
    role TEXT,
    companyId TEXT,
    createdAt TEXT,
    FOREIGN KEY(companyId) REFERENCES companies(id)
  );

  CREATE TABLE IF NOT EXISTS vat_returns (
    id TEXT PRIMARY KEY,
    userId TEXT,
    companyId TEXT,
    status TEXT,
    period TEXT,
    vatRef TEXT,
    periodFrom TEXT,
    periodTo TEXT,
    taxYearEnd TEXT,
    totalSales REAL,
    totalVAT REAL,
    totalExpenses REAL,
    totalRecoverableVAT REAL,
    netVAT REAL,
    dueDate TEXT,
    filedAt TEXT,
    updatedAt TEXT,
    createdAt TEXT,
    formData TEXT,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(companyId) REFERENCES companies(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    userId TEXT,
    companyId TEXT,
    type TEXT,
    amount REAL,
    status TEXT,
    dueDate TEXT,
    paidAt TEXT,
    createdAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(companyId) REFERENCES companies(id)
  );

  CREATE TABLE IF NOT EXISTS corporate_tax_returns (
    id TEXT PRIMARY KEY,
    userId TEXT,
    companyId TEXT,
    status TEXT,
    period TEXT,
    netTax REAL,
    dueDate TEXT,
    filedAt TEXT,
    updatedAt TEXT,
    createdAt TEXT,
    formData TEXT,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(companyId) REFERENCES companies(id)
  );

  CREATE TABLE IF NOT EXISTS correspondence (
    id TEXT PRIMARY KEY,
    userId TEXT,
    companyId TEXT,
    subject TEXT,
    fromName TEXT,
    date TEXT,
    status TEXT,
    content TEXT,
    createdAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(companyId) REFERENCES companies(id)
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    userId TEXT,
    companyId TEXT,
    taxType TEXT,
    trn TEXT,
    status TEXT,
    effectiveDate TEXT,
    entityName TEXT,
    createdAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(companyId) REFERENCES companies(id)
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    userId TEXT,
    companyId TEXT,
    vatReturnId TEXT,
    fileName TEXT,
    fileType TEXT,
    fileData TEXT,
    createdAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(companyId) REFERENCES companies(id),
    FOREIGN KEY(vatReturnId) REFERENCES vat_returns(id)
  );
`);

// Seed Database
async function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  if (userCount.count > 0) return;

  console.log('Seeding database with mock data...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin', 10);
  const now = new Date().toISOString();

  // Create Companies
  const companies = [
    { id: 'company-admin', name: 'MOHAMMAD SHAFIULALAM VEGETABLES & FRUITS TRADING L.L.C.', email: 'info@shafiulalamtrading.com', trn: '100354945600003', status: 'Active', createdBy: 'system' },
    { id: 'company-1', name: 'AL MARJAN INTERNATIONAL TRADING LLC', email: 'contact@almarjantrading.ae', trn: '100465892376001', status: 'Active', createdBy: 'system' },
    { id: 'company-2', name: 'GOLDEN HORIZON ENTERPRISES L.L.C', email: 'business@goldenhorizon.ae', trn: '100587234891002', status: 'Active', createdBy: 'system' }
  ];

  const insertCompany = db.prepare('INSERT INTO companies (id, name, email, trn, status, createdBy, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const c of companies) {
    insertCompany.run(c.id, c.name, c.email, c.trn, c.status, c.createdBy, now);
  }

  // Create Users
  const users = [
    { id: 'admin-id', username: 'admin', email: 'info@shafiulalamtrading.com', password: adminPassword, displayName: 'MOHAMMAD SHAFIULALAM VEGETABLES & FRUITS TRADING L.L.C.', role: 'admin', companyId: 'company-admin' },
    { id: 'user-1', username: 'almarjan_user', email: 'contact@almarjantrading.ae', password: hashedPassword, displayName: 'AL MARJAN INTERNATIONAL TRADING LLC', role: 'corporate', companyId: 'company-1' },
    { id: 'user-2', username: 'golden_user', email: 'business@goldenhorizon.ae', password: hashedPassword, displayName: 'GOLDEN HORIZON ENTERPRISES L.L.C', role: 'person', companyId: 'company-2' }
  ];

  const insertUser = db.prepare('INSERT INTO users (id, username, email, password, displayName, role, companyId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  for (const u of users) {
    insertUser.run(u.id, u.username, u.email, u.password, u.displayName, u.role, u.companyId, now);
  }

  // Helper to seed data for a user
  const seedUserData = (userId: string, companyId: string, entityName: string, trn: string) => {
    // Create Registrations
    const registrations = [
      { id: `reg-vat-${userId}`, userId, companyId, taxType: 'VAT', trn: trn, status: 'Active', effectiveDate: '2024-01-01', entityName },
      { id: `reg-ct-${userId}`, userId, companyId, taxType: 'Corporate Tax', trn: trn, status: 'Active', effectiveDate: '2024-06-01', entityName }
    ];
    const insertReg = db.prepare('INSERT INTO registrations (id, userId, companyId, taxType, trn, status, effectiveDate, entityName, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const r of registrations) {
      insertReg.run(r.id, r.userId, r.companyId, r.taxType, r.trn, r.status, r.effectiveDate, r.entityName, now);
    }

    // Create VAT Returns
    const createVatFormData = (period: string, periodFrom: string, periodTo: string, taxYearEnd: string, totalSales: number, totalVAT: number, totalExpenses: number, totalRecoverableVAT: number, dueDate: string, vatRef: string, goodsImportedAmount: number = 0, goodsImportedVat: number = 0, dubaiSalesAmount: number = 0, dubaiSalesVat: number = 0, stdExpensesAmount: number = 0, stdExpensesVat: number = 0) => ({
      vatRef,
      period,
      periodFrom,
      periodTo,
      taxYearEnd,
      dueDate,
      status: 'Submitted',
      stagger: 'Stagger 2 - Quarterly (Mar to Feb)',
      sales: {
        standardRated: {
          abuDhabi: { amount: 0, vat: 0, adjustment: 0 },
          dubai: { amount: dubaiSalesAmount, vat: dubaiSalesVat, adjustment: 0 },
          sharjah: { amount: 0, vat: 0, adjustment: 0 },
          ajman: { amount: 0, vat: 0, adjustment: 0 },
          ummAlQuwain: { amount: 0, vat: 0, adjustment: 0 },
          rasAlKhaimah: { amount: 0, vat: 0, adjustment: 0 },
          fujairah: { amount: 0, vat: 0, adjustment: 0 },
        },
        touristRefunds: { amount: 0, vat: 0, adjustment: 0 },
        reverseCharge: { amount: 0, vat: 0 },
        zeroRated: { amount: 0 },
        exempt: { amount: 0 },
        goodsImported: { amount: goodsImportedAmount, vat: goodsImportedVat },
        adjustmentsImports: { amount: 0, vat: 0 },
      },
      expenses: {
        standardRated: { amount: stdExpensesAmount, vat: stdExpensesVat, adjustment: 0 },
        reverseCharge: { amount: goodsImportedAmount, vat: goodsImportedVat, adjustment: 0 },
      },
      refundRequest: 'Yes',
      profitMarginScheme: 'No'
    });

    const vatReturns = [
      { 
        id: `vat-img-1-${userId}`, 
        userId, 
        companyId,
        status: 'Submitted', 
        period: '01/12/2025 - 28/02/2026', 
        vatRef: '230010165962',
        periodFrom: '01/12/2025',
        periodTo: '28/02/2026',
        taxYearEnd: '28/02/2026',
        totalSales: 3121416.78, 
        totalVAT: 156070.84, 
        totalExpenses: 2558941.13, 
        totalRecoverableVAT: 127947.06, 
        netVAT: 28123.78, 
        dueDate: '30/03/2026', 
        filedAt: '2026-03-23T19:40:03Z', 
        formData: createVatFormData(
          '01/12/2025 - 28/02/2026', 
          '01/12/2025', 
          '28/02/2026', 
          '28/02/2026', 
          3121416.78, 
          156070.84, 
          2558941.13, 
          127947.06, 
          '30/03/2026', 
          '230010165962', 
          519580.13, 
          25979.01,
          2601836.65,
          130091.83,
          2039361.00,
          101968.05
        )
      },
      { 
        id: `vat-img-2-${userId}`, 
        userId, 
        status: 'Submitted', 
        period: '01/09/2025 - 30/11/2025', 
        vatRef: '230009650203',
        periodFrom: '01/09/2025',
        periodTo: '30/11/2025',
        taxYearEnd: '28/02/2026',
        totalSales: 0, 
        totalVAT: 0, 
        totalExpenses: 445976.20, 
        totalRecoverableVAT: 22298.81, 
        netVAT: 22298.81, 
        dueDate: '29/12/2025', 
        filedAt: '2025-12-25T10:00:00Z', 
        formData: createVatFormData('01/09/2025 - 30/11/2025', '01/09/2025', '30/11/2025', '28/02/2026', 0, 0, 445976.20, 22298.81, '29/12/2025', '230009650203')
      },
      { 
        id: `vat-img-3-${userId}`, 
        userId, 
        status: 'Submitted', 
        period: '01/06/2025 - 31/08/2025', 
        vatRef: '230009007872',
        periodFrom: '01/06/2025',
        periodTo: '31/08/2025',
        taxYearEnd: '28/02/2026',
        totalSales: 0, 
        totalVAT: 0, 
        totalExpenses: 123245.60, 
        totalRecoverableVAT: 6162.28, 
        netVAT: 6162.28, 
        dueDate: '29/09/2025', 
        filedAt: '2025-09-26T10:00:00Z', 
        formData: createVatFormData('01/06/2025 - 31/08/2025', '01/06/2025', '31/08/2025', '28/02/2026', 0, 0, 123245.60, 6162.28, '29/09/2025', '230009007872')
      },
      { 
        id: `vat-img-4-${userId}`, 
        userId, 
        status: 'Submitted', 
        period: '01/03/2025 - 31/05/2025', 
        vatRef: '230008349468',
        periodFrom: '01/03/2025',
        periodTo: '31/05/2025',
        taxYearEnd: '28/02/2026',
        totalSales: 132939.60, 
        totalVAT: 6646.98, 
        totalExpenses: 0, 
        totalRecoverableVAT: 0, 
        netVAT: 6646.98, 
        dueDate: '30/06/2025', 
        filedAt: '2025-06-24T10:00:00Z', 
        formData: createVatFormData('01/03/2025 - 31/05/2025', '01/03/2025', '31/05/2025', '28/02/2026', 132939.60, 6646.98, 0, 0, '30/06/2025', '230008349468')
      },
      { 
        id: `vat-img-5-${userId}`, 
        userId, 
        status: 'Submitted', 
        period: '01/12/2024 - 28/02/2025', 
        vatRef: '230007923042',
        periodFrom: '01/12/2024',
        periodTo: '28/02/2025',
        taxYearEnd: '28/02/2025',
        totalSales: 499780.20, 
        totalVAT: 24989.01, 
        totalExpenses: 0, 
        totalRecoverableVAT: 0, 
        netVAT: 24989.01, 
        dueDate: '28/03/2025', 
        filedAt: '2025-03-25T10:00:00Z', 
        formData: createVatFormData('01/12/2024 - 28/02/2025', '01/12/2024', '28/02/2025', '28/02/2025', 499780.20, 24989.01, 0, 0, '28/03/2025', '230007923042')
      },
      { 
        id: `vat-img-6-${userId}`, 
        userId, 
        status: 'Overdue', 
        period: '01/09/2024 - 30/11/2024', 
        vatRef: '230007123456',
        periodFrom: '01/09/2024',
        periodTo: '30/11/2024',
        taxYearEnd: '28/02/2025',
        totalSales: 250000.00, 
        totalVAT: 12500.00, 
        totalExpenses: 0, 
        totalRecoverableVAT: 0, 
        netVAT: 12500.00, 
        dueDate: '29/12/2024', 
        filedAt: null, 
        formData: createVatFormData('01/09/2024 - 30/11/2024', '01/09/2024', '30/11/2024', '28/02/2025', 250000.00, 12500.00, 0, 0, '29/12/2024', '230007123456')
      }
    ];
    const insertVAT = db.prepare(`
      INSERT INTO vat_returns (id, userId, companyId, status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate, filedAt, updatedAt, createdAt, formData)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const v of vatReturns) {
      insertVAT.run(v.id, v.userId, v.companyId, v.status, v.period, v.vatRef, v.periodFrom, v.periodTo, v.taxYearEnd, v.totalSales, v.totalVAT, v.totalExpenses, v.totalRecoverableVAT, v.netVAT, v.dueDate, v.filedAt, now, now, JSON.stringify(v.formData));
    }

    // Create Corporate Tax Returns
    const ctReturns = [
      { id: `ct-1-${userId}`, userId, companyId, status: 'Submitted', period: '2023', netTax: 45000, dueDate: '2024-09-30', filedAt: '2024-08-15', formData: { taxableIncome: 500000 } },
      { id: `ct-2-${userId}`, userId, companyId, status: 'Draft', period: '2024', netTax: 0, dueDate: '2025-09-30', filedAt: null, formData: { taxableIncome: 0 } }
    ];
    const insertCT = db.prepare(`
      INSERT INTO corporate_tax_returns (id, userId, companyId, status, period, netTax, dueDate, filedAt, updatedAt, createdAt, formData)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of ctReturns) {
      insertCT.run(c.id, c.userId, c.companyId, c.status, c.period, c.netTax, c.dueDate, c.filedAt, now, now, JSON.stringify(c.formData));
    }

    // Create Payments
    const payments = [
      { id: `pay-1-${userId}`, userId, companyId, type: 'VAT Payment', amount: 28123.78, status: 'Outstanding', dueDate: '30/03/2026', paidAt: null },
      { id: `pay-2-${userId}`, userId, companyId, type: 'VAT Payment', amount: 22298.81, status: 'Paid', dueDate: '29/12/2025', paidAt: '2025-12-27' },
      { id: `pay-3-${userId}`, userId, companyId, type: 'VAT Payment', amount: 6162.28, status: 'Paid', dueDate: '29/09/2025', paidAt: '2025-09-25' },
      { id: `pay-4-${userId}`, userId, companyId, type: 'VAT Payment', amount: 6646.98, status: 'Paid', dueDate: '30/06/2025', paidAt: '2025-06-28' },
      { id: `pay-5-${userId}`, userId, companyId, type: 'VAT Payment', amount: 24989.01, status: 'Paid', dueDate: '28/03/2025', paidAt: '2025-03-26' },
      { id: `pay-6-${userId}`, userId, companyId, type: 'VAT Payment', amount: 12500.00, status: 'Outstanding', dueDate: '29/12/2024', paidAt: null },
      { id: `pay-ct-1-${userId}`, userId, companyId, type: 'Corporate Tax', amount: 45000, status: 'Outstanding', dueDate: '30/09/2024', paidAt: null }
    ];
    const insertPayment = db.prepare(`
      INSERT INTO payments (id, userId, companyId, type, amount, status, dueDate, paidAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of payments) {
      insertPayment.run(p.id, p.userId, p.companyId, p.type, p.amount, p.status, p.dueDate, p.paidAt, now);
    }

    // Create Correspondence
    const correspondence = [
      { id: `msg-1-${userId}`, userId, companyId, subject: 'VAT Registration Approved', fromName: 'FTA Admin', date: '2024-01-12', status: 'Read', content: 'Your VAT registration has been approved. Your TRN is 100234567890003.' },
      { id: `msg-2-${userId}`, userId, companyId, subject: 'Corporate Tax Deadline Reminder', fromName: 'Tax System', date: '2024-08-01', status: 'Unread', content: 'This is a reminder that your Corporate Tax return for 2023 is due by 30 Sep 2024.' },
      { id: `msg-3-${userId}`, userId, companyId, subject: 'Tax Certificate Issued', fromName: 'FTA Admin', date: '2024-05-15', status: 'Read', content: 'Your Tax Residency Certificate has been issued and is available for download.' }
    ];
    const insertMsg = db.prepare(`
      INSERT INTO correspondence (id, userId, companyId, subject, fromName, date, status, content, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const m of correspondence) {
      insertMsg.run(m.id, m.userId, m.companyId, m.subject, m.fromName, m.date, m.status, m.content, now);
    }
  };

  seedUserData('admin-id', 'company-admin', 'MOHAMMAD SHAFIULALAM VEGETABLES & FRUITS TRADING L.L.C.', '100354945600003');
  seedUserData('user-1', 'company-1', 'AL MARJAN INTERNATIONAL TRADING LLC', '100465892376001');
  seedUserData('user-2', 'company-2', 'GOLDEN HORIZON ENTERPRISES L.L.C', '100587234891002');

  console.log('Database seeded successfully.');
}

async function startServer() {
  await seedDatabase();
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/companies', (req, res) => {
    const companies = db.prepare('SELECT id, name, email FROM companies WHERE status = ?').all('Active');
    res.json(companies);
  });

  app.post('/api/companies', async (req, res) => {
    const { name, email, trn } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    try {
      const stmt = db.prepare('INSERT INTO companies (id, name, email, trn, status, createdBy, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
      stmt.run(id, name, email, trn || null, 'Active', 'user', now);
      res.status(201).json({ id, name, email });
    } catch (err: any) {
      console.error(`Company registration failed:`, err);
      res.status(400).json({ error: err.message || 'Company name or email already exists' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    const { username, password, displayName, role, companyId } = req.body;
    console.log(`Registration attempt for: ${username}`);
    const id = Math.random().toString(36).substr(2, 9);
    const hashedPassword = await bcrypt.hash(password, 10);
    const email = `${username.toLowerCase()}@emara.tax`;
    const createdAt = new Date().toISOString();

    if (!companyId) {
      return res.status(400).json({ error: 'Company selection is required' });
    }

    try {
      const stmt = db.prepare('INSERT INTO users (id, username, email, password, displayName, role, companyId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      stmt.run(id, username, email, hashedPassword, displayName, role || 'corporate', companyId, createdAt);
      console.log(`User created: ${username}`);
      res.status(201).json({ message: 'User created' });
    } catch (err) {
      console.error(`Registration failed for ${username}:`, err);
      res.status(400).json({ error: 'Username already exists' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for: ${username}`);
    // Cookie options: secure only in production for local test compatibility
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
    };

    // Try to find user by username or email
    const user = db.prepare('SELECT u.*, c.name as companyName FROM users u LEFT JOIN companies c ON u.companyId = c.id WHERE u.username = ? OR u.email = ?').get(username, username) as any;

    if (!user) {
      console.log(`User not found: ${username}`);
    } else {
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log(`User found: ${user.username}, Password match: ${passwordMatch}`);
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Auto-create admin if not exists and trying to login with admin/admin
      if (username === 'admin' && password === 'admin') {
        console.log('Auto-creating admin user and company...');
        const adminCompanyId = 'company-admin';
        const adminId = 'admin-id';
        const hashedPassword = await bcrypt.hash('admin', 10);
        const email = 'info@shafiulalamtrading.com';
        const now = new Date().toISOString();
        db.prepare('INSERT OR IGNORE INTO companies (id, name, email, status, createdBy, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
          adminCompanyId, 'MOHAMMAD SHAFIULALAM VEGETABLES & FRUITS TRADING L.L.C.', email, 'Active', 'system', now
        );
        db.prepare('INSERT OR IGNORE INTO users (id, username, email, password, displayName, role, companyId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
          adminId, 'admin', email, hashedPassword, 'MOHAMMAD SHAFIULALAM VEGETABLES & FRUITS TRADING L.L.C.', 'admin', adminCompanyId, now
        );
        const newUser = db.prepare('SELECT u.*, c.name as companyName FROM users u LEFT JOIN companies c ON u.companyId = c.id WHERE u.username = ?').get('admin') as any;
        const token = jwt.sign({ id: newUser.id, username: newUser.username, companyId: newUser.companyId }, JWT_SECRET);
        res.cookie('token', token, cookieOptions);
        console.log('Admin auto-created and logged in.');
        return res.json({ user: { id: newUser.id, username: newUser.username, displayName: newUser.displayName, role: newUser.role, companyId: newUser.companyId, companyName: newUser.companyName } });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, companyId: user.companyId }, JWT_SECRET);
    res.cookie('token', token, cookieOptions);
    res.json({ user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role, companyId: user.companyId, companyName: user.companyName } });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const user = db.prepare('SELECT u.id, u.username, u.email, u.displayName, u.role, u.companyId, u.createdAt, c.name as companyName FROM users u LEFT JOIN companies c ON u.companyId = c.id WHERE u.id = ?').get(req.user.id) as any;
    res.json(user);
  });

  // VAT Return Routes
  app.get('/api/vat_returns', authenticateToken, (req: any, res) => {
    try {
      const returns = db.prepare('SELECT * FROM vat_returns WHERE userId = ? AND companyId = ? ORDER BY updatedAt DESC').all(req.user.id, req.user.companyId);
      res.json(returns.map((r: any) => ({ 
        ...r, 
        formData: r.formData ? JSON.parse(r.formData) : null 
      })));
    } catch (error) {
      console.error('Error in GET /api/vat_returns:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/vat_returns/:id', authenticateToken, (req: any, res) => {
    const r = db.prepare('SELECT * FROM vat_returns WHERE id = ? AND userId = ? AND companyId = ?').get(req.params.id, req.user.id, req.user.companyId) as any;
    if (!r) return res.sendStatus(404);
    res.json({ 
      ...r, 
      formData: r.formData ? JSON.parse(r.formData) : null 
    });
  });

  app.post('/api/vat_returns', authenticateToken, (req: any, res) => {
    const id = Math.random().toString(36).substr(2, 9);
    const { status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate, formData } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO vat_returns (id, userId, companyId, status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate, filedAt, updatedAt, createdAt, formData)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id, req.user.id, req.user.companyId, status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate, 
      status === 'Submitted' ? now : null, now, now, JSON.stringify(formData)
    );
    
    res.status(201).json({ id });
  });

  app.put('/api/vat_returns/:id', authenticateToken, (req: any, res) => {
    const { status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate, formData } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE vat_returns 
      SET status = ?, period = ?, vatRef = ?, periodFrom = ?, periodTo = ?, taxYearEnd = ?, totalSales = ?, totalVAT = ?, totalExpenses = ?, totalRecoverableVAT = ?, netVAT = ?, dueDate = ?, filedAt = ?, updatedAt = ?, formData = ?
      WHERE id = ? AND userId = ? AND companyId = ?
    `);
    
    const result = stmt.run(
      status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate,
      status === 'Submitted' ? now : null, now, JSON.stringify(formData),
      req.params.id, req.user.id, req.user.companyId
    );
    
    if (result.changes === 0) return res.sendStatus(404);
    res.json({ message: 'Updated' });
  });

  app.delete('/api/vat_returns/:id', authenticateToken, (req: any, res) => {
    const result = db.prepare('DELETE FROM vat_returns WHERE id = ? AND userId = ? AND companyId = ?').run(req.params.id, req.user.id, req.user.companyId);
    if (result.changes === 0) return res.sendStatus(404);
    res.json({ message: 'Deleted' });
  });

  // Payment Routes
  app.get('/api/payments', authenticateToken, (req: any, res) => {
    const payments = db.prepare('SELECT * FROM payments WHERE userId = ? AND companyId = ? ORDER BY createdAt DESC').all(req.user.id, req.user.companyId);
    res.json(payments);
  });

  app.post('/api/payments', authenticateToken, (req: any, res) => {
    const id = Math.random().toString(36).substr(2, 9);
    const { type, amount, status, dueDate } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO payments (id, userId, companyId, type, amount, status, dueDate, paidAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, req.user.id, req.user.companyId, type, amount, status, dueDate, status === 'Paid' ? now : null, now);
    res.status(201).json({ id });
  });

  app.put('/api/payments/:id', authenticateToken, (req: any, res) => {
    const { status } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE payments 
      SET status = ?, paidAt = ?
      WHERE id = ? AND userId = ? AND companyId = ?
    `);
    
    const result = stmt.run(status, status === 'Paid' ? now : null, req.params.id, req.user.id, req.user.companyId);
    if (result.changes === 0) return res.sendStatus(404);
    res.json({ message: 'Payment updated' });
  });

  // Corporate Tax Routes
  app.get('/api/corporate_tax_returns', authenticateToken, (req: any, res) => {
    try {
      const returns = db.prepare('SELECT * FROM corporate_tax_returns WHERE userId = ? AND companyId = ? ORDER BY updatedAt DESC').all(req.user.id, req.user.companyId);
      res.json(returns.map((r: any) => ({ 
        ...r, 
        formData: r.formData ? JSON.parse(r.formData) : null 
      })));
    } catch (error) {
      console.error('Error in GET /api/corporate_tax_returns:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/corporate_tax_returns', authenticateToken, (req: any, res) => {
    const id = Math.random().toString(36).substr(2, 9);
    const { status, period, netTax, dueDate, formData } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO corporate_tax_returns (id, userId, companyId, status, period, netTax, dueDate, filedAt, updatedAt, createdAt, formData)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, req.user.id, req.user.companyId, status, period, netTax, dueDate, status === 'Submitted' ? now : null, now, now, JSON.stringify(formData));
    res.status(201).json({ id });
  });

  app.delete('/api/corporate_tax_returns/:id', authenticateToken, (req: any, res) => {
    const result = db.prepare('DELETE FROM corporate_tax_returns WHERE id = ? AND userId = ? AND companyId = ?').run(req.params.id, req.user.id, req.user.companyId);
    if (result.changes === 0) return res.sendStatus(404);
    res.json({ message: 'Deleted' });
  });

  // Correspondence Routes
  app.get('/api/correspondence', authenticateToken, (req: any, res) => {
    const correspondence = db.prepare('SELECT * FROM correspondence WHERE userId = ? AND companyId = ? ORDER BY date DESC').all(req.user.id, req.user.companyId);
    res.json(correspondence);
  });

  app.get('/api/registrations', authenticateToken, (req: any, res) => {
    const registrations = db.prepare('SELECT * FROM registrations WHERE userId = ? AND companyId = ? ORDER BY createdAt DESC').all(req.user.id, req.user.companyId);
    res.json(registrations);
  });

  // Document Routes
  app.get('/api/documents', authenticateToken, (req: any, res) => {
    const docs = db.prepare(`
      SELECT d.id, d.userId, d.vatReturnId, d.fileName, d.fileType, d.createdAt, v.vatRef 
      FROM documents d
      JOIN vat_returns v ON d.vatReturnId = v.id
      WHERE d.userId = ? AND d.companyId = ?
      ORDER BY d.createdAt DESC
    `).all(req.user.id, req.user.companyId);
    res.json(docs);
  });

  app.get('/api/documents/:vatReturnId', authenticateToken, (req: any, res) => {
    const docs = db.prepare('SELECT id, userId, vatReturnId, fileName, fileType, createdAt FROM documents WHERE userId = ? AND companyId = ? AND vatReturnId = ?').all(req.user.id, req.user.companyId, req.params.vatReturnId);
    res.json(docs);
  });

  app.get('/api/documents/download/:id', authenticateToken, (req: any, res) => {
    const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND userId = ? AND companyId = ?').get(req.params.id, req.user.id, req.user.companyId) as any;
    if (!doc) return res.sendStatus(404);
    res.json(doc);
  });

  app.post('/api/documents/upload', authenticateToken, (req: any, res) => {
    const id = Math.random().toString(36).substr(2, 9);
    const { vatReturnId, fileName, fileType, fileData } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO documents (id, userId, companyId, vatReturnId, fileName, fileType, fileData, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, req.user.id, req.user.companyId, vatReturnId, fileName, fileType, fileData, now);
    res.status(201).json({ id });
  });

  app.post('/api/send-receipt', authenticateToken, (req: any, res) => {
    const { amount, reference, email } = req.body;
    const fromEmail = 'fta@payaetax.online';
    const toEmail = email || 'fta@payaetax.online';
    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    // 1. Log the "email" sending
    console.log(`[EMAIL SIMULATION] Sending receipt from ${fromEmail} to ${toEmail}`);
    console.log(`[EMAIL SIMULATION] Subject: Payment Receipt - ${reference}`);
    console.log(`[EMAIL SIMULATION] Body: Thank you for your payment of AED ${amount.toLocaleString()}. Reference: ${reference}`);

    // 2. Insert into correspondence (Customer Portal Inbox)
    const content = `
      Dear Taxpayer,
      
      This is an official receipt for your VAT payment.
      
      Payment Reference: ${reference}
      Amount Paid: AED ${amount.toLocaleString()}
      Date: ${new Date().toLocaleString()}
      
      Thank you for your compliance.
      
      Federal Tax Authority
    `;
    
    const stmt = db.prepare(`
      INSERT INTO correspondence (id, userId, subject, fromName, date, status, content, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, req.user.id, `Payment Receipt - ${reference}`, 'Federal Tax Authority', now, 'Unread', content, now);
    
    res.status(200).json({ success: true, id });
  });

  // API 404 Handler
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  // Global API Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    if (req.path.startsWith('/api/')) {
      console.error('API Error:', err);
      return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
    next(err);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
