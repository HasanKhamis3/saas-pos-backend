import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Pos() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. جلب المنتجات الحقيقية من قاعدة البيانات بمجرد فتح الشاشة
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/pos/products', {
          headers: {
            Authorization: `Bearer ${token}` // إرفاق التوكن السري في الطلب
          }
        });
        
        // حفظ المنتجات القادمة من السيرفر (نستخدم response.data.data أو response.data حسب هيكل الباك إند)
        setProducts(response.data.data || response.data || []);
      } catch (error: any) {
        setErrorMsg('لم نتمكن من جلب المنتجات، تأكد من اتصال السيرفر.');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (product: any) => {
    setCart([...cart, product]);
  };

  const total = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);

  // 2. إرسال الفاتورة الحالية للسيرفر عند إتمام الدفع
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const token = localStorage.getItem('token');
      
      // تجميع السلة بالشكل الذي يفهمه الباك إند (قائمة بالمنتجات وكمياتها)
      const items = cart.map(item => ({
        productId: item.id,
        quantity: 1, // في تطويراتنا القادمة يمكننا دمج المنتجات المتشابهة لزيادة الكمية
        price: item.price
      }));

      await axios.post('/api/v1/pos/transactions/checkout', {
        items: items,
        totalAmount: total
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('✅ تمت عملية الدفع بنجاح وحُفظت الفاتورة في النظام!');
      setCart([]); // تفريغ السلة لتجهيز طلب جديد

    } catch (error: any) {
      alert('❌ حدث خطأ أثناء الدفع: ' + (error.response?.data?.message || 'تأكد من إعدادات الباك إند'));
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    window.location.reload(); 
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50 font-sans" dir="rtl">
      
      {/* الشريط العلوي */}
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-extrabold text-gray-800">نظام الكاشير <span className="text-blue-600">السحابي</span></h1>
        <button 
          onClick={handleLogout} 
          className="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-all hover:bg-red-100"
        >
          تسجيل الخروج
        </button>
      </header>

      {/* منطقة العمل الرئيسية */}
      <div className="flex flex-1 gap-6 overflow-hidden p-6">
        
        {/* قائمة المنتجات (اليمين) */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
             <h2 className="text-xl font-bold text-gray-700">المنتجات المتاحة</h2>
             {errorMsg && <span className="text-sm font-bold text-red-500">{errorMsg}</span>}
          </div>

          {isLoadingProducts ? (
            <div className="flex h-64 items-center justify-center text-gray-400">
               جاري تحميل المنتجات من السيرفر... ⏳
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-400">
               <span className="text-4xl mb-2">📦</span>
               <p>لا توجد منتجات في قاعدة البيانات بعد!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => addToCart(product)} 
                  className="cursor-pointer rounded-xl border border-gray-100 bg-gray-50 p-4 text-center transition-all hover:-translate-y-1 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
                >
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                    {product.emoji || '📦'} {/* إذا لم يكن هناك إيموجي في الداتا بيز نضع صندوق */}
                  </div>
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  <p className="mt-1 font-bold text-blue-600">{product.price} ريال</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الفاتورة / السلة (اليسار) */}
        <div className="flex w-96 flex-col rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-700">الفاتورة الحالية</h2>
          
          <div className="flex-1 overflow-y-auto border-b border-gray-100 pb-4">
            {cart.length === 0 ? (
              <div className="mt-20 text-center text-gray-400">
                <span className="text-4xl">🛒</span>
                <p className="mt-2">السلة فارغة، ابدأ بإضافة المنتجات</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="flex justify-between py-3 border-b border-gray-50 last:border-0">
                  <span className="text-gray-800 font-medium">{item.name}</span>
                  <span className="font-bold text-gray-600">{item.price} ريال</span>
                </div>
              ))
            )}
          </div>

          <div className="pt-6">
            <div className="mb-6 flex justify-between text-2xl font-black text-gray-800">
              <span>الإجمالي:</span>
              <span className="text-blue-600">{total} ريال</span>
            </div>
            <button 
              onClick={handleCheckout}
              className={`w-full rounded-xl py-4 text-xl font-bold text-white shadow-md transition-all focus:outline-none ${
                cart.length === 0 || isCheckingOut 
                  ? 'cursor-not-allowed bg-gray-300 shadow-none' 
                  : 'bg-green-500 hover:bg-green-600 hover:shadow-lg'
              }`}
              disabled={cart.length === 0 || isCheckingOut}
            >
              {isCheckingOut ? 'جاري الدفع...' : 'إتمام الدفع'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}