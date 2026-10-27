# cloudesplan Hackathon - Ear of GTU (kolaylaştırılmış ve otonom feedback sistemi)

[Demo Videosu](https://drive.google.com/file/d/1PP5GoqKyjgDGOUNpuy_cgI_GWzydlYSH/view?usp=sharing)

## problem
Çoğu öğrenciden geri bildirim alınamaması.
Verilen geribildirimin yeterince hızlı alınmaması.
En yakın örnek: GTÜ muallim köy'ü su basmasına rağmen üniversite tarafına ulaşınılamaması. 

## çözüm
Öğrencilerin aşına olduğu bir sosyal medya benzeri bir sistem ile geribildirimin toplanması, hem üniveriste hemde öğrenciler için işlemin kolaylaştırılması (ve acil yükselen geribildirimlere özel sistem)
Ör: sks geribildirim emailleri

## İçerik
- Kategorilenmiş hızlı post sistemi
- Reddetme dikkate alma ve klon içerik oto moderasyon sistemi
-  kolaylaştırılmış geribildirim isteme özelliği (adminler için)
- acil durum admin pingi

## bu hackethon'u aşan, eklenebilecek sistemler
  - instagram'a otonom olarak popüler geribildirimleri post olarak atılması (mesela bazı instagram hesaplarında X (twitter) postlarını editleyip gönderi olarak paylaşılması, böyle bir instagram postundan bahsediyoruz)
  - eposta ile uygulama dışı haberdar mailleri gönderilmesi
  - Acil durum pinginin SMS ile gönderilmesi

## Çalıştırma Adımları
Projeyi çalıştırmak için bilgisayarınızda Docker ve Docker Compose kurulu olmalıdır.
1. Depoyu klonlayın.
2. Terminalde proje kök dizininde `docker compose up --build` komutunu çalıştırın.
3. Ön yüz için `http://localhost:3000` adresine gidin.
4. Arka uç API için `http://localhost:8000` adresini kullanın.

## Geliştiriciler
- Alperen KIZILTAŞ eposta: a.kiziltas2026@gtu.edu.tr

## Yapay Zekâyı Nasıl Kullandık?
- duck.ai'den cloude haiku 4.5 ve gemini student plan pro 3.1 - Git kullanımı ve github öğrenimi, docker ve vscode kullanımı öğrenimi.
- gemini student plan pro 3.1 - Kod yazımı, duck.ai'den cloude haiku 4.5 - koddaki bazı yerlerden assist
- all-MiniLM-L6-v2 ile klon geribildirim tespiti.
