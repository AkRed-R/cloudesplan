import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, ChevronRight, Loader2, LogOut, PlusCircle, ArrowLeft, Home, Layers, Settings, ChevronLeft, X } from 'lucide-react';
import benimResmim from './earofgtu.jpg';

// Backend adresi (Geliştirme ortamı için)
const API_BASE_URL = 'http://localhost:8000/api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('selection');
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activePage, setActivePage] = useState('home');
  const [activeTab, setActiveTab] = useState('trend'); 
  const [selectedCategory, setSelectedCategory] = useState(null); 
  
  // Modal ve Post Formu Durumları
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postCategory, setPostCategory] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  
  // Backend'den çekilen canlı postlar
  const [posts, setPosts] = useState([]);
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);

  const categoryList = [
    { name: "Ders ve Dönem Sonu Değerlendirmeleri", type: "normal" },
    { name: "Öğretim Elemanı Performansı", type: "normal" },
    { name: "Sınav ve Ölçme-Değerlendirme", type: "normal" },
    { name: "Memnuniyet Anketleri", type: "normal" },
    { name: "İdari Hizmetler", type: "normal" },
    { name: "Yerleşke ve Fiziki İmkanlar", type: "normal" },
    { name: "Bilgi İşlem ve Altyapı", type: "normal" },
    { name: "Sosyal ve Kültürel Faaliyetler", type: "normal" },
    { name: "Dikkate Alınanlar", type: "accepted" },
    { name: "Reddedilenler", type: "rejected" }
  ];

  // --------------------------------------------------------
  // GERÇEK BACKEND GİRİŞ İSTEĞİ (Login API)
  // --------------------------------------------------------
  const handleLoginSubmit = async (e, role, email, password) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Giriş başarısız!');
      }

      // Giriş Başarılı!
      setUserRole(data.role || role);
      setCurrentScreen('home');
      setActivePage('home');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------
  // GERÇEK POST GÖNDERME İSTEĞİ (Create Post API)
  // --------------------------------------------------------
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postCategory || !postTitle || !postContent) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: postCategory,
          title: postTitle,
          content: postContent,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Geribildirim oluşturuldu! AI Klon Grubu: #${data.clone_group_id}`);
        setIsPostModalOpen(false);
        setPostCategory('');
        setPostTitle('');
        setPostContent('');
      } else {
        alert('Post oluşturulurken bir hata oluştu.');
      }
    } catch (err) {
      console.error(err);
      alert('Backend ile iletişim kurulamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------
  // 1. EKRAN: ROL SEÇİMİ
  // --------------------------------------------------------
  if (currentScreen === 'selection') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#feedde', fontFamily: '"Open Sans", sans-serif' }}>
        <div className="bg-[#161032] rounded-[3rem] shadow-2xl p-10 w-full max-w-md flex flex-col items-center">
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
            <button onClick={() => { setCurrentScreen('student_login'); setLoginError(''); }} className="group w-full flex items-center justify-between px-6 py-4 rounded-3xl transition-all border-2" style={{ backgroundColor: '#feedde', borderColor: '#e9ecef', color: '#14181c' }}>
              <div className="flex items-center gap-3">
                <User size={24} className="text-[#5B636A]" strokeWidth={2} />
                <span className="font-semibold text-[11pt]">Öğrenci Girişi</span>
              </div>
              <ChevronRight size={24} className="text-[#5B636A] group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => { setCurrentScreen('admin_login'); setLoginError(''); }} className="group w-full flex items-center justify-between px-6 py-4 rounded-3xl transition-all border-2" style={{ backgroundColor: '#feedde', borderColor: '#e9ecef', color: '#14181c' }}>
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

  // --------------------------------------------------------
  // 2. EKRAN: GİRİŞ FORMU (Gerçek Form Bağlantısı)
  // --------------------------------------------------------
  if (currentScreen === 'student_login' || currentScreen === 'admin_login') {
    const isStudent = currentScreen === 'student_login';
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#feedde', fontFamily: '"Open Sans", sans-serif' }}>
        <div className="bg-[#161032] rounded-[3rem] p-10 w-full max-w-md relative shadow-2xl">
          <button onClick={() => setCurrentScreen('selection')} className="absolute top-8 left-8 text-[#f9cd92] hover:opacity-80 transition-opacity">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col items-center mt-4">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#feedde' }}>{isStudent ? 'Öğrenci Girişi' : 'Admin Girişi'}</h2>
            
            {/* HATA MESAJI GÖSTERGESİ */}
            {loginError && (
              <div className="w-full p-3 mb-4 rounded-xl text-xs font-bold text-center bg-red-500/20 text-red-300 border border-red-500/50">
                {loginError}
              </div>
            )}

            <form 
              onSubmit={(e) => {
                const email = e.target.email.value;
                const password = e.target.password.value;
                handleLoginSubmit(e, isStudent ? 'Öğrenci' : 'Admin', email, password);
              }} 
              className="w-full space-y-4"
            >
              <input name="email" type="email" placeholder="E-posta (Örn: ogrenci@gtu.edu.tr)" required className="w-full px-6 py-4 rounded-3xl outline-none" style={{ backgroundColor: '#feedde', color: '#161032' }} />
              <input name="password" type="password" placeholder="Şifre" required className="w-full px-6 py-4 rounded-3xl outline-none" style={{ backgroundColor: '#feedde', color: '#161032' }} />
              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-3xl transition-all font-bold mt-4" style={{ backgroundColor: '#f9cd92', color: '#161032' }}>
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
      
      {/* GERİBİLDİRİM POSTLA MODALI */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(22, 16, 50, 0.7)' }}>
          <div className="rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl relative" style={{ backgroundColor: '#feedde' }}>
            <button onClick={() => setIsPostModalOpen(false)} className="absolute top-6 right-6 hover:opacity-70 transition-opacity" style={{ color: '#161032' }}>
              <X size={28} strokeWidth={2.5} />
            </button>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#161032' }}>Yeni Geribildirim Postla</h2>
            <form onSubmit={handleCreatePost} className="space-y-5">
              <select 
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
                required
                className="w-full p-4 rounded-2xl border-2 font-bold outline-none cursor-pointer" 
                style={{ backgroundColor: 'white', borderColor: 'rgba(22,16,50,0.1)', color: '#161032' }}
              >
                <option value="" disabled>Kategori Seçin...</option>
                {categoryList.filter(c => c.type === 'normal').map((cat, i) => <option key={i} value={cat.name}>{cat.name}</option>)}
              </select>
              <input 
                type="text" 
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                required
                placeholder="Konu (Örn: Kütüphane prizleri çalışmıyor)" 
                className="w-full p-4 rounded-2xl border-2 font-bold outline-none focus:border-[#f4ac45] transition-colors" 
                style={{ backgroundColor: 'white', borderColor: 'rgba(22,16,50,0.1)', color: '#161032' }} 
              />
              <div className="relative">
                <textarea 
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  maxLength={300}
                  required
                  placeholder="Detayları buraya yazın..." 
                  rows="5" 
                  className="w-full p-4 rounded-2xl border-2 font-medium outline-none resize-none focus:border-[#f4ac45] transition-colors"
                  style={{ backgroundColor: 'white', borderColor: 'rgba(22,16,50,0.1)', color: '#161032' }}
                ></textarea>
                <div className="absolute bottom-4 right-4 text-xs font-bold opacity-60" style={{ color: '#161032' }}>
                  {postContent.length} / 300
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md" style={{ backgroundColor: '#f4ac45', color: '#161032' }}>
                {isLoading ? <Loader2 className="animate-spin" size={22} /> : <><PlusCircle size={22} /><span className="text-lg">Gönder</span></>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SOL NAVİGASYON */}
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

        <nav className="flex flex-col gap-4 flex-1 w-full max-w-sm mx-auto">
          <button onClick={() => setIsPostModalOpen(true)} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold transition-transform active:scale-95 mb-4 shadow-md" style={{ backgroundColor: '#f4ac45', color: '#161032' }}>
            <PlusCircle size={22} />
            <span className="text-[11pt]">Geribildirim Postla</span>
          </button>

          <button onClick={() => { setActivePage('home'); setSelectedCategory(null); }} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-colors ${activePage === 'home' ? 'shadow-md' : 'hover:bg-white/10'}`} style={{ backgroundColor: activePage === 'home' ? '#f9cd92' : 'transparent', color: activePage === 'home' ? '#161032' : '#feedde' }}>
            <Home size={22} />
            <span>Ana Sayfa</span>
          </button>
          
          <button onClick={() => setActivePage('categories')} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-colors ${activePage === 'categories' ? 'shadow-md' : 'hover:bg-white/10'}`} style={{ backgroundColor: activePage === 'categories' ? '#f9cd92' : 'transparent', color: activePage === 'categories' ? '#161032' : '#feedde' }}>
            <Layers size={22} />
            <span>Kategoriler</span>
          </button>
          
          <button onClick={() => { setActivePage('settings'); setSelectedCategory(null); }} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-colors ${activePage === 'settings' ? 'shadow-md' : 'hover:bg-white/10'}`} style={{ backgroundColor: activePage === 'settings' ? '#f9cd92' : 'transparent', color: activePage === 'settings' ? '#161032' : '#feedde' }}>
            <Settings size={22} />
            <span>Ayarlar</span>
          </button>
        </nav>

        <button onClick={() => setCurrentScreen('selection')} className="flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold transition-colors hover:bg-white/10 w-full max-w-sm mx-auto mt-auto opacity-80 hover:opacity-100" style={{ color: '#feedde' }}>
          <LogOut size={22} />
          <span>Çıkış Yap</span>
        </button>
      </aside>

      {/* SAĞ İÇERİK */}
      <main className="w-3/4 h-screen overflow-y-auto p-10">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {activePage === 'home' && (
            <>
              <div className="flex justify-between items-center w-full mb-10">
                <button onClick={() => setActiveTab('trend')} className={`flex-1 py-4 text-center rounded-3xl font-extrabold text-lg transition-all ${activeTab === 'trend' ? 'shadow-lg scale-105' : 'opacity-60 hover:opacity-100'}`} style={{ backgroundColor: activeTab === 'trend' ? '#161032' : 'transparent', color: activeTab === 'trend' ? '#f9cd92' : '#161032' }}>
                  🔥 Şuan İstek Çok
                </button>
                <div className="px-6 text-4xl font-light opacity-20" style={{ color: '#161032' }}>|</div>
                <button onClick={() => setActiveTab('top')} className={`flex-1 py-4 text-center rounded-3xl font-extrabold text-lg transition-all ${activeTab === 'top' ? 'shadow-lg scale-105' : 'opacity-60 hover:opacity-100'}`} style={{ backgroundColor: activeTab === 'top' ? '#161032' : 'transparent', color: activeTab === 'top' ? '#f9cd92' : '#161032' }}>
                  ⭐ Uzun Süredir İsteniyor
                </button>
              </div>

              {/* POST KARTI */}
              <div className="space-y-6">
                <article className="bg-white rounded-[2.5rem] p-8 shadow-md border-2" style={{ borderColor: 'rgba(22, 16, 50, 0.05)' }}>
                  <div className="mb-2">
                    <span className="text-lg font-extrabold uppercase tracking-wide" style={{ color: '#161032' }}>Yerleşke ve Fiziki İmkanlar</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#b84b07' }}>Kütüphane prizleri çalışmıyor</h3>
                  <p className="text-base mb-8 leading-relaxed font-medium" style={{ color: '#161032', opacity: 0.85 }}>
                    2. kattaki masaların çoğunda prizlerde elektrik yok. Vize haftası cihazlarımızı şarj edemiyoruz. Acil bir şekilde onarılması veya uzatma kabloları sağlanması gerekiyor.
                  </p>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center">
                      <button className="w-14 h-14 rounded-full flex items-center justify-center font-black text-xl shadow-lg z-10 active:scale-95 transition-transform" style={{ backgroundColor: '#f4ac45', color: '#161032' }}>
                        +1
                      </button>
                      <div className="h-10 flex items-center justify-center px-4 font-extrabold text-lg rounded-r-full -ml-4 pl-6 z-0 shadow-sm" style={{ backgroundColor: '#f9cd92', color: '#161032' }}>
                        85
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="flex items-stretch h-12 rounded-full shadow-md z-10 border-2 overflow-hidden" style={{ backgroundColor: '#161032', borderColor: '#161032', color: '#feedde' }}>
                        <button className="px-5 font-extrabold text-[11pt] transition-colors hover:bg-white/20 active:bg-white/30 flex items-center justify-center">
                          Fikirler
                        </button>
                        <div className="flex items-center justify-center opacity-40 font-light">|</div>
                        <button className="px-5 font-extrabold text-[11pt] transition-colors hover:bg-white/20 active:bg-white/30 flex items-center justify-center">
                          Fikir Ekle
                        </button>
                      </div>
                      <div className="h-10 flex items-center justify-center px-4 font-bold text-lg rounded-r-full -ml-4 pl-6 z-0 border-y-2 border-r-2" style={{ borderColor: '#161032', backgroundColor: '#feedde', color: '#161032' }}>
                        14
                      </div>
                    </div>

                    <div className="flex items-center ml-auto">
                      <button className="h-12 px-6 rounded-full flex items-center justify-center font-extrabold text-[11pt] shadow-md z-10 border-2 transition-colors hover:bg-white active:scale-95" style={{ borderColor: 'rgba(22, 16, 50, 0.15)', backgroundColor: '#feedde', color: '#161032' }}>
                        Klonları Gör
                      </button>
                      <div className="h-10 flex items-center justify-center px-4 font-bold text-lg rounded-r-full -ml-4 pl-6 z-0 border-y-2 border-r-2" style={{ borderColor: 'rgba(22, 16, 50, 0.15)', backgroundColor: 'transparent', color: '#161032' }}>
                        12
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </>
          )}

          {activePage === 'categories' && (
            <>
              {!selectedCategory ? (
                <div>
                  <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: '#161032' }}>Kategoriler</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categoryList.map((cat, index) => {
                      let textColor = '#161032';
                      let borderColor = 'rgba(22, 16, 50, 0.05)';

                      if (cat.type === 'rejected') {
                        textColor = '#dc2626'; 
                        borderColor = 'rgba(220, 38, 38, 0.3)';
                      } else if (cat.type === 'accepted') {
                        textColor = '#2563eb'; 
                        borderColor = 'rgba(37, 99, 235, 0.3)';
                      }

                      return (
                        <button key={index} onClick={() => setSelectedCategory(cat.name)} className="p-6 rounded-[2rem] text-left transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 border-2 group" style={{ backgroundColor: 'white', borderColor: borderColor }}>
                          <h3 className="text-xl font-extrabold mb-2 transition-colors" style={{ color: textColor }}>{cat.name}</h3>
                          <p className="text-sm font-medium opacity-60" style={{ color: textColor }}>Bu kategorideki gönderileri incele</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 mb-6 font-bold hover:opacity-70 transition-opacity" style={{ color: '#161032' }}>
                    <ChevronLeft size={20} />
                    <span>Kategorilere Dön</span>
                  </button>
                  <h2 className="text-3xl font-bold mb-8" style={{ color: '#b84b07' }}>{selectedCategory}</h2>
                </div>
              )}
            </>
          )}

          {activePage === 'settings' && (
            <div className="text-center mt-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#161032' }}>Ayarlar</h2>
            </div>
          )}

        </div>
      </main>
      
    </div>
  );
}