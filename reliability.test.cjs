const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const html=fs.readFileSync('mobile-preview.html','utf8');const script=html.split('<script>')[1].split('</script>')[0];new vm.Script(script);
let clock=new Date('2026-10-15T23:59:00+08:00').getTime();class TestDate extends Date{constructor(...a){super(...(a.length?a:[clock]))}static now(){return clock}}
const values=new Map(),element={dataset:{},textContent:'',classList:{add(){},remove(){},contains(){return false}},querySelector(){return null}};const ctx={console,Date:TestDate,setTimeout(){},clearTimeout(){},AbortController,document:{getElementById(){return element},addEventListener(){}},window:{visualViewport:{addEventListener(){}}},localStorage:{getItem:k=>values.get(k)||null,removeItem:k=>values.delete(k),setItem:(k,v)=>values.set(k,v)}};vm.createContext(ctx);vm.runInContext(script.slice(0,script.indexOf("  $('newMeal').onclick")),ctx);const run=s=>vm.runInContext(s,ctx);
run('loadAppData()');assert.equal(run('state.meals.length'),0);assert.equal(run('state.weightPeriod'),'6');
run(`state.meals=[{id:'a',date:'2026-10-15',foods:[{grams:30}],remaining:0,updatedAt:'2026-10-15T12:00:00Z'}];state.deleted.meals.deleted='2026-10-15T12:00:00Z';render=()=>{};enrichLegacyFoods=()=>{};toast=()=>{};importParsedData({meals:[{id:'a',date:'2026-10-15',foods:[{grams:20}],remaining:0},{id:'deleted',date:'2026-10-15',foods:[{grams:10}],remaining:0}]})`);
assert.equal(run('state.meals[0].foods[0].grams'),30);assert.equal(run('state.meals.length'),1);
run(`importParsedData({meals:[{id:'a',date:'2026-10-15',foods:[{grams:40}],remaining:0,updatedAt:'2026-10-15T13:00:00Z'}]})`);assert.equal(run('state.meals[0].foods[0].grams'),40);
assert.equal(run('dayKey(0)'),'2026-10-15');
vm.runInContext(script.slice(script.indexOf('  let lastCalendarDay='),script.indexOf("  document.addEventListener('visibilitychange'")),ctx);
run("state.date=dayKey(0)");clock+=120000;run('refreshCalendarDay()');assert.equal(run('state.date'),'2026-10-16');
element.classList.contains=()=>true;clock+=86400000;run('refreshCalendarDay()');assert.equal(run('state.date'),'2026-10-16');element.classList.contains=()=>false;

run(`database=[{name:'A',brand:'B',category:'乾糧'}];state.packages=[{id:'p',foodIndex:0,initialGrams:340,remainingGrams:300}]`);assert.equal(run('backupPayload().packages[0].foodName'),'A');run('importParsedData({meals:[],packages:[]})');assert.equal(run('state.packages.length'),1,'Gist merge must keep locally opened packages');assert.equal(run('backupPayload().packages[0].remainingGrams'),300);assert.ok(run('backupPayload().deleted.meals.deleted'));
run('const savedBackup=JSON.parse(JSON.stringify(backupPayload()));state.packages=[];importParsedData(savedBackup)');assert.equal(run('state.packages[0].remainingGrams'),300);

ctx.localStorage.setItem=()=>{throw Error('quota')};assert.throws(()=>run('saveAppData()'),/quota/);
// Source fallback and persisted recent food identity.
ctx.localStorage.setItem=(k,v)=>values.set(k,v);values.set('chocoRecentFoods',JSON.stringify(['A\u001f乾糧\u001fB']));let calls=[];ctx.fetch=async url=>{calls.push(url);if(url.startsWith('https:'))throw Error('offline');if(url==='package-capacities.json')return {ok:true,json:async()=>[]};return {ok:true,text:async()=> '品名,分類,每一百克熱量,品牌,肉類\nA,乾糧,400,B,雞肉'};};run('renderChooser=()=>{};state.packages=[]');
(async()=>{await run('loadFoods()');assert.equal(calls.length,3);assert.equal(run('database.length'),1);assert.equal(run('recentIndices[0]'),0);
ctx.URL=URL;ctx.fetch=async()=>({ok:true,text:async()=>JSON.stringify({meals:[]})});
assert.equal((await run(`readGistBackup({files:{'cat-food-data.json':{truncated:true,content:'{',raw_url:'https://gist.githubusercontent.com/example/raw/backup.json'}}})`)).meals.length,0);
await assert.rejects(run(`readGistBackup({files:{'cat-food-data.json':{content:'{'}}})`),/格式不完整/);
values.set('github_gist_id','test');values.set('github_token','test-only');
let requests=[],patchHook=null;ctx.fetch=async(url,options={})=>{requests.push(options.method||'GET');if(options.method==='PATCH'){if(patchHook)patchHook();return {ok:true}}return {ok:true,json:async()=>({files:{'cat-food-data.json':{content:JSON.stringify({meals:[]})}}})}};
run('saveAppData()');assert.equal(values.get('chocoBackupPending'),'1');await run('saveGist({automatic:true})');assert.equal(values.has('chocoBackupPending'),false);assert.ok(values.get('chocoBackupLastSuccess'));assert.equal(JSON.parse(values.get('chocoBackupCoverage')).lastDate,'2026-10-15');assert.equal(requests.join(','),'GET,PATCH');
patchHook=()=>run('saveAppData()');run('saveAppData()');await run('saveGist({automatic:true})');assert.equal(values.get('chocoBackupPending'),'1','changes made during PATCH must remain pending');
ctx.fetch=async()=>{throw Error('offline')};await run('saveGist({automatic:true})');assert.equal(values.get('chocoBackupPending'),'1');assert.equal(element.dataset.state,'failed');
run("state.meals=[{date:'2026-09-30'},{date:'2026-10-01'},{date:'2026-10-16'},{date:'2025-10-01'}];state.historyMode='month';state.historyMonth='2026-10'");assert.equal(JSON.stringify(run('historyDates()')),JSON.stringify(['2026-10-16','2026-10-01']));run("state.historyMode='custom';state.historyStart='2026-09-30';state.historyEnd='2026-10-01'");assert.equal(JSON.stringify(run('historyDates()')),JSON.stringify(['2026-10-01','2026-09-30']));run("state.historyMode='all'");assert.equal(run('historyDates().length'),4);console.log('PASS: history month/year, inclusive date range, newest-first order, all dates');
console.log('PASS: automatic backup, upload race retains pending revision, network failure retains retry state');
console.log('PASS: local package preserved during merge, truncated Gist download, malformed backup rejected');console.log('PASS: syntax, empty first use, weight range, merge conflict/deletion, rollover, backup packages, storage failure, CSV fallback, recent foods');})().catch(e=>{console.error(e);process.exitCode=1});
