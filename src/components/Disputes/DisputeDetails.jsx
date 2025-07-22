// src/components/Disputes/DisputeDetails.jsx
import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  User, 
  Calendar, 
  Clock,
  MessageSquare,
  FileText,
  CheckCircle,
  XCircle,
  ChevronRight,
  Paperclip,
  DollarSign,
  Shield,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';
import DisputeTimeline from './DisputeTimeline';
import DisputeResolution from './DisputeResolution';

const DisputeDetails = ({ dispute, onClose, onResolve, onUpdateStatus, onAssign }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [showResolution, setShowResolution] = useState(false);
  const [notes, setNotes] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const handleStatusChange = async (newStatus) => {
    await onUpdateStatus(dispute.id, newStatus, notes);
    setNotes('');
  };

  const handleAssign = async (adminId, adminName) => {
    await onAssign(dispute.id, adminId, adminName);
    setShowAssignModal(false);
  };

  const getStatusActions = () => {
    switch (dispute.status) {
      case 'open':
        return [
          { label: 'Assign to Me', action: () => setShowAssignModal(true), icon: UserCheck },
          { label: 'Mark In Progress', action: () => handleStatusChange('in_progress'), icon: Clock }
        ];
      case 'in_progress':
        return [
          { label: 'Resolve Dispute', action: () => setShowResolution(true), icon: CheckCircle },
          { label: 'Need More Info', action: () => handleStatusChange('pending_info'), icon: MessageSquare }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle size={24} />
              Dispute Case #{dispute.id.slice(-6).toUpperCase()}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {dispute.type} dispute • Filed {format(dispute.createdAt?.toDate() || new Date(), 'PPP')}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Status Banner */}
        <div className={`p-4 flex items-center justify-between ${
          dispute.status === 'resolved' ? 'bg-green-50' :
          dispute.status === 'in_progress' ? 'bg-blue-50' :
          'bg-yellow-50'
        }`}>
          <div className="flex items-center gap-3">
            {dispute.status === 'resolved' ? (
              <CheckCircle className="text-green-600" size={20} />
            ) : dispute.status === 'in_progress' ? (
              <Clock className="text-blue-600" size={20} />
            ) : (
              <AlertTriangle className="text-yellow-600" size={20} />
            )}
            <div>
              <p className="font-medium capitalize">
                {dispute.status.replace(/_/g, ' ')}
              </p>
              {dispute.assignedToName && (
                <p className="text-sm text-gray-600">
                  Assigned to {dispute.assignedToName}
                </p>
              )}
            </div>
          </div>
          
          {dispute.status !== 'resolved' && (
            <div className="flex gap-2">
              {getStatusActions().map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="btn-secondary flex items-center gap-2"
                >
                  <action.icon size={16} />
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-6 px-6">
            {[
              { id: 'details', label: 'Details' },
              { id: 'timeline', label: 'Timeline' },
              { id: 'evidence', label: 'Evidence' },
              { id: 'communication', label: 'Communication' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Parties Involved */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <User size={18} />
                    Reporter
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="font-medium">{dispute.reporterName}</p>
                    <p className="text-sm text-gray-600">{dispute.reporterEmail}</p>
                    <p className="text-sm text-gray-600">User Type: {dispute.reporterType}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <User size={18} />
                    Respondent
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="font-medium">{dispute.respondentName || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{dispute.respondentEmail || 'N/A'}</p>
                    <p className="text-sm text-gray-600">User Type: {dispute.respondentType || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Dispute Information */}
              <div>
                <h3 className="font-medium mb-3">Dispute Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium capitalize">{dispute.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Priority</p>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        dispute.priority === 'high' ? 'bg-red-100 text-red-800' :
                        dispute.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {dispute.priority}
                      </span>
                    </div>
                    {dispute.bookingId && (
                      <div>
                        <p className="text-sm text-gray-500">Related Booking</p>
                        <p className="font-medium">#{dispute.bookingId.slice(-6)}</p>
                      </div>
                    )}
                    {dispute.amount && (
                      <div>
                        <p className="text-sm text-gray-500">Disputed Amount</p>
                        <p className="font-medium">₱{dispute.amount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700">{dispute.description}</p>
                  </div>
                  
                  {dispute.desiredResolution && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Desired Resolution</p>
                      <p className="text-gray-700">{dispute.desiredResolution}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution (if resolved) */}
              {dispute.resolution && (
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-600" />
                    Resolution
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Decision</p>
                      <p className="font-medium">{dispute.resolution.decision}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Explanation</p>
                      <p className="text-gray-700">{dispute.resolution.explanation}</p>
                    </div>
                    {dispute.resolution.compensation && (
                      <div>
                        <p className="text-sm text-gray-500">Compensation</p>
                        <p className="font-medium">
                          {dispute.resolution.compensation.type}: ₱{dispute.resolution.compensation.amount.toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Resolved by</p>
                      <p className="font-medium">
                        {dispute.resolution.resolvedBy} on {format(dispute.resolution.resolvedAt?.toDate() || new Date(), 'PPP')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Notes */}
              {dispute.status !== 'resolved' && (
                <div>
                  <h3 className="font-medium mb-3">Internal Notes</h3>
                  <textarea
                    className="input h-24"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this dispute..."
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <DisputeTimeline timeline={dispute.timeline || []} />
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <h3 className="font-medium mb-3">Submitted Evidence</h3>
              {dispute.evidence && dispute.evidence.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dispute.evidence.map((item, index) => (
                    <div key={index} className="card p-4">
                      <div className="flex items-start gap-3">
                        <Paperclip className="text-gray-400 mt-1" size={20} />
                        <div className="flex-1">
                          <p className="font-medium">{item.type}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Submitted by {item.submittedBy} on {format(item.submittedAt?.toDate() || new Date(), 'PPP')}
                          </p>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block"
                            >
                              View Evidence
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No evidence submitted</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="space-y-4">
              <h3 className="font-medium mb-3">Communication History</h3>
              <div className="space-y-4">
                {/* Placeholder for communication history */}
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Communication feature coming soon</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>

      {/* Resolution Modal */}
      {showResolution && (
        <DisputeResolution
          dispute={dispute}
          onClose={() => setShowResolution(false)}
          onResolve={onResolve}
        />
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Assign Dispute</h3>
            <p className="text-gray-600 mb-4">
              Assign this dispute case to yourself?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssign('admin', 'Admin User')}
                className="btn-primary"
              >
                Assign to Me
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputeDetails;