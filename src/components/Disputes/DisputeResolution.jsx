// src/components/Disputes/DisputeResolution.jsx
import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  Ban,
  RefreshCw,
  FileText
} from 'lucide-react';

const DisputeResolution = ({ dispute, onClose, onResolve }) => {
  const [resolution, setResolution] = useState({
    decision: '',
    explanation: '',
    actions: [],
    compensation: null,
    followUp: false
  });

  const decisions = [
    { id: 'favor_reporter', label: 'In favor of reporter', icon: CheckCircle },
    { id: 'favor_respondent', label: 'In favor of respondent', icon: CheckCircle },
    { id: 'partial_resolution', label: 'Partial resolution', icon: RefreshCw },
    { id: 'no_action', label: 'No action required', icon: Ban }
  ];

  const handleAddAction = (actionType) => {
    const newAction = { type: actionType, details: {} };
    
    switch (actionType) {
      case 'refund':
        newAction.details = { amount: 0, method: 'original' };
        break;
      case 'credit':
        newAction.details = { amount: 0 };
        break;
      case 'suspend_user':
        newAction.details = { userId: '', duration: 30, reason: '' };
        break;
      case 'block_listing':
        newAction.details = { listingId: '', reason: '' };
        break;
    }
    
    setResolution({
      ...resolution,
      actions: [...resolution.actions, newAction]
    });
  };

  const handleRemoveAction = (index) => {
    setResolution({
      ...resolution,
      actions: resolution.actions.filter((_, i) => i !== index)
    });
  };

  const handleUpdateAction = (index, updates) => {
    const updatedActions = [...resolution.actions];
    updatedActions[index] = { ...updatedActions[index], ...updates };
    setResolution({ ...resolution, actions: updatedActions });
  };

  const handleSubmit = () => {
    if (!resolution.decision || !resolution.explanation) {
      alert('Please provide a decision and explanation');
      return;
    }
    
    onResolve(dispute.id, {
      ...resolution,
      resolvedBy: 'Admin User', // Should be actual admin user
      resolvedAt: new Date()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Resolve Dispute</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Decision */}
          <div>
            <h3 className="font-medium mb-3">Decision</h3>
            <div className="grid grid-cols-2 gap-3">
              {decisions.map((decision) => (
                <button
                  key={decision.id}
                  onClick={() => setResolution({ ...resolution, decision: decision.id })}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    resolution.decision === decision.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <decision.icon className="mx-auto mb-2" size={24} />
                  <p className="text-sm font-medium">{decision.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Explanation <span className="text-red-500">*</span>
            </label>
            <textarea
              className="input h-32"
              value={resolution.explanation}
              onChange={(e) => setResolution({ ...resolution, explanation: e.target.value })}
              placeholder="Provide a detailed explanation for this decision..."
              required
            />
          </div>

          {/* Compensation */}
          {(resolution.decision === 'favor_reporter' || resolution.decision === 'partial_resolution') && (
            <div>
              <h3 className="font-medium mb-3">Compensation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    className="input"
                    value={resolution.compensation?.type || ''}
                    onChange={(e) => setResolution({
                      ...resolution,
                      compensation: { ...resolution.compensation, type: e.target.value }
                    })}
                  >
                    <option value="">Select compensation type</option>
                    <option value="full_refund">Full Refund</option>
                    <option value="partial_refund">Partial Refund</option>
                    <option value="credit">Platform Credit</option>
                    <option value="discount">Future Discount</option>
                  </select>
                </div>
                
                {resolution.compensation?.type && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        className="input pl-10"
                        value={resolution.compensation?.amount || ''}
                        onChange={(e) => setResolution({
                          ...resolution,
                          compensation: { ...resolution.compensation, amount: parseFloat(e.target.value) }
                        })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div>
            <h3 className="font-medium mb-3">Additional Actions</h3>
            
            {resolution.actions.length > 0 && (
              <div className="space-y-3 mb-4">
                {resolution.actions.map((action, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-medium capitalize">
                        {action.type.replace(/_/g, ' ')}
                      </p>
                      <button
                        onClick={() => handleRemoveAction(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    {/* Action-specific fields */}
                    {action.type === 'refund' && (
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          className="input"
                          placeholder="Amount"
                          value={action.details.amount}
                          onChange={(e) => handleUpdateAction(index, {
                            details: { ...action.details, amount: parseFloat(e.target.value) }
                          })}
                        />
                        <select
                          className="input"
                          value={action.details.method}
                          onChange={(e) => handleUpdateAction(index, {
                            details: { ...action.details, method: e.target.value }
                          })}
                        >
                          <option value="original">Original Payment Method</option>
                          <option value="gcash">GCash</option>
                          <option value="bank">Bank Transfer</option>
                        </select>
                      </div>
                    )}
                    
                    {action.type === 'suspend_user' && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          className="input"
                          placeholder="User ID"
                          value={action.details.userId}
                          onChange={(e) => handleUpdateAction(index, {
                            details: { ...action.details, userId: e.target.value }
                          })}
                        />
                        <input
                          type="number"
                          className="input"
                          placeholder="Duration (days)"
                          value={action.details.duration}
                          onChange={(e) => handleUpdateAction(index, {
                            details: { ...action.details, duration: parseInt(e.target.value) }
                          })}
                        />
                        <input
                          type="text"
                          className="input"
                          placeholder="Reason"
                          value={action.details.reason}
                          onChange={(e) => handleUpdateAction(index, {
                            details: { ...action.details, reason: e.target.value }
                          })}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => handleAddAction('refund')}
                className="btn-secondary text-sm"
              >
                Add Refund
              </button>
              <button
                onClick={() => handleAddAction('credit')}
                className="btn-secondary text-sm"
              >
                Add Credit
              </button>
              <button
                onClick={() => handleAddAction('suspend_user')}
                className="btn-secondary text-sm"
              >
                Suspend User
              </button>
              <button
                onClick={() => handleAddAction('block_listing')}
                className="btn-secondary text-sm"
              >
                Block Listing
              </button>
            </div>
          </div>

          {/* Follow-up */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={resolution.followUp}
                onChange={(e) => setResolution({ ...resolution, followUp: e.target.checked })}
              />
              <span className="text-sm font-medium">Schedule follow-up in 7 days</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary flex items-center gap-2"
          >
            <CheckCircle size={20} />
            Resolve Dispute
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisputeResolution;