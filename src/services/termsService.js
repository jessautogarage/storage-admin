import { 
  collection, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';

class TermsService {
  constructor() {
    this.collection = collection(db, 'terms');
  }

  /**
   * Get current terms and conditions
   * @returns {Promise<Object>} Current terms
   */
  async getCurrentTerms() {
    try {
      // Get the most recent active terms
      const q = query(
        this.collection,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Return default terms if none exist
        return {
          success: true,
          terms: this.getDefaultTerms()
        };
      }
      
      const termsDoc = snapshot.docs[0];
      return {
        success: true,
        terms: { id: termsDoc.id, ...termsDoc.data() }
      };
    } catch (error) {
      console.error('Error fetching terms:', error);
      // Return default terms on error
      return {
        success: true,
        terms: this.getDefaultTerms()
      };
    }
  }

  /**
   * Create or update terms (admin only)
   * @param {Object} termsData - Terms content
   * @param {string} adminId - Admin user ID
   * @returns {Promise<Object>} Result
   */
  async updateTerms(termsData, adminId) {
    try {
      // First, deactivate all existing terms
      const activeTermsQuery = query(
        this.collection,
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(activeTermsQuery);
      const updatePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { 
          status: 'archived',
          archivedAt: serverTimestamp(),
          archivedBy: adminId
        })
      );
      
      await Promise.all(updatePromises);
      
      // Create new terms document
      const newTerms = {
        ...termsData,
        status: 'active',
        createdAt: serverTimestamp(),
        createdBy: adminId,
        updatedAt: serverTimestamp(),
        version: (snapshot.size + 1).toString()
      };
      
      const docRef = await addDoc(this.collection, newTerms);
      
      return {
        success: true,
        message: 'Terms updated successfully',
        termsId: docRef.id
      };
    } catch (error) {
      console.error('Error updating terms:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get default terms and conditions
   * @returns {Object} Default terms
   */
  getDefaultTerms() {
    return {
      id: 'default',
      title: 'Terms and Conditions',
      content: {
        general: {
          title: 'General Terms',
          items: [
            'By using LockifyHub, you agree to these terms and conditions.',
            'You must be at least 18 years old to use this service.',
            'You are responsible for maintaining the confidentiality of your account.',
            'All information provided must be accurate and up-to-date.'
          ]
        },
        booking: {
          title: 'Booking Terms',
          items: [
            'All bookings are subject to availability.',
            'Bookings must be paid in full at the time of confirmation.',
            'The storage space must be used only for lawful purposes.',
            'Prohibited items include hazardous materials, illegal goods, and perishables.',
            'Access to storage space is provided during agreed-upon times only.'
          ]
        },
        payment: {
          title: 'Payment Terms',
          items: [
            'Payments can be made via Wallet, GCash, or Cash.',
            'Service fees are charged to the host, not the client.',
            'All fees are non-refundable unless otherwise stated.',
            'Hosts must maintain a minimum wallet balance of ₱500.',
            'Payment disputes must be reported within 7 days.'
          ]
        },
        cancellation: {
          title: 'Cancellation Policy',
          items: [
            'Free cancellation up to 24 hours before check-in.',
            'Cancellations within 24 hours may incur a fee.',
            'No-shows forfeit the full booking amount.',
            'Hosts may cancel only for valid reasons (damage, safety concerns).',
            'Repeated cancellations may result in account suspension.'
          ]
        },
        liability: {
          title: 'Liability and Insurance',
          items: [
            'LockifyHub is not responsible for loss or damage to stored items.',
            'Clients are encouraged to obtain their own insurance.',
            'Hosts must maintain their spaces in safe condition.',
            'Both parties agree to resolve disputes through the platform first.',
            'Maximum liability is limited to the booking amount.'
          ]
        },
        privacy: {
          title: 'Privacy and Data',
          items: [
            'Personal information is protected according to our Privacy Policy.',
            'We do not share your data with third parties without consent.',
            'You may request deletion of your data at any time.',
            'Communication between users is monitored for safety.',
            'We comply with all applicable data protection laws.'
          ]
        }
      },
      footer: {
        text: 'By proceeding with your booking, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.',
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      },
      status: 'active',
      createdAt: new Date(),
      createdBy: 'system'
    };
  }

  /**
   * Record user acceptance of terms
   * @param {string} userId - User ID
   * @param {string} termsId - Terms ID
   * @param {string} context - Context of acceptance (booking, registration, etc.)
   * @param {Object} signatureData - Optional signature data
   * @returns {Promise<Object>} Result
   */
  async recordAcceptance(userId, termsId, context = 'booking', signatureData = null) {
    try {
      const acceptanceRef = doc(collection(db, 'terms_acceptances'));
      
      const acceptanceData = {
        userId,
        termsId,
        context,
        acceptedAt: serverTimestamp(),
        ipAddress: null, // Would be captured in production
        userAgent: navigator.userAgent
      };
      
      // Add signature data if provided
      if (signatureData) {
        acceptanceData.signature = {
          firstName: signatureData.firstName,
          lastName: signatureData.lastName,
          signatureImage: signatureData.signature,
          signedAt: signatureData.acceptedAt || new Date().toISOString(),
          additionalData: signatureData
        };
      }
      
      await setDoc(acceptanceRef, acceptanceData);
      
      return {
        success: true,
        acceptanceId: acceptanceRef.id
      };
    } catch (error) {
      console.error('Error recording acceptance:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if user has accepted current terms
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Has accepted current terms
   */
  async hasAcceptedCurrentTerms(userId) {
    try {
      // Get current terms
      const currentTermsResult = await this.getCurrentTerms();
      if (!currentTermsResult.success) return false;
      
      const currentTermsId = currentTermsResult.terms.id;
      
      // Check for acceptance
      const q = query(
        collection(db, 'terms_acceptances'),
        where('userId', '==', userId),
        where('termsId', '==', currentTermsId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking terms acceptance:', error);
      return false;
    }
  }
}

export const termsService = new TermsService();