import React, { useState } from 'react';
import { User, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';
import benimResmim from './earofgtu.jpg';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);

  // Butonlara basıldığında sistemi simüle eden geçici fonksiyon
  const handleLogin = (role) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`${role} girişi başarılı! (Şifreler arka uçta .env üzerinden doğrulandı)`);
    }, 1500);
  };

  return (
    // Arka plan rengi HTML'den alındı (#f8f9fa) ve Open Sans fontu eklendi
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#feedde', fontFamily: '"Open Sans", sans-serif' }}>
      
      {/* İlk tasarımdaki Squircle Konteyner */}
      <div className="bg-[#161032] rounded-[3rem] shadow-[0_24px_48px_rgba(0,0,0,0.12)] p-10 w-full max-w-md flex flex-col items-center">
        
        {/* Logo Alanı (Yuvarlak ve Yazısız) */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-md mb-6 overflow-hidden border-2" style={{ borderColor: '#f9cd92' }}>
           <img src={benimResmim} alt="GTÜ Logo" className="w-full h-full object-cover" />
        </div>

        {/* Başlık (HTML'deki --ink rengi kullanıldı) */}
        <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: '#feedde' }}>GTÜ'nün Kulağı</h1>

        {/* Çizgiler Arasındaki Yazı (HTML'deki --ink-soft ve --sep renkleri) */}
        <div className="flex items-center w-full my-5">
          <div className="flex-grow border-t-2" style={{ borderColor: '#f9cd92' }}></div>
          <span className="px-4 text-xs font-semibold uppercase tracking-widest text-center" style={{ color: '#feedde' }}>
            Herkes İçin Geribildirim Sistemi
          </span>
          <div className="flex-grow border-t-2" style={{ borderColor: '#f9cd92' }}></div>
        </div>

        {/* Normal Yazı */}
        <p className="font-medium mb-8 text-sm" style={{ color: '#feedde' }}>
          Söyleyecek bir şeyin mi var?
        </p>

        {/* Yuvarlatılmış Dikdörtgen Tuşlar */}
        <div className="w-full space-y-4">
          
          {/* Öğrenci Girişi Butonu */}
          <button 
            onClick={() => handleLogin('Öğrenci')}
            disabled={isLoading}
            className="group w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all duration-200 border-2"
            style={{ backgroundColor: '#feedde', borderColor: '#e9ecef', color: '#14181c' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#feedde'}
          >
            <div className="flex items-center gap-3">
              {isLoading ? <Loader2 className="animate-spin text-[#5B636A]" size={24} /> : <User size={24} className="text-[#5B636A]" strokeWidth={2} />}
              <span className="font-semibold text-[11pt]">Öğrenci Girişi</span>
            </div>
            <ChevronRight size={24} strokeWidth={2} className="text-[#5B636A] group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Admin Girişi Butonu */}
          <button 
            onClick={() => handleLogin('Admin')}
            disabled={isLoading}
            className="group w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all duration-200 border-2"
            style={{ backgroundColor: '#feedde', borderColor: '#e9ecef', color: '#14181c' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#feedde'}
          >
            <div className="flex items-center gap-3">
              {isLoading ? <Loader2 className="animate-spin text-[#5B636A]" size={24} /> : <ShieldCheck size={24} className="text-[#5B636A]" strokeWidth={2} />}
              <span className="font-semibold text-[11pt]">Admin Girişi</span>
            </div>
            <ChevronRight size={24} strokeWidth={2} className="text-[#5B636A] group-hover:translate-x-1 transition-transform" />
          </button>
          
        </div>
      </div>
    </div>
  );
}