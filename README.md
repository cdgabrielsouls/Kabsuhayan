# Kabsuhayan

Campus marketplace para sa mga estudyante ng CvSU Indang. Naka-save sa MongoDB ang mga listing na ipo-post sa site.

## Paandarin sa local computer

Siguraduhing puwedeng kumonekta ang MongoDB Atlas sa internet connection mo. Nasa `server/.env` ang database connection mo; huwag itong i-upload o ibahagi.

Buksan ang dalawang terminal sa project folder.

**Terminal 1 — API at database**

```powershell
cd .\server
npm install
npm run dev
```

Kapag tama ang koneksyon, lalabas ang `Connected to the Kabsuhayan database` at gagana ang API sa `http://localhost:3001`.

**Terminal 2 — website**

```powershell
cd .\client
npm install
npm run dev
```

Buksan ang address na ibibigay ni Vite, karaniwan ay `http://localhost:5173`.

## Mag-post ng item

Sa website, mag-log in sa demo, pumunta sa **Post an item**, at ilagay ang detalye. Pag na-save, lalabas ang listing sa marketplace at mananatili ito sa database kahit i-refresh ang page.

Halimbawa:

- **Pangalan:** Calculus 1 reviewer bundle
- **Kategorya:** Books
- **Presyo:** ₱120
- **Kondisyon:** Good
- **Stock:** 1
- **Paglalarawan:** Reviewer notes at practice problems mula noong nakaraang semester. Kumpleto at maayos pa. Puwedeng mag-meet malapit sa CvSU library.

Puwede mong palitan ang halimbawang ito ng sarili mong item. Hindi awtomatikong maglalagay ng sample listing sa database.

## API

- `GET /api/health` — tingnan kung umaandar ang server
- `GET /api/products` — kunin ang lahat ng listing
- `POST /api/products` — magdagdag ng listing
- `GET /api/products/:id` — tingnan ang isang listing
- `PATCH /api/products/:id` — baguhin ang listing
- `DELETE /api/products/:id` — burahin ang listing

Pang-prototype pa ang demo login at seller permissions. Huwag maglagay ng sensitibong impormasyon o gamitin ang public CRUD API para sa live service hangga't wala pang tunay na authentication at access control.
