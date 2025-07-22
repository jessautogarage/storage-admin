// src/components/Disputes/DisputeTimeline.jsx
import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare,
  User,
  FileText,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

const DisputeTimeline = ({ timeline }) => {
  const getTimelineIcon = (action) => {
    const icons = {
      dispute_created: AlertTriangle,
      assigned: User,
      status_changed: Clock,
      evidence_added: FileText,
      message_sent: MessageSquare,
      resolved: CheckCircle
    };
    
    const IconComponent = icons[action.split('_to_')[0]] || Shield;
    return <IconComponent size={16} />;
  };

  const getTimelineColor = (action) => {
    if (action.includes('resolved')) return 'text-green-600 bg-green-50';
    if (action.includes('rejected')) return 'text-red-600 bg-red-50';
    if (action.includes('assigned')) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium mb-3">Case Timeline</h3>
      
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-gray-200"></div>
        
        {/* Timeline items */}
        <div className="space-y-6">
          {timeline.map((event, index) => (
            <div key={index} className="flex gap-4">
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                getTimelineColor(event.action)
              }`}>
                {getTimelineIcon(event.action)}
              </div>
              
              <div className="flex-1 pb-6">
                <p className="font-medium text-gray-900">{event.description}</p>
                {event.notes && (
                  <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>{event.user}</span>
                  <span>•</span>
                  <span>{format(event.timestamp?.toDate() || new Date(), 'PPpp')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisputeTimeline;