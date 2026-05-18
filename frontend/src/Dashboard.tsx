import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [bestSeller, setBestSeller] = useState('جاري الحساب...');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // جلب البيانات الحقيقية من الباك إند
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // طلب ملخص المبيعات وأفضل المنتجات
        const [summaryRes, bestSellerRes] = await Promise.all([
          axios.get('/api/v1/pos/dashboard/daily-summary', config),
          axios.get('/api/v1/pos/dashboard/best-sellers', config)
        ]);

        const summaryData = summaryRes.data?.data || summaryRes.data || {};
        
        setStats({
          totalRevenue: summaryData.totalRevenue || 0,
          // 🔥 التعديل السحري: استخدام كلمة transactionCount التي رأيناها في الصورة
          totalOrders: summaryData.transactionCount || 0,
        });

        const bestSellerData = bestSellerRes.data?.data || bestSellerRes.data;
        if (Array.isArray(bestSellerData) && bestSellerData.length > 0) {
          setBestSeller(bestSellerData[0].name || bestSellerData[0].productName || 'غير متوفر');
        } else if (bestSellerData && typeof bestSellerData === 'object' && bestSellerData.name) {
          setBestSeller(bestSellerData.name);
        } else {
          setBestSeller('لا توجد مبيعات كافية');
        }

      } catch (error: any) {
        console.error(error);
        setErrorMsg('لم نتمكن من جلب الإحصائيات الحقيقية، تأكد من اتصال السيرفر.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50 pb-24 font-sans" dir="rtl">
      {/* الشريط العلوي */}
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-extrabold text-gray-800">لوحة تحكم <span className="text-blue-600">المدير</span></h1>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-all hover:bg-red-100"
        >
          تسجيل الخروج
        </button>
      </header>

      {/* محتوى الإحصائيات */}
      <div className="flex-1 overflow-y-auto p-6">
         {errorMsg && (
           <div className="mb-4 rounded-lg bg-red-50 p-4 font-bold text-red-600 border border-red-200">
             ⚠️ {errorMsg}
           </div>
         )}

         {isLoading ? (
            <div className="flex h-40 items-center justify-center text-xl font-bold text-gray-400">
               جاري تحليل مبيعات متجرك... ⏳
            </div>
         ) : (
           <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                 <h3 className="mb-2 font-bold text-gray-500">إجمالي المبيعات (اليوم)</h3>
                 <p className="text-3xl font-black text-green-600">{stats.totalRevenue} ريال</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                 <h3 className="mb-2 font-bold text-gray-500">الطلبات المكتملة</h3>
                 {/* الآن سيعرض رقم 2 أو أكثر بنجاح */}
                 <p className="text-3xl font-black text-blue-600">{stats.totalOrders} طلب</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                 <h3 className="mb-2 font-bold text-gray-500">المنتج الأكثر مبيعاً</h3>
                 <p className="text-2xl font-black text-purple-600">🏆 {bestSeller}</p>
              </div>
           </div>
         )}

         {/* قسم العمليات الأخيرة */}
         <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-bold text-gray-800">آخر العمليات</h3>
            <div className="py-10 text-center text-gray-400">
               سيتم عرض جدول المبيعات التفصيلي هنا في التطوير القادم... 📊
            </div>
         </div>
      </div>
    </div>
  );
}