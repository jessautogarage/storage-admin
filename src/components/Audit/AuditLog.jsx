// src/components/Audit/AuditLog.jsx
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Download,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Activity,
  Eye,
  FileText
} from 'lucide-react';
import { useAuditLog } from '../../hooks/useAuditLog';
import { format, startOfDay, endOfDay } from 'date-fns';
import AuditDetails from './AuditDetails';

const AuditLog = () => {
  const [filters, setFilters] = useState({
    category: '',
    userId: '',
    severity: '',
    startDate: startOfDay(new Date()),
    endDate: endOfDay(new Date()),
    searchTerm: ''
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const { logs, loading, exportLogs } = useAuditLog(filters);

  const categoryIcons = {
    auth: Shield,
    user: User,
    payment: FileText,
    listing: Activity,
    booking: Calendar,
    system: Activity,
    settings: Filter,
    data: Download
  };

  const severityColors = {
    info: 'text-blue-600 bg-blue-50',
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-orange-600 bg-orange-50',
    critical: 'text-red-600 bg-red-50'
  };

  const handleExport = async () => {
    await exportLogs('csv');
  };

  const formatAction = (category, action) => {
    const actionMap = {
      auth: {
        login: 'User Login',
        logout: 'User Logout',
        register: 'User Registration',
        passwordReset: 'Password Reset'
      },
      user: {
        create: 'User Created',
        update: 'User Updated',
        delete: 'User Deleted',
        verify: 'User Verified',
        suspend: 'User Suspended'
      },
      payment: {
        create: 'Payment Created',
        verify: 'Payment Verified',
        reject: 'Payment Rejected',
        refund: 'Payment Refunded'
      },
      listing: {
        create: 'Listing Created',
        update: 'Listing Updated',
        delete: 'Listing Deleted',
        approve: 'Listing Approved',
        suspend: 'Listing Suspended'
      }
    };

    return actionMap[category]?.[action] || `${category}: ${action}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-600 mt-1">Track all system activities and changes</p>
        </div>
        <button
          onClick={handleExport}
          className="btn-secondary flex items-center gap-2"
        >
          <Download size={20} />
          Export Log
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="text-gray-400" size={20} />
            <span className="text-2xl font-bold">{logs.length}</span>
          </div>
          <p className="text-sm text-gray-600">Total Actions Today</p>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <Shield className="text-blue-600" size={20} />
            <span className="text-2xl font-bold">
              {logs.filter(l => l.category === 'auth').length}
            </span>
          </div>
          <p className="text-sm text-gray-600">Auth Events</p>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="text-orange-600" size={20} />
            <span className="text-2xl font-bold">
              {logs.filter(l => l.severity === 'high' || l.severity === 'critical').length}
            </span>
          </div>
          <p className="text-sm text-gray-600">High Severity</p>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <User className="text-green-600" size={20} />
            <span className="text-2xl font-bold">
              {[...new Set(logs.map(l => l.userId))].length}
            </span>
          </div>
          <p className="text-sm text-gray-600">Active Users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search logs..."
              className="input pl-10"
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            />
          </div>
          
          <select
            className="input"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="auth">Authentication</option>
            <option value="user">Users</option>
            <option value="payment">Payments</option>
            <option value="listing">Listings</option>
            <option value="booking">Bookings</option>
            <option value="system">System</option>
            <option value="settings">Settings</option>
          </select>
          
          <select
            className="input"
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
          >
            <option value="">All Severities</option>
            <option value="info">Info</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          
          <input
            type="date"
            className="input"
            value={format(filters.startDate, 'yyyy-MM-dd')}
            onChange={(e) => setFilters({
              ...filters,
              startDate: startOfDay(new Date(e.target.value))
            })}
          />
          
          <input
            type="date"
            className="input"
            value={format(filters.endDate, 'yyyy-MM-dd')}
            onChange={(e) => setFilters({
              ...filters,
              endDate: endOfDay(new Date(e.target.value))
            })}
          />
          
          <button
            onClick={() => setFilters({
              category: '',
              userId: '',
              severity: '',
              startDate: startOfDay(new Date()),
              endDate: endOfDay(new Date()),
              searchTerm: ''
            })}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => {
                const Icon = categoryIcons[log.category] || Activity;
                
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium">
                          {format(log.timestamp?.toDate() || new Date(), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-gray-500">
                          {format(log.timestamp?.toDate() || new Date(), 'HH:mm:ss')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium">{log.userEmail}</div>
                        <div className="text-gray-500 text-xs">{log.userId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="text-gray-400" />
                        <span className="text-sm capitalize">{log.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium">
                          {formatAction(log.category, log.action)}
                        </div>
                        {log.targetId && (
                          <div className="text-gray-500 text-xs">
                            Target: {log.targetId.slice(-6)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        severityColors[log.severity || 'info']
                      }`}>
                        {log.severity || 'info'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{log.ip}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="text-center py-12">
              <Shield size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No audit logs found</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedLog && (
        <AuditDetails
          log={selectedLog}
          onClose={() => {
            setShowDetails(false);
            setSelectedLog(null);
          }}
        />
      )}
    </div>
  );
};

export default AuditLog;