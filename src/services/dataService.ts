import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  orderBy,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  VATReturn, 
  Payment, 
  CorporateTaxReturn, 
  Correspondence, 
  Registration, 
  Document,
  UserProfile
} from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const dataService = {
  // VAT Returns
  async getVATReturns(userId?: string): Promise<VATReturn[]> {
    const path = 'vat_returns';
    try {
      let q = query(collection(db, path), orderBy('period', 'desc'));
      if (userId) {
        q = query(collection(db, path), where('userId', '==', userId), orderBy('period', 'desc'));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VATReturn));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getVATReturn(id: string): Promise<VATReturn | null> {
    const path = `vat_returns/${id}`;
    try {
      const docSnap = await getDoc(doc(db, 'vat_returns', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as VATReturn;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async saveVATReturn(data: any) {
    const path = 'vat_returns';
    try {
      if (data.id) {
        const docRef = doc(db, path, data.id);
        await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
        return data.id;
      } else {
        const docRef = await addDoc(collection(db, path), {
          ...data,
          userId: auth.currentUser?.uid,
          createdAt: new Date().toISOString()
        });
        return docRef.id;
      }
    } catch (error) {
      handleFirestoreError(error, data.id ? OperationType.UPDATE : OperationType.CREATE, path);
      throw error;
    }
  },

  async deleteVATReturn(id: string) {
    const path = `vat_returns/${id}`;
    try {
      await deleteDoc(doc(db, 'vat_returns', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      throw error;
    }
  },

  // Payments
  async getPayments(userId?: string): Promise<Payment[]> {
    const path = 'payments';
    try {
      let q = query(collection(db, path), orderBy('dueDate', 'desc'));
      if (userId) {
        q = query(collection(db, path), where('userId', '==', userId), orderBy('dueDate', 'desc'));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async savePayment(data: { type: string, amount: number, status: string, dueDate: string }) {
    const path = 'payments';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        userId: auth.currentUser?.uid,
        createdAt: new Date().toISOString()
      });
      const newDoc = await getDoc(docRef);
      return { id: newDoc.id, ...newDoc.data() } as Payment;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  async updatePaymentStatus(id: string, status: string) {
    const path = `payments/${id}`;
    try {
      const docRef = doc(db, 'payments', id);
      await updateDoc(docRef, { status });
      const updatedDoc = await getDoc(docRef);
      return { id: updatedDoc.id, ...updatedDoc.data() } as Payment;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  // Corporate Tax
  async getCorporateTaxReturns(userId?: string): Promise<CorporateTaxReturn[]> {
    const path = 'corporate_tax_returns';
    try {
      let q = query(collection(db, path), orderBy('accountingPeriod', 'desc'));
      if (userId) {
        q = query(collection(db, path), where('userId', '==', userId), orderBy('accountingPeriod', 'desc'));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CorporateTaxReturn));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async saveCorporateTaxReturn(data: any) {
    const path = 'corporate_tax_returns';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        userId: auth.currentUser?.uid,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  async deleteCorporateTaxReturn(id: string) {
    const path = `corporate_tax_returns/${id}`;
    try {
      await deleteDoc(doc(db, 'corporate_tax_returns', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      throw error;
    }
  },

  async getVATRefunds(): Promise<any[]> {
    return [];
  },

  async getCorrespondence(userId?: string): Promise<Correspondence[]> {
    const path = 'correspondence';
    try {
      let q = query(collection(db, path), orderBy('createdAt', 'desc'));
      if (userId) {
        q = query(collection(db, path), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Correspondence));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getRegistrations(userId?: string): Promise<Registration[]> {
    const path = 'registrations';
    try {
      let q = query(collection(db, path));
      if (userId) {
        q = query(collection(db, path), where('userId', '==', userId));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getDocuments(userId?: string): Promise<Document[]> {
    const path = 'documents';
    try {
      let q = query(collection(db, path), orderBy('createdAt', 'desc'));
      if (userId) {
        q = query(collection(db, path), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getDocumentsByVATReturn(vatReturnId: string): Promise<Document[]> {
    const path = 'documents';
    try {
      const q = query(collection(db, path), where('vatReturnId', '==', vatReturnId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async uploadDocument(data: { vatReturnId: string, fileName: string, fileType: string, fileData: string }) {
    const path = 'documents';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        userId: auth.currentUser?.uid,
        createdAt: new Date().toISOString()
      });
      const newDoc = await getDoc(docRef);
      return { id: newDoc.id, ...newDoc.data() } as Document;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  async downloadDocument(id: string) {
    const path = `documents/${id}`;
    try {
      const docSnap = await getDoc(doc(db, 'documents', id));
      if (!docSnap.exists()) throw new Error('Document not found');
      const docData = docSnap.data() as Document;
      
      const link = document.createElement('a');
      link.href = docData.fileData || '';
      link.download = docData.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      throw error;
    }
  },

  async sendReceipt(data: { amount: number, reference: string, email: string }) {
    // This would typically be a cloud function or a backend call.
    // For now, we'll just simulate success.
    console.log('Sending receipt:', data);
    return { success: true };
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const path = 'users';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async seedData(): Promise<void> {
    const vatReturns = [
      { userId: auth.currentUser?.uid, status: 'Filed', period: '2023-Q4', vatRef: 'VAT-2023-001', periodFrom: '2023-10-01', periodTo: '2023-12-31', totalSales: 1250000, totalVAT: 62500, totalExpenses: 850000, totalRecoverableVAT: 42500, netVAT: 20000, dueDate: '2024-01-28', filedAt: '2024-01-15', createdAt: new Date().toISOString() },
      { userId: auth.currentUser?.uid, status: 'Filed', period: '2023-Q3', vatRef: 'VAT-2023-002', periodFrom: '2023-07-01', periodTo: '2023-09-30', totalSales: 1100000, totalVAT: 55000, totalExpenses: 750000, totalRecoverableVAT: 37500, netVAT: 17500, dueDate: '2023-10-28', filedAt: '2023-10-10', createdAt: new Date().toISOString() },
      { userId: auth.currentUser?.uid, status: 'Overdue', period: '2024-Q1', vatRef: 'VAT-2024-001', periodFrom: '2024-01-01', periodTo: '2024-03-31', totalSales: 0, totalVAT: 0, totalExpenses: 0, totalRecoverableVAT: 0, netVAT: 0, dueDate: '2024-04-28', createdAt: new Date().toISOString() }
    ];

    const payments = [
      { userId: auth.currentUser?.uid, type: 'VAT Payment', amount: 20000, status: 'Paid', dueDate: '2024-01-28', paidAt: '2024-01-20', createdAt: new Date().toISOString() },
      { userId: auth.currentUser?.uid, type: 'Corporate Tax', amount: 45000, status: 'Outstanding', dueDate: '2024-06-30', createdAt: new Date().toISOString() },
      { userId: auth.currentUser?.uid, type: 'Penalty', amount: 500, status: 'Paid', dueDate: '2023-12-15', paidAt: '2023-12-14', createdAt: new Date().toISOString() }
    ];

    const correspondence = [
      { userId: auth.currentUser?.uid, subject: 'VAT Registration Certificate', fromName: 'FTA Admin', date: '2023-01-15', type: 'Certificate', status: 'Read', content: 'Your VAT registration has been approved. Please find the certificate attached.', createdAt: new Date().toISOString() },
      { userId: auth.currentUser?.uid, subject: 'Tax Audit Notification', fromName: 'Audit Department', date: '2024-02-10', type: 'Audit', status: 'Unread', content: 'Your entity has been selected for a routine tax audit for the period 2023.', createdAt: new Date().toISOString() },
      { userId: auth.currentUser?.uid, subject: 'New Service Update', fromName: 'System', date: '2024-03-01', type: 'Message', status: 'Read', content: 'We have updated our corporate tax filing portal with new features.', createdAt: new Date().toISOString() }
    ];

    const registrations = [
      { userId: auth.currentUser?.uid, taxType: 'VAT', trn: '100234567890003', status: 'Active', effectiveDate: '2023-01-01', entityName: 'Global Trading LLC' },
      { userId: auth.currentUser?.uid, taxType: 'Corporate Tax', trn: '200567890123456', status: 'Active', effectiveDate: '2023-06-01', entityName: 'Global Trading LLC' }
    ];

    for (const v of vatReturns) await addDoc(collection(db, 'vat_returns'), v);
    for (const p of payments) await addDoc(collection(db, 'payments'), p);
    for (const c of correspondence) await addDoc(collection(db, 'correspondence'), c);
    for (const r of registrations) await addDoc(collection(db, 'registrations'), r);
  }
};
