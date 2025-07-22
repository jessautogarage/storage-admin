// src/components/Audit/AuditDetails.jsx
import React from 'react';
import { X, Shield, Clock, Globe, Monitor, Database } from 'lucide-react';
import { format } from 'date-fns';

const AuditDetails = ({ log, onClose }) => {
  const renderDetails = () => {
    if (!log.details) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <pre className="text-sm text-gray-700 overflow-x-auto">
          {JSON.stringify(log.details, null, 2)}
        </pre>
      </div>
    );
  };

  const renderChanges = () => {
    if (!log.changes) return null;

    return (
      <div className="space-y-2">
        {Object.entries(log.changes).map(([field, change]) => (
          <div key={field} className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900 mb-1">{field}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">From:</span>
                <p className="font-mono">{change.from || 'null'}</p>
              </div>
              <div>
                <span className="text-gray-500">To:</span>
                <p className="font-mono">{change.to || 'null'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Audit Log Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Shield size={18} />
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Log ID</p>
                <p className="font-medium">{log.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium capitalize">{log.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Action</p>
                <p className="font-medium">{log.action}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Severity</p>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  log.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  log.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  log.severity === 'low' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {log.severity || 'info'}
                </span>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Clock size={18} />
              User & Time Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">User Email</p>
                <p className="font-medium">{log.userEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-medium text-xs">{log.userId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Timestamp</p>
                <p className="font-medium">
                  {format(log.timestamp?.toDate() || new Date(), 'PPpp')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Session ID</p>
                <p className="font-medium text-xs">{log.sessionId}</p>
              </div>
            </div>
          </div>

          {/* Technical Information */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Globe size={18} />
              Technical Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">IP Address</p>
                <p className="font-medium">{log.ip}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User Agent</p>
                <p className="font-medium text-xs line-clamp-2">{log.userAgent}</p>
              </div>
            </div>
          </div>

          {/* Target Information */}
          {log.targetId && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Database size={18} />
                Target Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Target ID</p>
                <p className="font-medium">{log.targetId}</p>
              </div>
            </div>
          )}

          {/* Changes */}
          {log.changes && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Changes Made</h3>
              {renderChanges()}
            </div>
          )}

          {/* Additional Details */}
          {log.details && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Additional Details</h3>
              {renderDetails()}
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditDetails;