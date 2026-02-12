export default function LoginPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Login</h2>
      <div style={{ marginTop: "1rem" }}>
        <a 
          href="/admin/dashboard" 
          style={{ display: "block", marginBottom: "1rem", color: "blue" }}
        >
          Go to Admin Dashboard
        </a>
        <a 
          href="/customer/dashboard" 
          style={{ display: "block", color: "green" }}
        >
          Go to Customer Dashboard
        </a>
      </div>
    </div>
  );
}
