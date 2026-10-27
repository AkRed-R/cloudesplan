FROM python:3.11-slim 
WORKDIR /app 
COPY requirements.txt . 
RUN pip install --no-cache-dir -r requirements.txt 

# YENİ EKLENEN KISIM: Modeli build aşamasında indirip imaja gömer
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY . . 

# Çevrimdışı mod değişkenlerini çalışma zamanı (runtime) için ayarlıyoruz
ENV HF_HUB_OFFLINE=1
ENV TRANSFORMERS_OFFLINE=1

EXPOSE 8000 
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]