// src/hooks/useDisputes.js
import { useState, useEffect } from 'react';
import { disputeService } from '../services/disputeService';

export const useDisputes = (filters = {}) => {
  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDisputes();
    loadStats();
  }, [filters]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const data = await disputeService.getDisputes(filters);
      
      // Apply client-side search filter
      const filtered = data.filter(dispute => {
        if (!filters.searchTerm) return true;
        
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          dispute.id.toLowerCase().includes(searchLower) ||
          dispute.description?.toLowerCase().includes(searchLower) ||
          dispute.reporterName?.toLowerCase().includes(searchLower) ||
          dispute.respondentName?.toLowerCase().includes(searchLower)
        );
      });
      
      setDisputes(filtered);
      setError(null);
    } catch (err) {
      console.error('Error loading disputes:', err);
      setError(err.message);
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await disputeService.getDisputeStats({
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        end: new Date()
      });
      setStats(stats);
    } catch (err) {
      console.error('Error loading dispute stats:', err);
    }
  };

  const updateStatus = async (disputeId, newStatus, notes) => {
    try {
      await disputeService.updateDisputeStatus(disputeId, newStatus, notes);
      await loadDisputes();
    } catch (err) {
      console.error('Error updating dispute status:', err);
      throw err;
    }
  };

  const assignDispute = async (disputeId, adminId, adminName) => {
    try {
      await disputeService.assignDispute(disputeId, adminId, adminName);
      await loadDisputes();
    } catch (err) {
      console.error('Error assigning dispute:', err);
      throw err;
    }
  };

  const resolveDispute = async (disputeId, resolution) => {
    try {
      await disputeService.resolveDispute(disputeId, resolution);
      await loadDisputes();
      await loadStats();
    } catch (err) {
      console.error('Error resolving dispute:', err);
      throw err;
    }
  };

  return {
    disputes,
    stats,
    loading,
    error,
    updateStatus,
    assignDispute,
    resolveDispute,
    refresh: loadDisputes
  };
};