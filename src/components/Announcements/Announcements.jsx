import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Users } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { databaseService } from '../../services/database';
import { format } from 'date-fns';

const Announcements = () => {
  const { data: announcements, loading } = useFirestore('announcements');
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'all',
    priority: 'normal',
    active: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingAnnouncement) {
      await databaseService.update('announcements', editingAnnouncement.id, formData);
    } else {
      await databaseService.create('announcements', {
        ...formData,
        createdBy: 'admin',
        views: 0
      });
    }
    
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      targetAudience: 'all',
      priority: 'normal',
      active: true
    });
    setEditingAnnouncement(null);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      targetAudience: announcement.targetAudience || 'all',
      priority: announcement.priority || 'normal',
      active: announcement.active !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      await databaseService.delete('announcements', id);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    await databaseService.update('announcements', id, {
      active: !currentStatus
    });
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Create and manage platform announcements</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Create Announcement
        </button>
      </div>

      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="card p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{announcement.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    priorityColors[announcement.priority || 'normal']
                  }`}>
                    {announcement.priority || 'normal'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    announcement.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {announcement.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{announcement.content}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>
                      {format(announcement.createdAt?.toDate?.() || new Date(announcement.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>Target: {announcement.targetAudience || 'all'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={16} />
                    <span>{announcement.views || 0} views</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => toggleActive(announcement.id, announcement.active)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={announcement.active ? 'Deactivate' : 'Activate'}
                >
                  {announcement.active ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                  onClick={() => handleEdit(announcement)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {announcements.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-gray-500">No announcements yet. Create your first announcement!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-4">
              {editingAnnouncement ? 'Edit' : 'Create'} Announcement
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  className="input h-32 resize-none"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Audience</label>
                  <select
                    className="input"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                  >
                    <option value="all">All Users</option>
                    <option value="clients">Clients Only</option>
                    <option value="hosts">Hosts Only</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    className="input"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">Active</span>
              </label>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingAnnouncement ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;