// src/pages/UserManagement.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/AxiosInstance";
import { useAuthStore } from "../store/AuthStore";
import { getAllFaculties } from "../api/FacultyService";
import { getAllDepartments } from "../api/DepartmentService";
import type { Faculty } from "../types/Faculty";
import type { Department } from "../types/Department";


// Define types for user data from backend
type UserRole = {
  id: string;
  name: string;
};
type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  faculty?: { id: string; name: string } | null;
  department?: { id: string; name: string } | null;
};

const BLUE = "#05058c";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Form states for adding new user
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [selectedFacultyIdForNewUser, setSelectedFacultyIdForNewUser] = useState("");
  const [selectedDepartmentIdForNewUser, setSelectedDepartmentIdForNewUser] = useState("");

  const [loading, setLoading] = useState(false);

  // Edit state for existing user
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRoleId, setEditRoleId] = useState("");
  const [selectedFacultyIdForEditUser, setSelectedFacultyIdForEditUser] = useState("");
  const [selectedDepartmentIdForEditUser, setSelectedDepartmentIdForEditUser] = useState("");


  const navigate = useNavigate();
  const { role: currentUserRole } = useAuthStore();

  useEffect(() => {
    if (currentUserRole === "ADMIN") {
        fetchData();
    } else {
        alert("You are not authorized to access User Management.");
        navigate("/dashboard");
    }
  }, [currentUserRole, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Axios response'ları doğrudan data property'sini içerir.
      const [rolesRes, usersRes, facultiesRes, departmentsRes] = await Promise.all([
        axiosInstance.get("/roles"),
        axiosInstance.get("/users"),
        getAllFaculties(),
        getAllDepartments(),
      ]);

      setRoles(rolesRes.data || []);
      setUsers(usersRes.data || []);
      setFaculties(facultiesRes || []); // `getAllFaculties` zaten Faculty[] döndürüyor
      setDepartments(departmentsRes || []); // `getAllDepartments` zaten Department[] döndürüyor

      if (rolesRes.data.length > 0) {
        setRoleId(rolesRes.data[0].id);
      }
      if (facultiesRes.length > 0) {
        setSelectedFacultyIdForNewUser(facultiesRes[0].id);
        const initialDepartments = departmentsRes.filter((d: Department) => d.facultyId === facultiesRes[0].id);
        if (initialDepartments.length > 0) {
          setSelectedDepartmentIdForNewUser(initialDepartments[0].id);
        } else {
          setSelectedDepartmentIdForNewUser("");
        }
      } else {
        setSelectedFacultyIdForNewUser("");
        setSelectedDepartmentIdForNewUser("");
      }

    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      alert("Failed to fetch data (roles, users, faculties, departments).");
      setUsers([]);
      setRoles([]);
      setFaculties([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestBody = {
        name,
        email,
        password,
        roleId,
        facultyId: selectedFacultyIdForNewUser || null,
        departmentId: selectedDepartmentIdForNewUser || null,
      };
      const response = await axiosInstance.post("/users", requestBody);
      if (response.status === 200) {
        alert("User added successfully!");
        setName("");
        setEmail("");
        setPassword("");
        setRoleId(roles[0]?.id || ""); // Reset to first role
        setSelectedFacultyIdForNewUser(faculties[0]?.id || ""); // Reset to first faculty
        // Reset department based on the default faculty
        const defaultFacultyDepartments = faculties[0]?.id ? departments.filter(d => d.facultyId === faculties[0].id) : [];
        setSelectedDepartmentIdForNewUser(defaultFacultyDepartments[0]?.id || "");
        
        fetchData();
      } else {
        alert("Failed to add user: " + response.data);
      }
    } catch (err: any) {
      console.error("Failed to add user:", err);
      alert("Failed to add user: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    try {
      const response = await axiosInstance.delete(`/users/${userId}`);
      if (response.status === 200) {
        alert("User deleted successfully!");
        fetchData();
      } else {
        alert("Failed to delete user.");
      }
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
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
        name: editName,
        email: editEmail,
        // password: not included in update request unless specifically changing it.
        // If password needs to be changed, add an input field for it.
        roleId: editRoleId,
        facultyId: selectedFacultyIdForEditUser || null,
        departmentId: selectedDepartmentIdForEditUser || null,
      };
      const response = await axiosInstance.put(`/users/${userId}`, requestBody);
      if (response.status === 200) {
        alert("User updated successfully!");
        setEditingUserId(null);
        setEditName("");
        setEditEmail("");
        setEditRoleId("");
        setSelectedFacultyIdForEditUser("");
        setSelectedDepartmentIdForEditUser("");
        fetchData();
      } else {
        alert("Failed to update user: " + response.data);
      }
    } catch (err: any) {
      console.error("Failed to update user:", err);
      alert("Failed to update user: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filter departments based on selected faculty for the NEW user form
  const filteredDepartmentsForNewUser = selectedFacultyIdForNewUser
    ? departments.filter(d => d.facultyId === selectedFacultyIdForNewUser)
    : [];

  // Filter departments based on selected faculty for the EDIT user form
  const filteredDepartmentsForEditUser = selectedFacultyIdForEditUser
    ? departments.filter(d => d.facultyId === selectedFacultyIdForEditUser)
    : [];


  if (currentUserRole !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-red-600">Access Denied.</p>
          <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-8">
      {/* NAV BUTTONS */}
      <div className="flex gap-3 mb-6 w-full max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 rounded-xl font-semibold text-base"
          style={{
            backgroundColor: "#e5e7eb",
            color: "#05058c",
            border: "1px solid #05058c",
          }}
        >
          Back
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2 rounded-xl font-semibold text-base"
          style={{
            backgroundColor: BLUE,
            color: "#fff",
            border: "1px solid #05058c",
          }}
        >
          Home
        </button>
      </div>
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-6xl border" style={{ borderColor: BLUE }}>
        <h1
          className="text-2xl font-extrabold mb-8 text-center tracking-tight drop-shadow"
          style={{ color: BLUE }}
        >
          User Management
        </h1>
        {/* Add User Form */}
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center mb-10">
          <input
            type="text"
            placeholder="User Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 border border-gray-200 rounded-2xl focus:ring-2 text-base transition"
            required
          />
          <input
            type="email"
            placeholder="User Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-gray-200 rounded-2xl focus:ring-2 text-base transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-200 rounded-2xl focus:ring-2 text-base transition"
            required
          />
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="p-3 border border-gray-200 rounded-2xl bg-white focus:ring-2 text-base transition"
            required
            style={{ color: BLUE }}
          >
            {roles.map((r) => (
              <option value={r.id} key={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          {/* Faculty Selection for New User */}
          <select
            value={selectedFacultyIdForNewUser}
            onChange={(e) => {
              setSelectedFacultyIdForNewUser(e.target.value);
              setSelectedDepartmentIdForNewUser(""); // Reset department when faculty changes
              const filtered = departments.filter(d => d.facultyId === e.target.value);
              if (filtered.length > 0) {
                setSelectedDepartmentIdForNewUser(filtered[0].id);
              }
            }}
            className="p-3 border border-gray-200 rounded-2xl bg-white focus:ring-2 text-base transition"
            style={{ color: BLUE }}
          >
            <option value="">No Faculty</option>
            {faculties.map((f) => (
              <option value={f.id} key={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          {/* Department Selection for New User (filtered by selected faculty) */}
          <select
            value={selectedDepartmentIdForNewUser}
            onChange={(e) => setSelectedDepartmentIdForNewUser(e.target.value)}
            className="p-3 border border-gray-200 rounded-2xl bg-white focus:ring-2 text-base transition"
            style={{ color: BLUE }}
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
            className="md:col-span-1 px-8 py-3 rounded-2xl shadow font-bold text-base hover:opacity-90 active:scale-95 transition min-w-[90px]"
            style={{
              backgroundColor: BLUE,
              color: "#fff",
            }}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add"}
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
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-blue-50 transition group"
                >
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
                        onChange={e => setEditRoleId(e.target.value)}
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
                        {roles.find(r => r.id === user.role?.id)?.name ?? user.role?.name}
                      </span>
                    )}
                  </td>
                  {/* Faculty */}
                  <td className="py-3 px-6 border-b border-gray-100">
                    {editingUserId === user.id ? (
                      <select
                        value={selectedFacultyIdForEditUser}
                        onChange={(e) => {
                          setSelectedFacultyIdForEditUser(e.target.value);
                          setSelectedDepartmentIdForEditUser(""); // Reset department
                          const filtered = departments.filter(d => d.facultyId === e.target.value);
                          if (filtered.length > 0) {
                            setSelectedDepartmentIdForEditUser(filtered[0].id);
                          }
                        }}
                        className="p-2 border rounded-lg text-base"
                        style={{ color: BLUE }}
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
                  {/* Department */}
                  <td className="py-3 px-6 border-b border-gray-100">
                    {editingUserId === user.id ? (
                      <select
                        value={selectedDepartmentIdForEditUser}
                        onChange={e => setSelectedDepartmentIdForEditUser(e.target.value)}
                        className="p-2 border rounded-lg text-base"
                        style={{ color: BLUE }}
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
                  {/* Actions */}
                  <td className="py-3 px-6 border-b border-gray-100 flex gap-2">
                    {editingUserId === user.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(user.id)}
                          className="px-4 py-2 rounded-lg font-bold text-base"
                          style={{ backgroundColor: "#13ae5a", color: "#fff" }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-2 rounded-lg font-bold text-base"
                          style={{ backgroundColor: "#555", color: "#fff" }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(user)}
                          className="px-4 py-2 rounded-lg font-bold text-base"
                          style={{ backgroundColor: "#ffd400", color: BLUE }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-4 py-2 rounded-lg font-bold text-base"
                          style={{ backgroundColor: "#ce1515", color: "#fff" }}
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
        {loading && <div className="mt-6" style={{ color: BLUE, textAlign: "center" }}>Loading...</div>}
      </div>
    </div>
  );
};

export default UserManagement;