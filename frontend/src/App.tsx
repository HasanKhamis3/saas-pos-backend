import { useState } from 'react';
import axios from 'axios';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // حالة التحميل
  const [errorMsg, setErrorMsg] = useState(''); // رسالة الخطأ

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(''); // تصفير الخطأ عند كل محاولة

    try {
      // 1. إرسال الطلب لسيرفر الباك إند الخاص بك
      const response = await axios.post('http://178.105.42.32:3000/api/v1/pos/auth/login', {
        email,
        password
      });

      // 2. إذا نجح الدخول، نستخرج التوكن السري
      const token = response.data.accessToken;
      
      // 3. نحفظ التوكن في ذاكرة المتصفح (خزنة آمنة)
      localStorage.setItem('token', token);
      
      alert('✅ نجاح! تم تسجيل الدخول وحفظ التوكن بنجاح.');
      // في الخطوة القادمة سنقوم بنقله لشاشة لوحة القيادة أو الكاشير

    } catch (error: any) {
      // إذا فشل الدخول (إيميل خاطئ، باسورد خاطئ، أو السيرفر مغلق)
      setErrorMsg(error.response?.data?.message || 'حدث خطأ في الاتصال بالخادم، تأكد من عمل السيرفر.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 font-sans" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-800">نظام الكاشير السحابي</h2>
          <p className="mt-2 text-sm text-gray-500">سجل دخولك للوصول إلى متجرك بأمان</p>
        </div>

        {/* عرض رسالة الخطأ إن وجدت */}
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
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
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
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