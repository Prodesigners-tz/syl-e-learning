# SYL E-Learning — Kiongozi Mwandamizi wa Vijana Wakubwa

Mfumo wa e-learning uliojengwa kutoka kwenye manual ya SYL (Senior Youth
Leader) ya Idara ya Huduma za Vijana, SDA. React + Firebase.

## Hali ya sasa (v1 — msingi wa mfumo)

Hii ni **toleo la kwanza linalofanya kazi (functional scaffold)**, si bidhaa
kamili ya uzalishaji. Yafuatayo yametengenezwa na yanafanya kazi:

- ✅ Usajili/kuingia kwa email (Firebase Auth)
- ✅ Kuchagua kanisa wakati wa usajili; akaunti inabaki "pending" mpaka
  mchungaji aidhinishe (kwa link ya barua pepe, au admin kwa mkono)
- ✅ Notes za semina zote 10 (kutoka OCR ya manual asili) zinaonekana ndani ya
  mfumo, ukiwa na picha za kurasa asili
- ✅ Quiz engine: maswali ya nasibu kutoka benki, dakika 10/swali, alama ya
  kufaulu 75%, kurudia kwa maswali tofauti, cooldown ya siku 2 baada ya
  kufeli mara mbili mfululizo
- ✅ Cheti kinachotokea baada ya kumaliza semina zote
- ✅ Admin panel: kuongeza makanisa, kuidhinisha wanachama kwa mkono
- ⚠️ **Benki ya maswali bado ina sampuli chache tu** (`src/data/questionBank.sample.js`)
  — inahitaji kujazwa kikamilifu (tazama "Hatua zinazofuata" chini)
- ⚠️ **Sehemu ya "live na mentor" kwa mazoezi ya vitendo bado haijajengwa** —
  bado tunahitaji kuamua jinsi itakavyofanya kazi (tazama maelezo chini)
- ⚠️ Barua pepe halisi (SMTP) haijaunganishwa na akaunti yako bado —
  msimbo upo tayari (`functions/index.js`), unahitaji tu ujaze taarifa za
  akaunti ya SMTP utakayotumia

## Muundo wa mradi

```
src/
  pages/          Kurasa zote (Login, Signup, Dashboard, ModuleView, Quiz, Certificate, admin/...)
  components/     Navbar, Timer, ProtectedRoute
  context/        AuthContext — usimamizi wa mtumiaji aliyeingia
  data/modules.js Orodha ya semina 10 na taarifa zake
  utils/quizLogic.js  Mantiki ya quiz (randomization, scoring, cooldown)
  firebase.js     Uanzishaji wa Firebase SDK
public/content/
  notes/          Notes za kila semina (Markdown, kutoka OCR)
  images/         Picha za kurasa za manual asili (hazijabadilishwa)
functions/
  index.js        Cloud Functions — email ya idhini ya mchungaji
firestore.rules    Kanuni za usalama za database
```

## Kuanzisha kwenye kompyuta yako (VS Code)

### 1. Mahitaji
- Node.js 20+ (`node --version`)
- Akaunti ya Firebase (bure): https://console.firebase.google.com

### 2. Sakinisha dependencies
```bash
npm install
cd functions && npm install && cd ..
```

### 3. Tengeneza Firebase project
1. Nenda https://console.firebase.google.com → "Add project"
2. Ndani ya project, washa:
   - **Authentication** → Sign-in method → Email/Password
   - **Firestore Database** → Create database (production mode)
   - **Functions** (inahitaji Blaze plan — pay-as-you-go, lakini matumizi
     madogo kama haya ni bure kivitendo kwa mwezi)
3. Nenda Project Settings → General → "Your apps" → Add app → Web app
4. Nakili config values ulizopewa

### 4. Jaza environment variables
```bash
cp .env.example .env
```
Jaza `.env` na thamani ulizopata hatua ya 3.

### 5. Endesha mfumo (development)
```bash
npm run dev
```
Fungua http://localhost:5173

**Kumbuka:** wakati huu, hakuna makanisa bado kwenye database, kwa hiyo
signup dropdown itakuwa tupu. Unahitaji akaunti ya kwanza ya admin —
tazama "Kutengeneza admin wa kwanza" chini.

### 6. Deploy Firestore rules
```bash
npm install -g firebase-tools
firebase login
firebase init   # chagua project yako, Firestore + Functions + Hosting
firebase deploy --only firestore:rules
```

### 7. Usanidi wa barua pepe (SMTP) kwa Cloud Functions
```bash
firebase functions:config:set \
  smtp.host="smtp.yourprovider.com" \
  smtp.port="587" \
  smtp.user="your-smtp-username" \
  smtp.pass="your-smtp-password" \
  smtp.from="SYL <no-reply@yourdomain.org>" \
  app.base_url="https://your-app-domain.web.app"

firebase deploy --only functions
```
Tumia huduma ya SMTP ya kuaminika (SendGrid, Mailgun, Amazon SES, au email
ya taasisi/kanisa) — si Gmail ya kawaida ya kibinafsi, kwani Google
huzuia utumaji wa kiotomatiki kutoka kwa akaunti za kawaida.

Baada ya deploy, nakili URL ya functions (itaonyeshwa terminal) kwenye
`.env` yako kama `VITE_FUNCTIONS_BASE_URL`.

### Kutengeneza admin wa kwanza
Hakuna UI ya "kuwa admin" kwa makusudi (kuzuia mtu yeyote kujifanya admin).
Baada ya kujisajili mara ya kwanza kama mtumiaji wa kawaida:
1. Nenda Firebase Console → Firestore → collection `users` → pata doc yako
2. Badilisha `role` kutoka `student` kuwa `admin`, na `status` kuwa `approved`
3. Ingia tena — sasa utaona link ya "Admin" kwenye menyu

Kisha tumia Admin → Makanisa kuongeza kanisa lako la kwanza kabla ya mtu
yeyote mwingine kujisajili.

## Hatua zinazofuata (bado hazijafanyika)

1. **Kujaza benki ya maswali kikamilifu** — sasa hivi kuna sampuli chache
   tu kwenye `src/data/questionBank.sample.js`. Baada ya kukagua/kusahihisha
   notes za OCR (`public/content/notes/*.md`), maswali kamili ya kila
   semina yanahitaji kuongezwa kwenye Firestore collection
   `questionBank/{moduleId}/questions` (au tunaweza kuandika script ya
   kuyapakia moja kwa moja — niambie ukiwa tayari).
2. **Kuamua muundo wa "live na mentor"** kwa kutathmini mazoezi ya vitendo —
   bado halijaamuliwa jinsi litakavyofanya kazi kwenye mfumo (booking ya
   muda? kuandika alama kwa mkono baada ya kikao?).
3. **Kuunganisha akaunti halisi ya SMTP** ili barua pepe za idhini zitume
   kweli (hatua 7 hapo juu).
4. **Kupitia usahihi wa OCR** kwenye notes zote kabla ya kuzitangaza rasmi
   kwa watumiaji.
5. **Kupandisha (deploy) mfumo mahali watu waweze kuufikia** — Firebase
   Hosting ndiyo njia rahisi zaidi ikizingatiwa tayari tunatumia Firebase:
   `npm run build && firebase deploy --only hosting`

## Usalama — vitu vya kuzingatia baadaye

- Uchambuzi wa jaribio (scoring) kwa sasa unafanyika **upande wa mtumiaji
  (client-side)** kabla ya kuandikwa Firestore. Kwa usalama zaidi dhidi ya
  udanganyifu wa hali ya juu, hatua inayofuata ni kuhamishia mantiki ya
  kukokotoa alama ndani ya Cloud Function badala ya browser.
- Muda wa sekunde 10 kwa swali unasaidia kupunguza udanganyifu wa haraka
  lakini si suluhisho la 100% (mtu bado anaweza kutumia kifaa cha pili).
