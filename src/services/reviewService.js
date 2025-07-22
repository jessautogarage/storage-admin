// src/services/reviewService.js
import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { notificationService } from './notificationService';

export const reviewService = {
  // Create a new review
  async createReview(reviewData) {
    try {
      const review = {
        ...reviewData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        helpful: 0,
        notHelpful: 0
      };

      const docRef = await addDoc(collection(db, 'reviews'), review);
      
      // Notify admin
      await notificationService.createNotification({
        type: 'review',
        title: 'New Review Submitted',
        message: `${reviewData.reviewerName} left a ${reviewData.rating}-star review`,
        data: { reviewId: docRef.id },
        priority: reviewData.rating <= 2 ? 'high' : 'normal',
        icon: 'MessageSquare',
        actionUrl: '/reviews'
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating review:', error);
      return { success: false, error: error.message };
    }
  },

  // Approve a review
  async approveReview(reviewId) {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: 'admin',
        updatedAt: serverTimestamp()
      });

      // Update target rating
      const reviewDoc = await getDoc(reviewRef);
      const review = reviewDoc.data();
      await this.updateTargetRating(review.targetId, review.type);

      return { success: true };
    } catch (error) {
      console.error('Error approving review:', error);
      return { success: false, error: error.message };
    }
  },

  // Reject a review
  async rejectReview(reviewId, reason) {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: 'admin',
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error rejecting review:', error);
      return { success: false, error: error.message };
    }
  },

  // Flag a review
  async flagReview(reviewId, reason) {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        status: 'flagged',
        flaggedAt: serverTimestamp(),
        flaggedBy: 'admin',
        flagReason: reason,
        updatedAt: serverTimestamp()
      });

      // Notify about flagged review
      await notificationService.createNotification({
        type: 'system',
        title: 'Review Flagged',
        message: `Review #${reviewId.slice(-6)} has been flagged for: ${reason}`,
        data: { reviewId },
        priority: 'high',
        icon: 'Flag',
        actionUrl: '/reviews'
      });

      return { success: true };
    } catch (error) {
      console.error('Error flagging review:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete a review
  async deleteReview(reviewId) {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      return { success: false, error: error.message };
    }
  },

  // Add response to review
  async addResponse(reviewId, response, responderId) {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        response,
        responseDate: serverTimestamp(),
        respondedBy: responderId,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding response:', error);
      return { success: false, error: error.message };
    }
  },

  // Update target rating
  async updateTargetRating(targetId, targetType) {
    try {
      const collection = targetType === 'host' ? 'users' : 'listings';
      const targetRef = doc(db, collection, targetId);
      
      // Get all approved reviews for this target
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('targetId', '==', targetId),
        where('status', '==', 'approved')
      );
      
      const snapshot = await getDocs(reviewsQuery);
      const reviews = snapshot.docs.map(doc => doc.data());
      
      if (reviews.length === 0) return;
      
      // Calculate average rating
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      // Calculate rating breakdown
      const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach(r => {
        ratingCounts[r.rating]++;
      });
      
      // Update target
      await updateDoc(targetRef, {
        rating: averageRating,
        reviewCount: reviews.length,
        ratingDistribution: ratingCounts,
        lastReviewDate: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating target rating:', error);
      return { success: false, error: error.message };
    }
  },

  // Get review statistics
  async getReviewStats(startDate, endDate) {
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate)
      );

      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const stats = {
        total: reviews.length,
        approved: reviews.filter(r => r.status === 'approved').length,
        pending: reviews.filter(r => r.status === 'pending').length,
        flagged: reviews.filter(r => r.status === 'flagged').length,
        rejected: reviews.filter(r => r.status === 'rejected').length,
        averageRating: reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0,
        ratingDistribution: {
          5: reviews.filter(r => r.rating === 5).length,
          4: reviews.filter(r => r.rating === 4).length,
          3: reviews.filter(r => r.rating === 3).length,
          2: reviews.filter(r => r.rating === 2).length,
          1: reviews.filter(r => r.rating === 1).length
        },
        responseRate: reviews.filter(r => r.response).length / reviews.length * 100
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting review stats:', error);
      return { success: false, error: error.message };
    }
  },

  // Bulk moderate reviews
  async bulkModerate(reviewIds, action, reason = '') {
    try {
      const batch = writeBatch(db);
      const timestamp = serverTimestamp();
      
      reviewIds.forEach(id => {
        const reviewRef = doc(db, 'reviews', id);
        const updateData = {
          status: action,
          updatedAt: timestamp,
          moderatedBy: 'admin'
        };

        if (action === 'approved') {
          updateData.approvedAt = timestamp;
        } else if (action === 'rejected') {
          updateData.rejectedAt = timestamp;
          updateData.rejectionReason = reason;
        } else if (action === 'flagged') {
          updateData.flaggedAt = timestamp;
          updateData.flagReason = reason;
        }

        batch.update(reviewRef, updateData);
      });

      await batch.commit();
      return { success: true, count: reviewIds.length };
    } catch (error) {
      console.error('Error bulk moderating reviews:', error);
      return { success: false, error: error.message };
    }
  }
};