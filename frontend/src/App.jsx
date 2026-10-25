import React, { useState } from 'react';
import { User, ShieldCheck, ChevronRight, Loader2, LogOut, PlusCircle, ArrowLeft, Home, Layers, Settings, ChevronLeft, X } from 'lucide-react';
import benimResmim from './earofgtu.jpg';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('selection');
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  
  // Ana sayfa içindeki navigasyon durumları
  const [activePage, setActivePage] = useState('home');
  const [activeTab, setActiveTab] = useState('trend'); 
  const [selectedCategory, setSelectedCategory] = useState(null); 

  // Yeni Geribildirim Kutucuğu (Modal) Durumları
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postContent, setPostContent] = useState('');

  const categoryList = [
    "Ders ve Dönem Sonu Değerlendirmeleri",
    "Öğretim Elemanı Performansı",
    "Sınav ve Ölçme-Değerlendirme",
    "Memnuniyet Anketleri",
    "İdari Hizmetler",
    "Yerleşke ve Fiziki İmkanlar",
    "Bilgi İşlem ve Altyapı",
    "Sosyal ve Kültürel Faaliyetler"
  ];

  const handleLoginSubmit = (e, role) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setUserRole(role);
      setCurrentScreen('home');
      setActivePage('home');
    }, 1500);
  };

  // --------------------------------------------------------
  // 1. & 2. EKRAN: GİRİŞ VE ROL SEÇİMİ
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
            <span className="px-4 text-xs font-semibold uppercase tracking-widest text-center" style={{ color: '#feedde' }}>Herkes İçin Geribildirim</span>
            <div className="flex-grow border-t-2" style={{ borderColor: '#f9cd92' }}></div>
          </div>
          <div className="w-full space-y-4">
            <button onClick={() => setCurrentScreen('student_login')} className="group w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all border-2" style={{ backgroundColor: '#feedde', borderColor: '#e9ecef', color: '#14181c' }}>
              <div className="flex items-center gap-3">
                <User size={24} className="text-[#5B636A]" strokeWidth={2} />
                <span className="font-semibold text-[11pt]">Öğrenci Girişi</span>
              </div>
              <ChevronRight size={24} className="text-[#5B636A] group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => setCurrentScreen('admin_login')} className="group w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all border-2" style={{ backgroundColor: '#feedde', borderColor: '#e9ecef', color: '#14181c' }}>
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} className="text-[#5B636A]" strokeWidth={2} />
                <span className="font-semibold text-[11pt]">Admin Girişi</span>
              </div>
              <ChevronRight size={24} className="text-[#5B636A] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'student_login' || currentScreen === 'admin_login') {
    const isStudent = currentScreen === 'student_login';
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#feedde', fontFamily: '"Open Sans", sans-serif' }}>
        <div className="bg-[#161032] rounded-[3rem] p-10 w-full max-w-md relative shadow-2xl">
          <button onClick={() => setCurrentScreen('selection')} className="absolute top-8 left-8 text-[#f9cd92] hover:opacity-80 transition-opacity">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col items-center mt-4">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#feedde' }}>{isStudent ? 'Öğrenci Girişi' : 'Admin Girişi'}</h2>
            <form onSubmit={(e) => handleLoginSubmit(e, isStudent ? 'Öğrenci' : 'Admin')} className="w-full space-y-4">
              <input type="email" placeholder="E-posta adresiniz" required className="w-full px-6 py-4 rounded-[1.5rem] outline-none" style={{ backgroundColor: '#feedde', color: '#161032' }} />
              <input type="password" placeholder="Şifreniz" required className="w-full px-6 py-4 rounded-[1.5rem] outline-none" style={{ backgroundColor: '#feedde', color: '#161032' }} />
              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-[1.5rem] transition-all font-bold mt-4" style={{ backgroundColor: '#f9cd92', color: '#161032' }}>
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isStudent ? 'Sisteme Gir' : 'Panele Gir')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // 3. EKRAN: ANA SAYFA 
  // --------------------------------------------------------
  return (
    <div className="min-h-screen flex relative" style={{ backgroundColor: '#feedde', fontFamily: '"Open Sans", sans-serif' }}>
      
      {/* --- GERİBİLDİRİM POSTLA MODALI (POP-UP) --- */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(22, 16, 50, 0.7)' }}>
          <div className="rounded-[2rem] p-8 w-full max-w-xl shadow-2xl relative" style={{ backgroundColor: '#feedde' }}>
            
            {/* Kapatma Tuşu */}
            <button onClick={() => setIsPostModalOpen(false)} className="absolute top-6 right-6 hover:opacity-70 transition-opacity" style={{ color: '#161032' }}>
              <X size={28} strokeWidth={2.5} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#161032' }}>Yeni Geribildirim Postla</h2>
            
            <div className="space-y-5">
              {/* 1. Kategori Seçimi */}
              <select className="w-full p-4 rounded-xl border-2 font-bold outline-none cursor-pointer" style={{ backgroundColor: 'white', borderColor: 'rgba(22,16,50,0.1)', color: '#161032' }}>
                <option value="" disabled selected>Kategori Seçin...</option>
                {categoryList.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
              </select>
              
              {/* 2. Konu (Başlık) */}
              <input type="text" placeholder="Konu (Örn: Kütüphane prizleri çalışmıyor)" className="w-full p-4 rounded-xl border-2 font-bold outline-none focus:border-[#f4ac45] transition-colors" style={{ backgroundColor: 'white', borderColor: 'rgba(22,16,50,0.1)', color: '#161032' }} />
              
              {/* 3. Metin Kutusu (300 Karakter Sınırı) */}
              <div className="relative">
                <textarea 
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  maxLength={300}
                  placeholder="Detayları buraya yazın (Sorun veya fikriniz nedir?)..." 
                  rows="5" 
                  className="w-full p-4 rounded-xl border-2 font-medium outline-none resize-none focus:border-[#f4ac45] transition-colors"
                  style={{ backgroundColor: 'white', borderColor: 'rgba(22,16,50,0.1)', color: '#161032' }}
                ></textarea>
                <div className="absolute bottom-4 right-4 text-xs font-bold opacity-60" style={{ color: '#161032' }}>
                  {postContent.length} / 300
                </div>
              </div>
              
              {/* Gönder Butonu */}
              <button className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md" style={{ backgroundColor: '#f4ac45', color: '#161032' }}>
                <PlusCircle size={22} />
                <span className="text-lg">Gönder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOL: NAVİGASYON BARI (1/4 Alan) */}
      <aside className="w-1/4 flex flex-col p-6 lg:p-8 shadow-2xl z-10 sticky top-0 h-screen" style={{ backgroundColor: '#161032' }}>
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-lg mb-4" style={{ borderColor: '#f9cd92' }}>
            <img src={benimResmim} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold tracking-wide text-center" style={{ color: '#feedde' }}>GTÜ'nün Kulağı</h1>
          <span className="text-xs font-bold px-3 py-1 rounded-full mt-2" style={{ backgroundColor: '#f9cd92', color: '#161032' }}>
            {userRole} Modu
          </span>
        </div>

        <nav className="flex flex-col gap-3 flex-1 w-full max-w-sm mx-auto">
          {/* Geribildirim Postla Tuşu Modal'ı Açar */}
          <button onClick={() => setIsPostModalOpen(true)} className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold transition-transform active:scale-95 mb-4 shadow-md" style={{ backgroundColor: '#f4ac45', color: '#161032' }}>
            <PlusCircle size={22} />
            <span className="text-[11pt]">Geribildirim Postla</span>
          </button>

          <button onClick={() => { setActivePage('home'); setSelectedCategory(null); }} className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-colors ${activePage === 'home' ? 'shadow-md' : 'hover:bg-white/10'}`} style={{ backgroundColor: activePage === 'home' ? '#f9cd92' : 'transparent', color: activePage === 'home' ? '#161032' : '#feedde' }}>
            <Home size={22} />
            <span>Ana Sayfa</span>
          </button>
          
          <button onClick={() => setActivePage('categories')} className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-colors ${activePage === 'categories' ? 'shadow-md' : 'hover:bg-white/10'}`} style={{ backgroundColor: activePage === 'categories' ? '#f9cd92' : 'transparent', color: activePage === 'categories' ? '#161032' : '#feedde' }}>
            <Layers size={22} />
            <span>Kategoriler</span>
          </button>
          
          <button onClick={() => { setActivePage('settings'); setSelectedCategory(null); }} className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-colors ${activePage === 'settings' ? 'shadow-md' : 'hover:bg-white/10'}`} style={{ backgroundColor: activePage === 'settings' ? '#f9cd92' : 'transparent', color: activePage === 'settings' ? '#161032' : '#feedde' }}>
            <Settings size={22} />
            <span>Ayarlar</span>
          </button>
        </nav>

        <button onClick={() => setCurrentScreen('selection')} className="flex items-center gap-3 px-5 py-4 rounded-xl font-semibold transition-colors hover:bg-white/10 w-full max-w-sm mx-auto mt-auto opacity-80 hover:opacity-100" style={{ color: '#feedde' }}>
          <LogOut size={22} />
          <span>Çıkış Yap</span>
        </button>
      </aside>

      {/* SAĞ: İÇERİK ALANI (3/4 Alan) */}
      <main className="w-3/4 h-screen overflow-y-auto p-10">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* ANA SAYFA İÇERİĞİ */}
          {activePage === 'home' && (
            <>
              {/* Sekmeler */}
              <div className="flex justify-center gap-4 border-b-2 pb-4 mb-8" style={{ borderColor: 'rgba(22, 16, 50, 0.1)' }}>
                <button onClick={() => setActiveTab('trend')} className={`px-8 py-3 rounded-full font-bold text-sm transition-all ${activeTab === 'trend' ? 'shadow-md' : 'opacity-60 hover:opacity-100'}`} style={{ backgroundColor: activeTab === 'trend' ? '#161032' : 'transparent', color: activeTab === 'trend' ? '#f9cd92' : '#161032' }}>
                  🔥 Şuan İstek Çok
                </button>
                <button onClick={() => setActiveTab('top')} className={`px-8 py-3 rounded-full font-bold text-sm transition-all ${activeTab === 'top' ? 'shadow-md' : 'opacity-60 hover:opacity-100'}`} style={{ backgroundColor: activeTab === 'top' ? '#161032' : 'transparent', color: activeTab === 'top' ? '#f9cd92' : '#161032' }}>
                  ⭐ Uzun Süredir İsteniyor
                </button>
              </div>

              {/* GÖNDERİ (POST) KARTI */}
              <div className="space-y-6">
                <article className="bg-white rounded-[2rem] p-8 shadow-md border-2" style={{ borderColor: 'rgba(22, 16, 50, 0.05)' }}>
                  
                  {/* Sol Üst: Kategori */}
                  <div className="mb-2">
                    <span className="text-lg font-extrabold uppercase tracking-wide" style={{ color: '#161032' }}>Yerleşke ve Fiziki İmkanlar</span>
                  </div>
                  
                  {/* Altında Konu */}
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#b84b07' }}>Kütüphane prizleri çalışmıyor</h3>
                  
                  {/* Altında Metin Gövdesi */}
                  <p className="text-base mb-8 leading-relaxed font-medium" style={{ color: '#161032', opacity: 0.85 }}>
                    2. kattaki masaların çoğunda prizlerde elektrik yok. Vize haftası cihazlarımızı şarj edemiyoruz. Acil bir şekilde onarılması veya uzatma kabloları sağlanması gerekiyor.
                  </p>

                  {/* POST ALT BARI (Etkileşim Tuşları) */}
                  <div className="flex flex-wrap items-center gap-5">
                    
                    {/* 1. +1 Tuşu (Sayı Uzantılı) */}
                    <div className="flex items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-95">
                      <div className="flex items-center justify-center px-4 py-2 font-black text-lg rounded-l-full" style={{ backgroundColor: '#f4ac45', color: '#161032' }}>
                        +1
                      </div>
                      <div className="flex items-center justify-center px-4 py-2 font-bold text-lg rounded-r-full" style={{ backgroundColor: '#f9cd92', color: '#161032' }}>
                        85
                      </div>
                    </div>

                    {/* 2. Fikirler Tuşu (Sayı Solda Uzantı) */}
                    <div className="flex items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-95">
                      <div className="flex items-center justify-center px-4 py-2 font-bold text-lg rounded-l-full border-y-2 border-l-2" style={{ borderColor: '#161032', backgroundColor: '#feedde', color: '#161032' }}>
                        14
                      </div>
                      <div className="flex items-center justify-center px-4 py-2 font-bold rounded-r-full border-2" style={{ backgroundColor: '#161032', borderColor: '#161032', color: '#feedde' }}>
                        Fikirler <span className="mx-2 opacity-50">|</span> Fikir Ekle
                      </div>
                    </div>

                    {/* 3. Klon Sayısı Tuşu (Sayı Solda Uzantı) */}
                    <div className="flex items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-95 ml-auto">
                      <div className="flex items-center justify-center px-4 py-2 font-bold text-lg rounded-l-full border-y-2 border-l-2" style={{ borderColor: 'rgba(22, 16, 50, 0.15)', backgroundColor: 'transparent', color: '#161032' }}>
                        12
                      </div>
                      <div className="flex items-center justify-center px-4 py-2 font-bold rounded-r-full border-y-2 border-r-2 transition-colors hover:bg-white" style={{ borderColor: 'rgba(22, 16, 50, 0.15)', backgroundColor: '#feedde', color: '#161032' }}>
                        Klonları Gör
                      </div>
                    </div>

                  </div>
                </article>
              </div>
            </>
          )}

          {/* KATEGORİLER SAYFASI */}
          {activePage === 'categories' && (
            <>
              {!selectedCategory ? (
                <div>
                  <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: '#161032' }}>Kategoriler</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categoryList.map((cat, index) => (
                      <button key={index} onClick={() => setSelectedCategory(cat)} className="p-6 rounded-[2rem] text-left transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 border-2 group" style={{ backgroundColor: 'white', borderColor: 'rgba(22, 16, 50, 0.05)' }}>
                        <h3 className="text-lg font-extrabold mb-2 group-hover:text-[#b84b07] transition-colors" style={{ color: '#161032' }}>{cat}</h3>
                        <p className="text-sm font-medium opacity-60" style={{ color: '#161032' }}>Bu kategorideki gönderileri incele</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 mb-6 font-bold hover:opacity-70 transition-opacity" style={{ color: '#161032' }}>
                    <ChevronLeft size={20} />
                    <span>Kategorilere Dön</span>
                  </button>
                  <h2 className="text-3xl font-bold mb-8" style={{ color: '#b84b07' }}>{selectedCategory}</h2>
                  <p className="font-medium" style={{ color: '#161032', opacity: 0.7 }}>Bu kategoride atılan gönderiler burada listelenecektir.</p>
                </div>
              )}
            </>
          )}

          {/* AYARLAR SAYFASI */}
          {activePage === 'settings' && (
            <div className="text-center mt-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#161032' }}>Ayarlar</h2>
              <p className="font-medium" style={{ color: '#161032', opacity: 0.7 }}>Hesap ayarları ve diğer özellikler yakında burada olacak.</p>
            </div>
          )}

        </div>
      </main>
      
    </div>
  );
}