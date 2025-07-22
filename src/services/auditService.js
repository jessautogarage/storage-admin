// src/services/auditService.js
import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

export const auditService = {
  // Log an action
  async logAction(action) {
    try {
      const user = auth.currentUser;
      const auditEntry = {
        ...action,
        userId: user?.uid || 'system',
        userEmail: user?.email || 'system',
        timestamp: serverTimestamp(),
        ip: await this.getUserIP(),
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId()
      };

      const docRef = await addDoc(collection(db, 'auditLogs'), auditEntry);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error logging audit action:', error);
      // Fail silently to not interrupt the main action
      return { success: false, error: error.message };
    }
  },

  // Log predefined actions
  async logLogin(success, details = {}) {
    return this.logAction({
      category: 'auth',
      action: 'login',
      success,
      details,
      severity: success ? 'info' : 'warning'
    });
  },

  async logLogout() {
    return this.logAction({
      category: 'auth',
      action: 'logout',
      success: true,
      severity: 'info'
    });
  },

  async logUserModification(userId, changes, action = 'update') {
    return this.logAction({
      category: 'user',
      action,
      targetId: userId,
      changes,
      severity: action === 'delete' ? 'high' : 'medium'
    });
  },

  async logPaymentAction(paymentId, action, details = {}) {
    return this.logAction({
      category: 'payment',
      action,
      targetId: paymentId,
      details,
      severity: 'high'
    });
  },

  async logListingAction(listingId, action, details = {}) {
    return this.logAction({
      category: 'listing',
      action,
      targetId: listingId,
      details,
      severity: action === 'delete' ? 'high' : 'medium'
    });
  },

  async logBookingAction(bookingId, action, details = {}) {
    return this.logAction({
      category: 'booking',
      action,
      targetId: bookingId,
      details,
      severity: 'medium'
    });
  },

  async logSystemAction(action, details = {}) {
    return this.logAction({
      category: 'system',
      action,
      details,
      severity: details.severity || 'info'
    });
  },

  async logDataExport(dataType, format, recordCount) {
    return this.logAction({
      category: 'data',
      action: 'export',
      details: {
        dataType,
        format,
        recordCount
      },
      severity: 'medium'
    });
  },

  async logSettingsChange(setting, oldValue, newValue) {
    return this.logAction({
      category: 'settings',
      action: 'update',
      details: {
        setting,
        oldValue,
        newValue
      },
      severity: 'high'
    });
  },

  // Get audit logs with filters
  async getAuditLogs(filters = {}) {
    try {
      let q = collection(db, 'auditLogs');
      const constraints = [];

      // Add order by timestamp
      constraints.push(orderBy('timestamp', 'desc'));

      // Apply filters
      if (filters.category) {
        constraints.push(where('category', '==', filters.category));
      }

      if (filters.userId) {
        constraints.push(where('userId', '==', filters.userId));
      }

      if (filters.startDate) {
        constraints.push(where('timestamp', '>=', filters.startDate));
      }

      if (filters.endDate) {
        constraints.push(where('timestamp', '<=', filters.endDate));
      }

      if (filters.severity) {
        constraints.push(where('severity', '==', filters.severity));
      }

      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }

      q = query(q, ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },

  // Utility functions
  async getUserIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  },

  getSessionId() {
    let sessionId = sessionStorage.getItem('audit_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('audit_session_id', sessionId);
    }
    return sessionId;
  }
};