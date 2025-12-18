import { useEffect, useState } from 'react';
import { getAllComplaints, updateComplaintStatus } from '../../api/adminApi';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await getAllComplaints();
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, status, adminResponse) => {
    try {
      await updateComplaintStatus(complaintId, { status, adminResponse });
      fetchComplaints();
      setSelectedComplaint(null);
      setResponseText('');
    } catch (error) {
      alert('Error updating complaint');
    }
  };

  const statusOptions = ['pending', 'in-progress', 'resolved', 'closed'];
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Complaints Management</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-900"
                    >
                      {complaint._id.slice(-8)}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{complaint.userId?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{complaint.userId?.email || ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{complaint.subject}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{complaint.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[complaint.status] || 'bg-gray-100'}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Complaint Details</h2>
              <button onClick={() => { setSelectedComplaint(null); setResponseText(''); }} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Complaint ID:</h3>
                <p className="text-gray-600">{selectedComplaint._id}</p>
              </div>
              <div>
                <h3 className="font-semibold">Customer:</h3>
                <p className="text-gray-600">{selectedComplaint.userId?.name} ({selectedComplaint.userId?.email})</p>
              </div>
              {selectedComplaint.orderId && (
                <div>
                  <h3 className="font-semibold">Related Order:</h3>
                  <p className="text-gray-600">Order ID: {selectedComplaint.orderId._id?.slice(-8)}</p>
                  <p className="text-gray-600">Amount: ${selectedComplaint.orderId.totalAmount?.toFixed(2)}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold">Subject:</h3>
                <p className="text-gray-600">{selectedComplaint.subject}</p>
              </div>
              <div>
                <h3 className="font-semibold">Message:</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedComplaint.message}</p>
              </div>
              <div>
                <h3 className="font-semibold">Current Status:</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedComplaint.status] || 'bg-gray-100'}`}>
                  {selectedComplaint.status}
                </span>
              </div>
              {selectedComplaint.adminResponse && (
                <div>
                  <h3 className="font-semibold">Admin Response:</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedComplaint.adminResponse}</p>
                </div>
              )}
              {selectedComplaint.resolvedAt && (
                <div>
                  <h3 className="font-semibold">Resolved At:</h3>
                  <p className="text-gray-600">{new Date(selectedComplaint.resolvedAt).toLocaleString()}</p>
                </div>
              )}
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Update Status & Response:</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={selectedComplaint.status}
                      onChange={(e) => setSelectedComplaint({ ...selectedComplaint, status: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Response</label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      rows="4"
                      placeholder="Enter your response to the customer..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedComplaint._id, selectedComplaint.status, responseText)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => { setSelectedComplaint(null); setResponseText(''); }}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}












