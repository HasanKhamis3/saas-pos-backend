import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [bestSeller, setBestSeller] = useState('جاري الحساب...');
  const [transactions, setTransactions] = useState<any[]>([]); // حالة جديدة لتخزين العمليات
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. جلب الإحصائيات العلوية
        const [summaryRes, bestSellerRes] = await Promise.all([
          axios.get('/api/v1/pos/dashboard/daily-summary', config),
          axios.get('/api/v1/pos/dashboard/best-sellers', config)
        ]);

        const summaryData = summaryRes.data?.data || summaryRes.data || {};
        setStats({
          totalRevenue: summaryData.totalRevenue || 0,
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

        // 2. جلب جدول العمليات الأخيرة (محاط بـ try..catch منفصل لضمان استقرار الشاشة)
        try {
          const txRes = await axios.get('/api/v1/pos/transactions', config);
          const txData = txRes.data?.data || txRes.data;
          setTransactions(Array.isArray(txData) ? txData : []);
        } catch (txError) {
          console.warn('لم نتمكن من جلب جدول العمليات، ربما المسار مختلف:', txError);
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
           <>
             {/* البطاقات العلوية */}
             <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                   <h3 className="mb-2 font-bold text-gray-500">إجمالي المبيعات (اليوم)</h3>
                   <p className="text-3xl font-black text-green-600">{stats.totalRevenue} ريال</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                   <h3 className="mb-2 font-bold text-gray-500">الطلبات المكتملة</h3>
                   <p className="text-3xl font-black text-blue-600">{stats.totalOrders} طلب</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                   <h3 className="mb-2 font-bold text-gray-500">المنتج الأكثر مبيعاً</h3>
                   <p className="text-2xl font-black text-purple-600">🏆 {bestSeller}</p>
                </div>
             </div>

             {/* جدول العمليات الأخيرة */}
             <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-bold text-gray-800">آخر العمليات</h3>
                <div className="overflow-x-auto">
                  {transactions.length === 0 ? (
                    <div className="py-10 text-center text-gray-400">
                      لا توجد عمليات مسجلة حتى الآن أو المسار غير متطابق.
                    </div>
                  ) : (
                    <table className="w-full text-right">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-500">
                          <th className="py-3 px-4 font-semibold">رقم الفاتورة</th>
                          <th className="py-3 px-4 font-semibold">التاريخ</th>
                          <th className="py-3 px-4 font-semibold">طريقة الدفع</th>
                          <th className="py-3 px-4 font-semibold text-left">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx, idx) => (
                          <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-gray-800 text-sm">
                              {tx.id ? tx.id.substring(0, 8) + '...' : 'غير متوفر'}
                            </td>
                            <td className="py-3 px-4 text-gray-600 text-sm">
                              {tx.createdAt ? new Date(tx.createdAt).toLocaleString('ar-SA') : 'غير متوفر'}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                {tx.paymentMethod === 'cash' ? 'نقدي' : tx.paymentMethod}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-left font-bold text-blue-600">
                              {tx.totalAmount} ريال
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
             </div>
           </>
         )}
      </div>
    </div>
  );
}