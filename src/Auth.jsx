//auth.jsx
import { useState } from 'react';
import { supabase } from './supabaseClient';
import { FcGoogle } from 'react-icons/fc';
import { ImSpinner2 } from 'react-icons/im';
import './auth.css';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) alert(error.message)
  }

return (
    <div className="auth-container gradient-auth">
      <div className="auth-card">
        <h1>Welcome to School Portal</h1>
        <form onSubmit={handleLogin}>
          <div className="auth-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-group password-group">
            <label>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-login">
            {loading ? <ImSpinner2 className="spin" /> : 'Login'}
          </button>
        </form>
        <div className="divider"><span>OR</span></div>
        <button className="btn-google" onClick={signInWithGoogle}>
          <FcGoogle /> Continue with Google
        </button>
        <p className="request">
          Don't have an account?{' '}
          <button onClick={() => alert('Contact Admin')}>Request access</button>
        </p>
      </div>
    </div>
  );
}