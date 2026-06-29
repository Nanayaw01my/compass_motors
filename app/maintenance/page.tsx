export default function MaintenancePage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Compass Motors – Back Soon</title>
      </head>
      <body style={{ margin: 0, fontFamily: "'Segoe UI', Arial, sans-serif", background: "#f4f4f0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>

          {/* Logo circle */}
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #f87171, #dc2626 45%, #7f1d1d)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 32px rgba(185,28,28,0.35)" }}>
            <span style={{ color: "white", fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>CM</span>
          </div>

          {/* Brand */}
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111", letterSpacing: -0.5, margin: "0 0 4px" }}>
            Compass Motors
          </h1>
          <p style={{ fontSize: 12, color: "#999", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 32px" }}>
            Motorcycle Installment System
          </p>

          {/* Card */}
          <div style={{ background: "white", borderRadius: 20, padding: "32px 28px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.05)" }}>
            {/* Wrench icon */}
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>
              🔧
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: "0 0 10px" }}>
              We&apos;ll be right back
            </h2>
            <p style={{ fontSize: 14, color: "#777", lineHeight: 1.6, margin: "0 0 24px" }}>
              We&apos;re performing a quick update to improve your experience.
              The system will be back online shortly.
            </p>

            {/* Divider */}
            <div style={{ height: 1, background: "#f0f0f0", margin: "0 0 20px" }} />

            <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 12px" }}>Need urgent help?</p>
            <a
              href="tel:0593920144"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#b91c1c,#991b1b)", color: "white", textDecoration: "none", padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 700, boxShadow: "0 4px 16px rgba(185,28,28,0.3)" }}
            >
              📞 Call 0593920144
            </a>
          </div>

          <p style={{ fontSize: 11, color: "#bbb", marginTop: 20 }}>
            &copy; {new Date().getFullYear()} Compass Motors &middot; compassmotor.online
          </p>
        </div>
      </body>
    </html>
  );
}
