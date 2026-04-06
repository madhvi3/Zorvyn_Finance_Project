import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 0 }}>FinanceApp</h2>
        <p style={{ textAlign: 'center' }}>Log in to access your dashboard</p>
        <SignIn routing="hash" />
      </div>
    </div>
  );
}
