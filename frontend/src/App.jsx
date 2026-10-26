import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, ChevronRight, Loader2, LogOut, PlusCircle, ArrowLeft, Home, Layers, Settings, ChevronLeft, X, ShieldAlert, Tag as TagIcon } from 'lucide-react';
import benimResmim from './earofgtu.jpg'; 

const API_BASE_URL = 'http://localhost:8000/api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('selection');
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activePage, setActivePage] = useState('home');
  const [activeTab, setActiveTab] = useState('trend'); 
  const [selectedCategory, setSelectedCategory] = useState(null); 
  
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postCategory, setPostCategory] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postIsRequested, setPostIsRequested] = useState(false);
  const [postRequestTag, setPostRequestTag] = useState(null);

  const [isAdminRequestModalOpen, setIsAdminRequestModalOpen] = useState(false);
  const [adminRequestCategory, setAdminRequestCategory] = useState('');
  const [adminRequestTopic, setAdminRequestTopic] = useState('');

  const [posts, setPosts] = useState([]);
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);
  const [adminTags, setAdminTags] = useState([]);
  
  const [votedPosts, setVotedPosts] = useState(new Set()); 

  const [viewingClonesPostId, setViewingClonesPostId] = useState(null);
  const [clonesList, setClonesList] = useState([]);
  const [isFetchingClones, setIsFetchingClones] = useState(false);

  const [viewingIdeasPostId, setViewingIdeasPostId] = useState(null);
  const [activeIdeaPostId, setActiveIdeaPostId] = useState(null);
  const [newIdeaText, setNewIdeaText] = useState('');

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

  const fetchPosts = async (sortType) => {
    setIsFetchingPosts(true);
    try {
      const res = await fetch(`${API_BASE_URL}/posts?sort=${sortType}`);
      if (res.ok) setPosts(await res.json());
    } catch (err) {
      console.error("Postlar yüklenirken hata:", err);
    } finally {
      setIsFetchingPosts(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tags`);
      if (res.ok) setAdminTags(await res.json());
    } catch (err) {
      console.error("Etiketler yüklenirken hata:", err);
    }
  };

  useEffect(() => {
    if (currentScreen === 'home') {
      fetchPosts(activeTab);
      fetchTags();
    }
  }, [currentScreen, activeTab]);

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
      if (!response.ok) throw new Error(data.detail || 'Giriş başarısız!');
      
      setUserRole(data.role || role);
      setUserEmail(data.email); 
      setCurrentScreen('home');
      setActivePage('home');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          is_requested: postIsRequested,
          request_tag: postRequestTag,
          author_email: userEmail
        }),
      });
      if (response.ok) {
        setIsPostModalOpen(false);
        setPostCategory(''); setPostTitle(''); setPostContent(''); setPostIsRequested(false); setPostRequestTag(null);
        fetchPosts(activeTab); 
      } else {
        const err = await response.json();
        console.error("Sunucu Hatası:", err);
      }
    } catch (err) {
      console.error("Post hatası:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminRequestSubmit = async (e) => {
    e.preventDefault();
    if (!adminRequestCategory || !adminRequestTopic) return;
    const colors = ['#b84b07', '#f4ac45', '#161032'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    try {
      const response = await fetch(`${API_BASE_URL}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: adminRequestCategory, tag_name: adminRequestTopic, color: randomColor }),
      });
      if (response.ok) {
        setIsAdminRequestModalOpen(false);
        setAdminRequestCategory(''); setAdminRequestTopic('');
        fetchTags();
      }
    } catch (err) {
      console.error("İstek hatası:", err);
    }
  };

  const openPostModalForRequest = (tag) => {
    setPostCategory(tag.category);
    setPostTitle(tag.tag_name);
    setPostIsRequested(true);
    setPostRequestTag(tag.tag_name);
    setIsPostModalOpen(true);
  };

  const handleUpvote = async (postId) => {
    if (votedPosts.has(postId)) {
      alert("Bu gönderiye zaten +1 verdiniz!");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/upvote`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }) 
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail); 
        return;
      }
      setVotedPosts(prev => new Set(prev).add(postId));
      fetchPosts(activeTab); 
    } catch (err) {
      console.error("+1 hatası:", err);
    }
  };

  const handleAddIdea = async (postId) => {
    if (!newIdeaText.trim()) return;
    try {
      await fetch(`${API_BASE_URL}/posts/${postId}/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newIdeaText, email: userEmail }),
      });
      setNewIdeaText('');
      setActiveIdeaPostId(null);
      fetchPosts(activeTab);
    } catch (err) {
      console.error("Fikir ekleme hatası:", err);
    }
  };

  const handleStatusUpdate = async (postId, newStatus, newCategory) => {
    try {
      await fetch(`${API_BASE_URL}/posts/${postId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, category: newCategory })
      });
      fetchPosts(activeTab);
    } catch (err) {
      console.error("Durum güncelleme hatası:", err);
    }
  };

  const handleViewClones = async (postId) => {
    setViewingClonesPostId(postId);
    setIsFetchingClones(true);
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}/clones`);
      if (res.ok) setClonesList(await res.json());
    } catch (err) {
      console.error("Klonlar yüklenirken hata:", err);
    } finally {
      setIsFetchingClones(false);
    }
  };

  const formatEmail = (email) => {
    if (!email) return "Anonim";
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    return parts[0].substring(0, 3) + "***@" + parts[1];
  };

  const renderPostCard = (post) => {
    const isVoted = votedPosts.has(post.id);
    const isProcessed = post.category === 'Dikkate Alınanlar' || post.category === 'Reddedilenler';

    return (
      <article key={post.id} className="bg-white rounded-[2.5rem] p-8 shadow-md border-2 relative" style={{ borderColor: 'rgba(22, 16, 50, 0.05)' }}>
        {post.is_requested && (
          <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-xs shadow-sm" style={{ backgroundColor: '#feedde', color: '#b84b07' }}>
            <TagIcon size={14} /> {post.request_tag || "Admin İsteği"}
          </div>
        )}

        <div className="mb-2 flex items-center justify-between">
          <span className="text-lg font-extrabold uppercase tracking-wide" style={{ color: '#161032' }}>{post.category}</span>
          {!post.is_requested && <span className="text-xs font-bold opacity-50 flex items-center gap-1"><User size={12}/> {formatEmail(post.author_email)}</span>}
        </div>
        <h3 className="text-2xl font-bold mb-4 pr-32" style={{ color: '#b84b07' }}>{post.title}</h3>
        <p className="text-base mb-8 leading-relaxed font-medium" style={{ color: '#161032', opacity: 0.85 }}>{post.content}</p>

        {activeIdeaPostId === post.id && (
          <div className="mb-6 p-4 border-2 rounded-2xl" style={{ borderColor: '#f4ac45' }}>
            <input type="text" placeholder="Fikrini yaz..." value={newIdeaText} onChange={(e) => setNewIdeaText(e.target.value)} className="w-full p-3 rounded-xl mb-3 outline-none font-medium" style={{ backgroundColor: '#feedde', color: '#161032' }} />
            <div className="flex gap-2">
              <button onClick={() => handleAddIdea(post.id)} className="px-4 py-2 rounded-xl font-bold text-xs bg-[#f4ac45] text-[#161032] hover:opacity-80">Gönder</button>
              <button onClick={() => setActiveIdeaPostId(null)} className="px-4 py-2 rounded-xl font-bold text-xs bg-gray-200 text-gray-700 hover:bg-gray-300">İptal</button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center cursor-pointer group" onClick={() => handleUpvote(post.id)}>
            <button className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-xl shadow-lg z-10 transition-transform ${isVoted ? 'opacity-50' : 'group-active:scale-95'}`} style={{ backgroundColor: '#f4ac45', color: '#161032' }}>+1</button>
            <div className={`h-10 flex items-center justify-center px-4 font-extrabold text-lg rounded-r-full -ml-4 pl-6 z-0 shadow-sm transition-transform ${isVoted ? 'opacity-50' : 'group-active:scale-95'}`} style={{ backgroundColor: '#f9cd92', color: '#161032' }}>{post.upvotes}</div>
          </div>

          <div className="flex items-center">
            <div className="flex items-stretch h-12 rounded-full shadow-md z-10 border-2 overflow-hidden" style={{ backgroundColor: '#161032', borderColor: '#161032', color: '#feedde' }}>
              <button onClick={() => setViewingIdeasPostId(post.id)} className="px-5 font-extrabold text-[11pt] transition-colors hover:bg-white/20 active:bg-white/30 flex items-center justify-center">Fikirler</button>
              <div className="flex items-center justify-center opacity-40 font-light">|</div>
              <button onClick={() => setActiveIdeaPostId(activeIdeaPostId === post.id ? null : post.id)} className="px-5 font-extrabold text-[11pt] transition-colors hover:bg-white/20 active:bg-white/30 flex items-center justify-center">Fikir Ekle</button>
            </div>
            <div className="h-10 flex items-center justify-center px-4 font-bold text-lg rounded-r-full -ml-4 pl-6 z-0 border-y-2 border-r-2" style={{ borderColor: '#161032', backgroundColor: '#feedde', color: '#161032' }}>{post.ideas_count || 0}</div>
          </div>

          <div className="flex items-center ml-auto">
            <button onClick={() => handleViewClones(post.id)} className="h-12 px-6 rounded-full flex items-center justify-center font-extrabold text-[11pt] shadow-md z-10 border-2 transition-colors hover:bg-white active:scale-95" style={{ borderColor: 'rgba(22, 16, 50, 0.15)', backgroundColor: '#feedde', color: '#161032' }}>Klonları Gör</button>
            <div className="h-10 flex items-center justify-center px-4 font-bold text-lg rounded-r-full -ml-4 pl-6 z-0 border-y-2 border-r-2" style={{ borderColor: 'rgba(22, 16, 50, 0.15)', backgroundColor: 'transparent', color: '#161032' }}>{post.clone_count || 0}</div>
          </div>
        </div>

        {userRole === 'Admin' && !isProcessed && (
          <div className="flex gap-4 mt-6 pt-6 border-t-2" style={{ borderColor: 'rgba(22, 16, 50, 0.05)' }}>
            <button onClick={() => handleStatusUpdate(post.id, 'Dikkate Alındı', 'Dikkate Alınanlar')} className="flex-1 py-3 rounded-xl font-bold text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">Dikkate Al</button>
            <button onClick={() => handleStatusUpdate(post.id, 'Reddedildi', 'Reddedilenler')} className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors">Reddet</button>
          </div>
        )}
      </article>
    );
  };

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
          <p className="font-medium mb-8 text-sm" style={{ color: '#feedde' }}>Söyleyecek bir şeyin mi var?</p>
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
            {loginError && <div className="w-full p-3 mb-4 rounded-xl text-xs font-bold text-center bg-red-500/20 text-red-300 border border-red-500/50">{loginError}</div>}
            <form onSubmit={(e) => handleLoginSubmit(e, isStudent ? 'Öğrenci' : 'Admin', e.target.email.value, e.target.password.value)} className="w-full space-y-4">
              <input name="email" type="email" placeholder="E-posta" required className="w-full px-6 py-4 rounded-3xl outline-none" style={{ backgroundColor: '#feedde', color: '#161032' }} />
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

  return (
    <div className="min-h-screen flex relative" style={{ backgroundColor: '#feedde', fontFamily: '"Open Sans", sans-serif' }}>
      
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(22, 16, 50, 0.7)' }}>
          <div className="rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl relative" style={{ backgroundColor: '#feedde' }}>
            <button onClick={() => {setIsPostModalOpen(false); setPostIsRequested(false); setPostCategory(''); setPostTitle(''); setPostRequestTag(null);}} className="absolute top-6 right-6 hover:opacity-70 transition-opacity" style={{ color: '#161032' }}>
              <X size={28} strokeWidth={2.5} />
            </button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#161032' }}>
              Yeni Geribildirim Postla 
              {postIsRequested && <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 border border-red-300">{postRequestTag} İsteği</span>}
            </h2>
            <form onSubmit={handleCreatePost} className="space-y-5">
              <select value={postCategory} onChange={(e) => setPostCategory(e.target.value)} required disabled={postIsRequested} className="w-full p-4 rounded-2xl border-2 font-bold outline-none cursor-pointer disabled:opacity-70" style={{ backgroundColor: 'white', borderColor: 'rgba(22,16,50,0.1)', color: '#161032' }}>
                <option value="" disabled>Kategori Seçin...</option>
                {categoryList.filter(c => c.type === 'normal').map((cat, i) => <option key={i} value={cat.name}>{cat.name}</option>)}
              </select>
              <input type="text" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} required disabled={postIsRequested} placeholder="Konu (Örn: Kütüphane prizleri)" className="w-full p-4 rounded-2xl border-2 font-bold outline-none focus:border-[#f4ac45] disabled:opacity-70" style={{ backgroundColor: 'white', borderColor: 'rgba(22,16,50,0.1)', color: '#161032' }} />
              <div className="relative">
                <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} maxLength={300} required placeholder="Detayları buraya yazın..." rows="5" className="w-full p-4 rounded-2xl border-2 font-medium outline-none resize-none focus:border-[#f4ac45]" style={{ backgroundColor: 'white', borderColor: 'rgba(22,16,50,0.1)', color: '#161032' }}></textarea>
                <div className="absolute bottom-4 right-4 text-xs font-bold opacity-60" style={{ color: '#161032' }}>{postContent.length} / 300</div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all" style={{ backgroundColor: '#f4ac45', color: '#161032' }}>
                {isLoading ? <Loader2 className="animate-spin" size={22} /> : <><PlusCircle size={22} /><span className="text-lg">Gönder</span></>}
              </button>
            </form>
          </div>
        </div>
      )}

      {isAdminRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(22, 16, 50, 0.7)' }}>
          <div className="rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl relative" style={{ backgroundColor: '#feedde' }}>
            <button onClick={() => setIsAdminRequestModalOpen(false)} className="absolute top-6 right-6 hover:opacity-70 transition-opacity" style={{ color: '#161032' }}>
              <X size={28} strokeWidth={2.5} />
            </button>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#161032' }}>Geribildirim İsteği Aç</h2>
            <form onSubmit={handleAdminRequestSubmit} className="space-y-5">
              <select value={adminRequestCategory} onChange={(e) => setAdminRequestCategory(e.target.value)} required className="w-full p-4 rounded-2xl border-2 font-bold outline-none cursor-pointer" style={{ backgroundColor: 'white', borderColor: 'rgba(22,16,50,0.1)', color: '#161032' }}>
                <option value="" disabled>Hedef Kategori Seçin...</option>
                {categoryList.filter(c => c.type === 'normal').map((cat, i) => <option key={i} value={cat.name}>{cat.name}</option>)}
              </select>
              <input type="text" value={adminRequestTopic} onChange={(e) => setAdminRequestTopic(e.target.value)} required placeholder="İstenecek Konu (Örn: Yeni Ring Saatleri)" className="w-full p-4 rounded-2xl border-2 font-bold outline-none" style={{ backgroundColor: 'white', borderColor: 'rgba(22,16,50,0.1)', color: '#161032' }} />
              <button type="submit" className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all" style={{ backgroundColor: '#b84b07', color: '#feedde' }}>
                <ShieldAlert size={22} /><span className="text-lg">Öğrencilerden Geri Bildirim İste</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {viewingIdeasPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(22, 16, 50, 0.7)' }}>
          <div className="rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl relative max-h-[80vh] flex flex-col" style={{ backgroundColor: '#feedde' }}>
            <button onClick={() => setViewingIdeasPostId(null)} className="absolute top-6 right-6 hover:opacity-70 transition-opacity" style={{ color: '#161032' }}>
              <X size={28} strokeWidth={2.5} />
            </button>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#161032' }}>Öğrenci Fikirleri</h2>
            <div className="overflow-y-auto space-y-4 pr-2">
              {posts.find(p => p.id === viewingIdeasPostId)?.ideas?.length > 0 ? (
                posts.find(p => p.id === viewingIdeasPostId).ideas.map((idea, i) => (
                  <div key={i} className="p-5 bg-white rounded-2xl shadow-sm border-2" style={{ borderColor: 'rgba(22, 16, 50, 0.05)', color: '#161032' }}>
                    <div className="text-xs font-bold mb-2 opacity-50 flex items-center gap-2">
                      <User size={14} /> {formatEmail(idea.user_email)}
                    </div>
                    <p className="font-semibold text-sm">{idea.content}</p>
                  </div>
                ))
              ) : (
                <p className="font-medium opacity-60 text-center py-4" style={{ color: '#161032' }}>Henüz fikir belirtilmemiş. İlk fikri sen ekle!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {viewingClonesPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(22, 16, 50, 0.7)' }}>
          <div className="rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl relative max-h-[80vh] flex flex-col" style={{ backgroundColor: '#feedde' }}>
            <button onClick={() => { setViewingClonesPostId(null); setClonesList([]); }} className="absolute top-6 right-6 hover:opacity-70 transition-opacity" style={{ color: '#161032' }}>
              <X size={28} strokeWidth={2.5} />
            </button>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#161032' }}>Benzer Geribildirimler (Klonlar)</h2>
            <div className="overflow-y-auto space-y-4 pr-2">
              {isFetchingClones ? (
                <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-[#161032]" size={32} /></div>
              ) : clonesList.length > 0 ? (
                clonesList.map(clone => (
                  <div key={clone.id} className="p-5 bg-white rounded-2xl shadow-sm border-2 relative" style={{ borderColor: 'rgba(22, 16, 50, 0.05)', color: '#161032' }}>
                    {clone.is_requested && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-md font-bold text-[10px]" style={{ backgroundColor: '#feedde', color: '#b84b07' }}>
                        <TagIcon size={10} /> {clone.request_tag || "Admin İsteği"}
                      </div>
                    )}
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold opacity-50 flex items-center gap-1"><User size={10}/> {formatEmail(clone.author_email)}</span>
                    </div>
                    <h4 className="font-extrabold mb-2 pr-20" style={{ color: '#b84b07' }}>{clone.title}</h4>
                    <p className="font-medium text-sm opacity-85">{clone.content}</p>
                    <div className="mt-3 flex justify-between items-center text-xs font-bold opacity-60">
                      <span>+1 Sayısı: {clone.upvotes}</span>
                      <span>Kategori: {clone.category}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="font-medium opacity-60 text-center py-4" style={{ color: '#161032' }}>Bu gönderinin başka bir klonu bulunmuyor.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <aside className="w-1/4 flex flex-col p-6 lg:p-8 shadow-2xl z-10 sticky top-0 h-screen" style={{ backgroundColor: '#161032' }}>
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-lg mb-4" style={{ borderColor: '#f9cd92' }}>
            <img src={benimResmim} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold tracking-wide text-center" style={{ color: '#feedde' }}>GTÜ'nün Kulağı</h1>
          <span className="text-xs font-bold px-3 py-1 rounded-full mt-2" style={{ backgroundColor: '#f9cd92', color: '#161032' }}>{userEmail}</span>
        </div>

        <nav className="flex flex-col gap-3 flex-1 w-full max-w-sm mx-auto overflow-y-auto">
          {userRole === 'Admin' && (
            <button onClick={() => setIsAdminRequestModalOpen(true)} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold transition-transform active:scale-95 mb-2 shadow-md" style={{ backgroundColor: '#b84b07', color: '#feedde' }}>
              <ShieldAlert size={22} /><span className="text-[11pt]">Geribildirim İste</span>
            </button>
          )}
          <button onClick={() => setIsPostModalOpen(true)} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold transition-transform active:scale-95 mb-4 shadow-md" style={{ backgroundColor: '#f4ac45', color: '#161032' }}>
            <PlusCircle size={22} /><span className="text-[11pt]">Geribildirim Postla</span>
          </button>
          
          <button onClick={() => { setActivePage('home'); setSelectedCategory(null); }} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-colors ${activePage === 'home' ? 'shadow-md' : 'hover:bg-white/10'}`} style={{ backgroundColor: activePage === 'home' ? '#f9cd92' : 'transparent', color: activePage === 'home' ? '#161032' : '#feedde' }}>
            <Home size={22} /><span>Ana Sayfa</span>
          </button>
          
          <button onClick={() => setActivePage('categories')} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-colors ${activePage === 'categories' ? 'shadow-md' : 'hover:bg-white/10'}`} style={{ backgroundColor: activePage === 'categories' ? '#f9cd92' : 'transparent', color: activePage === 'categories' ? '#161032' : '#feedde' }}>
            <Layers size={22} /><span>Kategoriler</span>
          </button>

          {adminTags.length > 0 && (
            <div className="mt-2 mb-2 space-y-2">
              <div className="px-5 text-xs font-bold opacity-50 uppercase tracking-widest text-white">İstenen Geribildirimler</div>
              {adminTags.map(tag => (
                <button 
                  key={tag.id} 
                  onClick={() => openPostModalForRequest(tag)} 
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl font-bold transition-transform active:scale-95 w-full text-left" 
                  style={{ backgroundColor: tag.color, color: '#feedde' }}
                >
                  <TagIcon size={18} />
                  <span className="text-sm truncate">{tag.tag_name}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        <div className="mt-auto space-y-2 w-full max-w-sm mx-auto pt-4">
          <button onClick={() => { setActivePage('settings'); setSelectedCategory(null); }} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-colors ${activePage === 'settings' ? 'shadow-md' : 'hover:bg-white/10'}`} style={{ backgroundColor: activePage === 'settings' ? '#f9cd92' : 'transparent', color: activePage === 'settings' ? '#161032' : '#feedde' }}>
            <Settings size={22} /><span>Ayarlar</span>
          </button>
          <button onClick={() => { setCurrentScreen('selection'); setUserEmail(''); }} className="flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold transition-colors hover:bg-white/10 w-full opacity-80 hover:opacity-100" style={{ color: '#feedde' }}>
            <LogOut size={22} /><span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

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

              <div className="space-y-6">
                {isFetchingPosts ? (
                  <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-[#161032]" size={36} /></div>
                ) : posts.filter(p => p.category !== 'Dikkate Alınanlar' && p.category !== 'Reddedilenler').length === 0 ? (
                  <div className="text-center py-12 font-bold opacity-60" style={{ color: '#161032' }}>Ana akışta henüz geribildirim bulunmuyor.</div>
                ) : (
                  posts.filter(p => p.category !== 'Dikkate Alınanlar' && p.category !== 'Reddedilenler').map((post) => renderPostCard(post))
                )}
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
                      let textColor = '#161032'; let borderColor = 'rgba(22, 16, 50, 0.05)';
                      if (cat.type === 'rejected') { textColor = '#dc2626'; borderColor = 'rgba(220, 38, 38, 0.3)'; } 
                      else if (cat.type === 'accepted') { textColor = '#2563eb'; borderColor = 'rgba(37, 99, 235, 0.3)'; }
                      return (
                        <button key={index} onClick={() => setSelectedCategory(cat.name)} className="p-6 rounded-[2rem] text-left transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 border-2 group" style={{ backgroundColor: 'white', borderColor: borderColor }}>
                          <h3 className="text-xl font-extrabold mb-2 transition-colors" style={{ color: textColor }}>{cat.name}</h3>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 mb-6 font-bold hover:opacity-70 transition-opacity" style={{ color: '#161032' }}>
                    <ChevronLeft size={20} /><span>Kategorilere Dön</span>
                  </button>
                  <h2 className="text-3xl font-bold mb-8" style={{ color: '#b84b07' }}>{selectedCategory}</h2>
                  <div className="space-y-6">
                    {posts.filter(p => p.category === selectedCategory).length === 0 ? (
                      <div className="text-center py-12 font-bold opacity-60" style={{ color: '#161032' }}>Bu kategoride henüz geribildirim bulunmuyor.</div>
                    ) : (
                      posts.filter(p => p.category === selectedCategory).map(post => renderPostCard(post))
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activePage === 'settings' && (
            <div className="bg-white rounded-[2.5rem] p-10 shadow-md border-2" style={{ borderColor: 'rgba(22, 16, 50, 0.05)' }}>
              <h2 className="text-3xl font-bold mb-10" style={{ color: '#161032' }}>Ayarlar</h2>
              <div className="space-y-8">
                <div>
                  <label className="block text-lg font-bold mb-3" style={{ color: '#161032' }}>Dil Seçimi</label>
                  <select className="w-full max-w-sm p-4 rounded-2xl border-2 font-bold outline-none cursor-pointer" style={{ backgroundColor: '#feedde', borderColor: 'rgba(22,16,50,0.1)', color: '#161032' }}>
                    <option value="tr">Türkçe</option>
                  </select>
                </div>
                <div className="p-6 rounded-3xl border-2" style={{ backgroundColor: '#fff', borderColor: '#f9cd92', color: '#161032' }}>
                  <h4 className="font-extrabold text-lg mb-2">Erişilebilirlik</h4>
                  <p className="font-medium opacity-80 flex items-center flex-wrap gap-2">
                    Sayfayı yaklaştırmak için: 
                    <kbd className="px-3 py-1 rounded-lg font-bold shadow-sm border border-gray-200" style={{ backgroundColor: '#feedde' }}>Ctrl</kbd> 
                    + 
                    <kbd className="px-3 py-1 rounded-lg font-bold shadow-sm border border-gray-200" style={{ backgroundColor: '#feedde' }}>Fare Tekeri</kbd>
                    kullanabilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      
    </div>
  );
}