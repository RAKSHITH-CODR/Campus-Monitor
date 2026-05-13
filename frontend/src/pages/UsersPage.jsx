import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { userAPI } from '../services/api';
import { useStore } from '../store/useStore';

export default function UsersPage() {
  const { auth } = useStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [deleteError, setDeleteError] = useState('');
  const [roleChangeError, setRoleChangeError] = useState('');
  const [selectedRole, setSelectedRole] = useState({});

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setDeleteError('');
      const response = await userAPI.getAll(page, 15);
      
      if (response.data) {
        setUsers(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setDeleteError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setRoleChangeError('');
      await userAPI.updateUserRole(userId, newRole);
      
      setUsers(users.map(u => 
        u._id === userId ? { ...u, role: newRole } : u
      ));
      
      setSelectedRole(prev => ({ ...prev, [userId]: null }));
    } catch (error) {
      console.error('Failed to update role:', error);
      setRoleChangeError('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      setDeleteError('');
      await userAPI.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
      setDeleteError('Failed to delete user');
    }
  };

  const handleNextPage = () => {
    if (pagination.pages && page < pagination.pages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const roleColors = {
    admin: 'from-red-500/20 to-pink-500/20 border-red-500/30 text-red-200',
    manager: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-200',
    viewer: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-200',
  };

  if (loading && users.length === 0) {
    return <div className="text-center text-slate-400 py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-400" />
          User Management
        </h1>
      </motion.div>

      {deleteError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200"
        >
          {deleteError}
        </motion.div>
      )}

      {roleChangeError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-orange-500/20 border border-orange-500/50 rounded-lg text-orange-200"
        >
          {roleChangeError}
        </motion.div>
      )}

      {/* Users Table */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {users.length > 0 ? (
            <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {users.map((user, idx) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-lg border backdrop-blur-sm bg-gradient-to-r ${roleColors[user.role]} hover:shadow-lg transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{user.name}</h3>
                      <p className="text-sm text-slate-300">{user.email}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Role Badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">Role:</span>
                        <select
                          value={selectedRole[user._id] || user.role}
                          onChange={(e) => {
                            if (e.target.value !== user.role) {
                              handleRoleChange(user._id, e.target.value);
                            }
                          }}
                          disabled={auth.user?._id === user._id}
                          className="px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      {/* Delete Button */}
                      {auth.user?._id !== user._id && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center text-slate-400 py-8">No users found</div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {pagination.pages && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevPage}
            disabled={page === 1}
            className="p-2 rounded-lg bg-slate-700/30 border border-slate-600/30 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <div className="flex gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  page === p
                    ? 'bg-blue-500/30 border border-blue-400/50 text-white'
                    : 'bg-slate-700/20 border border-slate-600/30 text-slate-300 hover:border-slate-500/50'
                }`}
              >
                {p}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextPage}
            disabled={page === pagination.pages}
            className="p-2 rounded-lg bg-slate-700/30 border border-slate-600/30 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
