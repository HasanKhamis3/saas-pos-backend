import { useState } from 'react';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`أهلاً بك! جاري محاولة تسجيل الدخول للحساب: ${email}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 font-sans" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-800">نظام الكاشير السحابي</h2>
          <p className="mt-2 text-sm text-gray-500">سجل دخولك للوصول إلى متجرك بأمان</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-left outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="admin@saas.com"
              required
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-left outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="••••••••"
              required
              dir="ltr"
            />
          </div>

          <button 
            type="submit" 
            className="mt-4 w-full rounded-lg bg-blue-600 p-3 text-lg font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            تسجيل الدخول
          </button>
        </form>

      </div>
    </div>
  );
}

export default App;