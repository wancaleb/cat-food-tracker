const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const html=fs.readFileSync('mobile-preview.html','utf8');const script=html.split('<script>')[1].split('</script>')[0];new vm.Script(script);
let clock=new Date('2026-10-15T23:59:00+08:00').getTime();class TestDate extends Date{constructor(...a){super(...(a.length?a:[clock]))}static now(){return clock}}
const values=new Map(),element={textContent:'',classList:{add(){},remove(){},contains(){return false}},querySelector(){return null}};const ctx={console,Date:TestDate,setTimeout(){},clearTimeout(){},AbortController,document:{getElementById(){return element},addEventListener(){}},window:{visualViewport:{addEventListener(){}}},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)}};vm.createContext(ctx);vm.runInContext(script.slice(0,script.indexOf("  $('newMeal').onclick")),ctx);const run=s=>vm.runInContext(s,ctx);
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
console.log('PASS: local package preserved during merge, truncated Gist download, malformed backup rejected');console.log('PASS: syntax, empty first use, weight range, merge conflict/deletion, rollover, backup packages, storage failure, CSV fallback, recent foods');})().catch(e=>{console.error(e);process.exitCode=1});
