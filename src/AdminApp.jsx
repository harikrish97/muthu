import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./lib/api";

const ADMIN_TOKEN_KEY = "vv_admin_token";

const emptyEditForm = {
  name: "",
  email: "",
  phone: "",
  city: "",
  address: "",
  gender: "",
  dob: "",
  education: "",
  occupation: "",
  gothram: "",
  message: "",
  status: "New",
  isActive: true,
  credits: 0
};

const AdminApp = () => {
  const [token, setToken] = useState(() => sessionStorage.getItem(ADMIN_TOKEN_KEY) || "");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [registrations, setRegistrations] = useState([]);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [queryVersion, setQueryVersion] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    isActive: "all",
    useCreditFilter: false,
    maxCredits: 50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [newPassword, setNewPassword] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`
    }),
    [token]
  );

  const selectedUser = useMemo(
    () => registrations.find((item) => item.memberId === selectedId) || null,
    [registrations, selectedId]
  );

  const updateSelectedUserForm = (user) => {
    if (!user) {
      setEditForm(emptyEditForm);
      return;
    }
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      city: user.city || "",
      address: user.address || "",
      gender: user.gender || "",
      dob: user.dob || "",
      education: user.education || "",
      occupation: user.occupation || "",
      gothram: user.gothram || "",
      message: user.message || "",
      status: user.status || "New",
      isActive: Boolean(user.isActive),
      credits: Number.isFinite(user.credits) ? user.credits : 0
    });
  };

  const fetchRegistrations = async (authToken = token) => {
    if (!authToken) return;
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams();
      query.set("page", String(page));
      query.set("pageSize", String(pageSize));
      if (filters.search.trim()) query.set("search", filters.search.trim());
      if (filters.isActive !== "all") query.set("isActive", filters.isActive);
      if (filters.useCreditFilter) query.set("maxCredits", String(filters.maxCredits));
      query.set("sortBy", "created_at");
      query.set("sortOrder", "desc");

      const data = await apiFetch(`/admin/registrations?${query.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setRegistrations(data.items || []);
      setTotalRegistrations(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (!selectedId && data.items && data.items.length > 0) {
        setSelectedId(data.items[0].memberId);
        updateSelectedUserForm(data.items[0]);
      } else if (selectedId) {
        const latest = (data.items || []).find((item) => item.memberId === selectedId) || null;
        updateSelectedUserForm(latest);
      }
    } catch (err) {
      setError(err.message);
      if (/401/.test(err.message) || /token/i.test(err.message)) {
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken("");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRegistrations(token);
    }
  }, [token, page, pageSize, queryVersion]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const response = await apiFetch("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });
      sessionStorage.setItem(ADMIN_TOKEN_KEY, response.token);
      setToken(response.token);
      setLoginForm({ username: "", password: "" });
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken("");
    setRegistrations([]);
    setSelectedId("");
    setEditForm(emptyEditForm);
  };

  const handleSelectUser = (memberId) => {
    setSelectedId(memberId);
    const user = registrations.find((item) => item.memberId === memberId) || null;
    updateSelectedUserForm(user);
    setActionMessage("");
  };

  const handleSaveChanges = async (event) => {
    event.preventDefault();
    if (!selectedId) return;

    setActionMessage("");
    const payload = {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      city: editForm.city,
      address: editForm.address,
      gender: editForm.gender,
      dob: editForm.dob,
      education: editForm.education,
      occupation: editForm.occupation,
      gothram: editForm.gothram,
      message: editForm.message,
      status: editForm.status,
      isActive: editForm.isActive,
      credits: editForm.credits
    };

    try {
      const updated = await apiFetch(`/admin/registrations/${selectedId}`, {
        method: "PATCH",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      setRegistrations((current) =>
        current.map((item) => (item.memberId === updated.memberId ? updated : item))
      );
      setActionMessage("User details updated successfully.");
      fetchRegistrations();
    } catch (err) {
      setActionMessage(err.message);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (!selectedId) return;
    if (!newPassword || newPassword.length < 4) {
      setActionMessage("New password must be at least 4 characters.");
      return;
    }

    setActionMessage("");
    try {
      const response = await apiFetch(`/admin/registrations/${selectedId}/reset-password`, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ newPassword })
      });
      setActionMessage(response.message);
      setNewPassword("");
      fetchRegistrations();
    } catch (err) {
      setActionMessage(err.message);
    }
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setQueryVersion((v) => v + 1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      isActive: "all",
      useCreditFilter: false,
      maxCredits: 50
    });
    setPage(1);
    setQueryVersion((v) => v + 1);
    setIsFilterOpen(false);
  };

  const getVisiblePages = () => {
    const pages = [];
    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages, page + 1);

    if (start > 1) pages.push(1);
    if (start > 2) pages.push("...");
    for (let p = start; p <= end; p += 1) pages.push(p);
    if (end < totalPages - 1) pages.push("...");
    if (end < totalPages) pages.push(totalPages);
    return pages;
  };

  if (!token) {
    return (
      <div className="page">
        <header className="site-header">
          <div className="header-inner">
            <div className="brand">
              <div className="brand-mark">VV</div>
              <div>
                <p className="brand-name">Vedic Vivaha</p>
                <p className="brand-tag">Private Admin Login</p>
              </div>
            </div>
          </div>
        </header>
        <section className="section">
          <div className="card" style={{ maxWidth: "520px", margin: "0 auto" }}>
            <h2 style={{ marginBottom: "12px" }}>Admin Sign In</h2>
            <form className="login-form" onSubmit={handleLogin}>
              <label>
                <span>Username</span>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm((current) => ({ ...current, username: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((current) => ({ ...current, password: e.target.value }))
                  }
                  required
                />
              </label>
              {loginError && <p className="form-message error">{loginError}</p>}
              <button className="btn primary" type="submit" disabled={loggingIn}>
                {loggingIn ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark">VV</div>
            <div>
              <p className="brand-name">Vedic Vivaha</p>
              <p className="brand-tag">Admin Dashboard</p>
            </div>
          </div>
          <button className="btn ghost" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="section" id="admin" style={{ paddingTop: "28px", paddingBottom: "28px" }}>
        <div className="section-head" style={{ maxWidth: "1360px" }}>
          <div>
            <h2>Admin User Management</h2>
          </div>
          <div className="admin-actions" style={{ position: "relative", width: "100%", maxWidth: "620px" }}>
            <form onSubmit={applyFilters} style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
              <input
                type="text"
                placeholder="Search (Name or Member ID)"
                value={filters.search}
                onChange={(e) => setFilters((cur) => ({ ...cur, search: e.target.value }))}
                style={{
                  flex: 1,
                  border: "1px solid rgba(31, 24, 14, 0.15)",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  fontSize: "14px"
                }}
              />
              <button className="btn primary" type="submit" style={{ padding: "10px 14px" }}>Search</button>
              <button
                className="btn ghost"
                type="button"
                title="Filters"
                onClick={() => setIsFilterOpen((open) => !open)}
                style={{ minWidth: "40px", padding: "10px 10px" }}
              >
                ⚙
              </button>
              <button className="btn ghost" type="button" onClick={() => fetchRegistrations()} disabled={loading} style={{ padding: "10px 12px" }}>
                {loading ? "..." : "↻"}
              </button>
            </form>

            {isFilterOpen && (
              <div
                className="card"
                style={{
                  position: "absolute",
                  right: "0",
                  top: "52px",
                  width: "320px",
                  zIndex: 30,
                  padding: "14px",
                  boxShadow: "0 18px 36px rgba(31, 24, 14, 0.18)"
                }}
              >
                <label style={{ display: "grid", gap: "6px", marginBottom: "10px", fontSize: "13px" }}>
                  <span>Account State</span>
                  <select
                    value={filters.isActive}
                    onChange={(e) => setFilters((cur) => ({ ...cur, isActive: e.target.value }))}
                  >
                    <option value="all">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", fontSize: "13px" }}>
                  <input
                    type="checkbox"
                    checked={filters.useCreditFilter}
                    onChange={(e) => setFilters((cur) => ({ ...cur, useCreditFilter: e.target.checked }))}
                  />
                  <span>Enable credit filter</span>
                </label>

                <label style={{ display: "grid", gap: "6px", marginBottom: "12px", fontSize: "13px" }}>
                  <span>Credits less than or equal: {filters.maxCredits}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.maxCredits}
                    disabled={!filters.useCreditFilter}
                    onChange={(e) =>
                      setFilters((cur) => ({ ...cur, maxCredits: Number(e.target.value) }))
                    }
                  />
                </label>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn primary"
                    type="button"
                    onClick={() => {
                      setPage(1);
                      setQueryVersion((v) => v + 1);
                      setIsFilterOpen(false);
                    }}
                  >
                    Apply
                  </button>
                  <button className="btn ghost" type="button" onClick={clearFilters}>Reset</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <p className="form-message error" style={{ maxWidth: "1360px", margin: "0 auto 16px" }}>{error}</p>}

        <div
          className="register-grid"
          style={{
            maxWidth: "1360px",
            marginTop: 0,
            gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
            height: "calc(100vh - 220px)",
            minHeight: "520px"
          }}
        >
          <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <h3 style={{ marginBottom: "12px" }}>Registered Users</h3>
            <p className="form-note" style={{ marginBottom: "8px" }}>
              Total users: <strong>{totalRegistrations}</strong>
            </p>
            <div className="table-wrap" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Member ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Active</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((item) => (
                    <tr
                      key={item.memberId}
                      onClick={() => handleSelectUser(item.memberId)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: selectedId === item.memberId ? "rgba(15, 92, 92, 0.10)" : "transparent"
                      }}
                    >
                      <td>{item.memberId}</td>
                      <td>{item.name || "-"}</td>
                      <td>{item.status || "-"}</td>
                      <td>{item.isActive ? "Yes" : "No"}</td>
                      <td>{item.credits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px", justifyContent: "center" }}>
              <button
                className="btn ghost"
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                Prev
              </button>
              {getVisiblePages().map((p, index) => (
                p === "..." ? (
                  <span key={`ellipsis-${index}`} className="form-note" style={{ padding: "0 4px" }}>...</span>
                ) : (
                  <button
                    key={`page-${p}`}
                    className={p === page ? "btn primary" : "btn ghost"}
                    type="button"
                    onClick={() => setPage(p)}
                    disabled={loading}
                    style={{ minWidth: "40px", padding: "8px 12px" }}
                  >
                    {p}
                  </button>
                )
              ))}
              <button
                className="btn ghost"
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
              >
                Next
              </button>
            </div>
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            <h3 style={{ marginBottom: "12px" }}>Edit User</h3>
            {!selectedUser && <p className="form-note">Select a user from the table.</p>}
            {selectedUser && (
              <>
                <p className="form-note" style={{ marginBottom: "12px" }}>
                  Member: <strong>{selectedUser.memberId}</strong>
                </p>
                <form
                  className="register-form"
                  style={{ padding: 0, boxShadow: "none", gap: "10px" }}
                  onSubmit={handleSaveChanges}
                >
                  <div className="form-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
                    <label>
                      <span>Name</span>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm((cur) => ({ ...cur, name: e.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Email</span>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm((cur) => ({ ...cur, email: e.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Phone</span>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm((cur) => ({ ...cur, phone: e.target.value }))}
                      />
                    </label>
                    <label>
                      <span>City</span>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm((cur) => ({ ...cur, city: e.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Address</span>
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm((cur) => ({ ...cur, address: e.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Gender</span>
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm((cur) => ({ ...cur, gender: e.target.value }))}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                    <label>
                      <span>Date of Birth</span>
                      <input
                        type="date"
                        value={editForm.dob}
                        onChange={(e) => setEditForm((cur) => ({ ...cur, dob: e.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Education</span>
                      <input
                        type="text"
                        value={editForm.education}
                        onChange={(e) => setEditForm((cur) => ({ ...cur, education: e.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Occupation</span>
                      <input
                        type="text"
                        value={editForm.occupation}
                        onChange={(e) => setEditForm((cur) => ({ ...cur, occupation: e.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Gothram</span>
                      <input
                        type="text"
                        value={editForm.gothram}
                        onChange={(e) => setEditForm((cur) => ({ ...cur, gothram: e.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Status</span>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm((cur) => ({ ...cur, status: e.target.value }))}
                      >
                        <option value="New">New</option>
                        <option value="In Review">In Review</option>
                        <option value="Verified">Verified</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </label>
                    <label>
                      <span>Credits</span>
                      <input
                        type="number"
                        min="0"
                        value={editForm.credits}
                        onChange={(e) =>
                          setEditForm((cur) => ({ ...cur, credits: Number(e.target.value || 0) }))
                        }
                      />
                    </label>
                    <label style={{ gridColumn: "1 / -1" }}>
                      <span>Message</span>
                      <textarea
                        rows="2"
                        value={editForm.message}
                        onChange={(e) => setEditForm((cur) => ({ ...cur, message: e.target.value }))}
                      ></textarea>
                    </label>
                  </div>
                  <label style={{ maxWidth: "220px" }}>
                    <span>Account State</span>
                    <select
                      value={editForm.isActive ? "active" : "inactive"}
                      onChange={(e) =>
                        setEditForm((cur) => ({ ...cur, isActive: e.target.value === "active" }))
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                  <button className="btn primary" type="submit">Save Changes</button>
                </form>

                <form className="login-form" style={{ marginTop: "16px" }} onSubmit={handleResetPassword}>
                  <label>
                    <span>Reset Password</span>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </label>
                  <button className="btn ghost" type="submit">Reset Password</button>
                </form>
              </>
            )}
            {actionMessage && (
              <p className={`form-message ${actionMessage.toLowerCase().includes("successful") ? "success" : "error"}`}>
                {actionMessage}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminApp;
