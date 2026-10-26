from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
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
    c.execute('''CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT, title TEXT, content TEXT, embedding TEXT, clone_group_id INTEGER, status TEXT DEFAULT 'Bekleniyor', is_requested BOOLEAN DEFAULT 0, request_tag TEXT, author_email TEXT, upvotes INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    c.execute('''CREATE TABLE IF NOT EXISTS ideas (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER, user_email TEXT, content TEXT, upvotes INTEGER DEFAULT 0)''')
    c.execute('''CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT, tag_name TEXT, color TEXT)''')
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
    is_requested: bool = False
    request_tag: Optional[str] = None
    author_email: Optional[str] = None

class IdeaCreate(BaseModel):
    content: str
    email: str

class UpvoteRequest(BaseModel):
    email: str

class TagCreate(BaseModel):
    category: str
    tag_name: str
    color: str

class StatusUpdate(BaseModel):
    status: str
    category: str

@app.post("/api/login")
def login(req: LoginRequest, db: sqlite3.Connection = Depends(get_db)):
    admins = {}
    students = {}
    
    # .env dosyasındaki değişkenleri dinamik olarak tarıyoruz
    for key, value in os.environ.items():
        # Admin hesaplarını topla
        if key.startswith("ADMIN_") and key.endswith("_EMAIL"):
            base_key = key.replace("_EMAIL", "")
            admins[value] = os.getenv(f"{base_key}_PASSWORD")
        elif key == "ADMIN_EMAIL": # Geriye dönük uyumluluk
            admins[value] = os.getenv("ADMIN_PASSWORD")
            
        # Öğrenci hesaplarını topla
        elif key.startswith("STUDENT_") and key.endswith("_EMAIL"):
            base_key = key.replace("_EMAIL", "")
            students[value] = os.getenv(f"{base_key}_PASSWORD")
        elif key == "STUDENT_EMAIL": # Geriye dönük uyumluluk
            students[value] = os.getenv("STUDENT_PASSWORD")

    # Giriş kontrolleri
    if req.email in admins and admins[req.email] == req.password:
        return {"message": "Admin girişi başarılı", "role": "Admin", "email": req.email}
        
    if req.email in students and students[req.email] == req.password:
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
            if util.cos_sim(new_embedding, ep_emb).item() > 0.65: 
                assigned_group_id = ep["clone_group_id"]
                break 
        except Exception:
            continue
            
    cursor.execute(
        "INSERT INTO posts (category, title, content, embedding, clone_group_id, status, is_requested, request_tag, author_email) VALUES (?, ?, ?, ?, ?, 'Bekleniyor', ?, ?, ?)",
        (post.category, post.title, post.content, json.dumps(new_embedding), assigned_group_id, int(post.is_requested), post.request_tag, post.author_email)
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
    # Tüm postları döndürüyoruz, frontend tarafında ana akışta reddedilenler gizlenecek.
    cursor.execute("SELECT * FROM posts")
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
        p_dict["is_requested"] = bool(p_dict["is_requested"])
        
        result.append(p_dict)
        
    if sort == "top":
        result.sort(key=lambda x: x["upvotes"], reverse=True)
    else:
        result.sort(key=lambda x: x["trend_score"], reverse=True)
        
    return result


@app.put("/api/posts/{post_id}/status")
def update_post_status(post_id: int, req: StatusUpdate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("UPDATE posts SET status = ?, category = ? WHERE id = ?", (req.status, req.category, post_id))
    db.commit()
    return {"message": "Durum güncellendi"}


@app.get("/api/posts/{post_id}/clones")
def get_post_clones(post_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT clone_group_id FROM posts WHERE id = ?", (post_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Gönderi bulunamadı")
        
    group_id = row["clone_group_id"]
    cursor.execute("SELECT id, category, title, content, upvotes, created_at, is_requested, request_tag, author_email FROM posts WHERE clone_group_id = ? AND id != ?", (group_id, post_id))
    
    clones = []
    for c in cursor.fetchall():
        c_dict = dict(c)
        c_dict["is_requested"] = bool(c_dict["is_requested"])
        clones.append(c_dict)
        
    return clones


@app.post("/api/posts/{post_id}/upvote")
def upvote_post(post_id: int, req: UpvoteRequest, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO post_upvotes (post_id, user_email) VALUES (?, ?)", (post_id, req.email))
        cursor.execute("UPDATE posts SET upvotes = upvotes + 1 WHERE id = ?", (post_id,))
        db.commit()
        return {"message": "+1 verildi"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Bu gönderiye zaten +1 verdiniz!")


@app.post("/api/posts/{post_id}/ideas")
def add_idea(post_id: int, idea: IdeaCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("INSERT INTO ideas (post_id, user_email, content) VALUES (?, ?, ?)", (post_id, idea.email, idea.content))
    db.commit()
    return {"message": "Fikir başarıyla eklendi"}


@app.post("/api/tags")
def create_tag(tag: TagCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("INSERT INTO tags (category, tag_name, color) VALUES (?, ?, ?)", (tag.category, tag.tag_name, tag.color))
    db.commit()
    return {"message": "Etiket oluşturuldu"}


@app.get("/api/tags")
def get_tags(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM tags")
    return [dict(t) for t in cursor.fetchall()]