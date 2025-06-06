import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/AxiosInstance";
import { useAuthStore } from "../store/AuthStore";
import { getAllFaculties } from "../api/FacultyService";
import { getAllDepartments } from "../api/DepartmentService";
import type { Faculty } from "../types/Faculty";
import type { Department } from "../types/Department";

type UserRole = { id: string; name: string };
type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  faculty?: { id: string; name: string } | null;
  department?: { id: string; name: string } | null;
};

const BG = "#f8f9fb";
const PRIMARY = "#21409a";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [selectedFacultyIdForNewUser, setSelectedFacultyIdForNewUser] = useState("");
  const [selectedDepartmentIdForNewUser, setSelectedDepartmentIdForNewUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRoleId, setEditRoleId] = useState("");
  const [selectedFacultyIdForEditUser, setSelectedFacultyIdForEditUser] = useState("");
  const [selectedDepartmentIdForEditUser, setSelectedDepartmentIdForEditUser] = useState("");
  const navigate = useNavigate();
  const { role: currentUserRole } = useAuthStore();

  useEffect(() => {
    if (currentUserRole === "ADMIN") fetchData();
    else {
      alert("You are not authorized to access User Management.");
      navigate("/dashboard");
    }
  }, [currentUserRole, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, usersRes, facultiesRes, departmentsRes] = await Promise.all([
        axiosInstance.get("/roles"),
        axiosInstance.get("/users"),
        getAllFaculties(),
        getAllDepartments(),
      ]);
      setRoles(rolesRes.data || []);
      setUsers(usersRes.data || []);
      setFaculties(facultiesRes || []);
      setDepartments(departmentsRes || []);
      if (rolesRes.data.length > 0) setRoleId(rolesRes.data[0].id);
      if (facultiesRes.length > 0) {
        setSelectedFacultyIdForNewUser(facultiesRes[0].id);
        const initialDepartments = departmentsRes.filter((d: Department) => d.facultyId === facultiesRes[0].id);
        setSelectedDepartmentIdForNewUser(initialDepartments[0]?.id || "");
      } else {
        setSelectedFacultyIdForNewUser("");
        setSelectedDepartmentIdForNewUser("");
      }
    } catch (err) {
      setUsers([]); setRoles([]); setFaculties([]); setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestBody = {
        name, email, password, roleId,
        facultyId: selectedFacultyIdForNewUser || null,
        departmentId: selectedDepartmentIdForNewUser || null,
      };
      const response = await axiosInstance.post("/users", requestBody);
      if (response.status === 200) {
        setName(""); setEmail(""); setPassword("");
        setRoleId(roles[0]?.id || "");
        setSelectedFacultyIdForNewUser(faculties[0]?.id || "");
        const defaultFacultyDepartments = faculties[0]?.id ? departments.filter(d => d.facultyId === faculties[0].id) : [];
        setSelectedDepartmentIdForNewUser(defaultFacultyDepartments[0]?.id || "");
        fetchData();
      }
    } finally { setLoading(false); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    try {
      const response = await axiosInstance.delete(`/users/${userId}`);
      if (response.status === 200) fetchData();
    } finally { setLoading(false); }
  };

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRoleId(user.role?.id ?? "");
    setSelectedFacultyIdForEditUser(user.faculty?.id ?? "");
    setSelectedDepartmentIdForEditUser(user.department?.id ?? "");
  };
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditName("");
    setEditEmail("");
    setEditRoleId("");
    setSelectedFacultyIdForEditUser("");
    setSelectedDepartmentIdForEditUser("");
  };
  const handleSaveEdit = async (userId: string) => {
    setLoading(true);
    try {
      const requestBody = {
        name: editName, email: editEmail, roleId: editRoleId,
        facultyId: selectedFacultyIdForEditUser || null,
        departmentId: selectedDepartmentIdForEditUser || null,
      };
      const response = await axiosInstance.put(`/users/${userId}`, requestBody);
      if (response.status === 200) {
        setEditingUserId(null); setEditName(""); setEditEmail(""); setEditRoleId(""); setSelectedFacultyIdForEditUser(""); setSelectedDepartmentIdForEditUser("");
        fetchData();
      }
    } finally { setLoading(false); }
  };

  const filteredDepartmentsForNewUser = selectedFacultyIdForNewUser
    ? departments.filter(d => d.facultyId === selectedFacultyIdForNewUser)
    : [];
  const filteredDepartmentsForEditUser = selectedFacultyIdForEditUser
    ? departments.filter(d => d.facultyId === selectedFacultyIdForEditUser)
    : [];

  if (currentUserRole !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: BG }}>
        <div className="text-xl text-gray-700">Access Denied.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-10 px-2" style={{ background: BG }}>
      <div className="w-full max-w-6xl flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-[#21409a] text-center tracking-tight">User Management</h1>
        {/* Add User Form */}
        <form onSubmit={handleAddUser} className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 px-4">
          <input
            type="text"
            placeholder="User Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
            required
          />
          <input
            type="email"
            placeholder="User Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
            required
          />
          <select
            value={roleId}
            onChange={e => setRoleId(e.target.value)}
            className="p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
            required
            style={{ color: PRIMARY }}
          >
            {roles.map((r) => (
              <option value={r.id} key={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            value={selectedFacultyIdForNewUser}
            onChange={e => {
              setSelectedFacultyIdForNewUser(e.target.value);
              setSelectedDepartmentIdForNewUser("");
              const filtered = departments.filter(d => d.facultyId === e.target.value);
              if (filtered.length > 0) setSelectedDepartmentIdForNewUser(filtered[0].id);
            }}
            className="p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
            style={{ color: PRIMARY }}
          >
            <option value="">No Faculty</option>
            {faculties.map((f) => (
              <option value={f.id} key={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <select
            value={selectedDepartmentIdForNewUser}
            onChange={e => setSelectedDepartmentIdForNewUser(e.target.value)}
            className="p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-[#21409a] outline-none transition"
            style={{ color: PRIMARY }}
            disabled={!selectedFacultyIdForNewUser || filteredDepartmentsForNewUser.length === 0}
          >
            <option value="">No Department</option>
            {filteredDepartmentsForNewUser.map((d) => (
              <option value={d.id} key={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="md:col-span-1 w-full mt-2 py-2 rounded-md bg-[#21409a] hover:bg-[#18316e] text-white font-semibold text-sm shadow-md transition-all duration-150"
            style={{ letterSpacing: ".03em", boxShadow: `0 2.5px 8px -3px #21409a25` }}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
        {/* User Table */}
        <div className="w-full mt-2 overflow-x-auto rounded-lg">
          <table className="min-w-full bg-white text-sm rounded-lg">
            <thead>
              <tr>
                <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Name</th>
                <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Email</th>
                <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Role</th>
                <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Faculty</th>
                <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Department</th>
                <th className="py-3 px-4 bg-[#e5eaf8] text-[#21409a] font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50 transition">
                  <td className="py-2 px-4 border-b border-gray-100">
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="p-1 border rounded-md text-xs w-28"
                      />
                    ) : (
                      <span className="font-semibold">{user.name}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-100">
                    {editingUserId === user.id ? (
                      <input
                        type="email"
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        className="p-1 border rounded-md text-xs w-36"
                      />
                    ) : (
                      <span>{user.email}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-100">
                    {editingUserId === user.id ? (
                      <select
                        value={editRoleId}
                        onChange={e => setEditRoleId(e.target.value)}
                        className="p-1 border rounded-md text-xs"
                        style={{ color: PRIMARY }}
                      >
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                        style={{ backgroundColor: "#e5e7fa", color: PRIMARY, border: `1px solid ${PRIMARY}` }}
                      >
                        {roles.find(r => r.id === user.role?.id)?.name ?? user.role?.name}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-100">
                    {editingUserId === user.id ? (
                      <select
                        value={selectedFacultyIdForEditUser}
                        onChange={e => {
                          setSelectedFacultyIdForEditUser(e.target.value);
                          setSelectedDepartmentIdForEditUser("");
                          const filtered = departments.filter(d => d.facultyId === e.target.value);
                          if (filtered.length > 0) setSelectedDepartmentIdForEditUser(filtered[0].id);
                        }}
                        className="p-1 border rounded-md text-xs"
                        style={{ color: PRIMARY }}
                      >
                        <option value="">No Faculty</option>
                        {faculties.map(f => (
                          <option value={f.id} key={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{user.faculty?.name || "N/A"}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-100">
                    {editingUserId === user.id ? (
                      <select
                        value={selectedDepartmentIdForEditUser}
                        onChange={e => setSelectedDepartmentIdForEditUser(e.target.value)}
                        className="p-1 border rounded-md text-xs"
                        style={{ color: PRIMARY }}
                        disabled={!selectedFacultyIdForEditUser || filteredDepartmentsForEditUser.length === 0}
                      >
                        <option value="">No Department</option>
                        {filteredDepartmentsForEditUser.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{user.department?.name || "N/A"}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-100 flex gap-2">
                    {editingUserId === user.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(user.id)}
                          className="px-3 py-1 rounded-md font-bold text-xs bg-green-600 text-white hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-3 py-1 rounded-md font-bold text-xs bg-gray-500 text-white hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(user)}
                          className="px-3 py-1 rounded-md font-bold text-xs bg-yellow-400 text-[#21409a] hover:bg-yellow-500"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 rounded-md font-bold text-xs bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="mt-6 text-[#21409a] text-center">Loading...</div>}
      </div>
    </div>
  );
};

export default UserManagement;
