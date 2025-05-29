// src/App.jsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import Chat from './Chat';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // initial fetch
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    // listen for changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  // if session exists, show chat; otherwise login
  return session ? <Chat /> : <Auth />;
}
