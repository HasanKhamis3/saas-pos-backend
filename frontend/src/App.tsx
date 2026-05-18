import { useState, useEffect } from 'react';
import axios from 'axios';
import Pos from './Pos'; 
import Dashboard from './Dashboard'; // 1. استيراد لوحة التحكم الجديدة

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 2. حالة جديدة لتحديد أي شاشة نعرضها (الكاشير أم لوحة التحكم)
  const [currentView, setCurrentView] = useState<'pos' | 'dashboard'>('pos');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await axios.post('/api/v1/pos/auth/login', {
        email,
        password
      });

      const token = response.data?.data?.accessToken || response.data?.accessToken;
      
      if (!token) {
        throw new Error('لم يتم العثور على التوكن، تأكد من استجابة السيرفر.');
      }

      localStorage.setItem('token', token); 
      setIsAuthenticated(true); 

    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || error.message || 'حدث خطأ في الاتصال بالخادم.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. إذا كان المستخدم مسجل الدخول، نعرض الشاشة المطلوبة مع شريط تنقل سفلي
  if (isAuthenticated) {
    return (
      <div className="relative min-h-screen">
        
        {/* شريط تنقل سفلي عائم */}
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 transform gap-6 rounded-full bg-gray-900 px-8 py-4 shadow-2xl">
          <button
            onClick={() => setCurrentView('pos')}
            className={`text-lg font-bold transition-all ${currentView === 'pos' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            🛒 الكاشير
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`text-lg font-bold transition-all ${currentView === 'dashboard' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            📊 لوحة التحكم
          </button>
        </div>

        {/* عرض الشاشة بناءً على اختيار المستخدم */}
        {currentView === 'pos' ? <Pos /> : <Dashboard />}
      </div>
    );
  }

  // واجهة تسجيل الدخول
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 font-sans" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-800">نظام الكاشير السحابي</h2>
          <p className="mt-2 text-sm text-gray-500">سجل دخولك للوصول إلى متجرك بأمان</p>
        </div>
        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            ⚠️ {errorMsg}
          </div>
        )}
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
            disabled={isLoading}
            className={`mt-4 w-full rounded-lg p-3 text-lg font-bold text-white shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 ${
              isLoading ? 'cursor-not-allowed bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;