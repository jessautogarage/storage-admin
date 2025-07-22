// src/hooks/useVerification.js
import { useState, useEffect } from 'react';
import { verificationService } from '../services/verificationService';

export const useVerification = (filters = {}) => {
  const [verifications, setVerifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVerifications();
    loadStats();
  }, [filters]);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const data = await verificationService.getVerifications(filters);
      
      // Apply client-side search filter
      const filtered = data.filter(verification => {
        if (!filters.searchTerm) return true;
        
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          verification.id.toLowerCase().includes(searchLower) ||
          verification.userEmail?.toLowerCase().includes(searchLower) ||
          verification.personalInfo?.name?.toLowerCase().includes(searchLower) ||
          verification.businessInfo?.name?.toLowerCase().includes(searchLower)
        );
      });
      
      setVerifications(filtered);
      setError(null);
    } catch (err) {
      console.error('Error loading verifications:', err);
      setError(err.message);
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await verificationService.getVerificationStats();
      setStats(stats);
    } catch (err) {
      console.error('Error loading verification stats:', err);
    }
  };

  const approveVerification = async (verificationId, notes) => {
    try {
      await verificationService.approveVerification(verificationId, notes);
      await loadVerifications();
      await loadStats();
    } catch (err) {
      console.error('Error approving verification:', err);
      throw err;
    }
  };

  const rejectVerification = async (verificationId, reason) => {
    try {
      await verificationService.rejectVerification(verificationId, reason);
      await loadVerifications();
      await loadStats();
    } catch (err) {
      console.error('Error rejecting verification:', err);
      throw err;
    }
  };

  const requestAdditionalDocs = async (verificationId, requirements) => {
    try {
      await verificationService.requestAdditionalDocs(verificationId, requirements);
      await loadVerifications();
    } catch (err) {
      console.error('Error requesting additional docs:', err);
      throw err;
    }
  };

  return {
    verifications,
    stats,
    loading,
    error,
    approveVerification,
    rejectVerification,
    requestAdditionalDocs,
    refresh: loadVerifications
  };
};