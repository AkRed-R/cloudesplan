from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import sqlite3
import json
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = FastAPI(title="EAR OF GTU API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Yapay Zeka modeli yükleniyor... (all-MiniLM-L6-v2)")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model başarıyla yüklendi!")

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
    c.execute('''CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT, role TEXT, banned_until DATETIME)''')
    c.execute('''CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT, title TEXT, content TEXT, embedding TEXT, clone_group_id INTEGER, status TEXT DEFAULT 'Bekleniyor', upvotes INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    c.execute('''CREATE TABLE IF NOT EXISTS ideas (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER, content TEXT, upvotes INTEGER DEFAULT 0)''')
    c.execute('''CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, tag_name TEXT, description TEXT)''')
    # YENİ TABLO: Kimin kime +1 verdiğini tutmak için
    c.execute('''CREATE TABLE IF NOT EXISTS post_upvotes (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER, user_email TEXT, UNIQUE(post_id, user_email))''')
    conn.commit()
    conn.close()

init_db()

class LoginRequest(BaseModel):
    email: str
    password: str

class PostCreate(BaseModel):
    category: str
    title: str
    content: str

class IdeaCreate(BaseModel):
    content: str

class UpvoteRequest(BaseModel):
    email: str

@app.post("/api/login")
def login(req: LoginRequest, db: sqlite3.Connection = Depends(get_db)):
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    student_email = os.getenv("STUDENT_EMAIL")
    student_password = os.getenv("STUDENT_PASSWORD")

    if admin_email and admin_password and req.email == admin_email and req.password == admin_password:
        return {"message": "Admin girişi başarılı", "role": "Admin", "email": req.email}
    
    if student_email and student_password and req.email == student_email and req.password == student_password:
         return {"message": "Öğrenci girişi başarılı", "role": "Öğrenci", "email": req.email}
         
    raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı!")


@app.post("/api/posts")
def create_post(post: PostCreate, db: sqlite3.Connection = Depends(get_db)):
    new_embedding = model.encode(post.title + " " + post.content).tolist()
    cursor = db.cursor()
    cursor.execute("SELECT id, clone_group_id, embedding FROM posts WHERE clone_group_id IS NOT NULL AND embedding IS NOT NULL")
    existing_posts = cursor.fetchall()
    
    assigned_group_id = None
    for ep in existing_posts:
        try:
            ep_emb = json.loads(ep["embedding"])
            if util.cos_sim(new_embedding, ep_emb).item() > 0.80: 
                assigned_group_id = ep["clone_group_id"]
                break 
        except Exception:
            continue
            
    cursor.execute(
        "INSERT INTO posts (category, title, content, embedding, clone_group_id, status) VALUES (?, ?, ?, ?, ?, 'Bekleniyor')",
        (post.category, post.title, post.content, json.dumps(new_embedding), assigned_group_id)
    )
    new_post_id = cursor.lastrowid
    
    if assigned_group_id is None:
        cursor.execute("UPDATE posts SET clone_group_id = ? WHERE id = ?", (new_post_id, new_post_id))
        assigned_group_id = new_post_id
    db.commit()
    return {"message": "Geribildirim alındı.", "post_id": new_post_id, "clone_group_id": assigned_group_id}


@app.get("/api/posts")
def get_posts(sort: str = "trend", db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM posts WHERE status != 'Reddedildi'")
    posts_raw = cursor.fetchall()
    
    result = []
    for p in posts_raw:
        p_dict = dict(p)
        
        cursor.execute("SELECT * FROM ideas WHERE post_id = ?", (p_dict['id'],))
        p_dict["ideas"] = [dict(i) for i in cursor.fetchall()]
        p_dict["ideas_count"] = len(p_dict["ideas"])
        
        cursor.execute("SELECT COUNT(*) as cnt FROM posts WHERE clone_group_id = ? AND id != ?", (p_dict['clone_group_id'], p_dict['id']))
        p_dict["clone_count"] = cursor.fetchone()["cnt"]
        
        try:
            created_at = datetime.strptime(p_dict["created_at"], "%Y-%m-%d %H:%M:%S")
        except:
            created_at = datetime.now()
            
        hours_passed = (datetime.now() - created_at).total_seconds() / 3600.0
        p_dict["trend_score"] = (p_dict["upvotes"] + 1.0) / ((hours_passed + 2.0) ** 1.5)
        
        result.append(p_dict)
        
    if sort == "top":
        result.sort(key=lambda x: x["upvotes"], reverse=True)
    else:
        result.sort(key=lambda x: x["trend_score"], reverse=True)
        
    return result[:30]


# YENİ API: Sadece Klonları Getir
@app.get("/api/posts/{post_id}/clones")
def get_post_clones(post_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT clone_group_id FROM posts WHERE id = ?", (post_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Gönderi bulunamadı")
        
    group_id = row["clone_group_id"]
    cursor.execute("SELECT id, category, title, content, upvotes, created_at FROM posts WHERE clone_group_id = ? AND id != ? AND status != 'Reddedildi'", (group_id, post_id))
    
    return [dict(p) for p in cursor.fetchall()]


# GÜNCELLENEN API: E-Postaya Göre +1 Doğrulaması
@app.post("/api/posts/{post_id}/upvote")
def upvote_post(post_id: int, req: UpvoteRequest, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    try:
        # Önce bu emaile ve bu post id'ye sahip kayıt atmayı dener, UNIQUE kısıtlaması varsa hata fırlatır
        cursor.execute("INSERT INTO post_upvotes (post_id, user_email) VALUES (?, ?)", (post_id, req.email))
        cursor.execute("UPDATE posts SET upvotes = upvotes + 1 WHERE id = ?", (post_id,))
        db.commit()
        return {"message": "+1 verildi"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Bu gönderiye zaten +1 verdiniz!")


@app.post("/api/posts/{post_id}/ideas")
def add_idea(post_id: int, idea: IdeaCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("INSERT INTO ideas (post_id, content) VALUES (?, ?)", (post_id, idea.content))
    db.commit()
    return {"message": "Fikir başarıyla eklendi"}