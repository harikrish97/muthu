import { useEffect, useState } from "react";

const AdminApp = () => {
  const [registrations, setRegistrations] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  const fetchRegistrations = async () => {
    setAdminLoading(true);
    setAdminError("");
    try {
      const response = await fetch("/api/registrations");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to load registrations");
      }
      setRegistrations(data);
    } catch (err) {
      setAdminError(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

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
          <nav className="nav-links">
            <a href="/">Back to site</a>
          </nav>
          <a className="btn ghost" href="/">Return Home</a>
        </div>
      </header>

      <section className="section" id="admin">
        <div className="section-head">
          <div>
            <p className="eyebrow">Admin</p>
            <h2>Recent registrations</h2>
          </div>
          <div className="admin-actions">
            <button
              className="btn ghost"
              type="button"
              onClick={fetchRegistrations}
              disabled={adminLoading}
            >
              {adminLoading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
        <div className="admin-panel card">
          <div className="admin-meta">
            <p>
              Total registrations: <strong>{registrations.length}</strong>
            </p>
            <p className="form-note">Newest entries appear first.</p>
          </div>
          {adminError && (
            <p className="form-message error">{adminError}</p>
          )}
          {!adminError && !adminLoading && registrations.length === 0 && (
            <p className="form-note">No registrations yet.</p>
          )}
          {registrations.length > 0 && (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>City</th>
                    <th>Created</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((item) => {
                    const createdLabel = item.createdAt
                      ? new Date(item.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })
                      : "-";
                    return (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.data?.name || "-"}</td>
                        <td>{item.data?.phone || "-"}</td>
                        <td>{item.data?.email || "-"}</td>
                        <td>{item.data?.city || "-"}</td>
                        <td>{createdLabel}</td>
                        <td>
                          <span className="status-pill">
                            {item.status || "New"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminApp;
