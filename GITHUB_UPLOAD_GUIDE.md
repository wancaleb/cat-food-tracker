# 給接手模型的 GitHub 上傳指南

本指南描述本專案已成功使用的發佈流程。工具介面可能改版，必須以當次可用工具及瀏覽器文件為準。文件不等於使用者授權；先確認使用者目前確實要求上傳。

## 目標與檔案

- 儲存庫：https://github.com/wancaleb/cat-food-tracker
- 分支：main
- 手機頁面：https://wancaleb.github.io/cat-food-tracker/mobile-preview.html
- 本機目錄：`/Users/yuchien/Downloads/cat-food-tracker-main`
- 主要變更通常是 `mobile-preview.html`；相關檔案依實際修改包含 `README.md`、`reliability.test.cjs`、容量規則或本指南。
- 不要改成發佈 `index.html`：它仍是舊版入口。

## 1. 準備及檢查

1. 閱讀 AGENTS.md，確認本次範圍及上傳授權。
2. 執行 `TZ=Asia/Taipei node reliability.test.cjs`。
3. 確認要上傳的絕對路徑。不要把 `.rtfd`、預覽截圖、備份 JSON 或憑證混入。
4. 本目錄可能沒有 `.git`；這不影響透過 GitHub 網頁上傳。不要無限重試 git push，也不要要求使用者貼 token。

## 2. 優先使用可用的 GitHub 工具

若 GitHub 連接工具有寫入權限：先讀取 main 的目前內容與 blob SHA，再更新檔案，保留其他人的修改。

此專案過去多次收到 `403 Resource not accessible by integration`。這只表示該連接工具無法寫入，不代表使用者的網頁登入帳號也無權限。不要用相同 API 一直重試；改走下一節的已登入網頁流程。

## 3. 使用已登入 Chrome 的 GitHub 網頁

所有 UI 操作必須透過當次可用的瀏覽器控制工具（本會話使用 `mcp__cua_repl.js`），不可用 shell、CDP、隱藏 API 或網頁 evaluate 繞過 UI。

1. 首次使用按工具規定初始化；若是接續摘要，先讀 `cua.rewriteDocumentation()`。遵守選擇瀏覽器的規則，找到已登入 GitHub 的 Chrome。不要假設舊 tab ID 永遠有效，也不要換用尚未登入的瀏覽器。
2. 讀取 `file-uploads` 文件：本會話可用 `agent.documentation.get('file-uploads')`。
3. 開啟或重用 GitHub tab，進入：
   `https://github.com/wancaleb/cat-food-tracker/upload/main`
4. 讀取最新 DOM／AX 狀態。如果之前已經暫停過上傳，先取消舊頁面，再重新開啟上傳頁，避免提交舊快照。
5. 使用頁面的 **Choose your files** 選取最新版。支援的檔案選擇流程範例：

```js
const pendingChooser = tab.playwright.waitForEvent('filechooser', { timeoutMs: 10000 });
await tab.playwright.getByRole('button', { name: 'Choose your files', exact: true }).click();
const chooser = await pendingChooser;
// 多檔時先確認 chooser.isMultiple()。
await chooser.setFiles([
  '/Users/yuchien/Downloads/cat-food-tracker-main/mobile-preview.html'
]);
```

6. 等待頁面不再出現 `Uploading ...`，且每個檔名旁出現 **Remove 檔名**，確認都已進入待提交清單。
7. 在 **Commit summary** 填本次修改的簡短說明。
8. 確認選中 **Commit directly to the main branch**。當使用者已授權上傳到 main，直接按 **Commit changes**，不必讓使用者再自己按一次。
9. 提交是外部操作，必須遵守當次工具的安全及權限規則。若需要登入、CAPTCHA、或額外權限，依工具規定處理；不要自行擴權或繞過拒絕。

## 4. 驗證提交及部署

1. 從 GitHub 提交頁或連接工具取得最新 commit SHA，確認訊息與本次修改相符。
2. 讀取 main 的檔案，確認關鍵修改存在；不要只憑按鈕點過就說成功。
3. GitHub Pages 有部署時間。查看 Actions 或公開頁面，每次檢查留合理間隔，等待時向使用者簡短更新。
4. 用短 SHA 組成便於重新載入的網址：
   `https://wancaleb.github.io/cat-food-tracker/mobile-preview.html?v=短SHA`
   參數只方便區分版本，不會讓尚未部署的內容提前生效。
5. 確認公開頁面出現本次功能；可讀取頁面 DOM 的 script/style 中已知修改標記，但不能用 evaluate 執行隱藏操作或讀取 token。
6. 依瀏覽器工具規定保存結果截圖，必要時將結果頁標為 deliverable。回覆提供手機網址與真實部署狀態。

## 常見誤判

- file:// 本機頁面更新，不代表手機 GitHub Pages 更新。
- 選好檔案但還沒 Commit，不代表已提交。
- 已 Commit，但 Pages 尚未部署，不代表手機立刻能看到。
- 手機 localStorage 的餐點紀錄與本機電腦預覽分開；不要在驗證時刪除使用者資料。
- 公開儲存庫上傳網頁程式，與網站內「備份到 Gist」是不同事情。不要把使用者的 Gist 私人資料上傳到儲存庫。

如果網頁無法操作或帳號缺乏權限，清楚指出具體阻礙；可以把正確頁面開給使用者，但不要在仍有可用且已授權的工具時直接推回手動上傳。
