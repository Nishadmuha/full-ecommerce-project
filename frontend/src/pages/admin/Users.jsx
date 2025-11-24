import { useEffect, useState } from 'react';
import { getAllUsers, updateUser, deleteUser, toggleUserBlock, updateUserRole, getUserById } from '../../api/adminApi';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateUser(id, data);
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      alert('Error updating user');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (error) {
      alert('Error deleting user');
    }
  };

  const handleToggleBlock = async (id, currentStatus) => {
    const action = currentStatus ? 'unblock' : 'block';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await toggleUserBlock(id);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating user block status');
    }
  };

  const handleRoleChange = async (id, currentRole) => {
    const newRole = !currentRole;
    const roleText = newRole ? 'admin' : 'user';
    if (!confirm(`Are you sure you want to make this user an ${roleText}?`)) return;
    try {
      await updateUserRole(id, newRole);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating user role');
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await getUserById(userId);
      setSelectedUser(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Fallback to using user from list if API fails
      const user = users.find(u => u._id === userId);
      if (user) setSelectedUser(user);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
        <p className="text-gray-600">Total Users: {users.length}</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr 
                  key={user._id}
                  onClick={() => {
                    if (editingUser?._id !== user._id) {
                      handleViewUser(user._id);
                    }
                  }}
                  className={editingUser?._id !== user._id ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?._id === user._id ? (
                      <input
                        type="text"
                        defaultValue={user.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        className="border rounded px-2 py-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?._id === user._id ? (
                      <input
                        type="email"
                        defaultValue={user.email}
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      <div className="text-sm text-gray-500">{user.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?._id === user._id ? (
                      <input
                        type="text"
                        defaultValue={user.phone || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      <div className="text-sm text-gray-500">{user.phone || 'N/A'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?._id === user._id ? (
                      <input
                        type="checkbox"
                        checked={editingUser.isAdmin || false}
                        onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.checked })}
                        className="rounded"
                      />
                    ) : (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingUser?._id === user._id ? (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleUpdate(user._id, editingUser)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:text-red-900 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                            className={`text-xs px-2 py-1 rounded ${user.isBlocked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                          >
                            {user.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => handleRoleChange(user._id, user.isAdmin)}
                            className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            Make {user.isAdmin ? 'User' : 'Admin'}
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">User Details</h2>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Name:</h3>
                <p className="text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Email:</h3>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
              {selectedUser.phone && (
                <div>
                  <h3 className="font-semibold text-gray-700">Phone:</h3>
                  <p className="text-gray-900">{selectedUser.phone}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-700">Role:</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedUser.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {selectedUser.isAdmin ? 'Admin' : 'User'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Status:</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedUser.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              {selectedUser.address && (
                <div>
                  <h3 className="font-semibold text-gray-700">Address:</h3>
                  <pre className="text-gray-900 bg-gray-50 p-3 rounded text-sm">
                    {JSON.stringify(selectedUser.address, null, 2)}
                  </pre>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-700">Joined:</h3>
                <p className="text-gray-900">
                  {new Date(selectedUser.createdAt).toLocaleDateString()} at {new Date(selectedUser.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setEditingUser(selectedUser);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit User
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    handleToggleBlock(selectedUser._id, selectedUser.isBlocked);
                  }}
                  className={`px-4 py-2 rounded-lg ${selectedUser.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                >
                  {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

