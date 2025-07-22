// src/services/disputeService.js
import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { notificationService } from './notificationService';
import { auditService } from './auditService';

export const disputeService = {
  // Create a new dispute
  async createDispute(disputeData) {
    try {
      const dispute = {
        ...disputeData,
        status: 'open',
        priority: this.calculatePriority(disputeData),
        timeline: [{
          action: 'dispute_created',
          description: 'Dispute case opened',
          timestamp: serverTimestamp(),
          user: disputeData.reportedBy
        }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'disputes'), dispute);
      
      // Notify admin
      await notificationService.createNotification({
        type: 'dispute',
        title: 'New Dispute Filed',
        message: `${disputeData.reporterName} filed a ${disputeData.type} dispute`,
        data: { disputeId: docRef.id },
        priority: dispute.priority === 'high' ? 'high' : 'normal',
        icon: 'AlertTriangle',
        actionUrl: '/disputes'
      });

      // Log audit
      await auditService.logSystemAction('dispute_created', {
        disputeId: docRef.id,
        type: disputeData.type
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating dispute:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all disputes with filters
  async getDisputes(filters = {}) {
    try {
      let q = collection(db, 'disputes');
      const constraints = [];

      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters.type) {
        constraints.push(where('type', '==', filters.type));
      }

      if (filters.priority) {
        constraints.push(where('priority', '==', filters.priority));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting disputes:', error);
      throw error;
    }
  },

  // Update dispute status
  async updateDisputeStatus(disputeId, newStatus, notes = '') {
    try {
      const disputeRef = doc(db, 'disputes', disputeId);
      const updates = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      // Add timeline entry
      const timelineEntry = {
        action: `status_changed_to_${newStatus}`,
        description: `Status changed to ${newStatus}`,
        notes,
        timestamp: serverTimestamp(),
        user: 'admin'
      };

      await updateDoc(disputeRef, {
        ...updates,
        timeline: [...(await this.getDispute(disputeId)).timeline, timelineEntry]
      });

      // Log audit
      await auditService.logSystemAction('dispute_status_updated', {
        disputeId,
        newStatus,
        notes
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating dispute status:', error);
      return { success: false, error: error.message };
    }
  },

  // Assign dispute to admin
  async assignDispute(disputeId, adminId, adminName) {
    try {
      const disputeRef = doc(db, 'disputes', disputeId);
      const timelineEntry = {
        action: 'assigned',
        description: `Case assigned to ${adminName}`,
        timestamp: serverTimestamp(),
        user: 'system'
      };

      await updateDoc(disputeRef, {
        assignedTo: adminId,
        assignedToName: adminName,
        assignedAt: serverTimestamp(),
        status: 'in_progress',
        timeline: [...(await this.getDispute(disputeId)).timeline, timelineEntry],
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error assigning dispute:', error);
      return { success: false, error: error.message };
    }
  },

  // Add evidence to dispute
  async addEvidence(disputeId, evidence) {
    try {
      const dispute = await this.getDispute(disputeId);
      const timelineEntry = {
        action: 'evidence_added',
        description: `${evidence.type} evidence added`,
        timestamp: serverTimestamp(),
        user: evidence.submittedBy
      };

      await updateDoc(doc(db, 'disputes', disputeId), {
        evidence: [...(dispute.evidence || []), evidence],
        timeline: [...dispute.timeline, timelineEntry],
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding evidence:', error);
      return { success: false, error: error.message };
    }
  },

  // Resolve dispute
  async resolveDispute(disputeId, resolution) {
    try {
      const batch = writeBatch(db);
      const disputeRef = doc(db, 'disputes', disputeId);
      
      // Update dispute
      const timelineEntry = {
        action: 'resolved',
        description: 'Dispute resolved',
        timestamp: serverTimestamp(),
        user: resolution.resolvedBy
      };

      batch.update(disputeRef, {
        status: 'resolved',
        resolution: {
          ...resolution,
          resolvedAt: serverTimestamp()
        },
        timeline: [...(await this.getDispute(disputeId)).timeline, timelineEntry],
        resolvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Apply resolution actions
      if (resolution.actions) {
        for (const action of resolution.actions) {
          await this.applyResolutionAction(action, batch);
        }
      }

      await batch.commit();

      // Send notifications to involved parties
      await this.notifyResolution(disputeId, resolution);

      // Log audit
      await auditService.logSystemAction('dispute_resolved', {
        disputeId,
        decision: resolution.decision,
        compensationType: resolution.compensation?.type
      });

      return { success: true };
    } catch (error) {
      console.error('Error resolving dispute:', error);
      return { success: false, error: error.message };
    }
  },

  // Calculate priority based on dispute details
  calculatePriority(disputeData) {
    let score = 0;

    // Type-based scoring
    const typeScores = {
      'payment': 3,
      'damage': 3,
      'cancellation': 2,
      'service': 2,
      'communication': 1,
      'other': 1
    };
    score += typeScores[disputeData.type] || 1;

    // Amount-based scoring
    if (disputeData.amount) {
      if (disputeData.amount > 10000) score += 3;
      else if (disputeData.amount > 5000) score += 2;
      else if (disputeData.amount > 1000) score += 1;
    }

    // Time sensitivity
    if (disputeData.isUrgent) score += 2;

    // Determine priority level
    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  },

  // Apply resolution action
  async applyResolutionAction(action, batch) {
    switch (action.type) {
      case 'refund':
        // Create refund record
        const refundRef = doc(collection(db, 'refunds'));
        batch.set(refundRef, {
          ...action.details,
          status: 'pending',
          createdAt: serverTimestamp()
        });
        break;

      case 'suspend_user':
        // Update user status
        const userRef = doc(db, 'users', action.userId);
        batch.update(userRef, {
          status: 'suspended',
          suspendedAt: serverTimestamp(),
          suspensionReason: action.reason
        });
        break;

      case 'block_listing':
        // Update listing status
        const listingRef = doc(db, 'listings', action.listingId);
        batch.update(listingRef, {
          status: 'blocked',
          blockedAt: serverTimestamp(),
          blockReason: action.reason
        });
        break;

      default:
        console.warn('Unknown resolution action type:', action.type);
    }
  },

  // Get single dispute
  async getDispute(disputeId) {
    const snapshot = await getDocs(
      query(collection(db, 'disputes'), where('__name__', '==', disputeId))
    );
    return snapshot.docs[0]?.data() || null;
  },

  // Notify parties about resolution
  async notifyResolution(disputeId, resolution) {
    const dispute = await this.getDispute(disputeId);
    
    // Notify reporter
    if (dispute.reportedBy) {
      await notificationService.createNotification({
        type: 'dispute',
        title: 'Dispute Resolved',
        message: `Your dispute case #${disputeId.slice(-6)} has been resolved`,
        data: { disputeId, decision: resolution.decision },
        priority: 'high',
        icon: 'CheckCircle',
        userId: dispute.reportedBy
      });
    }

    // Notify respondent
    if (dispute.respondent) {
      await notificationService.createNotification({
        type: 'dispute',
        title: 'Dispute Resolution',
        message: `A dispute involving you (case #${disputeId.slice(-6)}) has been resolved`,
        data: { disputeId, decision: resolution.decision },
        priority: 'high',
        icon: 'Info',
        userId: dispute.respondent
      });
    }
  },

  // Get dispute statistics
  async getDisputeStats(dateRange) {
    try {
      const disputesQuery = query(
        collection(db, 'disputes'),
        where('createdAt', '>=', dateRange.start),
        where('createdAt', '<=', dateRange.end)
      );

      const snapshot = await getDocs(disputesQuery);
      const disputes = snapshot.docs.map(doc => doc.data());

      return {
        total: disputes.length,
        open: disputes.filter(d => d.status === 'open').length,
        inProgress: disputes.filter(d => d.status === 'in_progress').length,
        resolved: disputes.filter(d => d.status === 'resolved').length,
        avgResolutionTime: this.calculateAvgResolutionTime(disputes),
        byType: this.groupByType(disputes),
        byPriority: this.groupByPriority(disputes)
      };
    } catch (error) {
      console.error('Error getting dispute stats:', error);
      throw error;
    }
  },

  calculateAvgResolutionTime(disputes) {
    const resolved = disputes.filter(d => d.status === 'resolved' && d.resolvedAt);
    if (resolved.length === 0) return 0;

    const totalTime = resolved.reduce((sum, d) => {
      const created = d.createdAt?.toDate() || new Date();
      const resolved = d.resolvedAt?.toDate() || new Date();
      return sum + (resolved - created);
    }, 0);

    return totalTime / resolved.length / (1000 * 60 * 60 * 24); // Convert to days
  },

  groupByType(disputes) {
    const types = {};
    disputes.forEach(d => {
      types[d.type] = (types[d.type] || 0) + 1;
    });
    return types;
  },

  groupByPriority(disputes) {
    const priorities = {};
    disputes.forEach(d => {
      priorities[d.priority] = (priorities[d.priority] || 0) + 1;
    });
    return priorities;
  }
};