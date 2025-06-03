// src/pages/UserManagement.tsx
import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
  getAllRoles,
} from "../api/UserService";
import { getAllFaculties, getAllDepartments } from "../api/UniversityService";
import type { UserResponse, UserRole, AddUserRequest, UpdateUserRequest } from "../types/User";
import type { Faculty, Department } from "../types/University";

const BLUE = "#05058c";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRoleId, setEditRoleId] = useState("");
  const [editFacultyId, setEditFacultyId] = useState<string | null>(null);
  const [editDepartmentId, setEditDepartmentId] = useState<string | null>(null);

  // Store IDs of roles that cannot be assigned to faculty/department
  const [restrictedRoleIds, setRestrictedRoleIds] = useState<string[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedRoles, fetchedFaculties, fetchedDepartments, fetchedUsers] = await Promise.all([
        getAllRoles(),
        getAllFaculties(),
        getAllDepartments(),
        getAllUsers(),
      ]);

      setRoles(fetchedRoles);
      setFaculties(fetchedFaculties);
      setDepartments(fetchedDepartments);
      setUsers(fetchedUsers);

      // Find and store IDs of roles that cannot be assigned to faculty/department
      const restricted = fetchedRoles
        .filter(r => r.name === 'ADMIN' || r.name === 'RECTOR' || r.name === 'STAFF')
        .map(r => r.id);
      setRestrictedRoleIds(restricted);

      // Set default selected values for new user form
      if (fetchedRoles.length > 0) {
        setSelectedRoleId(fetchedRoles[0].id);
        const defaultRoleIsRestricted = restricted.includes(fetchedRoles[0].id);
        if (defaultRoleIsRestricted) {
          setSelectedFacultyId(null);
          setSelectedDepartmentId(null);
        } else if (fetchedFaculties.length > 0) {
          setSelectedFacultyId(fetchedFaculties[0].id);
          const initialDepartments = fetchedDepartments.filter(d => d.facultyId === fetchedFaculties[0]?.id);
          if (initialDepartments.length > 0) setSelectedDepartmentId(initialDepartments[0].id);
          else setSelectedDepartmentId(null);
        } else {
          setSelectedFacultyId(null);
          setSelectedDepartmentId(null);
        }
      }

    } catch (err: any) {
      console.error("Failed to fetch initial data:", err.response?.data || err.message);
      setError("Failed to fetch initial data: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Check if selected role for new user is a restricted role
  const isNewUserRoleRestricted = restrictedRoleIds.includes(selectedRoleId);

  // Filter departments based on selected faculty for new user form
  const filteredNewDepartments = selectedFacultyId
    ? departments.filter((d) => d.facultyId === selectedFacultyId)
    : [];

  // Handle change for new user's role (to disable faculty/department selects for restricted roles)
  const handleNewRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    setSelectedRoleId(roleId);
    const roleIsRestricted = restrictedRoleIds.includes(roleId);
    if (roleIsRestricted) {
      setSelectedFacultyId(null);
      setSelectedDepartmentId(null);
    } else if (faculties.length > 0) { // If changing from restricted to non-restricted
        setSelectedFacultyId(faculties[0].id);
        const defaultDept = departments.find(d => d.facultyId === faculties[0].id);
        setSelectedDepartmentId(defaultDept ? defaultDept.id : null);
    } else {
        setSelectedFacultyId(null);
        setSelectedDepartmentId(null);
    }
  };

  // Handle change for new user's faculty
  const handleNewFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const facultyId = e.target.value;
    setSelectedFacultyId(facultyId === "" ? null : facultyId);
    const defaultDept = departments.find(d => d.facultyId === facultyId);
    setSelectedDepartmentId(defaultDept ? defaultDept.id : null);
  };

  // Check if selected role for editing user is a restricted role
  const isEditUserRoleRestricted = restrictedRoleIds.includes(editRoleId);

  // Filter departments based on selected faculty for edit form
  const filteredEditDepartments = editFacultyId
    ? departments.filter((d) => d.facultyId === editFacultyId)
    : [];

  // Handle change for editing user's role
  const handleEditRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    setEditRoleId(roleId);
    const roleIsRestricted = restrictedRoleIds.includes(roleId);
    if (roleIsRestricted) {
      setEditFacultyId(null);
      setEditDepartmentId(null);
    } else if (faculties.length > 0 && !editFacultyId) { // If changing from restricted to non-restricted, try to set a default faculty
        setEditFacultyId(faculties[0].id);
        const defaultDept = departments.find(d => d.facultyId === faculties[0].id);
        setEditDepartmentId(defaultDept ? defaultDept.id : null);
    }
  };

  // Handle change for editing user's faculty
  const handleEditFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const facultyId = e.target.value;
    setEditFacultyId(facultyId === "" ? null : facultyId);
    const defaultDept = departments.find(d => d.facultyId === facultyId);
    setEditDepartmentId(defaultDept ? defaultDept.id : null);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // If selected role is restricted, ensure faculty and department are null
    const finalFacultyId = isNewUserRoleRestricted ? null : selectedFacultyId;
    const finalDepartmentId = isNewUserRoleRestricted ? null : selectedDepartmentId;

    try {
      const requestData: AddUserRequest = {
        name,
        email,
        password,
        roleId: selectedRoleId,
        facultyId: finalFacultyId,
        departmentId: finalDepartmentId,
      };
      await addUser(requestData);
      alert("User added successfully!");
      setName("");
      setEmail("");
      setPassword("");
      // Reset dropdowns to default after adding
      if (roles.length > 0) {
        setSelectedRoleId(roles[0].id);
        // Reset faculty/department based on the new default role
        const defaultRoleIsRestricted = restrictedRoleIds.includes(roles[0].id);
        if (defaultRoleIsRestricted) {
            setSelectedFacultyId(null);
            setSelectedDepartmentId(null);
        } else if (faculties.length > 0) {
            setSelectedFacultyId(faculties[0].id);
            const initialDepartments = departments.filter(d => d.facultyId === faculties[0]?.id);
            setSelectedDepartmentId(initialDepartments.length > 0 ? initialDepartments[0].id : null);
        } else {
            setSelectedFacultyId(null);
            setSelectedDepartmentId(null);
        }
      }
      fetchInitialData(); // Re-fetch all data
    } catch (err: any) {
      console.error("Failed to add user:", err.response?.data || err.message);
      setError("Failed to add user: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteUser(userId);
      alert("User deleted successfully!");
      fetchInitialData();
    } catch (err: any) {
      console.error("Failed to delete user:", err.response?.data || err.message);
      setError("Failed to delete user: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (user: UserResponse) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRoleId(user.role?.id ?? "");
    setEditFacultyId(user.faculty?.id ?? null);
    setEditDepartmentId(user.department?.id ?? null);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditName("");
    setEditEmail("");
    setEditRoleId("");
    setEditFacultyId(null);
    setEditDepartmentId(null);
  };

  const handleSaveEdit = async (userId: string) => {
    setLoading(true);
    setError(null);

    // If selected role is restricted, ensure faculty and department are null
    const finalEditFacultyId = isEditUserRoleRestricted ? null : editFacultyId;
    const finalEditDepartmentId = isEditUserRoleRestricted ? null : editDepartmentId;

    try {
      const requestData: UpdateUserRequest = {
        name: editName,
        email: editEmail,
        roleId: editRoleId,
        facultyId: finalEditFacultyId,
        departmentId: finalEditDepartmentId,
      };
      await updateUser(userId, requestData);
      alert("User updated successfully!");
      handleCancelEdit();
      fetchInitialData();
    } catch (err: any) {
      console.error("Failed to update user:", err.response?.data || err.message);
      setError("Failed to update user: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8">
      <div
        className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-6xl border"
        style={{ borderColor: BLUE }}
      >
        <h1
          className="text-2xl font-extrabold mb-8 text-center tracking-tight drop-shadow"
          style={{ color: BLUE }}
        >
          User Management
        </h1>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}

        {/* Add User Form */}
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center mb-10">
          <input
            type="text"
            placeholder="User Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
          />
          <input
            type="email"
            placeholder="User Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#05058c] outline-none transition"
            required
          />
          <select
            value={selectedRoleId}
            onChange={handleNewRoleChange}
            className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 text-base transition"
            required
            style={{ color: BLUE }}
          >
            {roles.map((r) => (
              <option value={r.id} key={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          {/* Faculty Selection for Add User */}
          <select
            value={selectedFacultyId || ""}
            onChange={handleNewFacultyChange}
            className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 text-base transition"
            style={{ color: BLUE }}
            disabled={isNewUserRoleRestricted || faculties.length === 0 || loading}
          >
            <option value="">Select Faculty (Optional)</option>
            {faculties.map((f) => (
              <option value={f.id} key={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          {/* Department Selection for Add User (filtered by selected faculty) */}
          <select
            value={selectedDepartmentId || ""}
            onChange={(e) => setSelectedDepartmentId(e.target.value === "" ? null : e.target.value)}
            className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 text-base transition"
            style={{ color: BLUE }}
            disabled={isNewUserRoleRestricted || !selectedFacultyId || filteredNewDepartments.length === 0 || loading}
          >
            <option value="">Select Department (Optional)</option>
            {filteredNewDepartments.map((d) => (
              <option value={d.id} key={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="col-span-1 md:col-span-2 lg:col-span-3 px-8 py-3 rounded-xl shadow font-bold text-base hover:opacity-90 active:scale-95 transition"
            style={{ backgroundColor: BLUE, color: "#fff" }}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>

        {/* User Table */}
        <div className="overflow-x-auto rounded-2xl shadow">
          <table className="min-w-full bg-white rounded-2xl overflow-hidden text-base">
            <thead>
              <tr>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Name</th>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Email</th>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Role</th>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Faculty</th>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Department</th>
                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50 transition group">
                    {/* Name */}
                    <td className="py-3 px-6 border-b border-gray-100">
                      {editingUserId === user.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="p-2 border rounded-lg text-base"
                        />
                      ) : (
                        <span className="font-semibold">{user.name}</span>
                      )}
                    </td>
                    {/* Email */}
                    <td className="py-3 px-6 border-b border-gray-100">
                      {editingUserId === user.id ? (
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="p-2 border rounded-lg text-base"
                        />
                      ) : (
                        <span>{user.email}</span>
                      )}
                    </td>
                    {/* Role */}
                    <td className="py-3 px-6 border-b border-gray-100">
                      {editingUserId === user.id ? (
                        <select
                          value={editRoleId}
                          onChange={handleEditRoleChange}
                          className="p-2 border rounded-lg text-base"
                          style={{ color: BLUE }}
                        >
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                          style={{ backgroundColor: "#e5e7fa", color: BLUE, border: `1px solid ${BLUE}` }}
                        >
                          {user.role?.name}
                        </span>
                      )}
                    </td>
                    {/* Faculty */}
                    <td className="py-3 px-6 border-b border-gray-100">
                      {editingUserId === user.id ? (
                        <select
                          value={editFacultyId || ""}
                          onChange={handleEditFacultyChange}
                          className="p-2 border rounded-lg text-base"
                          style={{ color: BLUE }}
                          disabled={isEditUserRoleRestricted || faculties.length === 0 || loading}
                        >
                          <option value="">No Faculty</option>
                          {faculties.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{user.faculty?.name || "N/A"}</span>
                      )}
                    </td>
                    {/* Department */}
                    <td className="py-3 px-6 border-b border-gray-100">
                      {editingUserId === user.id ? (
                        <select
                          value={editDepartmentId || ""}
                          onChange={e => setEditDepartmentId(e.target.value === "" ? null : e.target.value)}
                          className="p-2 border rounded-lg text-base"
                          style={{ color: BLUE }}
                          disabled={isEditUserRoleRestricted || !editFacultyId || filteredEditDepartments.length === 0 || loading}
                        >
                          <option value="">No Department</option>
                          {filteredEditDepartments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{user.department?.name || "N/A"}</span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="py-3 px-6 border-b border-gray-100 flex gap-2 justify-center">
                      {editingUserId === user.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(user.id)}
                            className="px-4 py-2 rounded-lg font-bold text-base bg-green-600 text-white hover:bg-green-700"
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-4 py-2 rounded-lg font-bold text-base bg-gray-500 text-white hover:bg-gray-600"
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(user)}
                            className="px-4 py-2 rounded-lg font-bold text-base bg-yellow-500 text-white hover:bg-yellow-600"
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-4 py-2 rounded-lg font-bold text-base bg-red-600 text-white hover:bg-red-700"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {loading && <div className="mt-6" style={{ color: BLUE, textAlign: "center" }}>Loading...</div>}
      </div>
    </div>
  );
};

export default UserManagement;