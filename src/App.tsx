import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Task {
  id: number;
  title: string;
  is_complete: boolean;
  user_id: string;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [passcode, setPasscode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  
  // App States
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginMode, setLoginMode] = useState<'passcode' | 'email'>('passcode');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) setIsAdmin(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user || isGuest) {
      if (user) checkAdminStatus();
      fetchTasks();
    }
  }, [user, isGuest]);

  async function checkAdminStatus() {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (data?.role === 'admin') setIsAdmin(true);
  }

  async function fetchTasks() {
    setLoading(true);
    const { data } = await supabase.from('tasks').select('*').order('id', { ascending: false });
    if (data) setTasks(data);
    setLoading(false);
  }

  // --- AUTH HANDLERS ---
  
  // 1. Passcode + .env Credentials
  async function handlePasscodeLogin(e: React.FormEvent) {
    e.preventDefault();
    const LOCK = import.meta.env.VITE_ADMIN_PASSCODE;
    const SECRET_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
    const SECRET_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

    if (passcode === LOCK) {
      const { error } = await supabase.auth.signInWithPassword({
        email: SECRET_EMAIL,
        password: SECRET_PASSWORD, 
      });
      if (error) alert("Admin Credentials failed: " + error.message);
      else setIsGuest(false);
    } else {
      alert("Invalid Passcode.");
    }
    setPasscode("");
  }

  // 2. Standard Email/Password
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else setIsGuest(false);
  }

  // --- TASK ACTIONS ---
  async function toggleStatus(id: number, currentStatus: boolean) {
    if (isGuest) return;
    await supabase.from('tasks').update({ is_complete: !currentStatus }).eq('id', id);
    fetchTasks();
  }

  async function deleteTask(id: number) {
    if (isGuest) return;
    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (isGuest || !newTitle.trim()) return;
    await supabase.from('tasks').insert([{ title: newTitle, is_complete: false, user_id: user?.id }]);
    setNewTitle("");
    fetchTasks();
  }

  // --- LOGIN VIEW ---
  if (!user && !isGuest) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-2xl">
          <h1 className="text-3xl font-black mb-8 text-slate-900 text-center tracking-tighter">TaskFlow</h1>
          
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setLoginMode('passcode')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMode === 'passcode' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              PASSCODE
            </button>
            <button 
              onClick={() => setLoginMode('email')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMode === 'email' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              EMAIL
            </button>
          </div>

          {loginMode === 'passcode' ? (
            <form onSubmit={handlePasscodeLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Admin Passcode"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-center text-2xl tracking-widest outline-none focus:border-indigo-500"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />
              <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all">Unlock</button>
            </form>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-50 text-sm outline-none focus:border-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-50 text-sm outline-none focus:border-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">Sign In</button>
            </form>
          )}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-300 tracking-widest"><span className="bg-white px-3">or</span></div>
          </div>

          <button onClick={() => setIsGuest(true)} className="w-full text-slate-400 py-2 text-sm font-bold hover:text-slate-600 transition-all underline underline-offset-4">
            Enter as Guest
          </button>
        </div>
      </div>
    );
  }

  // --- DASHBOARD (Remains the same as before) ---
  return (
    <div className="min-h-screen w-full bg-slate-200 flex justify-center py-12 px-6">
      <div className="w-full max-w-md flex flex-col space-y-8">
        <header className="text-center space-y-2 relative">
           <button onClick={() => isGuest ? setIsGuest(false) : supabase.auth.signOut()} className="absolute -top-6 right-0 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest">
            {isGuest ? 'Exit' : 'Logout'}
          </button>
          <h1 className="text-4xl font-extrabold text-slate-900">TaskFlow</h1>
          <div className={`h-1 w-20 mx-auto rounded-full ${isAdmin ? 'bg-purple-600' : isGuest ? 'bg-slate-400' : 'bg-indigo-500'}`}></div>
          <div className="mt-2">
            {isAdmin && <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-3 py-1 rounded-full uppercase italic">Admin</span>}
            {isGuest && <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase italic">Guest</span>}
          </div>
        </header>

        {!isGuest && (
          <form onSubmit={addTask} className="bg-white p-3 rounded-2xl shadow-xl flex items-center gap-3 border-2 border-white">
            <input className="flex-1 px-4 py-3 outline-none text-slate-800 font-medium" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New Task..." />
            <button className="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-700">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </form>
        )}

        <div className="space-y-4">
          {loading ? (
             <div className="text-center text-slate-400 font-black animate-pulse py-10 uppercase tracking-widest text-xs">Loading Tasks...</div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className={`bg-white p-5 rounded-2xl shadow-md border flex items-center justify-between ${isAdmin && task.user_id !== user?.id ? 'border-purple-200' : 'border-transparent'}`}>
                <div className="flex items-center gap-5">
                  <div className={`w-5 h-5 rounded-full border-4 border-opacity-30 ${task.is_complete ? 'bg-green-500 border-green-500' : 'bg-yellow-400 border-yellow-400'}`} />
                  <span className={`text-lg font-bold ${task.is_complete ? 'text-slate-300 line-through' : 'text-slate-800'}`}>{task.title}</span>
                </div>
                {!isGuest && (
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleStatus(task.id, task.is_complete)} className={`text-xs px-4 py-2 rounded-lg font-black uppercase border-2 ${task.is_complete ? 'border-green-100 text-green-700 bg-green-50' : 'border-yellow-100 text-yellow-800 bg-yellow-50'}`}>
                      {task.is_complete ? 'Done' : 'Wait'}
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}