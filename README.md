# Choco 飲食記錄

供手機記錄 Choco 的每餐食物、攝取熱量及體重。純前端網站，紀錄主要儲存在目前瀏覽器的 localStorage。

## 網站入口

- 手機新版：`mobile-preview.html`，包含今天、歷史、攝取趨勢、體重、食物資料及資料與備份。
- `index.html` 是舊版，目前根網址仍會開啟舊版。兩者使用的紀錄格式不同，新版可讀取並遷移同網域的舊版本機紀錄。
- GitHub Pages：<https://wancaleb.github.io/cat-food-tracker/mobile-preview.html>

請透過網站網址使用。直接以 `file://` 開啟 HTML 時，瀏覽器可能阻擋食物檔案的載入；其資料空間也與正式網站不同。

## 食物資料

新版及舊版均優先讀取 [Google 試算表](https://docs.google.com/spreadsheets/d/1Yq9jQUD0c2YVzf-8E85B6DiA8Q5HaUBUWBNDiont1VE/edit?gid=0#gid=0)，失敗時使用 `CatFoodInfo.csv`。新版選食物畫面會顯示目前資料來源；重新整理會重新載入。

試算表需允許知道連結的人檢視。前七欄依序為：品名、分類、每一百克熱量、品牌、肉類、質地、產地。包裝重量預設規則放在 `package-capacities.json`。修改食物資料不會重新計算已保存餐點的熱量快照。

## 儲存與備份

- 儲存餐點／體重會寫入此瀏覽器，不代表已備份到雲端。
- 「匯出備份」下載 JSON，包含餐點、體重、開封包裝及刪除標記。「匯入並合併」可載入新版或相容的舊版備份。
- GitHub Gist 按鈕沿用同網域舊版的 `github_gist_id`／`github_token` 設定。每次儲存後約 3 秒自動備份；連續操作會延後至最後一次儲存後。失敗會稍後重試，恢復連線或回到頁面時也會嘗試。編輯餐點期間暫緩自動備份。上方顯示備份狀態與最後成功時間，仍可按按鈕立即備份。
- 合併以紀錄 ID 對應，有修改時間時保留較新的版本；舊備份沒有修改時間且本機已有同 ID 時保留本機版本。刪除標記避免紀錄被舊備份重新帶回。
- 同一筆舊格式紀錄兩邊都沒有修改時間時，無法自動判定哪一份更新。匯入前請先匯出本機備份。
- 舊版 `catFoodHistory`／`catWeightHistory` 會保留。更新網站檔案不會主動清除它們。
- 首次使用顯示空白紀錄。先前已保存的示範資料不會自動刪除，以免誤刪真實餐點。

## 本機檢查

```sh
python3 -m http.server 8765
TZ=Asia/Taipei node reliability.test.cjs
```

測試涵蓋空白首次使用、合併衝突與刪除、跨日、編輯中日期保留、包裝備份還原、儲存失敗、食物來源回退及最近使用清單。

手機 Safari 的鍵盤、日期選擇器及試算表連線仍需在實機確認。

## 專案檔案

- `mobile-preview.html`：新版畫面與程式。
- `index.html`：舊版畫面與程式。
- `choco-avatar.png`：新版大頭照。
- `CatFoodInfo.csv`／`package-capacities.json`：食物備份及包裝規則。
- `MOBILE_REDESIGN_PLAN.md`：改版規劃歷史，部分項目是規劃，並非已實作功能。
- `reliability.test.cjs`：資料可靠性測試。

MIT License。
