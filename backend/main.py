from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import sqlite3
import json
import os
from dotenv import load_dotenv

# .env dosyasındaki gizli şifreleri ve bilgileri yükle
load_dotenv()

app = FastAPI(title="EAR OF GTU API")

# YAPAY ZEKÂ MODELİ YÜKLENİYOR
print("Yapay Zeka modeli yükleniyor... Bu işlem birkaç saniye sürebilir.")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model başarıyla yüklendi!")

# ----------------- VERİTABANI BAĞLANTISI VE KURULUMU -----------------

def get_db():
    conn = sqlite3.connect("ear_of_gtu.db", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    conn = sqlite3.connect("ear_of_gtu.db")
    c = conn.cursor()
    
    # KULLANICILAR Tablosu
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  email TEXT UNIQUE,
                  password TEXT,
                  role TEXT,
                  banned_until DATETIME)''')

    # GÖNDERİLER Tablosu - (Eksik veya hatalı tabloyu önlemek için)
    c.execute('''CREATE TABLE IF NOT EXISTS posts
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  category TEXT, 
                  title TEXT, 
                  content TEXT, 
                  embedding TEXT,
                  clone_group_id INTEGER,
                  status TEXT DEFAULT 'Bekleniyor',
                  upvotes INTEGER DEFAULT 0,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS ideas
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  post_id INTEGER,
                  content TEXT,
                  upvotes INTEGER DEFAULT 0)''')

    conn.commit()
    conn.close()

init_db()

# ----------------- VERİ MODELLERİ -----------------

class LoginRequest(BaseModel):
    email: str
    password: str

class PostCreate(BaseModel):
    category: str
    title: str
    content: str

# ----------------- API UÇ NOKTALARI -----------------

@app.post("/api/login")
def login(req: LoginRequest, db: sqlite3.Connection = Depends(get_db)):
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    
    if req.email == admin_email and req.password == admin_password:
        return {"message": "Admin girişi başarılı", "role": "Admin", "email": req.email}
    
    student_email = os.getenv("STUDENT_EMAIL", "ogrenci@gtu.edu.tr")
    student_password = os.getenv("STUDENT_PASSWORD", "123456")

    if req.email == student_email and req.password == student_password:
        return {"message": "Öğrenci girişi başarılı", "role": "Öğrenci", "email": req.email}

    raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı!")


@app.post("/api/posts")
def create_post(post: PostCreate, db: sqlite3.Connection = Depends(get_db)):
    # 1. YENİ POSTUN ANLAMINI ÇIKAR
    new_embedding = model.encode(post.title + " " + post.content)
    new_emb_list = new_embedding.tolist()
    
    cursor = db.cursor()
    
    # 2. MEVCUT POSTLARI GETİR
    # "embedding IS NOT NULL" şartı eklendi ki boş olanlarda çökmesin
    cursor.execute("SELECT id, clone_group_id, embedding FROM posts WHERE clone_group_id IS NOT NULL AND embedding IS NOT NULL")
    existing_posts = cursor.fetchall()
    
    assigned_group_id = None
    
    # 3. YAPAY ZEKA İLE BENZERLİK HESAPLAMA (Güvenli hale getirildi)
    for ep in existing_posts:
        try:
            ep_emb = json.loads(ep["embedding"])
            similarity = util.cos_sim(new_embedding, ep_emb).item()
            
            if similarity > 0.80: 
                assigned_group_id = ep["clone_group_id"]
                break 
        except Exception as e:
            print(f"Post ID {ep['id']} vektör analizi hatası atlandı:", e)
            continue
            
    # 4. KAYDET
    cursor.execute(
        "INSERT INTO posts (category, title, content, embedding, clone_group_id, status) VALUES (?, ?, ?, ?, ?, 'Bekleniyor')",
        (post.category, post.title, post.content, json.dumps(new_emb_list), assigned_group_id)
    )
    new_post_id = cursor.lastrowid
    
    if assigned_group_id is None:
        cursor.execute("UPDATE posts SET clone_group_id = ? WHERE id = ?", (new_post_id, new_post_id))
        assigned_group_id = new_post_id
        
    db.commit()
    
    return {
        "message": "Geribildirim AI moderasyonuna alındı.",
        "post_id": new_post_id,
        "clone_group_id": assigned_group_id
    }