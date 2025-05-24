import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type UserRole = {
    id: string;
    name: string;
};
type User = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
};

const BLUE = "#05058c"; // Sabit mavi kodun

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);

    // Edit state
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editRole, setEditRole] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        fetchRoles();
        fetchUsers();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await fetch("http://localhost:8080/roles");
            const data = await res.json();
            setRoles(Array.isArray(data) ? data : []);
            if (data.length > 0) setRole(data[0].id);
        } catch {
            setRoles([]);
            alert("Failed to fetch roles.");
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8080/users");
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch {
            setUsers([]);
            alert("Failed to fetch users.");
        }
        setLoading(false);
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8080/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, roleId: role }),
            });
            if (response.ok) {
                setName("");
                setEmail("");
                setPassword("");
                setRole(roles[0]?.id ?? "");
                fetchUsers();
            } else {
                const text = await response.text();
                alert("Failed to add user: " + text);
            }
        } catch {
            alert("Failed to add user.");
        }
        setLoading(false);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/users/${userId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                fetchUsers();
            } else {
                alert("Failed to delete user.");
            }
        } catch {
            alert("Failed to delete user.");
        }
        setLoading(false);
    };

    const handleStartEdit = (user: User) => {
        setEditingUserId(user.id);
        setEditName(user.name);
        setEditEmail(user.email);
        setEditRole(user.role?.id ?? "");
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setEditName("");
        setEditEmail("");
        setEditRole("");
    };

    const handleSaveEdit = async (userId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName, email: editEmail, roleId: editRole }),
            });
            if (response.ok) {
                setEditingUserId(null);
                setEditName("");
                setEditEmail("");
                setEditRole("");
                fetchUsers();
            } else {
                const text = await response.text();
                alert("Failed to update user: " + text);
            }
        } catch {
            alert("Failed to update user.");
        }
        setLoading(false);
    };

    const handleRoleChange = async (userId: string, newRoleId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roleId: newRoleId }),
            });
            if (response.ok) {
                fetchUsers();
            } else {
                const text = await response.text();
                alert("Failed to update role: " + text);
            }
        } catch {
            alert("Failed to update role.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-200 py-8">
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
                <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-3 items-center mb-10">
                    <input
                        type="text"
                        placeholder="User Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 p-3 border border-gray-200 rounded-2xl focus:ring-2 text-base transition"
                        required
                    />
                    <input
                        type="email"
                        placeholder="User Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 p-3 border border-gray-200 rounded-2xl focus:ring-2 text-base transition"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 p-3 border border-gray-200 rounded-2xl focus:ring-2 text-base transition"
                        required
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
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
                    <button
                        type="submit"
                        className="px-8 py-3 rounded-2xl shadow font-bold text-base hover:opacity-90 active:scale-95 transition min-w-[90px]"
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
                                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}>Change Role</th>
                                <th className="py-4 px-6" style={{ backgroundColor: "#d3d3fa", color: BLUE }}></th>
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
                                    {/* Role Badge */}
                                    <td className="py-3 px-6 border-b border-gray-100">
                                        <span
                                            className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                            style={{ backgroundColor: "#e5e7fa", color: BLUE, border: `1px solid ${BLUE}` }}
                                        >
                                            {roles.find(r => r.id === user.role?.id)?.name ?? user.role?.name}
                                        </span>
                                    </td>
                                    {/* Role Change / Edit */}
                                    <td className="py-3 px-6 border-b border-gray-100">
                                        {editingUserId === user.id ? (
                                            <select
                                                value={editRole}
                                                onChange={e => setEditRole(e.target.value)}
                                                className="p-2 border rounded-lg text-base"
                                                style={{ color: BLUE }}
                                            >
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <select
                                                value={user.role?.id}
                                                onChange={e => handleRoleChange(user.id, e.target.value)}
                                                className="p-2 border rounded-lg text-base"
                                                style={{ color: BLUE }}
                                            >
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
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
