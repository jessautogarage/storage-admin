// src/hooks/useAuditLog.js
import { useState, useEffect } from 'react';
import { auditService } from '../services/auditService';

export const useAuditLog = (filters) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await auditService.getAuditLogs(filters);
      
      // Apply client-side filtering for search term
      const filtered = data.filter(log => {
        if (!filters.searchTerm) return true;
        
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          log.userEmail?.toLowerCase().includes(searchLower) ||
          log.action?.toLowerCase().includes(searchLower) ||
          log.category?.toLowerCase().includes(searchLower) ||
          log.targetId?.toLowerCase().includes(searchLower) ||
          JSON.stringify(log.details)?.toLowerCase().includes(searchLower)
        );
      });
      
      setLogs(filtered);
      setError(null);
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError(err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async (format = 'csv') => {
    try {
      if (format === 'csv') {
        const headers = ['Timestamp', 'User', 'Category', 'Action', 'Severity', 'IP', 'Details'];
        const rows = logs.map(log => [
          format(log.timestamp?.toDate() || new Date(), 'yyyy-MM-dd HH:mm:ss'),
          log.userEmail,
          log.category,
          log.action,
          log.severity || 'info',
          log.ip,
          JSON.stringify(log.details || {})
        ]);

        const csv = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_log_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      // Log the export action
      await auditService.logDataExport('audit_logs', format, logs.length);
    } catch (err) {
      console.error('Error exporting logs:', err);
    }
  };

  return {
    logs,
    loading,
    error,
    refresh: loadLogs,
    exportLogs
  };
};