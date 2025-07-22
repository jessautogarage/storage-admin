// src/services/verificationService.js
import { db, storage } from './firebase';
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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { notificationService } from './notificationService';
import { auditService } from './auditService';

export const verificationService = {
  // Submit verification request
  async submitVerification(userId, data) {
    try {
      const verification = {
        userId,
        type: data.type, // 'host' or 'premium_client'
        status: 'pending',
        documents: [],
        personalInfo: data.personalInfo,
        businessInfo: data.businessInfo || null,
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'verifications'), verification);
      
      // Upload documents
      if (data.documents && data.documents.length > 0) {
        const documentUrls = await this.uploadDocuments(docRef.id, data.documents);
        await updateDoc(doc(db, 'verifications', docRef.id), {
          documents: documentUrls
        });
      }

      // Notify admin
      await notificationService.createNotification({
        type: 'verification',
        title: 'New Verification Request',
        message: `${data.personalInfo.name} submitted verification for ${data.type}`,
        data: { verificationId: docRef.id, userId },
        priority: 'high',
        icon: 'Shield',
        actionUrl: '/verification'
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error submitting verification:', error);
      return { success: false, error: error.message };
    }
  },

  // Upload verification documents
  async uploadDocuments(verificationId, documents) {
    const uploadPromises = documents.map(async (document) => {
      const storageRef = ref(
        storage, 
        `verifications/${verificationId}/${document.type}_${Date.now()}`
      );
      
      await uploadBytes(storageRef, document.file);
      const url = await getDownloadURL(storageRef);
      
      return {
        type: document.type,
        name: document.file.name,
        url,
        uploadedAt: new Date()
      };
    });

    return Promise.all(uploadPromises);
  },

  // Get verification queue
  async getVerificationQueue(filters = {}) {
    try {
      let q = collection(db, 'verifications');
      const constraints = [];

      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters.type) {
        constraints.push(where('type', '==', filters.type));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      const snapshot = await getDocs(q);
      const verifications = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // Get user info
        const userSnapshot = await getDocs(
          query(collection(db, 'users'), where('__name__', '==', data.userId))
        );
        const userData = userSnapshot.docs[0]?.data() || {};

        verifications.push({
          id: doc.id,
          ...data,
          userName: userData.name,
          userEmail: userData.email
        });
      }

      return verifications;
    } catch (error) {
      console.error('Error getting verification queue:', error);
      throw error;
    }
  },

  // Approve verification
  async approveVerification(verificationId, approvedBy, notes = '') {
    try {
      const batch = writeBatch(db);
      
      // Update verification status
      const verificationRef = doc(db, 'verifications', verificationId);
      batch.update(verificationRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy,
        reviewNotes: notes,
        updatedAt: serverTimestamp()
      });

      // Get verification data
      const verificationDoc = await getDocs(
        query(collection(db, 'verifications'), where('__name__', '==', verificationId))
      );
      const verification = verificationDoc.docs[0].data();

      // Update user verification status
      const userRef = doc(db, 'users', verification.userId);
      batch.update(userRef, {
        verificationStatus: 'verified',
        verifiedAt: serverTimestamp(),
        verificationType: verification.type
      });

      await batch.commit();

      // Log audit
      await auditService.logUserModification(
        verification.userId,
        { verificationStatus: { from: 'pending', to: 'verified' } },
        'verify'
      );

      // Notify user
      await notificationService.notifyUserVerified({
        id: verification.userId,
        name: verification.personalInfo.name,
        type: verification.type
      });

      return { success: true };
    } catch (error) {
      console.error('Error approving verification:', error);
      return { success: false, error: error.message };
    }
  },

  // Reject verification
  async rejectVerification(verificationId, rejectedBy, reason) {
    try {
      const verificationRef = doc(db, 'verifications', verificationId);
      await updateDoc(verificationRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy,
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      });

      // Get verification data
      const verificationDoc = await getDocs(
        query(collection(db, 'verifications'), where('__name__', '==', verificationId))
      );
      const verification = verificationDoc.docs[0].data();

      // Update user verification status
      await updateDoc(doc(db, 'users', verification.userId), {
        verificationStatus: 'rejected',
        verificationRejectedAt: serverTimestamp()
      });

      // Log audit
      await auditService.logUserModification(
        verification.userId,
        { verificationStatus: { from: 'pending', to: 'rejected' } },
        'reject_verification'
      );

      return { success: true };
    } catch (error) {
      console.error('Error rejecting verification:', error);
      return { success: false, error: error.message };
    }
  },

  // Request additional documents
  async requestAdditionalDocuments(verificationId, requestedDocuments, message) {
    try {
      const verificationRef = doc(db, 'verifications', verificationId);
      await updateDoc(verificationRef, {
        status: 'additional_docs_required',
        requestedDocuments,
        requestMessage: message,
        requestedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // TODO: Send email/notification to user

      return { success: true };
    } catch (error) {
      console.error('Error requesting additional documents:', error);
      return { success: false, error: error.message };
    }
  },

  // Verify document authenticity (placeholder for actual verification)
  async verifyDocument(documentUrl, documentType) {
    // In a real implementation, this would integrate with:
    // - OCR services for text extraction
    // - Government APIs for ID verification
    // - Face matching for selfie verification
    // - Document authenticity checks
    
    return {
      isValid: true,
      confidence: 0.95,
      extractedData: {
        // Extracted information from document
      },
      warnings: []
    };
  },

  // Get verification statistics
  async getVerificationStats(dateRange) {
    try {
      const verificationsQuery = query(
        collection(db, 'verifications'),
        where('submittedAt', '>=', dateRange.start),
        where('submittedAt', '<=', dateRange.end)
      );

      const snapshot = await getDocs(verificationsQuery);
      const verifications = snapshot.docs.map(doc => doc.data());

      return {
        total: verifications.length,
        pending: verifications.filter(v => v.status === 'pending').length,
        approved: verifications.filter(v => v.status === 'approved').length,
        rejected: verifications.filter(v => v.status === 'rejected').length,
        avgProcessingTime: this.calculateAvgProcessingTime(verifications),
        byType: {
          host: verifications.filter(v => v.type === 'host').length,
          premiumClient: verifications.filter(v => v.type === 'premium_client').length
        }
      };
    } catch (error) {
      console.error('Error getting verification stats:', error);
      throw error;
    }
  },

  calculateAvgProcessingTime(verifications) {
    const processed = verifications.filter(v => 
      v.status === 'approved' || v.status === 'rejected'
    );
    
    if (processed.length === 0) return 0;
    
    const totalTime = processed.reduce((sum, v) => {
      const submitTime = v.submittedAt?.toDate() || new Date();
      const processTime = v.approvedAt?.toDate() || v.rejectedAt?.toDate() || new Date();
      return sum + (processTime - submitTime);
    }, 0);
    
    return totalTime / processed.length / (1000 * 60 * 60); // Convert to hours
  }
};