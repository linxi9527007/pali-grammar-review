const VERSION = "20.4";

let GRAMMAR = [];
let currentModule = "";
let currentLesson = null;
let currentFilter = "全部";
let cardItems = [];
let cardIndex = 0;
let exerciseItems = [];
let exerciseIndex = 0;
let selectedChoice = "";
let exerciseStats = { total: 0, right: 0, wrong: 0 };
let sentenceMode = "question";

const WRONG_KEY = "pali_grammar_wrong_exercises_v1";
const STATUS_KEY = "pali_grammar_lesson_status_v2";
const SENTENCE_STATUS_KEY = "pali_sentence_status_v1";
const LOOKUP_HISTORY_KEY = "pali_lookup_history_v1";
const VERSION_LABEL = "Pāli Learning Lab · 20.4 首页布局精简版";

const MODULE_ORDER = ["入门与发音", "名词变格", "代词与形容词", "动词系统", "分词与非限定动词", "不变词与常用句式", "句法与阅读", "其他"];
const TRAINING_PRESETS = [
  ["case", "格位识别专项", "集中练习主格、宾格、工具格、处格、属格等。"],
  ["verb", "动词变位专项", "集中练习现在时、将来时、过去时、命令语气等。"],
  ["nonfinite", "非限定动词专项", "集中练习 inf.、ger.、分词。"],
  ["particles", "不变词与句型专项", "集中练习 na、mā、ca、vā、eva、iti 等。"],
  ["reading", "阅读分析专项", "集中练习短句中的主语、宾语、动词和格位。"],
  ["input", "输入生成专项", "只练需要手动输入答案的题目。"]
];

function $(id){ return document.getElementById(id); }
function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }
function esc(s){ return String(s ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c])); }
function textOf(x){ try { return JSON.stringify(x, null, 0).toLowerCase(); } catch { return String(x || "").toLowerCase(); } }
function hasText(x, q){ return !q || textOf(x).includes(q.toLowerCase()); }
function arr(name){ return Array.isArray(window[name]) ? window[name] : []; }
function obj(name){ return window[name] && typeof window[name] === "object" ? window[name] : {}; }
function show(id){ const el=$(id); if(el) el.classList.remove("hidden"); }
function hide(id){ const el=$(id); if(el) el.classList.add("hidden"); }
function getJSON(key, fallback){ try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
function setJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

window.__viewStack = window.__viewStack || [];
function visibleView(){
  const hit = qsa(".view").find(v => !v.classList.contains("hidden"));
  return hit ? hit.id : "homeView";
}
function switchView(id, push=true){
  const current = visibleView();
  if(push && current && current !== id) {
    const stack = window.__viewStack;
    if(!stack.length || stack[stack.length-1] !== current) stack.push(current);
    if(stack.length > 60) stack.shift();
  }
  qsa(".view").forEach(v => v.classList.add("hidden"));
  show(id);
  window.scrollTo({ top: 0, behavior: "instant" });
  updateTopButton();
  ensurePageNav();
}
const safeSwitch = switchView;

function goPrevious(){
  const stack = window.__viewStack || [];
  let target = null;
  while(stack.length && !target){
    const candidate = stack.pop();
    if(candidate && candidate !== visibleView() && $(candidate)) target = candidate;
  }
  switchView(target || "homeView", false);
}

function ensurePageNav(){
  qsa(".view:not(#homeView) > .card, .view:not(#homeView) > section.card").forEach(card=>{
    if(card.querySelector(".page-nav-bar-202")) return;
    const bar = document.createElement("div");
    bar.className = "page-nav-bar-202";
    bar.innerHTML = `<button type="button" class="small secondary page-prev-202">返回上一页</button>
      <button type="button" class="small secondary page-home-202">返回首页</button>`;
    card.insertAdjacentElement("afterbegin", bar);
    const old = bar.nextElementSibling;
    if(old && old.matches("button.back-home")) old.style.display = "none";
  });
}
function updateTopButton(){
  const btn = $("globalBackToTopBtn") || $("backTopBtn202");
  if(!btn) return;
  if(window.scrollY > 480) btn.classList.add("show");
  else btn.classList.remove("show");
}

function lessonStatusMap(){ return getJSON(STATUS_KEY, {}); }
function lessonStatus(id){ return lessonStatusMap()[id] || "未学"; }
function setLessonStatus(id, status){
  const s = lessonStatusMap(); s[id] = status; setJSON(STATUS_KEY, s);
  renderStats(); renderModules(); if(currentModule) renderLessonList(currentModule); updateStatusButtons();
}
function statusClass(s){ return s==="已掌握" ? "mastered" : s==="学习中" ? "learning" : s==="需复习" ? "review" : ""; }
function wrongMap(){ return getJSON(WRONG_KEY, {}); }
function saveWrong(ex){ const w=wrongMap(); w[ex.id || (ex.question+"_"+Date.now())] = ex; setJSON(WRONG_KEY, w); renderStats(); }
function allLessonsInModule(m){ return m==="全部模块" ? GRAMMAR : GRAMMAR.filter(l => (l.module || "其他") === m); }
function allExercises(m="全部模块"){
  return allLessonsInModule(m).flatMap(l => (l.exercises || []).map(ex => ({...ex, lesson_id:l.id, lesson_title:l.title, module:l.module, category:l.category})));
}
function shuffle(a){ return [...a].sort(()=>Math.random()-0.5); }

async function loadGrammar(){
  const res = await fetch(`grammar.json?v=${VERSION}`);
  if(!res.ok) throw new Error("grammar.json 加载失败");
  GRAMMAR = await res.json();
}
function renderStats(){
  const totalEx = GRAMMAR.reduce((sum,l)=>sum + (l.exercises || []).length, 0);
  const mastered = GRAMMAR.filter(l => lessonStatus(l.id) === "已掌握").length;
  if($("totalLessons")) $("totalLessons").textContent = GRAMMAR.length;
  if($("totalExercises")) $("totalExercises").textContent = totalEx;
  if($("masteredCount")) $("masteredCount").textContent = mastered;
  if($("wrongCount")) $("wrongCount").textContent = Object.keys(wrongMap()).length;
}
function progressHTML(ls){
  const mastered = ls.filter(l => lessonStatus(l.id) === "已掌握").length;
  const p = ls.length ? Math.round(mastered / ls.length * 100) : 0;
  return `<div class="progress-wrap"><div class="progress-bar" style="width:${p}%"></div></div><p class="muted">掌握进度：${mastered}/${ls.length}（${p}%）</p>`;
}

/* 模块与课程 */
function renderModules(){
  const grids = [$("moduleGridPage"), $("moduleGrid")].filter(Boolean);
  grids.forEach(grid=>{
    grid.innerHTML = "";
    MODULE_ORDER.forEach(m=>{
      const ls = allLessonsInModule(m);
      if(!ls.length) return;
      const d = document.createElement("div");
      d.className = "module-card";
      d.dataset.module = m;
      d.innerHTML = `<h3>${esc(m)}</h3><p class="muted">${ls.length} 个语法点</p>${progressHTML(ls)}`;
      grid.appendChild(d);
    });
  });
}
function renderLessonList(m){
  currentModule = m;
  const all = allLessonsInModule(m);
  const ls = all.filter(l => currentFilter === "全部" || lessonStatus(l.id) === currentFilter);
  if($("moduleTitle")) $("moduleTitle").textContent = m;
  if($("moduleSubtitle")) $("moduleSubtitle").textContent = `${all.length} 个语法点`;
  const box = $("lessonList"); if(!box) return;
  box.innerHTML = ls.length ? "" : `<p class="muted">当前筛选下没有语法点。</p>`;
  ls.forEach(l=>{
    const d = document.createElement("div");
    d.className = "lesson-item";
    d.dataset.lessonId = l.id;
    const s = lessonStatus(l.id);
    d.innerHTML = `<h3>${esc(l.lesson_number || l.id)}. ${esc(l.title)}</h3>
      <div class="lesson-badges"><span class="badge ${statusClass(s)}">${esc(s)}</span><span class="badge">${esc(l.category||"")}</span><span class="badge">${(l.exercises||[]).length}题</span></div>
      <p>${esc(l.summary||"")}</p>`;
    box.appendChild(d);
  });
}
function openModule(m){ currentFilter="全部"; renderLessonList(m); switchView("lessonListView"); }
function updateStatusButtons(){
  if(!currentLesson) return;
  qsa(".status-btn").forEach(b=>b.classList.toggle("active", b.dataset.status === lessonStatus(currentLesson.id)));
}
function tableHTML(rows){
  if(!rows || !rows.length) return "";
  return `<table class="qa-table">${rows.map(r=>`<tr>${(r||[]).map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table>`;
}
function exampleHTML(e){
  return `<div class="example"><p class="pali">${esc(e.pali||"")}</p>
    <p><strong>翻译：</strong>${esc(e.cn || e.natural_cn || "")}</p>
    ${(e.note || e.grammar_note) ? `<p class="muted"><strong>语法说明：</strong>${esc(e.note || e.grammar_note)}</p>` : ""}</div>`;
}
function linkedBox(title, items){
  if(!items || !items.length) return "";
  return `<div class="linked-term-box"><strong>${esc(title)}：</strong>${items.map(x=>`<button class="related-link-btn" data-related="${esc(x)}">${esc(x)}</button>`).join("")}</div>`;
}
function openLesson(id){
  currentLesson = GRAMMAR.find(x => String(x.id) === String(id));
  if(!currentLesson) return;
  if($("lessonModule")) $("lessonModule").textContent = currentLesson.module || "";
  if($("lessonTitle")) $("lessonTitle").textContent = currentLesson.title || "";
  if($("lessonMeta")) $("lessonMeta").textContent = `${currentLesson.category||""}｜${currentLesson.difficulty||currentLesson.level||""}`;
  if($("lessonSummary")) {
    $("lessonSummary").textContent = currentLesson.summary || "";
    qsa(".auto-linked-box").forEach(x=>x.remove());
    const boxes = [
      linkedBox("相关易混点", currentLesson.linked_confusions),
      linkedBox("相关句型", currentLesson.linked_patterns),
      linkedBox("相关佛典句式", currentLesson.linked_buddhist_reading),
      linkedBox("相关背景", currentLesson.linked_buddhist_background),
      linkedBox("相关术语", currentLesson.linked_terminology)
    ].filter(Boolean).map(x=>`<div class="auto-linked-box">${x}</div>`).join("");
    $("lessonSummary").insertAdjacentHTML("afterend", boxes);
  }
  const exp = $("lessonExplanation"); if(exp) exp.innerHTML = (currentLesson.explanation||[]).map(x=>`<li>${esc(x)}</li>`).join("");
  const mistakes = $("lessonMistakes");
  if(mistakes){
    mistakes.innerHTML = (currentLesson.common_mistakes||[]).map(x=>`<li>${esc(x)}</li>`).join("");
    (currentLesson.common_mistakes||[]).length ? show("mistakeBlock") : hide("mistakeBlock");
  }
  if($("lessonTable")) $("lessonTable").innerHTML = tableHTML(currentLesson.table || "");
  if($("lessonExamples")) $("lessonExamples").innerHTML = (currentLesson.examples||[]).map(exampleHTML).join("");
  updateStatusButtons();
  switchView("lessonView");
}
function currentLessonIndex(){
  const list = allLessonsInModule(currentLesson?.module || currentModule);
  return list.findIndex(l => String(l.id) === String(currentLesson?.id));
}
function jumpLesson(step){
  if(!currentLesson) return;
  const list = allLessonsInModule(currentLesson.module || currentModule);
  const idx = list.findIndex(l=>String(l.id)===String(currentLesson.id));
  const target = list[idx+step];
  if(target) openLesson(target.id);
}

/* 搜索 */
function resultCard(title, meta, summary, action){
  return `<div class="lesson-item" ${action || ""}><h3>${esc(title)}</h3><p class="muted">${esc(meta||"")}</p><p>${esc(summary||"")}</p></div>`;
}
function searchAll(q){
  const query = (q || "").trim().toLowerCase();
  if(!query) return [];
  const res = [];
  GRAMMAR.forEach(l=>{ if(hasText(l, query)) res.push({type:"语法点", title:l.title, meta:l.module, summary:l.summary, action:`data-lesson-id="${l.id}"`}); });
  arr("SENTENCE_ANALYSIS_DATA").forEach(s=>{ if(hasText(s, query)) res.push({type:"句子分析", title:s.sentence, meta:s.level, summary:s.translation, action:`data-action="sentenceAnalysis"`}); });
  arr("TERMINOLOGY_GLOSSARY").forEach(t=>{ if(hasText(t, query)) res.push({type:"术语库", title:t.cn || t.en, meta:t.cat, summary:`${t.en||""} ${t.pali||""} ${t.note||""}`, action:`data-action="terminologyGlossary"`}); });
  arr("BUDDHIST_READING_DATA").forEach(x=>{ if(hasText(x, query)) res.push({type:"佛典句式", title:x.title, meta:x.category, summary:x.natural || x.warning, action:`data-action="buddhistReading"`}); });
  const bg = obj("BUDDHIST_BACKGROUND_DATA");
  Object.values(bg).flat().forEach(x=>{ if(hasText(x, query)) res.push({type:"佛典背景", title:x.title || x.cn || x.ref || x.stage || x.term, meta:x.category || x.type || "", summary:x.basic || x.explanation || x.meaning || x.note || x.purpose || "", action:`data-action="buddhistBackground"`}); });
  return res.slice(0, 80);
}
function renderSearchResults(q){
  const box = $("searchResults"); if(!box) return;
  const res = searchAll(q);
  box.innerHTML = res.length ? res.map(r=>resultCard(`${r.type}｜${r.title}`, r.meta, r.summary, r.action)).join("") : `<p class="muted">请输入关键词搜索。</p>`;
}
function renderHomeSearch(q){
  const box = $("globalSiteSearchResults"); if(!box) return;
  const res = searchAll(q);
  box.innerHTML = res.length ? res.slice(0,30).map(r=>resultCard(`${r.type}｜${r.title}`, r.meta, r.summary, r.action)).join("") : "";
}

/* 学习路线 */
function renderRoutes(selected="zero"){
  const routes = arr("LEARNING_ROUTES");
  const tabs = $("routeTabs"), box = $("routeContent");
  if(!tabs || !box) return;
  tabs.innerHTML = routes.map(r=>`<button class="route-tab ${r.id===selected?"active":""}" data-route-tab="${esc(r.id)}">${esc(r.title)}</button>`).join("");
  const route = routes.find(r=>r.id===selected) || routes[0];
  if(!route){ box.innerHTML = ""; return; }
  box.innerHTML = `<div class="qa-route-card"><h3>${esc(route.title)}</h3><p class="muted">${esc(route.desc||"")}</p>
    ${(route.steps||[]).map((s,i)=>`<div class="route-step-card"><div class="route-step-number">${i+1}</div><h3>${esc(s.title)}</h3><p>${esc(s.desc||"")}</p><div>${(s.lesson_ids||[]).map(id=>{
      const l = GRAMMAR.find(x=>String(x.id)===String(id));
      return l ? `<button class="route-lesson-jump" data-lesson-id="${id}">${esc(l.lesson_number||id)}. ${esc(l.title)}</button>` : "";
    }).join("")}</div></div>`).join("")}</div>`;
}

/* 练习 */
function prepareExerciseSelects(){
  const sel = $("exerciseModuleSelect"); if(!sel) return;
  const mods = ["全部模块", ...MODULE_ORDER.filter(m=>allLessonsInModule(m).length)];
  sel.innerHTML = mods.map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join("");
}
function startExercises(items, title="练习"){
  exerciseItems = shuffle(items || []);
  exerciseIndex = 0; exerciseStats = {total:exerciseItems.length,right:0,wrong:0}; selectedChoice="";
  if(!exerciseItems.length){ alert("当前没有可练习的题目。"); return; }
  if($("exerciseModeTitle")) $("exerciseModeTitle").textContent = title;
  switchView("exerciseSessionView");
  renderExercise();
}
function renderExercise(){
  const ex = exerciseItems[exerciseIndex]; if(!ex) return;
  selectedChoice = "";
  if($("exerciseProgress")) $("exerciseProgress").textContent = `第 ${exerciseIndex+1}/${exerciseItems.length} 题`;
  if($("exerciseLessonLabel")) $("exerciseLessonLabel").textContent = ex.lesson_title || ex.category || "";
  if($("exerciseQuestion")) $("exerciseQuestion").textContent = ex.question || "";
  const options = $("exerciseOptions"); const input = $("exerciseInput");
  if(options) options.innerHTML = "";
  if(input){ input.value=""; input.classList.add("hidden"); }
  hide("exerciseFeedback"); hide("nextExerciseBtn"); show("submitExerciseBtn");
  if(ex.type === "input" || !ex.options || !ex.options.length){
    if(input) input.classList.remove("hidden");
  } else if(options) {
    (ex.options || []).forEach(o=>{
      const b=document.createElement("button");
      b.className="choice-btn";
      b.textContent=o;
      b.onclick=()=>{ selectedChoice=o; qsa(".choice-btn", options).forEach(x=>x.classList.remove("selected")); b.classList.add("selected"); };
      options.appendChild(b);
    });
  }
}
function checkExercise(){
  const ex = exerciseItems[exerciseIndex]; if(!ex) return;
  const ans = ex.answer ?? "";
  const user = ex.type === "input" || !ex.options?.length ? ($("exerciseInput")?.value || "") : selectedChoice;
  const ok = String(user).trim().toLowerCase() === String(ans).trim().toLowerCase();
  exerciseStats.total = exerciseItems.length; ok ? exerciseStats.right++ : exerciseStats.wrong++;
  if(!ok) saveWrong(ex);
  const fb = $("exerciseFeedback");
  if(fb){
    fb.classList.remove("hidden");
    fb.innerHTML = `<p><strong>${ok ? "答对了" : "答错了"}</strong></p><p>正确答案：${esc(ans)}</p>${ex.explanation ? `<p>${esc(ex.explanation)}</p>` : ""}`;
  }
  hide("submitExerciseBtn"); show("nextExerciseBtn");
}
function nextExercise(){
  exerciseIndex++;
  if(exerciseIndex >= exerciseItems.length){
    alert(`练习完成：答对 ${exerciseStats.right}，答错 ${exerciseStats.wrong}`);
    switchView("exerciseCenterView");
    return;
  }
  renderExercise();
}
function renderTraining(){
  const box = $("trainingGrid"); if(!box) return;
  box.innerHTML = TRAINING_PRESETS.map(([id,title,desc])=>`<div class="training-card" data-training="${id}"><h3>${esc(title)}</h3><p>${esc(desc)}</p></div>`).join("");
}
function trainingItems(id){
  const all = allExercises("全部模块");
  if(id==="input") return all.filter(x=>x.type==="input");
  const map = {
    case: /格|主格|宾格|工具格|属格|处格|与格|从格/,
    verb: /动词|现在时|过去|将来|命令|人称|变位/,
    nonfinite: /inf\.|ger\.|分词|不定式|连续体/,
    particles: /不变词|ind\.|ca|vā|na|mā|iti|eva/,
    reading: /句子|主语|宾语|谓语|结构|阅读/
  };
  const r = map[id] || /.*/;
  return all.filter(x=>r.test(`${x.question} ${x.category} ${x.module} ${x.explanation}`));
}
function renderWrong(){
  const w = Object.values(wrongMap());
  const box = $("wrongList"); if(!box) return;
  box.innerHTML = w.length ? w.map(x=>`<div class="lesson-item"><h3>${esc(x.question)}</h3><p class="muted">${esc(x.lesson_title||"")}</p><p>答案：${esc(x.answer||"")}</p></div>`).join("") : `<p class="muted">暂无错题。</p>`;
}

/* 句子分析 */
function sentenceStatusMap(){ return getJSON(SENTENCE_STATUS_KEY, {}); }
function sentenceStatus(id){ return sentenceStatusMap()[id] || "未标记"; }
function setSentenceStatus(id, status){ const s=sentenceStatusMap(); s[id]=status; setJSON(SENTENCE_STATUS_KEY,s); renderSentenceSelect(true); }
function unique(vals){ return [...new Set(vals.filter(Boolean))]; }
function optionize(el, vals){ if(el) el.innerHTML = vals.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join(""); }
function renderSentenceFilters(){
  const data = arr("SENTENCE_ANALYSIS_DATA");
  optionize($("sentenceLevelSelect"), ["全部", ...unique(data.map(x=>x.level))]);
  optionize($("sentencePrioritySelect"), ["全部", ...unique(data.map(x=>x.practice_priority))]);
  optionize($("sentenceTagSelect"), ["全部", ...unique(data.flatMap(x=>x.tags||[]))]);
  optionize($("sentenceSourceSelect"), ["全部", ...unique(data.map(x=>x.source_type))]);
  optionize($("sentenceStatusSelect"), ["全部","未标记","已掌握","需复习"]);
}
function filteredSentences(){
  const q=($("sentenceSearchInput")?.value||"").toLowerCase();
  const level=$("sentenceLevelSelect")?.value||"全部", pri=$("sentencePrioritySelect")?.value||"全部", tag=$("sentenceTagSelect")?.value||"全部", src=$("sentenceSourceSelect")?.value||"全部", st=$("sentenceStatusSelect")?.value||"全部";
  return arr("SENTENCE_ANALYSIS_DATA").filter(x=>
    (!q || hasText(x,q)) &&
    (level==="全部" || x.level===level) &&
    (pri==="全部" || x.practice_priority===pri) &&
    (tag==="全部" || (x.tags||[]).includes(tag)) &&
    (src==="全部" || x.source_type===src) &&
    (st==="全部" || sentenceStatus(x.id)===st)
  );
}
function renderSentenceSelect(keep=false){
  const sel=$("sentenceSelect"); if(!sel) return;
  const old=sel.value; const items=filteredSentences();
  sel.innerHTML = items.map((x,i)=>`<option value="${esc(x.id)}">${i+1}. ${esc(x.sentence)}（${sentenceStatus(x.id)}）</option>`).join("");
  if(keep && old) sel.value=old;
  renderSentenceDashboard(items);
  renderSentenceCard("question");
}
function currentSentence(){ const id=$("sentenceSelect")?.value; return arr("SENTENCE_ANALYSIS_DATA").find(x=>x.id===id); }
function renderSentenceDashboard(items=filteredSentences()){
  if($("sentenceDashboard")) $("sentenceDashboard").innerHTML = `<div class="mini-stat">当前筛选：${items.length} 句</div>`;
}
function renderSentenceCard(mode="question"){
  sentenceMode = mode;
  const box=$("sentenceAnalysisCard"); if(!box) return;
  const item=currentSentence(); if(!item){ box.innerHTML=`<p class="muted">当前筛选下没有句子。</p>`; return; }
  const step={question:"第 1 步：先看原文",translation:"第 2 步：核对翻译",hint:"第 3 步：查看提示",analysis:"第 4 步：完整分析"}[mode] || "第 1 步：先看原文";
  let html = `<p class="pill">${esc(item.level)}</p><p class="sentence-step-chip">${esc(step)}</p><p class="sentence-main">${esc(item.sentence)}</p>
    <p><span class="source-chip">${esc(item.source_type||"教学句")}</span><span class="source-chip">${esc(item.practice_priority||"")}</span></p>
    <div>${(item.tags||[]).map(t=>`<span class="tag-chip">${esc(t)}</span>`).join("")}</div>
    <div class="training-goal-box"><strong>训练目标：</strong>${esc(item.training_goal||"训练句子分析能力。")}</div>`;
  if(mode==="question") html += `<div class="analysis-tip"><strong>练习顺序：</strong>先不要看答案，自己判断限定动词、主语、宾语或格位。</div>`;
  if(mode==="translation" || mode==="hint" || mode==="analysis") html += `<p class="sentence-translation"><strong>翻译：</strong>${esc(item.translation)}</p>`;
  if(mode==="hint" || mode==="analysis") html += `<h3>句法结构</h3><p>${esc(item.structure)}</p><div class="analysis-tip"><strong>提醒：</strong>${esc(item.tip)}</div>`;
  if(mode==="analysis"){
    html += `<h3>逐词分析</h3><table class="token-table"><tr><td>词形</td><td>语法说明</td><td>句中功能</td><td>意义</td></tr>${(item.tokens||[]).map(t=>`<tr><td><strong>${esc(t.form)}</strong></td><td>${esc(t.grammar)}</td><td>${esc(t.role)}</td><td>${esc(t.meaning)}</td></tr>`).join("")}</table>
      <details class="sentence-lookup-panel-192"><summary>本句词汇查词</summary><div class="sentence-lookup-row-192">${(item.tokens||[]).map(t=>`<button type="button" class="lookup-chip-187" data-copy="${esc(t.form)}">${esc(t.form)}</button>`).join("")}</div></details>`;
  } else {
    html += `<ol class="self-check-list">${(item.self_check||[]).map(q=>`<li>${esc(q)}</li>`).join("")}</ol>`;
  }
  box.innerHTML = html;
}
function nextSentence(delta=1){
  const sel=$("sentenceSelect"); if(!sel) return;
  const n=sel.options.length; if(!n) return;
  sel.selectedIndex = (sel.selectedIndex + delta + n) % n;
  renderSentenceCard("question");
}

/* 词典/查词 */
function normalizePaliInput(s){
  return String(s||"").trim()
    .replace(/aa/g,"ā").replace(/ii/g,"ī").replace(/uu/g,"ū")
    .replace(/\.t/g,"ṭ").replace(/\.d/g,"ḍ").replace(/\.n/g,"ṇ").replace(/\.m/g,"ṃ").replace(/~n/g,"ñ").replace(/"n/g,"ṅ");
}
function lookupURLs(word){
  const q=encodeURIComponent(word||"");
  return {
    sutta:`https://dictionary.sutta.org/search.php?word=${q}`,
    dpd:`https://dpdict.net/?q=${q}`,
    pts:`https://dsal.uchicago.edu/cgi-bin/app/pali_query.py?qs=${q}&searchhws=yes`
  };
}
function renderDictionarySites(){
  const box=$("tokenAnalysisGuide");
  if(box) box.innerHTML = `<p class="muted">输入词形后，可以打开词典查询；点击“词形分析”可查看本站内置分析线索。</p>`;
  updateDictLinks();
  renderLookupHistory();
}
function updateDictLinks(){
  const word = normalizePaliInput($("paliLookupInput")?.value || "");
  const urls = lookupURLs(word);
  [["directSuttaDictLink", urls.sutta], ["directDpdDictLink", urls.dpd], ["directPtsDictLink", urls.pts]].forEach(([id,u])=>{
    const a=$(id); if(a) a.href=u;
  });
}
function addLookupHistory(word){
  if(!word) return;
  const h = getJSON(LOOKUP_HISTORY_KEY, []).filter(x=>x!==word);
  h.unshift(word); setJSON(LOOKUP_HISTORY_KEY, h.slice(0,20));
}
function renderLookupHistory(){
  const box=$("lookupHistoryBox"); if(!box) return;
  const h=getJSON(LOOKUP_HISTORY_KEY, []);
  box.innerHTML = h.length ? `<p class="muted">最近查词：</p>${h.map(w=>`<button class="lookup-chip-187" data-lookup-history="${esc(w)}">${esc(w)}</button>`).join("")}` : "";
}
function analyzeToken(word){
  word = normalizePaliInput(word || $("paliLookupInput")?.value || "");
  if($("paliLookupInput")) $("paliLookupInput").value = word;
  addLookupHistory(word); updateDictLinks(); renderLookupHistory();
  const data=obj("TOKEN_ANALYSIS_DATA");
  const key = data[word] ? word : Object.keys(data).find(k=>k.toLowerCase()===word.toLowerCase());
  const panel=$("tokenAnalysisPanel"); if(!panel) return;
  if(!key){ panel.innerHTML = `<p class="muted">本站暂未收录 “${esc(word)}” 的内置词形分析。请使用上方词典查询。</p>`; return; }
  const entry=data[key];
  panel.innerHTML = `<h3>${esc(entry.form || key)}</h3>
    ${(entry.analyses||[]).map(a=>`<div class="qa-full-card"><p><strong>语法：</strong>${esc(a.grammar||"")}</p><p><strong>功能：</strong>${esc(a.role||"")}</p><p><strong>意义：</strong>${esc(a.meaning||"")}</p></div>`).join("")}
    ${(entry.examples||[]).length ? `<h3>例句</h3>${entry.examples.map(e=>`<div class="example"><p class="pali">${esc(e.sentence||"")}</p><p>${esc(e.translation||"")}</p><p class="muted">${esc(e.tip||"")}</p></div>`).join("")}` : ""}`;
}

/* 信息类页面 */
function renderPatterns(){
  const q=($("patternSearchInput")?.value||"").toLowerCase(), level=$("patternLevelSelect")?.value||"全部", box=$("sentencePatternList");
  if(!box) return;
  const items=arr("SENTENCE_PATTERNS").filter(x=>(level==="全部"||x.level===level)&&hasText(x,q));
  box.innerHTML=items.map(x=>`<div class="qa-full-card"><h3>${esc(x.title)}</h3><p class="qa-meta">${esc(x.level)}｜${esc(x.formula)}</p><p>${esc(x.function)}</p><h4>识别信号</h4><ul>${(x.signals||[]).map(s=>`<li>${esc(s)}</li>`).join("")}</ul><h4>例句</h4>${(x.examples||[]).map(e=>exampleHTML({pali:e.pali,cn:e.natural,note:e.note})).join("")}<p><strong>误区：</strong>${esc(x.trap||"")}</p></div>`).join("") || `<p class="muted">没有找到相关句型。</p>`;
}
function renderConfusions(){
  const data=arr("CONFUSION_PAIRS"), box=$("confusionPairsList"); if(!box) return;
  optionize($("confusionCategorySelect"), ["全部", ...unique(data.map(x=>x.category||"未分类"))]);
  const q=($("confusionSearchInput")?.value||"").toLowerCase(), cat=$("confusionCategorySelect")?.value||"全部";
  const items=data.filter(x=>(cat==="全部"||(x.category||"未分类")===cat)&&hasText(x,q));
  box.innerHTML=items.map(x=>`<div class="qa-full-card"><h3>${esc(x.title)}</h3><p><strong>核心区别：</strong>${esc(x.core)}</p><table class="qa-table"><tr><td>${esc(x.a)}</td><td>${esc(x.a_cue)}</td></tr><tr><td>${esc(x.b)}</td><td>${esc(x.b_cue)}</td></tr></table>${(x.examples||[]).map(e=>exampleHTML({pali:e.pali,cn:e.cn,note:e.note})).join("")}<p><strong>提醒：</strong>${esc(x.tip||"")}</p></div>`).join("") || `<p class="muted">没有找到相关易混概念。</p>`;
}
function renderTips(){
  const data=arr("LINGUISTICS_TIPS"), box=$("linguisticsTipsList"); if(!box) return;
  optionize($("linguisticsCategorySelect"), ["全部", ...unique(data.map(x=>x.category))]);
  const q=($("linguisticsSearchInput")?.value||"").toLowerCase(), cat=$("linguisticsCategorySelect")?.value||"全部";
  const items=data.filter(x=>(cat==="全部"||x.category===cat)&&hasText(x,q));
  box.innerHTML=items.map(x=>`<div class="qa-full-card"><h3>${esc(x.title)}</h3><p class="qa-meta">${esc(x.category)}</p><p>${esc(x.summary)}</p><p><strong>例：</strong>${esc(x.example||"")}</p></div>`).join("") || `<p class="muted">没有找到相关小贴士。</p>`;
}
function renderTerms(){
  const data=arr("TERMINOLOGY_GLOSSARY"), box=$("termGlossaryList"); if(!box) return;
  optionize($("termCategorySelect"), ["全部", ...unique(data.map(x=>x.cat))]);
  const q=($("termSearchInput")?.value||"").toLowerCase(), cat=$("termCategorySelect")?.value||"全部";
  const items=data.filter(x=>(cat==="全部"||x.cat===cat)&&hasText(x,q));
  box.innerHTML=items.map(x=>`<div class="qa-full-card"><h3>${esc(x.cn)} ${x.pali?`｜${esc(x.pali)}`:""}</h3><p class="qa-meta">${esc(x.cat||"")}｜${esc(x.en||"")} ${x.ipa?`<span class="ipa">${esc(x.ipa)}</span>`:""}</p><p>${esc(x.simple_explanation||x.note||"")}</p>${(x.contrast_examples||[]).length?`<table class="qa-table">${x.contrast_examples.map(e=>`<tr><td>${esc(e.label)}</td><td>${esc(e.form)}</td><td>${esc(e.meaning)}</td></tr>`).join("")}</table>`:""}</div>`).join("") || `<p class="muted">没有找到相关术语。</p>`;
}
function renderBuddhistReading(){
  const data=arr("BUDDHIST_READING_DATA"), box=$("buddhistReadingList"); if(!box) return;
  optionize($("buddhistReadingCategorySelect"), ["全部", ...unique(data.map(x=>x.category))]);
  const q=($("buddhistReadingSearchInput")?.value||"").toLowerCase(), cat=$("buddhistReadingCategorySelect")?.value||"全部", level=$("buddhistReadingLevelSelect")?.value||"全部";
  const items=data.filter(x=>(cat==="全部"||x.category===cat)&&(level==="全部"||x.level===level)&&hasText(x,q));
  box.innerHTML=items.map(x=>`<div class="qa-full-card"><h3>${esc(x.title)}</h3><p class="qa-meta">${esc(x.category)}｜${esc(x.level)}</p><p><strong>直译：</strong>${esc(x.literal||"")}</p><p><strong>翻译：</strong>${esc(x.natural||"")}</p><p><strong>结构：</strong>${esc(x.structure||"")}</p><p><strong>提醒：</strong>${esc(x.warning||"")}</p></div>`).join("") || `<p class="muted">没有找到相关佛典句式。</p>`;
}
function renderBackground(){
  const data=obj("BUDDHIST_BACKGROUND_DATA"), box=$("buddhistBackgroundContent"); if(!box) return;
  optionize($("backgroundCategorySelect"), ["全部","三藏结构与略号","佛学概念","章节术语","引用格式","佛经篇章结构"]);
  const q=($("backgroundSearchInput")?.value||"").toLowerCase(), cat=$("backgroundCategorySelect")?.value||"全部";
  const parts=[];
  if(cat==="全部"||cat==="三藏结构与略号"){
    const items=(data.canon_structure||[]).filter(x=>hasText(x,q));
    if(items.length) parts.push(`<h3 class="qa-section-title">三藏结构与略号</h3>${items.map(x=>`<div class="qa-full-card"><h3>${esc(x.title)}</h3><p>${esc(x.explanation||"")}</p>${tableHTML([["略号/术语","名称","说明"],...(x.items||[]).map(i=>[i.abbr,i.name,i.note])])}</div>`).join("")}`);
  }
  if(cat==="全部"||cat==="佛学概念"){
    const items=(data.concepts||[]).filter(x=>hasText(x,q));
    if(items.length) parts.push(`<h3 class="qa-section-title">佛学概念</h3>${items.map(x=>`<div class="qa-full-card"><h3>${esc(x.pali)}｜${esc(x.cn)}</h3><p class="qa-meta">${esc(x.category)}｜${esc(x.level)}｜${esc(x.en)}</p><p>${esc(x.basic||"")}</p><p><strong>阅读提醒：</strong>${esc(x.reading_tip||"")}</p></div>`).join("")}`);
  }
  if(cat==="全部"||cat==="章节术语"){
    const items=(data.reference_terms||[]).filter(x=>hasText(x,q));
    if(items.length) parts.push(`<h3 class="qa-section-title">章节术语</h3>${tableHTML([["术语","常见汉译","说明"],...items.map(x=>[x.term,x.cn,x.note])])}`);
  }
  if(cat==="全部"||cat==="引用格式"){
    const items=(data.citation_examples||[]).filter(x=>hasText(x,q));
    if(items.length) parts.push(`<h3 class="qa-section-title">引用格式</h3>${tableHTML([["格式","含义"],...items.map(x=>[x.ref,x.meaning])])}`);
  }
  if(cat==="全部"||cat==="佛经篇章结构"){
    const items=(data.sutta_flow||[]).filter(x=>hasText(x,q));
    if(items.length) parts.push(`<h3 class="qa-section-title">佛经篇章结构</h3>${items.map(x=>`<div class="qa-full-card"><h3>${esc(x.stage)}</h3><p>${esc(x.purpose)}</p><p>${(x.patterns||[]).map(esc).join("；")}</p></div>`).join("")}`);
  }
  box.innerHTML=parts.join("") || `<p class="muted">没有找到相关背景知识。</p>`;
}
function renderAcademic(){
  const data=obj("ACADEMIC_TRAINING_DATA"), box=$("academicTrainingContent"); if(!box) return;
  optionize($("academicCategorySelect"), ["全部","阅读方法","词义观察","原文记录模板","引用规范","阅读小任务","阅读误区"]);
  const q=($("academicSearchInput")?.value||"").toLowerCase(), cat=$("academicCategorySelect")?.value||"全部";
  const parts=[];
  if(cat==="全部"||cat==="阅读方法"){
    const items=(data.method||[]).filter(x=>hasText(x,q));
    if(items.length) parts.push(`<h3 class="qa-section-title">阅读方法</h3>${items.map(x=>`<div class="qa-full-card"><h3>${esc(x.title)}</h3><p>${esc(x.goal)}</p><ol>${(x.steps||[]).map(s=>`<li>${esc(s)}</li>`).join("")}</ol></div>`).join("")}`);
  }
  if(cat==="全部"||cat==="词义观察"){
    const items=(data.vocabulary||[]).filter(x=>hasText(x,q));
    if(items.length) parts.push(`<h3 class="qa-section-title">词义观察</h3>${items.map(x=>`<div class="qa-full-card"><h3>${esc(x.title)}</h3><p>${esc(x.core_warning||"")}</p><ol>${(x.steps||[]).map(s=>`<li>${esc(s)}</li>`).join("")}</ol></div>`).join("")}`);
  }
  if(cat==="全部"||cat==="原文记录模板"){
    const t=data.analysis_template||{};
    if(hasText(t,q)) parts.push(`<h3 class="qa-section-title">原文记录模板</h3><div class="qa-full-card"><h3>${esc(t.title||"原文记录模板")}</h3>${tableHTML((t.fields||[]).map(f=>[f.name,f.tip]))}</div>`);
  }
  if(cat==="全部"||cat==="引用规范"){
    const c=data.citation||{};
    if(hasText(c,q)) parts.push(`<h3 class="qa-section-title">引用规范</h3>${(c.principles||[]).map(p=>`<div class="qa-full-card"><h3>${esc(p.title)}</h3><p>${esc(p.content)}</p></div>`).join("")}${(c.citation_examples||[]).length?tableHTML([["格式","含义"],...c.citation_examples.map(e=>[e.format,e.meaning])]):""}`);
  }
  if(cat==="全部"||cat==="阅读小任务"){
    const items=(data.research_tasks||[]).filter(x=>hasText(x,q));
    if(items.length) parts.push(`<h3 class="qa-section-title">阅读小任务</h3>${items.map(x=>`<div class="qa-full-card"><h3>${esc(x.title)}</h3><p>${esc(x.goal)}</p><ol>${(x.steps||[]).map(s=>`<li>${esc(s)}</li>`).join("")}</ol><p><strong>提交形式：</strong>${esc(x.output||"")}</p></div>`).join("")}`);
  }
  if(cat==="全部"||cat==="阅读误区"){
    const items=(data.pitfalls||[]).filter(x=>hasText(x,q));
    if(items.length) parts.push(`<h3 class="qa-section-title">阅读误区</h3>${items.map((x,i)=>`<div class="qa-full-card"><h3>${i+1}. ${esc(x.title)}</h3><p>${esc(x.fix)}</p></div>`).join("")}`);
  }
  box.innerHTML=parts.join("") || `<p class="muted">没有找到相关佛典阅读内容。</p>`;
}

/* 进度 */
function renderProgressSummary(){
  const box=$("progressSummaryBox"); if(!box) return;
  box.innerHTML=`<p>语法点：${GRAMMAR.length}；已掌握：${GRAMMAR.filter(l=>lessonStatus(l.id)==="已掌握").length}；错题：${Object.keys(wrongMap()).length}</p>`;
}
function exportProgress(){
  const data={lessonStatus:lessonStatusMap(), wrong:wrongMap(), sentence:sentenceStatusMap(), lookup:getJSON(LOOKUP_HISTORY_KEY,[])};
  if($("progressDataText")) $("progressDataText").value=JSON.stringify(data,null,2);
}
function importProgress(){
  try{
    const d=JSON.parse($("progressDataText")?.value||"{}");
    if(d.lessonStatus) setJSON(STATUS_KEY,d.lessonStatus);
    if(d.wrong) setJSON(WRONG_KEY,d.wrong);
    if(d.sentence) setJSON(SENTENCE_STATUS_KEY,d.sentence);
    if(d.lookup) setJSON(LOOKUP_HISTORY_KEY,d.lookup);
    alert("导入完成。"); renderStats(); renderProgressSummary();
  }catch(e){ alert("导入失败：JSON 格式不正确。"); }
}

/* 路由与事件 */
function route(action){
  const run = {
    learningRoute(){ renderRoutes("zero"); switchView("learningRouteView"); },
    modules(){ renderModules(); switchView("moduleLearningView"); },
    search(){ renderSearchResults(""); switchView("searchView"); },
    exercise(){ prepareExerciseSelects(); switchView("exerciseCenterView"); },
    training(){ renderTraining(); switchView("trainingView"); },
    wrong(){ renderWrong(); switchView("wrongView"); },
    learningProgress(){ renderProgressSummary(); switchView("learningProgressView"); },
    studentGuide(){ switchView("studentGuideView"); },
    dictionaryLookup(){ renderDictionarySites(); switchView("dictionaryLookupView"); },
    sentenceAnalysis(){ renderSentenceFilters(); renderSentenceSelect(); switchView("sentenceAnalysisView"); },
    sentencePatterns(){ renderPatterns(); switchView("sentencePatternsView"); },
    confusionPairs(){ renderConfusions(); switchView("confusionPairsView"); },
    linguisticsTips(){ renderTips(); switchView("linguisticsTipsView"); },
    terminologyGlossary(){ renderTerms(); switchView("terminologyGlossaryView"); },
    buddhistReading(){ renderBuddhistReading(); switchView("buddhistReadingView"); },
    buddhistBackground(){ renderBackground(); switchView("buddhistBackgroundView"); },
    academicTraining(){ renderAcademic(); switchView("academicTrainingView"); }
  }[action];
  run ? run() : switchView("homeView");
}
function bindEvents(){
  document.addEventListener("click", e=>{
    const navPrev=e.target.closest(".page-prev-202"); if(navPrev){ e.preventDefault(); goPrevious(); return; }
    const navHome=e.target.closest(".page-home-202,.back-home"); if(navHome){ e.preventDefault(); switchView("homeView"); return; }
    const home=e.target.closest("[data-home-jump]"); if(home){ e.preventDefault(); switchView("homeView", false); setTimeout(()=>$(home.dataset.homeJump)?.scrollIntoView({behavior:"smooth"}), 20); return; }
    const action=e.target.closest("[data-action]"); if(action){ e.preventDefault(); route(action.dataset.action); return; }
    const module=e.target.closest("[data-module]"); if(module){ e.preventDefault(); openModule(module.dataset.module); return; }
    const lesson=e.target.closest("[data-lesson-id]"); if(lesson){ e.preventDefault(); openLesson(lesson.dataset.lessonId); return; }
    const related=e.target.closest("[data-related]"); if(related){ e.preventDefault(); const q=related.dataset.related; switchView("searchView"); if($("searchInput")) $("searchInput").value=q; renderSearchResults(q); return; }
    const tab=e.target.closest("[data-route-tab]"); if(tab){ e.preventDefault(); renderRoutes(tab.dataset.routeTab); return; }
    const train=e.target.closest("[data-training]"); if(train){ e.preventDefault(); startExercises(trainingItems(train.dataset.training), train.textContent.trim()); return; }
    const copy=e.target.closest("[data-copy]"); if(copy){ navigator.clipboard?.writeText(copy.dataset.copy); if($("paliLookupInput")) $("paliLookupInput").value=copy.dataset.copy; return; }
    const hist=e.target.closest("[data-lookup-history]"); if(hist){ if($("paliLookupInput")) $("paliLookupInput").value=hist.dataset.lookupHistory; analyzeToken(hist.dataset.lookupHistory); return; }
  });

  qsa(".filter-btn").forEach(b=>b.addEventListener("click", ()=>{ currentFilter=b.dataset.filter; qsa(".filter-btn").forEach(x=>x.classList.toggle("active",x===b)); renderLessonList(currentModule); }));
  qsa(".status-btn").forEach(b=>b.addEventListener("click", ()=> currentLesson && setLessonStatus(currentLesson.id, b.dataset.status)));

  $("backHomeFromListBtn")?.addEventListener("click",()=>switchView("moduleLearningView"));
  $("backToListBtn")?.addEventListener("click",()=>goPrevious());
  $("lessonParentTopBtn")?.addEventListener("click",()=>openModule(currentLesson?.module || currentModule));
  $("lessonParentBottomBtn")?.addEventListener("click",()=>openModule(currentLesson?.module || currentModule));
  $("lessonHomeTopBtn")?.addEventListener("click",()=>switchView("homeView"));
  $("lessonHomeBottomBtn")?.addEventListener("click",()=>switchView("homeView"));
  $("prevLessonBtn")?.addEventListener("click",()=>jumpLesson(-1));
  $("nextLessonBtn")?.addEventListener("click",()=>jumpLesson(1));
  $("prevLessonBottomBtn")?.addEventListener("click",()=>jumpLesson(-1));
  $("nextLessonBottomBtn")?.addEventListener("click",()=>jumpLesson(1));

  $("searchInput")?.addEventListener("input", e=>renderSearchResults(e.target.value));
  $("globalSiteSearchInput")?.addEventListener("input", e=>renderHomeSearch(e.target.value));
  $("startMixedExercisesBtn")?.addEventListener("click",()=>{ const m=$("exerciseModuleSelect")?.value||"全部模块"; const n=parseInt($("exerciseCountInput")?.value||"10",10); startExercises(shuffle(allExercises(m)).slice(0,n), "课程练习"); });
  $("submitExerciseBtn")?.addEventListener("click",checkExercise);
  $("nextExerciseBtn")?.addEventListener("click",nextExercise);
  $("exitExerciseBtn")?.addEventListener("click",()=>switchView("exerciseCenterView"));
  $("startWrongBtn")?.addEventListener("click",()=>startExercises(Object.values(wrongMap()), "错题复习"));
  $("clearWrongBtn")?.addEventListener("click",()=>{ if(confirm("确定清空错题？")){ setJSON(WRONG_KEY,{}); renderWrong(); renderStats(); }});

  ["sentenceSearchInput","sentenceLevelSelect","sentencePrioritySelect","sentenceTagSelect","sentenceSourceSelect","sentenceStatusSelect"].forEach(id=>$(id)?.addEventListener("input",()=>renderSentenceSelect()));
  ["sentenceLevelSelect","sentencePrioritySelect","sentenceTagSelect","sentenceSourceSelect","sentenceStatusSelect"].forEach(id=>$(id)?.addEventListener("change",()=>renderSentenceSelect()));
  $("sentenceSelect")?.addEventListener("change",()=>renderSentenceCard("question"));
  $("showSentenceTranslationBtn")?.addEventListener("click",()=>renderSentenceCard("translation"));
  $("showSentenceHintBtn")?.addEventListener("click",()=>renderSentenceCard("hint"));
  $("showSentenceAnalysisBtn")?.addEventListener("click",()=>renderSentenceCard("analysis"));
  $("nextSentenceBtn")?.addEventListener("click",()=>nextSentence(1));
  $("randomSentenceBtn")?.addEventListener("click",()=>{ const sel=$("sentenceSelect"); if(sel?.options.length){ sel.selectedIndex=Math.floor(Math.random()*sel.options.length); renderSentenceCard("question"); }});
  $("markSentenceMasteredBtn")?.addEventListener("click",()=>{ const s=currentSentence(); if(s) setSentenceStatus(s.id,"已掌握"); });
  $("markSentenceReviewBtn")?.addEventListener("click",()=>{ const s=currentSentence(); if(s) setSentenceStatus(s.id,"需复习"); });
  $("copySentenceAnalysisBtn")?.addEventListener("click",()=>{ const s=currentSentence(); if(s) navigator.clipboard?.writeText(`${s.sentence}\n${s.translation}\n${s.structure}`); });
  $("startBasicSentenceBtn")?.addEventListener("click",()=>{ if($("sentencePrioritySelect")) $("sentencePrioritySelect").value="基础必练"; renderSentenceSelect(); });
  $("showReviewSentenceBtn")?.addEventListener("click",()=>{ if($("sentenceStatusSelect")) $("sentenceStatusSelect").value="需复习"; renderSentenceSelect(); });
  $("resetSentenceFiltersBtn")?.addEventListener("click",()=>{ ["sentenceSearchInput"].forEach(id=>{if($(id)) $(id).value=""}); ["sentenceLevelSelect","sentencePrioritySelect","sentenceTagSelect","sentenceSourceSelect","sentenceStatusSelect"].forEach(id=>{if($(id)) $(id).value="全部"}); renderSentenceSelect(); });

  $("paliLookupInput")?.addEventListener("input",updateDictLinks);
  $("analyzeLookupWordBtn")?.addEventListener("click",()=>analyzeToken());
  $("clearLookupWordBtn")?.addEventListener("click",()=>{ if($("paliLookupInput")) $("paliLookupInput").value=""; updateDictLinks(); if($("tokenAnalysisPanel")) $("tokenAnalysisPanel").innerHTML=""; });
  qsa("[data-char]").forEach(b=>b.addEventListener("click",()=>{ const input=$("paliLookupInput") || $("exerciseInput"); if(input){ input.value += b.dataset.char; input.dispatchEvent(new Event("input")); }}));

  $("patternSearchInput")?.addEventListener("input",renderPatterns); $("patternLevelSelect")?.addEventListener("change",renderPatterns);
  $("confusionSearchInput")?.addEventListener("input",renderConfusions); $("confusionCategorySelect")?.addEventListener("change",renderConfusions);
  $("linguisticsSearchInput")?.addEventListener("input",renderTips); $("linguisticsCategorySelect")?.addEventListener("change",renderTips);
  $("termSearchInput")?.addEventListener("input",renderTerms); $("termCategorySelect")?.addEventListener("change",renderTerms);
  $("buddhistReadingSearchInput")?.addEventListener("input",renderBuddhistReading); $("buddhistReadingCategorySelect")?.addEventListener("change",renderBuddhistReading); $("buddhistReadingLevelSelect")?.addEventListener("change",renderBuddhistReading);
  $("backgroundSearchInput")?.addEventListener("input",renderBackground); $("backgroundCategorySelect")?.addEventListener("change",renderBackground);
  $("academicSearchInput")?.addEventListener("input",renderAcademic); $("academicCategorySelect")?.addEventListener("change",renderAcademic);

  $("exportProgressBtn")?.addEventListener("click",exportProgress);
  $("importProgressBtn")?.addEventListener("click",importProgress);
  $("clearProgressBtn")?.addEventListener("click",()=>{ if(confirm("确定清空学习进度？")){ [STATUS_KEY,WRONG_KEY,SENTENCE_STATUS_KEY,LOOKUP_HISTORY_KEY].forEach(k=>localStorage.removeItem(k)); renderStats(); renderProgressSummary(); }});
  $("copyFeedbackBtn")?.addEventListener("click",()=>navigator.clipboard?.writeText($("feedbackTemplateText")?.value || ""));

  window.addEventListener("scroll", updateTopButton, {passive:true});
  $("globalBackToTopBtn")?.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
}

async function init(){
  try{
    await loadGrammar();
    qsa(".visual-version-badge").forEach(x=>x.textContent=VERSION_LABEL);
    renderStats();
    renderModules();
    prepareExerciseSelects();
    bindEvents();
    ensurePageNav();
    updateTopButton();
  }catch(e){
    console.error(e);
    alert("加载失败：请确认 21 个网站文件都已上传，并清理旧缓存。错误："+(e.message||e));
  }
}
document.addEventListener("DOMContentLoaded", init);