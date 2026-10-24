from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import sqlite3
import json
import os
from dotenv import load_dotenv

# .env dosyasındaki gizli şifreleri yükle
load_dotenv()

app = FastAPI(title="EAR OF GTU API")

# YAPAY ZEKÂ MODELİ YÜKLENİYOR
# Bu işlem uygulama ilk ayağa kalkarken çalışır ve CPU'da çalışan küçük modeli (all-MiniLM-L6-v2) indirir.
print("Yapay Zeka modeli yükleniyor... Bu işlem birkaç saniye sürebilir.")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model başarıyla yüklendi!")

# Veritabanı Bağlantısı Ayarları
def get_db():
    conn = sqlite3.connect("ear_of_gtu.db", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Veritabanı Tablolarını Oluşturma
def init_db():
    conn = sqlite3.connect("ear_of_gtu.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS posts
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  category TEXT, 
                  title TEXT, 
                  content TEXT, 
                  embedding TEXT,
                  clone_of INTEGER,
                  upvotes INTEGER DEFAULT 0)''')
    conn.commit()
    conn.close()

# Uygulama başlarken tabloları hazırla
init_db()

# Dışarıdan gelecek veri yapısı (Öğrenci Postu)
class PostCreate(BaseModel):
    category: str
    title: str
    content: str

@app.post("/api/posts")
def create_post(post: PostCreate, db: sqlite3.Connection = Depends(get_db)):
    # 1. YENİ POSTUN ANLAMINI ÇIKAR (EMBEDDING)
    # Yapay zeka yazıyı matematiksel bir diziye (vektöre) çeviriyor
    new_embedding = model.encode(post.title + " " + post.content)
    new_emb_list = new_embedding.tolist()
    
    # 2. MEVCUT POSTLARI GETİR (Klon kontrolü için)
    cursor = db.cursor()
    # Sadece orijinal postları (clone_of IS NULL) getiriyoruz ki klonun klonunu yapmayalım
    cursor.execute("SELECT id, embedding FROM posts WHERE clone_of IS NULL")
    existing_posts = cursor.fetchall()
    
    clone_of_id = None
    
    # 3. YAPAY ZEKA İLE ANLAMSAL BENZERLİK HESAPLAMA
    for ep in existing_posts:
        ep_id = ep["id"]
        ep_emb = json.loads(ep["embedding"])
        
        # İki metin arasındaki anlamsal benzerlik skoru (0 ile 1 arası bir değer üretir)
        similarity = util.cos_sim(new_embedding, ep_emb).item()
        
        # Eğer benzerlik %80'den fazlaysa, bu kesinlikle aynı konudur (KLON)
        if similarity > 0.80: 
            clone_of_id = ep_id
            break # İlk bulduğu orijinal postun klonu yapar ve aramayı bitirir
            
    # 4. VERİTABANINA KAYDET
    cursor.execute(
        "INSERT INTO posts (category, title, content, embedding, clone_of) VALUES (?, ?, ?, ?, ?)",
        (post.category, post.title, post.content, json.dumps(new_emb_list), clone_of_id)
    )
    db.commit()
    
    return {
        "message": "Geribildirim başarıyla alındı.",
        "is_clone": clone_of_id is not None,
        "clone_of": clone_of_id
    }

@app.get("/api/posts")
def get_posts(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id, category, title, content, clone_of, upvotes FROM posts")
    return cursor.fetchall()