import { useState } from "react";

export async function getServerSideProps() {
  try {
    const res = await fetch(`${process.env.HOST}/api/admin/abandoned-carts`);
    const carts = await res.json();
    return { props: { carts: Array.isArray(carts) ? carts : [] } };
  } catch (err) {
    console.log(err);
    return { props: { carts: [] } };
  }
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ac-root {
    min-height: 100vh;
    background: #f4f6f0;
    font-family: 'DM Sans', sans-serif;
    color: #1a1f14;
    padding: 0 0 80px;
  }

  /* ── TOP BAR ── */
  .ac-topbar {
    // position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid #e4e8dc;
    padding: 18px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 12px rgba(0,0,0,0.05);
  }
  .ac-topbar-left { display: flex; align-items: center; gap: 14px; }
  .ac-topbar-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 18px;
    color: #2d5016;
    letter-spacing: 0.5px;
  }
  .ac-topbar-sep { width: 1px; height: 20px; background: #d8ddd0; }
  .ac-topbar-title { font-size: 12px; font-weight: 500; color: #999; letter-spacing: 1.2px; text-transform: uppercase; }

  .ac-send-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #2d5016;
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.3px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .ac-send-btn:hover { background: #3a6a1e; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(45,80,22,0.2); }
  .ac-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
  .ac-send-btn .spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── HERO STATS ── */
  .ac-hero { padding: 48px 40px 0; }
  .ac-hero-heading {
    font-family: 'DM Serif Display', serif;
    font-size: 48px;
    font-weight: 400;
    color: #1a1f14;
    line-height: 1.1;
    margin-bottom: 6px;
  }
  .ac-hero-heading em { font-style: italic; color: #4a8a28; }
  .ac-hero-sub { font-size: 14px; color: #8a9480; font-weight: 300; margin-bottom: 40px; }

  .ac-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 48px; }
  .ac-stat-card {
    background: #fff;
    border: 1px solid #e4e8dc;
    border-radius: 18px;
    padding: 22px 24px;
    position: relative;
    overflow: hidden;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .ac-stat-card:hover { border-color: #a3c47a; box-shadow: 0 6px 24px rgba(45,80,22,0.08); transform: translateY(-2px); }
  .ac-stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #4a8a28, #a3c47a);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .ac-stat-card:hover::before { opacity: 1; }
  .ac-stat-label { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #a0a89a; margin-bottom: 10px; }
  .ac-stat-value { font-family: 'DM Serif Display', serif; font-size: 36px; color: #1a1f14; line-height: 1; }
  .ac-stat-value.green { color: #2d5016; }
  .ac-stat-icon { position: absolute; right: 20px; top: 20px; font-size: 22px; opacity: 0.15; }

  /* ── DIVIDER ── */
  .ac-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #d0d8c4, transparent);
    margin: 0 40px 40px;
  }

  /* ── CART LIST ── */
  .ac-list { padding: 0 40px; display: flex; flex-direction: column; gap: 20px; }

  .ac-cart-card {
    background: #fff;
    border: 1px solid #e4e8dc;
    border-radius: 22px;
    overflow: hidden;
    transition: all 0.2s;
    animation: fadeUp 0.4s ease both;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .ac-cart-card:hover { border-color: #a3c47a; box-shadow: 0 8px 32px rgba(45,80,22,0.08); transform: translateY(-2px); }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Card header */
  .ac-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 28px;
    border-bottom: 1px solid #f0f2ec;
    background: #fafbf8;
  }
  .ac-user-info { display: flex; align-items: center; gap: 14px; }
  .ac-avatar {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, #d4e8bc, #a3c47a);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Serif Display', serif;
    font-size: 18px;
    color: #2d5016;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(45,80,22,0.15);
  }
  .ac-user-name { font-size: 15px; font-weight: 600; color: #1a1f14; margin-bottom: 2px; }
  .ac-user-email { font-size: 12px; color: #a0a89a; }

  .ac-header-right { display: flex; align-items: center; gap: 12px; }
  .ac-badge {
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .ac-badge.recovered { background: #eaf4e0; color: #2d5016; border: 1px solid #c4dfa8; }
  .ac-badge.pending { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .ac-reminder-pill {
    font-size: 11px;
    color: #8a9480;
    background: #f4f6f0;
    border: 1px solid #e4e8dc;
    border-radius: 20px;
    padding: 4px 10px;
  }

  /* Products */
  .ac-products { padding: 20px 28px; display: flex; flex-direction: column; gap: 10px; }
  .ac-product-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 14px;
    background: #f9faf6;
    border: 1px solid #edf0e8;
    border-radius: 14px;
    transition: background 0.15s;
  }
  .ac-product-row:hover { background: #f0f4ea; }
  .ac-product-img {
    width: 60px; height: 60px;
    object-fit: cover;
    border-radius: 10px;
    border: 1px solid #e4e8dc;
    flex-shrink: 0;
    background: #f4f6f0;
  }
  .ac-product-details { flex: 1; min-width: 0; }
  .ac-product-name { font-size: 13px; font-weight: 500; color: #2a2f22; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ac-product-meta { font-size: 11px; color: #a0a89a; margin-top: 4px; display: flex; gap: 12px; }
  .ac-product-meta span { display: flex; align-items: center; gap: 4px; }
  .ac-product-price-col { text-align: right; flex-shrink: 0; }
  .ac-product-price { font-family: 'DM Serif Display', serif; font-size: 18px; color: #2d5016; }
  .ac-product-mrp { font-size: 11px; color: #ccc; text-decoration: line-through; margin-top: 1px; }

  /* Stats row */
  .ac-card-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid #f0f2ec;
    background: #fafbf8;
  }
  .ac-card-stat {
    padding: 18px 24px;
    border-right: 1px solid #f0f2ec;
  }
  .ac-card-stat:last-child { border-right: none; }
  .ac-card-stat-label { font-size: 10px; letter-spacing: 1.2px; text-transform: uppercase; color: #b0b8aa; margin-bottom: 6px; }
  .ac-card-stat-value { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1f14; }
  .ac-card-stat-value.accent { color: #2d5016; }

  /* Card footer */
  .ac-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 28px;
    border-top: 1px solid #f0f2ec;
    background: #fafbf8;
  }
  .ac-date-text { font-size: 11px; color: #c0c8ba; }
  .ac-date-text span { color: #a0a89a; margin-left: 4px; }

  /* ── EMPTY STATE ── */
  .ac-empty {
    margin: 0 40px;
    background: #fff;
    border: 1px solid #e4e8dc;
    border-radius: 22px;
    padding: 80px 40px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .ac-empty-icon { font-size: 52px; margin-bottom: 20px; }
  .ac-empty-title { font-family: 'DM Serif Display', serif; font-size: 28px; color: #1a1f14; margin-bottom: 8px; }
  .ac-empty-sub { font-size: 14px; color: #a0a89a; }

  /* ── TOAST ── */
  .ac-toast {
    position: fixed;
    bottom: 32px; right: 32px;
    background: #fff;
    border: 1px solid #c4dfa8;
    border-radius: 14px;
    padding: 16px 22px;
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; color: #2d5016;
    box-shadow: 0 12px 40px rgba(45,80,22,0.12);
    animation: slideIn 0.3s ease;
    z-index: 100;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .ac-topbar { padding: 16px 20px; }
    .ac-hero { padding: 32px 20px 0; }
    .ac-hero-heading { font-size: 32px; }
    .ac-stats-row { grid-template-columns: repeat(2, 1fr); }
    .ac-list { padding: 0 20px; }
    .ac-card-stats { grid-template-columns: repeat(2, 1fr); }
    .ac-divider { margin: 0 20px 32px; }
    .ac-empty { margin: 0 20px; }
  }
`;

export default function AbandonedCarts({ carts = [] }) {
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  const totalValue = carts.reduce((acc, c) => acc + (c.total || 0), 0);
  const recovered = carts.filter((c) => c.recovered).length;
  const pending = carts.filter((c) => !c.recovered).length;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const sendReminderToAll = async () => {
    try {
      setSending(true);
      const res = await fetch("/api/admin/send-abandoned-mails");
      const data = await res.json();
      showToast(`✓ ${data.emails_sent || 0} reminder emails sent`);
    } catch (err) {
      console.log(err);
      showToast("✗ Failed to send reminder emails");
    } finally {
      setSending(false);
    }
  };

  const sendSingleReminder = async (cartId) => {
    try {
      const res = await fetch(
        `/api/admin/send-abandoned-mails?cartId=${cartId}`
      );

      const data = await res.json();

      if (data.success) {
        showToast("✓ Reminder sent successfully");
      } else {
        showToast("✗ Failed to send reminder");
      }
    } catch (err) {
      console.log(err);
      showToast("✗ Failed to send reminder");
    }
  };

  const getInitial = (name) => (name || "G").charAt(0).toUpperCase();

  return (
    <>
      <style>{styles}</style>
      <div className="ac-root">

        {/* ── TOP BAR ── */}
        <div className="ac-topbar">
          <div className="ac-topbar-left">
            <span className="ac-topbar-logo">Arenq</span>
            <div className="ac-topbar-sep" />
            <span className="ac-topbar-title">Admin Panel</span>
          </div>
          <button className="ac-send-btn" onClick={sendReminderToAll} disabled={sending}>
            {sending ? (
              <><div className="spinner" /> Sending...</>
            ) : (
              <>✉ Send Reminders to All</>
            )}
          </button>
        </div>

        {/* ── HERO ── */}
        <div className="ac-hero">
          <h1 className="ac-hero-heading">
            Abandoned <em>Carts</em>
          </h1>
          <p className="ac-hero-sub">Users who added products but didn&lsquo;t complete checkout</p>

          <div className="ac-stats-row">
            <div className="ac-stat-card">
              <span className="ac-stat-icon">🛒</span>
              <p className="ac-stat-label">Total Carts</p>
              <p className="ac-stat-value">{carts.length}</p>
            </div>
            <div className="ac-stat-card">
              <span className="ac-stat-icon">💰</span>
              <p className="ac-stat-label">Total Value</p>
              <p className="ac-stat-value green">₹{totalValue.toLocaleString("en-IN")}</p>
            </div>
            <div className="ac-stat-card">
              <span className="ac-stat-icon">✅</span>
              <p className="ac-stat-label">Recovered</p>
              <p className="ac-stat-value green">{recovered}</p>
            </div>
            <div className="ac-stat-card">
              <span className="ac-stat-icon">⏳</span>
              <p className="ac-stat-label">Pending</p>
              <p className="ac-stat-value">{pending}</p>
            </div>
          </div>
        </div>

        <div className="ac-divider" />

        {/* ── CART LIST ── */}
        {carts.length === 0 ? (
          <div className="ac-empty">
            <div className="ac-empty-icon">🎉</div>
            <h2 className="ac-empty-title">No Abandoned Carts</h2>
            <p className="ac-empty-sub">Everything looks good — all carts have been completed.</p>
          </div>
        ) : (
          <div className="ac-list">
            {carts.map((cart, i) => (
              <div
                className="ac-cart-card"
                key={cart._id}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Header */}
                <div className="ac-card-header">
                  <div className="ac-user-info">
                    <div className="ac-avatar">{getInitial(cart.user?.fullname)}</div>
                    <div>
                      <p className="ac-user-name">{cart.user?.fullname || "Guest User"}</p>
                      <p className="ac-user-email">{cart.user?.email || "No email on record"}</p>
                    </div>
                  </div>
                  <div className="ac-header-right">
                    <button
                      className="ac-send-btn"
                      style={{
                        padding: "8px 14px",
                        fontSize: "12px"
                      }}
                      onClick={() => sendSingleReminder(cart._id)}
                    >
                      ✉ Send
                    </button>
                    <span className="ac-reminder-pill">📨 {cart.reminder_count || 0} sent</span>
                    <span className={`ac-badge ${cart.recovered ? "recovered" : "pending"}`}>
                      {cart.recovered ? "Recovered" : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Products */}
                <div className="ac-products">
                  {cart.items?.map((item) => (
                    <div className="ac-product-row" key={item._id}>
                      <img
                        className="ac-product-img"
                        src={item.thumbnail || "/placeholder.png"}
                        alt={item.title}
                      />
                      <div className="ac-product-details">
                        <p className="ac-product-name">{item.title}</p>
                        <div className="ac-product-meta">
                          <span>📦 Qty: {item.quantity}</span>
                          {item.variantValue && <span>🏷 {item.variantValue}</span>}
                          {item.SKU && <span>SKU: {item.SKU}</span>}
                        </div>
                      </div>
                      <div className="ac-product-price-col">
                        <p className="ac-product-price">₹{item.price}</p>
                        {item.MRP > item.price && (
                          <p className="ac-product-mrp">₹{item.MRP}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="ac-card-stats">
                  <div className="ac-card-stat">
                    <p className="ac-card-stat-label">Cart Total (Including Tax)</p>
                    <p className="ac-card-stat-value accent">₹{cart.total || 0}</p>
                  </div>
                  <div className="ac-card-stat">
                    <p className="ac-card-stat-label">Products</p>
                    <p className="ac-card-stat-value">{cart.items?.length || 0}</p>
                  </div>
                  <div className="ac-card-stat">
                    <p className="ac-card-stat-label">Reminders</p>
                    <p className="ac-card-stat-value">{cart.reminder_count || 0} / 3</p>
                  </div>
                  <div className="ac-card-stat">
                    <p className="ac-card-stat-label">Shipping</p>
                    <p className="ac-card-stat-value">₹{cart.shipping || 0}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="ac-card-footer">
                  <p className="ac-date-text">
                    Created <span>{new Date(cart.createdAt).toLocaleString("en-IN")}</span>
                  </p>
                  <p className="ac-date-text">
                    Updated <span>{new Date(cart.updatedAt).toLocaleString("en-IN")}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TOAST ── */}
        {toast && <div className="ac-toast">{toast}</div>}

      </div>
    </>
  );
}