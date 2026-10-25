import React, { useState } from 'react';
import { User, ShieldCheck, ChevronRight, Loader2, LogOut, PlusCircle, ThumbsUp, MessageSquare, Tag, ArrowLeft } from 'lucide-react';
import benimResmim from './earofgtu.jpg';

export default function App() {
  // Ekran durumunu yönetiyoruz: 'selection', 'student_login', 'admin_login', 'home'
  const [currentScreen, setCurrentScreen] = useState('selection');
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [activeTab, setActiveTab] = useState('trend'); 

  // Form (E-posta/Şifre) simülasyonu
  const handleLoginSubmit = (e, role) => {
    e.preventDefault();
    setIsLoading(true);
    // Gerçekte burada FastAPI'ye (http://localhost:8000/api/login) istek atacağız
    setTimeout(() => {
      setIsLoading(false);
      setUserRole(role);
      setCurrentScreen('home');
    }, 1500);
  };

  // --------------------------------------------------------
  // 1. EKRAN: ROL SEÇİMİ (Ana Giriş)
  // --------------------------------------------------------
  if (currentScreen === 'selection') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#feedde', fontFamily: '"Open Sans", sans-serif' }}>
        <div className="bg-[#161032] rounded-[3rem] shadow-[0_24px_48px_rgba(0,0,0,0.12)] p-10 w-full max-w-md flex flex-col items-center">
          
          <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-md mb-6 overflow-hidden border-2" style={{ borderColor: '#f9cd92' }}>
             <img src={benimResmim} alt="GTÜ Logo" className="w-full h-full object-cover" />
          </div>

          <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: '#feedde' }}>GTÜ'nün Kulağı</h1>

          <div className="flex items-center w-full my-5">
            <div className="flex-grow border-t-2" style={{ borderColor: '#f9cd92' }}></div>
            <span className="px-4 text-xs font-semibold uppercase tracking-widest text-center" style={{ color: '#feedde' }}>
              Herkes İçin Geribildirim Sistemi
            </span>
            <div className="flex-grow border-t-2" style={{ borderColor: '#f9cd92' }}></div>
          </div>

          <p className="font-medium mb-8 text-sm" style={{ color: '#feedde' }}>Söyleyecek bir şeyin mi var?</p>

          <div className="w-full space-y-4">
            <button 
              onClick={() => setCurrentScreen('student_login')}
              className="group w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all duration-200 border-2"
              style={{ backgroundColor: '#feedde', borderColor: '#e9ecef', color: '#14181c' }}
            >
              <div className="flex items-center gap-3">
                <User size={24} className="text-[#5B636A]" strokeWidth={2} />
                <span className="font-semibold text-[11pt]">Öğrenci Girişi</span>
              </div>
              <ChevronRight size={24} strokeWidth={2} className="text-[#5B636A] group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => setCurrentScreen('admin_login')}
              className="group w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all duration-200 border-2"
              style={{ backgroundColor: '#feedde', borderColor: '#e9ecef', color: '#14181c' }}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} className="text-[#5B636A]" strokeWidth={2} />
                <span className="font-semibold text-[11pt]">Admin Girişi</span>
              </div>
              <ChevronRight size={24} strokeWidth={2} className="text-[#5B636A] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // 2. EKRAN: ÖĞRENCİ VEYA ADMİN GİRİŞ FORMU
  // --------------------------------------------------------
  if (currentScreen === 'student_login' || currentScreen === 'admin_login') {
    const isStudent = currentScreen === 'student_login';
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#feedde', fontFamily: '"Open Sans", sans-serif' }}>
        <div className="bg-[#161032] rounded-[3rem] shadow-[0_24px_48px_rgba(0,0,0,0.12)] p-10 w-full max-w-md relative">
          
          {/* Geri Dön Tuşu */}
          <button 
            onClick={() => setCurrentScreen('selection')} 
            className="absolute top-8 left-8 text-[#f9cd92] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="flex flex-col items-center mt-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-md mb-6 overflow-hidden border-2" style={{ borderColor: '#f9cd92' }}>
              <img src={benimResmim} alt="GTÜ Logo" className="w-full h-full object-cover" />
            </div>
            
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#feedde' }}>
              {isStudent ? 'Öğrenci Girişi' : 'Admin Girişi'}
            </h2>

            <form onSubmit={(e) => handleLoginSubmit(e, isStudent ? 'Öğrenci' : 'Admin')} className="w-full space-y-4">
              <div>
                <input 
                  type="email" 
                  placeholder="E-posta adresiniz" 
                  required 
                  className="w-full px-6 py-4 rounded-[1.5rem] outline-none"
                  style={{ backgroundColor: '#feedde', color: '#161032' }}
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="Şifreniz" 
                  required 
                  className="w-full px-6 py-4 rounded-[1.5rem] outline-none"
                  style={{ backgroundColor: '#feedde', color: '#161032' }}
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-[1.5rem] transition-all duration-200 font-bold mt-4"
                style={{ backgroundColor: '#f9cd92', color: '#161032' }}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isStudent ? 'Sisteme Gir' : 'Panele Gir')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // 3. EKRAN: ANA SAYFA (Feed)
  // --------------------------------------------------------
  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#feedde', fontFamily: '"Open Sans", sans-serif' }}>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Üst Menü */}
        <header className="bg-[#161032] rounded-[2rem] p-6 shadow-lg flex items-center justify-between border-b-4" style={{ borderColor: '#f9cd92' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2" style={{ borderColor: '#f9cd92' }}>
              <img src={benimResmim} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#feedde' }}>GTÜ'nün Kulağı</h1>
              <span className="text-xs font-semibold px-2 py-1 rounded-full mt-1 inline-block" style={{ backgroundColor: '#f9cd92', color: '#161032' }}>
                {userRole} Modu
              </span>
            </div>
          </div>
          <button onClick={() => setCurrentScreen('selection')} className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors hover:bg-opacity-80" style={{ backgroundColor: '#feedde', color: '#161032' }}>
            <span className="font-semibold text-sm">Çıkış</span>
            <LogOut size={18} />
          </button>
        </header>

        {/* Yeni Gönderi (Öğrenciyse Göster) */}
        {userRole === 'Öğrenci' && (
          <section className="bg-[#161032] rounded-[2rem] p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#f9cd92' }}>Yeni Geri Bildirim Gönder</h2>
            <div className="space-y-4">
              <select className="w-full p-3 rounded-xl bg-opacity-10 outline-none" style={{ backgroundColor: '#feedde', color: '#161032' }}>
                <option>Kategori Seçin (Örn: Yemekhane)</option>
                <option>Yemekhane</option>
                <option>Kütüphane</option>
              </select>
              <input type="text" placeholder="Konu Başlığı" className="w-full p-3 rounded-xl outline-none" style={{ backgroundColor: '#feedde', color: '#161032' }} />
              <textarea placeholder="Sorunu veya fikrini detaylıca yaz..." rows="3" className="w-full p-3 rounded-xl outline-none resize-none" style={{ backgroundColor: '#feedde', color: '#161032' }}></textarea>
              <button className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2" style={{ backgroundColor: '#f9cd92', color: '#161032' }}>
                <PlusCircle size={20} />
                <span>Gönder ve Sesi Ol</span>
              </button>
            </div>
          </section>
        )}

        {/* Filtreler ve Postlar */}
        <div className="flex gap-4 mb-2">
          <button onClick={() => setActiveTab('trend')} className="flex-1 py-3 rounded-[1.5rem] font-bold text-sm border-2" style={{ backgroundColor: activeTab === 'trend' ? '#161032' : 'transparent', color: activeTab === 'trend' ? '#f9cd92' : '#161032', borderColor: '#161032' }}>
            🔥 Şuan İstek Çok
          </button>
          <button onClick={() => setActiveTab('top')} className="flex-1 py-3 rounded-[1.5rem] font-bold text-sm border-2" style={{ backgroundColor: activeTab === 'top' ? '#161032' : 'transparent', color: activeTab === 'top' ? '#f9cd92' : '#161032', borderColor: '#161032' }}>
            ⭐ Uzun Süredir İsteniyor
          </button>
        </div>

        <div className="space-y-4">
          <article className="bg-[#161032] rounded-[2rem] p-6 shadow-md border-l-4" style={{ borderColor: '#f9cd92' }}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#feedde', color: '#161032' }}>Yemekhane</span>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#f9cd92' }}>Yemekhane sırası çok yavaş</h3>
            <p className="text-sm mb-4" style={{ color: '#feedde', opacity: 0.9 }}>
              Kafeteryada yemek alırken saatlerce beklemek zorunda kalıyoruz.
            </p>
            <div className="mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2" style={{ backgroundColor: '#feedde', color: '#161032' }}>
              <Tag size={14} /> AI: 12 kişi daha benzer bir konuyu dile getirdi
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full font-bold" style={{ backgroundColor: '#f9cd92', color: '#161032' }}>
                <ThumbsUp size={16} /> <span>+45</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full font-bold" style={{ backgroundColor: 'transparent', color: '#feedde', border: '1px solid #feedde' }}>
                <MessageSquare size={16} /> <span>8 Fikir</span>
              </button>
            </div>
          </article>
        </div>

      </div>
    </div>
  );
}