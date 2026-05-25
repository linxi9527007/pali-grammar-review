const VERSION="12.1";
let GRAMMAR=[],currentModule='',currentLesson=null,currentFilter='全部',lastView='homeView',cardItems=[],cardIndex=0,exerciseItems=[],exerciseIndex=0,selectedChoice='',exerciseStats={total:0,right:0,wrong:0};const WRONG_KEY='pali_grammar_wrong_exercises_v1',STATUS_KEY='pali_grammar_lesson_status_v2';const MODULE_ORDER=['入门与发音','动词系统','名词变格','代词与形容词','分词与非限定动词','不变词与常用句式','句法与阅读','其他'];const TRAINING_PRESETS=[['case','格位识别专项','集中练习主格、宾格、工具格、处格、属格等。'],['verb','动词变位专项','集中练习现在时、将来时、过去时、命令语气等。'],['nonfinite','非限定动词专项','集中练习不定式、连续体、分词。'],['particles','不变词与句型专项','集中练习 na、mā、ca、vā、eva、iti 等。'],['reading','阅读分析专项','集中练习短句中的主语、宾语、动词和格位。'],['input','输入生成专项','只练需要手动输入答案的题目。']];function $(id){return document.getElementById(id)}function show(id){const el=$(id); if(el) el.classList.remove('hidden')}function hide(id){const el=$(id); if(el) el.classList.add('hidden')}function switchView(id){document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));show(id);window.scrollTo({top:0,behavior:'smooth'})}function norm(t){return String(t||'').trim().replace(/\s+/g,' ').toLowerCase()}function strip(t){const m={ā:'a',ī:'i',ū:'u',ṅ:'n',ñ:'n',ṭ:'t',ḍ:'d',ṇ:'n',ḷ:'l',ṃ:'m',ṁ:'m'};return String(t||'').replace(/[āīūṅñṭḍṇḷṃṁ]/g,ch=>m[ch]||ch)}function ok(u,e){u=norm(u);e=norm(e);if(u===e)return true;let lu=strip(u),le=strip(e);if(lu===le)return true;return e.split(/\s*\/\s*|；|;|，|,|、/).some(x=>u===norm(x)||lu===strip(norm(x)))}function getW(){try{return JSON.parse(localStorage.getItem(WRONG_KEY))||{}}catch{return {}}}function saveW(r){localStorage.setItem(WRONG_KEY,JSON.stringify(r));stats()}function getS(){try{return JSON.parse(localStorage.getItem(STATUS_KEY))||{}}catch{return {}}}function saveS(s){localStorage.setItem(STATUS_KEY,JSON.stringify(s));stats()}function lstat(id){return getS()[id]||'未学'}function setLStat(id,s){let x=getS();x[id]=s;saveS(x);statusBtns();renderModules();if(currentModule)renderLessonList(currentModule)}function scls(s){return s==='已掌握'?'mastered':s==='学习中'?'learning':s==='需复习'?'review':''}function lessons(m){return m==='全部模块'?GRAMMAR:GRAMMAR.filter(x=>x.module===m)}function stats(){let total=GRAMMAR.reduce((a,l)=>a+(l.exercises||[]).length,0),s=getS(),master=GRAMMAR.filter(l=>s[l.id]==='已掌握').length;if($('totalLessons'))$('totalLessons').textContent=GRAMMAR.length;if($('totalExercises'))$('totalExercises').textContent=total;if($('masteredCount'))$('masteredCount').textContent=master;if($('wrongCount'))$('wrongCount').textContent=Object.keys(getW()).length}function progress(ls){let m=ls.filter(l=>lstat(l.id)==='已掌握').length,p=ls.length?Math.round(m/ls.length*100):0;return `<div class="progress-wrap"><div class="progress-bar" style="width:${p}%"></div></div><p class="muted">掌握进度：${m}/${ls.length}（${p}%）</p>`}function cardHTML(l){let s=lstat(l.id),n=(l.exercises||[]).length;return `<h3>${l.lesson_number||l.id}. ${l.title}</h3><div class="lesson-badges"><span class="badge ${scls(s)}">${s}</span><span class="badge">${l.category||''}</span><span class="badge">${n}题</span></div><p>${l.summary||''}</p>`}function renderModules(){let grid=$('moduleGrid');grid.innerHTML='';MODULE_ORDER.forEach(m=>{let ls=lessons(m);if(!ls.length)return;let d=document.createElement('div');d.className='module-card';d.innerHTML=`<h3>${m}</h3><p class="muted">${ls.length} 个语法点</p>${progress(ls)}`;d.onclick=()=>openModule(m);grid.appendChild(d)})}function renderLessonList(m){currentModule=m;let all=lessons(m),ls=all.filter(l=>currentFilter==='全部'||lstat(l.id)===currentFilter);$('moduleTitle').textContent=m;$('moduleSubtitle').textContent=`${all.length} 个语法点`;$('lessonList').innerHTML=ls.length?'':'<p class="muted">当前筛选下没有语法点。</p>';ls.forEach(l=>{let d=document.createElement('div');d.className='lesson-item';d.innerHTML=cardHTML(l);d.onclick=()=>openLesson(l.id);$('lessonList').appendChild(d)})}function openModule(m){lastView='lessonListView';currentFilter='全部';document.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',b.dataset.filter==='全部'));renderLessonList(m);switchView('lessonListView')}function statusBtns(){if(!currentLesson)return;let s=lstat(currentLesson.id);document.querySelectorAll('.status-btn').forEach(b=>b.classList.toggle('active',b.dataset.status===s))}function openLesson(id){currentLesson=GRAMMAR.find(x=>x.id===id);if(!currentLesson)return;$('lessonModule').textContent=currentLesson.module||'';$('lessonTitle').textContent=currentLesson.title;$('lessonMeta').textContent=`${currentLesson.category||''}｜${currentLesson.difficulty||currentLesson.level||''}`;$('lessonSummary').textContent=currentLesson.summary||'';document.querySelectorAll('.high-risk-box,.content-tier-box,.minimal-mastery-box,.misjudge-box').forEach(x=>x.remove());let polish=contentPolishHTML(currentLesson)+linkedConfusionHTML(currentLesson)+linkedPatternHTML(currentLesson)+linkedBuddhistReadingHTML(currentLesson)+linkedBuddhistBackgroundHTML(currentLesson)+linkedAcademicTrainingHTML(currentLesson)+linkedTerminologyHTML(currentLesson)+lessonStudyGuideHTML(currentLesson);if(currentLesson.high_risk_note){polish+=`<div class="high-risk-box"><strong>进阶/需复核提示：</strong>${currentLesson.high_risk_note}<br><button class="feedback-mini-btn" onclick="copyCurrentLessonFeedback()">反馈本课问题</button></div>`}$('lessonSummary').insertAdjacentHTML('afterend',polish);let e=$('lessonExplanation');e.innerHTML='';(currentLesson.explanation||[]).forEach(x=>{let li=document.createElement('li');li.textContent=x;e.appendChild(li)});let mb=$('mistakeBlock'),ml=$('lessonMistakes');if(ml){ml.innerHTML='';if(currentLesson.common_mistakes&&currentLesson.common_mistakes.length){currentLesson.common_mistakes.forEach(x=>{let li=document.createElement('li');li.textContent=x;ml.appendChild(li)});show('mistakeBlock')}else hide('mistakeBlock')}let t=$('lessonTable');t.innerHTML='';(currentLesson.table||[]).forEach(r=>{let tr=document.createElement('tr');r.forEach(c=>{let td=document.createElement('td');td.textContent=c;tr.appendChild(td)});t.appendChild(tr)});let ex=$('lessonExamples');ex.innerHTML='';(currentLesson.examples||[]).forEach(a=>{let d=document.createElement('div');d.className='example';d.innerHTML=exampleHTML(a);ex.appendChild(d)});statusBtns();switchView('lessonView')}function allEx(m){return lessons(m).flatMap(l=>(l.exercises||[]).map(ex=>({...ex,lesson_id:l.id,lesson_title:l.title,module:l.module,category:l.category})))}function shuffle(a){return [...a].sort(()=>Math.random()-.5)}function startCards(cs){cardItems=cs||[];cardIndex=0;if(!cardItems.length)return alert('当前没有卡片。');show('cardPanel');hide('exercisePanel');renderCard()}function renderCard(){let c=cardItems[cardIndex];$('cardProgress').textContent=`卡片 ${cardIndex+1}/${cardItems.length}`;$('cardQuestion').textContent=c.q;$('cardAnswer').textContent=c.a;hide('cardAnswer');show('cardBeforeButtons');hide('cardAfterButtons')}function nextCard(){if(++cardIndex>=cardItems.length){alert('卡片复习完成。');hide('cardPanel')}else renderCard()}function startExercises(items,title='练习'){exerciseItems=items||[];exerciseIndex=0;selectedChoice='';exerciseStats={total:0,right:0,wrong:0};if(!exerciseItems.length)return alert('当前没有练习题。');show('exercisePanel');hide('cardPanel');$('exerciseModeTitle').textContent=title;renderExercise()}function renderExercise(){let ex=exerciseItems[exerciseIndex];selectedChoice='';$('exerciseProgress').textContent=`题目 ${exerciseIndex+1}/${exerciseItems.length}｜正确 ${exerciseStats.right}｜错误 ${exerciseStats.wrong}`;$('exerciseLessonLabel').textContent=`${ex.module||''}｜${ex.lesson_title||''}`;$('exerciseQuestion').textContent=ex.question;$('exerciseFeedback').innerHTML='';$('exerciseFeedback').className='answer-box hidden';hide('nextExerciseBtn');show('submitExerciseBtn');let opts=$('exerciseOptions'),inp=$('exerciseInput');opts.innerHTML='';inp.value='';if(ex.type==='choice'){hide('exerciseInput');hide('paliKeyboard');(ex.options||[]).forEach(o=>{let b=document.createElement('button');b.className='option-btn';b.textContent=o;b.onclick=()=>{selectedChoice=o;document.querySelectorAll('.option-btn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')};opts.appendChild(b)})}else{show('exerciseInput');show('paliKeyboard')}}function submitExercise(){let ex=exerciseItems[exerciseIndex],ua='';if(ex.type==='choice'){ua=selectedChoice;if(!ua)return alert('请先选择一个答案。')}else{ua=$('exerciseInput').value;if(!ua.trim())return alert('请先输入答案。')}let good=ok(ua,ex.answer);exerciseStats.total++;let w=getW();if(good){exerciseStats.right++;delete w[ex.id]}else{exerciseStats.wrong++;w[ex.id]={...ex,wrong_at:new Date().toISOString()}}saveW(w);$('exerciseFeedback').innerHTML=`<strong>${good?'回答正确 ✅':'回答错误 ❌'}</strong><p>你的答案：${ua}</p><p>标准答案：${ex.answer}</p><p>${ex.explanation||''}</p>`;$('exerciseFeedback').classList.remove('hidden');if(!good)$('exerciseFeedback').classList.add('incorrect');show('nextExerciseBtn');hide('submitExerciseBtn')}function nextEx(){if(++exerciseIndex>=exerciseItems.length){alert(`本轮练习完成：正确 ${exerciseStats.right}，错误 ${exerciseStats.wrong}`);hide('exercisePanel');renderWrong();stats()}else renderExercise()}function renderSelect(){let s=$('exerciseModuleSelect');s.innerHTML='<option value="全部模块">全部模块</option>';MODULE_ORDER.forEach(m=>{if(GRAMMAR.some(x=>x.module===m)){let o=document.createElement('option');o.value=m;o.textContent=m;s.appendChild(o)}})}function renderWrong(){let items=Object.values(getW()),box=$('wrongList');box.innerHTML=items.length?'':'<p class="muted">目前没有错题。</p>';items.forEach(it=>{let d=document.createElement('div');d.className='wrong-item';d.innerHTML=`<strong>${it.question}</strong><p class="muted">${it.module||''}｜${it.lesson_title||''}</p><p>答案：${it.answer}</p>`;box.appendChild(d)})}function search(q){let box=$('searchResults');q=String(q||'').trim().toLowerCase();box.innerHTML=q?'':'<p class="muted">输入关键词后显示搜索结果。</p>';if(!q)return;let res=GRAMMAR.filter(l=>[l.title,l.category,l.module,l.summary,...(l.explanation||[]),...(l.examples||[]).flatMap(e=>[e.pali,e.cn,e.note]),...(l.cards||[]).flatMap(c=>[c.q,c.a])].join(' ').toLowerCase().includes(q));if(!res.length){box.innerHTML='<p class="muted">没有找到相关语法点。</p>';return}res.forEach(l=>{let d=document.createElement('div');d.className='lesson-item';d.innerHTML=cardHTML(l);d.onclick=()=>{lastView='searchView';openLesson(l.id)};box.appendChild(d)})}function train(key){let all=GRAMMAR.flatMap(l=>(l.exercises||[]).map(ex=>({...ex,lesson_id:l.id,lesson_title:l.title,module:l.module,category:l.category})));let f=all;if(key==='input')f=all.filter(e=>e.type==='input');else if(key==='reading')f=all.filter(e=>e.lesson_id===75||e.category==='阅读训练');else if(key==='case')f=all.filter(e=>/格|主格|宾格|工具格|处格|属格|与格|从格|呼格/.test(e.question+e.explanation));else if(key==='verb')f=all.filter(e=>/动词|现在时|将来时|过去|命令|祈愿|条件式|使役|被动|人称|词尾/.test(e.question+e.explanation));else if(key==='nonfinite')f=all.filter(e=>/不定式|连续体|分词|gantvā|gantuṃ|katvā|kātuṃ|sutvā/.test(e.question+e.explanation));else if(key==='particles')f=all.filter(e=>/不变词|na|mā|ca|vā|eva|iti|ti|关联|引语|否定|并列|选择/.test(e.question+e.explanation));return f}function renderTraining(){let grid=$('trainingGrid');grid.innerHTML='';TRAINING_PRESETS.forEach(p=>{let count=train(p[0]).length,d=document.createElement('div');d.className='training-card';d.innerHTML=`<h3>${p[1]}</h3><p class="muted">${p[2]}</p><p class="muted">${count} 道题</p><button class="primary">开始专项训练</button>`;d.onclick=()=>startExercises(shuffle(train(p[0])).slice(0,20),p[1]);grid.appendChild(d)})}



const SENTENCE_STATUS_KEY="pali_sentence_analysis_status_v1";

function getSentenceStatuses(){
  try{return JSON.parse(localStorage.getItem(SENTENCE_STATUS_KEY))||{}}catch{return {}}
}
function saveSentenceStatuses(statuses){
  localStorage.setItem(SENTENCE_STATUS_KEY, JSON.stringify(statuses));
}
function sentenceStatus(id){
  return getSentenceStatuses()[id] || "未练";
}
function setSentenceStatus(id,status){
  const statuses=getSentenceStatuses();
  statuses[id]=status;
  saveSentenceStatuses(statuses);
  renderSentenceSelect(true);
  renderSentenceDashboard();
  renderSentenceCard("question");
}
function sentenceLevels(){
  return [...new Set((window.SENTENCE_ANALYSIS_DATA||[]).map(x=>x.level))];
}
function sentenceTags(){
  const tags=new Set(["全部"]);
  (window.SENTENCE_ANALYSIS_DATA||[]).forEach(x=>(x.tags||[]).forEach(t=>tags.add(t)));
  return [...tags];
}
function sentenceSources(){
  return ["全部", ...new Set((window.SENTENCE_ANALYSIS_DATA||[]).map(x=>x.source_type||"教学句"))];
}
function sentencePriorities(){
  return ["全部", ...new Set((window.SENTENCE_ANALYSIS_DATA||[]).map(x=>x.practice_priority||"综合挑战"))];
}
function sentenceStats(){
  const all=window.SENTENCE_ANALYSIS_DATA||[];
  const statuses=getSentenceStatuses();
  const mastered=all.filter(x=>statuses[x.id]==="已掌握").length;
  const review=all.filter(x=>statuses[x.id]==="需复习").length;
  const unpracticed=all.length-mastered-review;
  const current=filteredSentences(false).length;
  return {total:all.length, mastered, review, unpracticed, current};
}
function renderSentenceDashboard(){
  const box=$("sentenceDashboard");
  if(!box)return;
  const s=sentenceStats();
  box.innerHTML=`
    <div class="sentence-stat-card"><strong>${s.total}</strong><span>句子总数</span></div>
    <div class="sentence-stat-card"><strong>${s.mastered}</strong><span>已掌握</span></div>
    <div class="sentence-stat-card"><strong>${s.review}</strong><span>需复习</span></div>
    <div class="sentence-stat-card"><strong>${s.current}</strong><span>当前筛选</span></div>
  `;
}
function renderSentenceLevels(){
  const levelSel=$("sentenceLevelSelect"), tagSel=$("sentenceTagSelect"), sourceSel=$("sentenceSourceSelect"), prioritySel=$("sentencePrioritySelect");
  if(!levelSel)return;
  levelSel.innerHTML="";
  sentenceLevels().forEach(level=>{let o=document.createElement("option");o.value=level;o.textContent=level;levelSel.appendChild(o)});
  if(tagSel){
    tagSel.innerHTML="";
    sentenceTags().forEach(tag=>{let o=document.createElement("option");o.value=tag;o.textContent=tag;tagSel.appendChild(o)});
  }
  if(sourceSel){
    sourceSel.innerHTML="";
    sentenceSources().forEach(source=>{let o=document.createElement("option");o.value=source;o.textContent=source;sourceSel.appendChild(o)});
  }
  if(prioritySel){
    prioritySel.innerHTML="";
    sentencePriorities().forEach(p=>{let o=document.createElement("option");o.value=p;o.textContent=p;prioritySel.appendChild(o)});
  }
  renderSentenceSelect();
  renderSentenceDashboard();
}
function filteredSentences(applySort=true){
  const level=$("sentenceLevelSelect")?.value;
  const tag=$("sentenceTagSelect")?.value||"全部";
  const source=$("sentenceSourceSelect")?.value||"全部";
  const priority=$("sentencePrioritySelect")?.value||"全部";
  const status=$("sentenceStatusSelect")?.value||"全部";
  let items=(window.SENTENCE_ANALYSIS_DATA||[]).filter(x=>{
    const okLevel=!level||x.level===level;
    const okTag=tag==="全部"||(x.tags||[]).includes(tag);
    const okSource=source==="全部"||(x.source_type||"教学句")===source;
    const okPriority=priority==="全部"||(x.practice_priority||"综合挑战")===priority;
    const okStatus=status==="全部"||sentenceStatus(x.id)===status;
    return okLevel&&okTag&&okSource&&okPriority&&okStatus;
  });
  if(applySort){
    items=items.sort((a,b)=>(a.priority_rank||99)-(b.priority_rank||99)||(a.recommended_order||999)-(b.recommended_order||999));
  }
  return items;
}
function renderSentenceSelect(keepCurrent=false){
  const sentSel=$("sentenceSelect"); if(!sentSel)return;
  const oldValue=sentSel.value;
  const items=filteredSentences(); sentSel.innerHTML="";
  items.forEach(item=>{let o=document.createElement("option");o.value=item.id;o.textContent=`${item.sentence}（${sentenceStatus(item.id)}）`;sentSel.appendChild(o)});
  if(keepCurrent && oldValue){
    for(let i=0;i<sentSel.options.length;i++){
      if(sentSel.options[i].value===oldValue){sentSel.selectedIndex=i;break;}
    }
  }
  renderSentenceDashboard();
  renderSentenceCard("question");
}
function currentSentence(){
  const id=$("sentenceSelect")?.value;
  return (window.SENTENCE_ANALYSIS_DATA||[]).find(x=>x.id===id);
}
function relatedLessonButtonHTML(name){
  return `<button class="related-link-btn" data-related="${String(name).replace(/"/g,'&quot;')}">${name}</button>`;
}
function bindRelatedButtons(){
  document.querySelectorAll("[data-token-lookup]").forEach(btn=>{btn.onclick=()=>lookupToken(btn.dataset.tokenLookup)});
  document.querySelectorAll("[data-token-analyze]").forEach(btn=>{btn.onclick=()=>{switchView("dictionaryLookupView");renderDictionarySites();analyzePaliToken(btn.dataset.tokenAnalyze);}});
  document.querySelectorAll("[data-related]").forEach(btn=>{btn.onclick=()=>{
    const name=btn.dataset.related;
    const lesson=GRAMMAR.find(l=>l.title===name || (l.title||"").includes(name) || name.includes(l.title));
    if(lesson){openLesson(lesson.id)}
    else{switchView("searchView");$("searchInput").value=name;renderSearchResults(name)}
  }});
}
function sentenceStatusChipHTML(item){
  const s=sentenceStatus(item.id);
  const cls=s==="已掌握"?"mastered":(s==="需复习"?"review":"");
  return `<span class="sentence-status-chip ${cls}">状态：${s}</span>`;
}
function sentenceRouteAdvice(item){
  if(!item)return "";
  const p=item.practice_priority||"综合挑战";
  let advice="建议按顺序分析：先找限定动词，再找主语、宾语和结构信号。";
  if(p==="基础必练") advice="这是基础必练句，建议反复练到能不看提示完成分析。";
  if(p==="重点提高") advice="这是重点提高句，适合在掌握主宾动后练习格位、连续体或分词。";
  if(p==="结构专项") advice="这是结构专项句，重点观察不变词、否定、并列、选择或关联结构。";
  if(p==="综合挑战") advice="这是综合挑战句，需要综合判断格位、动词、分词和句间结构。";
  if(p==="进阶选练") advice="这是进阶选练句，涉及佛典公式、sandhi 或特殊词形，可先识别大意。";
  return `<div class="route-box"><strong>学习路线建议：</strong>${advice}</div>`;
}
function renderSentenceCard(mode="question"){
  const box=$("sentenceAnalysisCard"); if(!box)return;
  const item=currentSentence();
  if(!item){box.innerHTML='<p class="muted">当前筛选下没有句子，请更换筛选条件。</p>';return}
  const tagHTML=(item.tags||[]).map(t=>`<span class="tag-chip">${t}</span>`).join("");
  let html=`<p class="pill">${item.level}</p><p class="sentence-main">${item.sentence}</p>${sentenceStatusChipHTML(item)}<span class="source-chip">${item.source_type||"教学句"}</span><span class="source-chip">${item.practice_priority||"综合挑战"}</span><div>${tagHTML}</div><div class="training-goal-box"><strong>训练目标：</strong>${item.training_goal||"训练句子分析能力。"}</div>${sentenceRouteAdvice(item)}`;
  if(mode==="question"){
    html+=`<p class="sentence-translation">先自己分析，不要急着看答案。</p><ol class="self-check-list">${(item.self_check||[]).map(q=>`<li>${q}</li>`).join("")}</ol><div class="analysis-tip"><strong>练习提示：</strong>按“找动词—找主语—找宾语—看格位—看结构信号”的顺序分析。</div>`;
  }
  if(mode==="hint"){
    html+=`<p class="sentence-translation">提示：${item.translation}</p><h3>句法结构提示</h3><p>${item.structure}</p><ol class="self-check-list">${(item.self_check||[]).map(q=>`<li>${q}</li>`).join("")}</ol><div class="analysis-tip"><strong>易错提醒：</strong>${item.tip}</div>`;
  }
  if(mode==="analysis"){
    html+=`<p class="sentence-translation">${item.translation}</p><h3>句法结构</h3><p>${item.structure}</p><h3>逐词分析</h3><table class="token-table"><tr><td>词形</td><td>语法说明</td><td>句中功能</td><td>意义</td><td>查词</td></tr>`;
    item.tokens.forEach(t=>{html+=`<tr><td><strong>${t.form}</strong></td><td>${t.grammar}</td><td>${t.role}</td><td>${t.meaning}</td><td><button class="token-lookup-btn" data-token-lookup="${t.form}">查词</button><button class="token-analyze-btn" data-token-analyze="${t.form}">分析</button></td></tr>`});
    html+=`</table><div class="analysis-tip"><strong>易错提醒：</strong>${item.tip}</div><div class="confidence-box"><strong>解析级别：</strong>${item.analysis_level||"教学解析"}</div><div class="analysis-related"><strong>相关语法点：</strong><br>${(item.related||[]).map(relatedLessonButtonHTML).join("")}</div>`;
  }
  box.innerHTML=html; bindRelatedButtons();
}
function nextSentence(){
  const sentSel=$("sentenceSelect");
  if(!sentSel||sentSel.options.length===0)return;
  sentSel.selectedIndex=(sentSel.selectedIndex+1)%sentSel.options.length;
  renderSentenceCard("question");
}
function randomSentence(){
  const items=filteredSentences();
  if(!items.length)return;
  const item=items[Math.floor(Math.random()*items.length)];
  const sentSel=$("sentenceSelect");
  if(sentSel){
    for(let i=0;i<sentSel.options.length;i++){
      if(sentSel.options[i].value===item.id){sentSel.selectedIndex=i;break;}
    }
  }
  renderSentenceCard("question");
}
function startBasicSentenceRoute(){
  if($("sentencePrioritySelect"))$("sentencePrioritySelect").value="基础必练";
  if($("sentenceStatusSelect"))$("sentenceStatusSelect").value="未练";
  renderSentenceSelect();
}
function showReviewSentenceRoute(){
  if($("sentenceStatusSelect"))$("sentenceStatusSelect").value="需复习";
  renderSentenceSelect();
}
function resetSentenceFilters(){
  if($("sentenceTagSelect"))$("sentenceTagSelect").value="全部";
  if($("sentenceSourceSelect"))$("sentenceSourceSelect").value="全部";
  if($("sentencePrioritySelect"))$("sentencePrioritySelect").value="全部";
  if($("sentenceStatusSelect"))$("sentenceStatusSelect").value="全部";
  renderSentenceSelect();
}
function sentenceAnalysisText(item){
  if(!item)return "";
  const lines=[
    `【巴利语句子分析】`,
    `原句：${item.sentence}`,
    `翻译：${item.translation}`,
    `来源类型：${item.source_type||""}`,
    `训练层级：${item.practice_priority||""}`,
    `难点标签：${(item.tags||[]).join("；")}`,
    `句法结构：${item.structure}`,
    "",
    "逐词分析："
  ];
  (item.tokens||[]).forEach(t=>lines.push(`${t.form}\t${t.grammar}\t${t.role}\t${t.meaning}`));
  lines.push("", `易错提醒：${item.tip||""}`, `解析级别：${item.analysis_level||""}`, `相关语法点：${(item.related||[]).join("；")}`);
  return lines.join("\n");
}
async function copyCurrentSentenceAnalysis(){
  const item=currentSentence();
  const text=sentenceAnalysisText(item);
  try{
    await navigator.clipboard.writeText(text);
    alert("本句解析已复制。");
  }catch{
    alert("复制失败，可以手动选择页面内容复制。");
  }
}


function linguisticsCategories(){
  return ["全部", ...new Set((window.LINGUISTICS_TIPS||[]).map(x=>x.category))];
}
function renderLinguisticsCategories(){
  const sel=$("linguisticsCategorySelect");
  if(!sel)return;
  sel.innerHTML="";
  linguisticsCategories().forEach(c=>{let o=document.createElement("option");o.value=c;o.textContent=c;sel.appendChild(o)});
}
function renderLinguisticsTips(){
  const box=$("linguisticsTipsList");
  if(!box)return;
  const q=($("linguisticsSearchInput")?.value||"").trim().toLowerCase();
  const cat=$("linguisticsCategorySelect")?.value||"全部";
  const items=(window.LINGUISTICS_TIPS||[]).filter(t=>{
    const text=[t.title,t.category,t.summary,t.example,...(t.keywords||[]),...(t.related||[])].join(" ").toLowerCase();
    return (cat==="全部"||t.category===cat) && (!q||text.includes(q));
  });
  box.innerHTML=items.length?"":"<p class='muted'>没有找到相关概念。</p>";
  items.forEach(t=>{
    let div=document.createElement("div");
    div.className="tip-card";
    div.innerHTML=`<span class="tip-category">${t.category}</span><h3>${t.title}</h3><p>${t.summary}</p>`;
    div.onclick=()=>openTipModal(t.id);
    box.appendChild(div);
  });
}
function findTipByTitleOrKeyword(name){
  const n=String(name||"").toLowerCase();
  return (window.LINGUISTICS_TIPS||[]).find(t=>t.title===name || (t.keywords||[]).some(k=>String(k).toLowerCase()===n) || String(t.title).toLowerCase().includes(n));
}
function openTipModal(idOrName){
  const tip=(window.LINGUISTICS_TIPS||[]).find(t=>t.id===idOrName) || findTipByTitleOrKeyword(idOrName);
  if(!tip)return;
  const body=$("tipModalBody");
  body.innerHTML=`
    <span class="tip-category">${tip.category}</span>
    <h2>${tip.title}</h2>
    <p>${tip.summary}</p>
    <div class="tip-example"><strong>例子：</strong>${tip.example}</div>
    <p><strong>相关概念：</strong>${(tip.related||[]).map(x=>`<button class="tip-button" data-tip="${x}">${x}</button>`).join("")}</p>
  `;
  show("tipModal");
  document.querySelectorAll("[data-tip]").forEach(btn=>btn.onclick=()=>openTipModal(btn.dataset.tip));
}
function closeTipModal(){
  hide("tipModal");
}
function tipButtonsHTML(names){
  const buttons=[];
  names.forEach(name=>{
    const tip=findTipByTitleOrKeyword(name);
    if(tip && !buttons.some(b=>b.id===tip.id)){
      buttons.push(tip);
    }
  });
  if(!buttons.length)return "";
  return `<div class="tip-inline-box"><strong>相关语言学知识：</strong><br>${buttons.map(t=>`<button class="tip-button" data-tip="${t.id}">${t.title}</button>`).join("")}</div>`;
}
function inferTipNamesFromLesson(lesson){
  const text=[lesson.title,lesson.module,lesson.category,lesson.summary,...(lesson.explanation||[])].join(" ");
  const names=[];
  const rules=[
    ["主格","主格"],["宾格","宾格"],["工具格","工具格"],["与格","与格"],["从格","从格"],["属格","属格"],["处格","处格"],["呼格","呼格"],
    ["变格","格"],["格位","格"],["动词","限定动词"],["不定式","不定式"],["连续体","连续体"],["gerund","连续体"],
    ["现在分词","现在分词"],["过去分词","过去分词"],["将来被动分词","将来被动分词"],["分词","分词"],
    ["sandhi","sandhi 连读音变"],["连读","sandhi 连读音变"],["复合词","复合词"],["不变词","不变词"],["否定","否定"],["ca","并列"],["vā","选择"],["yo","关系—指示结构"]
  ];
  rules.forEach(([key,val])=>{if(text.includes(key))names.push(val)});
  if(lesson.module==="名词变格")names.push("格","词干","词尾");
  if(lesson.module==="动词系统")names.push("限定动词","变位","词尾");
  if(lesson.module==="句法与阅读")names.push("句法学","主语","宾语","限定动词");
  return names;
}
function inferTipNamesFromSentence(item){
  const names=[];
  (item.tags||[]).forEach(tag=>{
    const map={
      "主宾动":["主语","宾语","限定动词"],
      "格位":["格"],
      "处格":["处格"],
      "工具格":["工具格"],
      "属格":["属格"],
      "与格/目的":["与格"],
      "不定式":["不定式"],
      "连续体":["连续体"],
      "现在分词":["现在分词"],
      "过去分词":["过去分词"],
      "将来被动分词":["将来被动分词"],
      "不变词/关联句":["不变词"],
      "na/mā":["否定"],
      "ca/vā":["并列","选择"],
      "yo...so":["关系—指示结构"],
      "sandhi/复合词":["sandhi 连读音变","复合词"]
    };
    (map[tag]||[]).forEach(x=>names.push(x));
  });
  return names;
}
function bindTipButtons(){
  document.querySelectorAll("[data-tip]").forEach(btn=>btn.onclick=()=>openTipModal(btn.dataset.tip));
}


let currentRouteId = "zero";
function renderLearningRoutes(){
  const tabs=$("routeTabs"), content=$("routeContent");
  if(!tabs || !content)return;
  tabs.innerHTML="";
  (window.LEARNING_ROUTES||[]).forEach(route=>{
    const btn=document.createElement("button");
    btn.className="route-tab" + (route.id===currentRouteId ? " active" : "");
    btn.textContent=route.title;
    btn.onclick=()=>{currentRouteId=route.id;renderLearningRoutes();};
    tabs.appendChild(btn);
  });
  const route=(window.LEARNING_ROUTES||[]).find(r=>r.id===currentRouteId) || (window.LEARNING_ROUTES||[])[0];
  if(!route){content.innerHTML="<p class='muted'>暂无学习路线。</p>";return;}
  let html=`<h3>${route.title}</h3><p>${route.desc}</p>`;
  if(route.id==="zero"){
    html += `<div class="student-note"><strong>建议：</strong>零基础学生先按这一条路线走，不必一开始打开所有语法点。每一步学完后，做几道练习，再进入下一步。</div>`;
  }
  (route.steps||[]).forEach((step,idx)=>{
    html += `<div class="route-step"><h3>${idx+1}. ${step.title}</h3><p>${step.desc}</p><div class="route-lesson-list">`;
    (step.lesson_ids||[]).forEach(id=>{
      const lesson=GRAMMAR.find(l=>l.id===id);
      if(lesson){html += `<button class="route-lesson-btn" data-route-lesson="${id}">${lesson.lesson_number||""}. ${lesson.title}</button>`;}
    });
    if(step.sentence_priority){
      html += `<button class="route-sentence-btn" data-sentence-priority="${step.sentence_priority}">进入句子分析：${step.sentence_priority}</button>`;
    }
    html += `</div></div>`;
  });
  content.innerHTML=html;
  document.querySelectorAll("[data-route-lesson]").forEach(btn=>{btn.onclick=()=>openLesson(Number(btn.dataset.routeLesson));});
  document.querySelectorAll("[data-sentence-priority]").forEach(btn=>{
    btn.onclick=()=>{
      const p=btn.dataset.sentencePriority;
      switchView("sentenceAnalysisView");
      renderSentenceLevels();
      if($("sentencePrioritySelect"))$("sentencePrioritySelect").value=p;
      if($("sentenceStatusSelect"))$("sentenceStatusSelect").value="全部";
      renderSentenceSelect();
    };
  });
}



function renderSiteHealth(){
  const box=$("siteHealthPanel");
  if(!box)return;
  const checks=[
    ["grammar.json", typeof GRAMMAR!=="undefined" && Array.isArray(GRAMMAR)],
    ["sentence-analysis-data.js", !!window.SENTENCE_ANALYSIS_DATA],
    ["linguistics-tips-data.js", !!window.LINGUISTICS_TIPS],
    ["learning-routes-data.js", !!window.LEARNING_ROUTES],
    ["dictionary-sites-data.js", !!window.PALI_DICTIONARY_SITES],
    ["token-analysis-data.js",
    "module-guides-data.js",
    "confusion-pairs-data.js",
    "sentence-patterns-data.js",
    "buddhist-reading-data.js",
    "buddhist-background-data.js",
    "academic-training-data.js",
    "terminology-glossary-data.js", !!window.TOKEN_ANALYSIS_DATA]
  ];
  const bad=checks.filter(x=>!x[1]).map(x=>x[0]);
  box.innerHTML=bad.length?`<span class="site-health-bad">有文件未加载：</span>${bad.join("、")}`:`<span class="site-health-ok">网站文件加载正常。</span>`;
}

function renderVersionStatus(){
  const box=$("versionStatus");
  if(!box)return;
  box.textContent=`当前版本：Pali Grammar ${VERSION}｜如果页面显示旧内容，请点击下方刷新缓存。`;
}

async function refreshSiteCache(){
  try{
    if("serviceWorker" in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      for(const reg of regs){await reg.update();}
    }
    if(window.caches){
      const keys=await caches.keys();
      await Promise.all(keys.filter(k=>k.includes("pali")).map(k=>caches.delete(k)));
    }
    location.reload(true);
  }catch(e){
    location.reload(true);
  }
}

function checkRequiredFiles(){
  renderSiteHealth();
  const required=[
    "grammar.json",
    "sentence-analysis-data.js",
    "linguistics-tips-data.js",
    "learning-routes-data.js",
    "dictionary-sites-data.js",
    "token-analysis-data.js"
  ];
  const missing=[];
  if(!window.GRAMMAR && typeof GRAMMAR==="undefined") missing.push("grammar.json");
  if(!window.SENTENCE_ANALYSIS_DATA) missing.push("sentence-analysis-data.js");
  if(!window.LINGUISTICS_TIPS) missing.push("linguistics-tips-data.js");
  if(!window.LEARNING_ROUTES) missing.push("learning-routes-data.js");
  if(missing.length){
    alert("有文件没有加载成功：" + missing.join("、") + "。请确认 GitHub 已上传全部网站文件。");
  }
}


function renderDictionarySites(){
  const box=$("dictionarySiteList");
  if(!box)return;
  box.innerHTML="";
  (window.PALI_DICTIONARY_SITES||[]).forEach(site=>{
    const div=document.createElement("div");
    div.className="dictionary-card";
    div.innerHTML=`
      <span class="dict-level">${site.level}</span>
      <h3>${site.name}</h3>
      <p><strong>语言：</strong>${site.langs}</p>
      <p><strong>适合：</strong>${site.best_for}</p>
      <p class="muted">${site.note}</p>
      <button class="dict-open-btn" data-dict-url="${site.url}">打开网站</button>
    `;
    box.appendChild(div);
  });
  document.querySelectorAll("[data-dict-url]").forEach(btn=>{
    btn.onclick=()=>window.open(btn.dataset.dictUrl, "_blank", "noopener");
  });
}
async function copyLookupWord(){
  const word=($("paliLookupInput")?.value||"").trim();
  if(!word){
    alert("请先输入要查的巴利语词。");
    return;
  }
  try{
    await navigator.clipboard.writeText(word);
    alert("已复制：" + word);
  }catch{
    alert("复制失败，可以手动选中输入框内容复制。");
  }
}
function openPrimaryDictionary(){
  const word=($("paliLookupInput")?.value||"").trim();
  if(word){
    try{navigator.clipboard.writeText(word)}catch(e){}
  }
  const primary=(window.PALI_DICTIONARY_SITES||[]).find(x=>x.id==="sutta") || (window.PALI_DICTIONARY_SITES||[])[0];
  if(primary) window.open(primary.url, "_blank", "noopener");
}
function clearLookupWord(){
  if($("paliLookupInput"))$("paliLookupInput").value="";
}


const LOOKUP_HISTORY_KEY="pali_lookup_history_v1";

function cleanPaliLookupWord(word){
  return String(word||"").replace(/[“”"'.。,，;；:：!?？()（）]/g,"").trim();
}
function getLookupHistory(){
  try{return JSON.parse(localStorage.getItem(LOOKUP_HISTORY_KEY))||[]}catch{return []}
}
function saveLookupHistory(items){
  localStorage.setItem(LOOKUP_HISTORY_KEY, JSON.stringify(items.slice(0,20)));
}
function addLookupHistory(word){
  word=cleanPaliLookupWord(word);
  if(!word)return;
  const items=getLookupHistory().filter(x=>x!==word);
  items.unshift(word);
  saveLookupHistory(items);
  renderLookupHistory();
}
function renderLookupHistory(){
  const box=$("lookupHistoryBox");
  if(!box)return;
  const items=getLookupHistory();
  if(!items.length){
    box.innerHTML="<p class='muted'>最近查询词会显示在这里。</p>";
    return;
  }
  box.innerHTML="<strong>最近查询：</strong><br>" + items.map(w=>`<button class="lookup-chip" data-lookup-history="${w}">${w}</button>`).join("");
  document.querySelectorAll("[data-lookup-history]").forEach(btn=>{
    btn.onclick=()=>{
      if($("paliLookupInput"))$("paliLookupInput").value=btn.dataset.lookupHistory;
    };
  });
}
async function copyTextSilent(text){
  try{await navigator.clipboard.writeText(text);return true}catch{return false}
}
async function lookupToken(word){
  word=cleanPaliLookupWord(word);
  if(!word)return;
  addLookupHistory(word);
  await copyTextSilent(word);
  const primary=(window.PALI_DICTIONARY_SITES||[]).find(x=>x.id==="sutta") || (window.PALI_DICTIONARY_SITES||[])[0];
  if(primary){
    window.open(primary.url, "_blank", "noopener");
  }
}
async function copyExampleText(text){
  const ok=await copyTextSilent(text);
  alert(ok ? "已复制例句。" : "复制失败，可以手动选择复制。");
}



function normalizeTokenForAnalysis(word){
  return String(word||"").replace(/[“”"'.。,，;；:：!?？()（）]/g,"").trim();
}
function lemmaSuggestions(word){
  const w=normalizeTokenForAnalysis(word);
  const suggestions=[];
  function add(x,why){ if(x && x!==w && !suggestions.some(s=>s.form===x)) suggestions.push({form:x,why}); }
  if(!w)return suggestions;
  if(w.endsWith("ṃ")){
    add(w.slice(0,-1), "去掉词尾 -ṃ，可能还原为词干/词典形。");
    if(w.endsWith("aṃ")) add(w.slice(0,-2)+"a", "中性或阳性 -a 词干宾格/主宾同形，可尝试 -a 词典形。");
  }
  if(w.endsWith("ssa")) add(w.slice(0,-3), "去掉 -ssa，可能还原属格/与格单数的基础词形。");
  if(w.endsWith("ena")) add(w.slice(0,-3)+"a", "工具格 -ena 常对应 -a 词干。");
  if(w.endsWith("e")) add(w.slice(0,-1)+"a", "处格 -e 常对应 -a 词干。");
  if(w.endsWith("āya")) add(w.slice(0,-3)+"ā", "阴性 -ā 词干的工具格/与格/属格可能出现 -āya。");
  if(w.endsWith("āya")) add(w.slice(0,-3)+"a", "也可尝试相关 -a 词干，需结合词典确认。");
  if(w.endsWith("tuṃ")||w.endsWith("ituṃ")||w.endsWith("etuṃ")){
    add(w.replace(/ituṃ$|etuṃ$|tuṃ$/,"ti"), "不定式可尝试查询对应现在时形式。");
  }
  if(w.endsWith("tvā")||w.endsWith("itvā")){
    add(w.replace(/itvā$|tvā$/,"ti"), "连续体可尝试查询对应动词形式，但常需词典辅助。");
  }
  if(w.endsWith("nto")) add(w.slice(0,-3)+"ti", "现在分词阳性主格单数可尝试查询对应动词形式。");
  if(w.endsWith("ntī")) add(w.slice(0,-3)+"ti", "现在分词阴性形式可尝试查询对应动词形式。");
  if(w.endsWith("tabbo")) add(w.slice(0,-5)+"ti", "将来被动分词可尝试查询相关动词形式。");
  if(w.endsWith("tabbaṃ")) add(w.slice(0,-6)+"ti", "将来被动分词可尝试查询相关动词形式。");
  if(w==="Buddhassa") add("Buddha", "Buddhassa 常是 Buddha 的属格/与格单数。");
  if(w==="dhammaṃ") add("dhamma", "dhammaṃ 常是 dhamma 的宾格单数。");
  if(w==="vihāre") add("vihāra", "vihāre 常是 vihāra 的处格单数。");
  if(w==="gacchanto") add("gacchati", "gacchanto 是现在分词，可查 gacchati。");
  if(w==="sutvā") add("suṇāti", "sutvā 与“听”相关，可查 suṇāti / suta 等。");
  return suggestions.slice(0,6);
}
function simpleTokenGuesses(word){
  const w=normalizeTokenForAnalysis(word);
  const guesses=[];
  if(!w)return guesses;
  if(w.endsWith("ṃ")) guesses.push({grammar:"可能是宾格单数，或 -a 尾中性主格/宾格单数",role:"需结合句子判断",meaning:"可尝试还原词干后查词"});
  if(w.endsWith("ssa")) guesses.push({grammar:"可能是属格/与格单数",role:"所属、关联、给予对象或持有者",meaning:"可尝试还原词典形"});
  if(w.endsWith("ena")) guesses.push({grammar:"可能是工具格单数",role:"工具、方式、施事",meaning:"可表示“用……、由……”"});
  if(w.endsWith("e")) guesses.push({grammar:"可能是处格单数，或某些复数/动词形式",role:"地点、时间或范围；需结合句子判断",meaning:"不要只按一个词尾机械判断"});
  if(w.endsWith("āya")) guesses.push({grammar:"可能是 -ā 尾阴性工具格/与格/属格单数",role:"工具、目的、所属等",meaning:"需结合句子判断"});
  if(w.endsWith("tuṃ")||w.endsWith("ituṃ")||w.endsWith("etuṃ")) guesses.push({grammar:"不定式可能性高",role:"目的或动作内容",meaning:"常译为“为了……”或补足动词意义"});
  if(w.endsWith("tvā")||w.endsWith("itvā")) guesses.push({grammar:"连续体/独立式可能性高",role:"先行动作",meaning:"常译为“……之后”"});
  if(w.endsWith("nto")||w.endsWith("ntī")||w.endsWith("ntā")) guesses.push({grammar:"现在分词可能性高",role:"修饰名词或表示伴随状态",meaning:"正在……的"});
  if(w.endsWith("tabbo")||w.endsWith("tabbaṃ")||w.endsWith("tabbā")||w.endsWith("eyyaṃ")) guesses.push({grammar:"可能是将来被动分词或相关应作形式",role:"谓语性成分或修饰语",meaning:"应被……、应当……"});
  if(w.endsWith("anti")) guesses.push({grammar:"可能是现在时第三人称复数动词",role:"限定动词",meaning:"他们……"});
  else if(w.endsWith("ti")) guesses.push({grammar:"可能是现在时第三人称单数动词",role:"限定动词",meaning:"他/她/它……"});
  if(w.endsWith("mi")) guesses.push({grammar:"可能是第一人称单数动词",role:"限定动词",meaning:"我……"});
  if(w.endsWith("si")) guesses.push({grammar:"可能是第二人称单数动词",role:"限定动词",meaning:"你……"});
  return guesses;
}
function renderLemmaSuggestions(raw){
  const suggestions=lemmaSuggestions(raw);
  if(!suggestions.length)return "";
  return `<div class="lemma-suggestion-box"><strong>建议尝试还原词典形：</strong><br>`+
    suggestions.map(s=>`<button class="lemma-chip" data-lemma="${s.form}">${s.form}</button><span class="muted">${s.why}</span><br>`).join("")+
    `</div>`;
}
function bindLemmaButtons(){
  document.querySelectorAll("[data-lemma]").forEach(btn=>{
    btn.onclick=()=>{
      if($("paliLookupInput"))$("paliLookupInput").value=btn.dataset.lemma;
      analyzePaliToken(btn.dataset.lemma);
    };
  });
}
function analyzePaliToken(word, targetId="tokenAnalysisPanel"){
  const panel=$(targetId);
  if(!panel)return;
  const selected=(window.getSelection?window.getSelection().toString():"");
  const raw=normalizeTokenForAnalysis(word || $("paliLookupInput")?.value || selected || "");
  if(!raw){panel.innerHTML='<div class="analysis-warning">请先输入或选中一个巴利语词。</div>';return;}
  if($("paliLookupInput"))$("paliLookupInput").value=raw;
  addLookupHistory(raw);
  const data=window.TOKEN_ANALYSIS_DATA||{};
  const item=data[raw]||data[raw.toLowerCase()];
  const guesses=simpleTokenGuesses(raw);
  let html=`<h3>词形分析：${raw}</h3>`;
  html+=renderLemmaSuggestions(raw);
  if(item){
    html+=`<div class="analysis-result-card"><h3>一、本站例句库已收录</h3>`;
    (item.analyses||[]).forEach(a=>{html+=`<p><strong>语法：</strong>${a.grammar}<br><strong>功能：</strong>${a.role}<br><strong>意义：</strong>${a.meaning}</p>`});
    if(item.examples&&item.examples.length){
      html+=`<strong>相关例句：</strong>`;
      item.examples.forEach(ex=>{html+=`<div class="analysis-example">${ex.sentence}<br>${ex.translation}<br><span class="muted">${ex.tip||""}</span></div>`});
    }
    html+=`</div>`;
  }else{
    html+=`<div class="analysis-warning"><h3>一、本站例句库未收录</h3>没有找到这个词形的已核校例句记录。请继续看规则提示，并建议查外部词典。</div>`;
  }
  if(guesses.length){
    html+=`<div class="analysis-warning"><h3>二、词尾规则提示</h3><strong>以下只是可能性，不是最终结论。</strong>`;
    guesses.forEach(g=>{html+=`<p><strong>可能语法：</strong>${g.grammar}<br><strong>可能功能：</strong>${g.role}<br><strong>提示：</strong>${g.meaning}</p>`});
    html+=`</div>`;
  }
  html+=`<div class="analysis-warning"><h3>三、下一步建议</h3><ol><li>先看本站例句库是否有同形解析。</li><li>再看词尾规则提示。</li><li>尝试还原词典形。</li><li>最后到外部词典交叉查询。</li></ol></div>`;
  html+=`<div class="button-row three-buttons"><button class="secondary" onclick="copyLookupWord()">复制该词</button><button class="primary" onclick="openPrimaryDictionary()">打开首选词典</button><button class="secondary" onclick="renderDictionarySites()">查看全部词典</button></div>`;
  panel.innerHTML=html;
  bindLemmaButtons();
}
function analyzeSelectedText(){analyzePaliToken(window.getSelection?window.getSelection().toString():"");}
function analyzeAndLookup(){
  const word=normalizeTokenForAnalysis($("paliLookupInput")?.value || (window.getSelection?window.getSelection().toString():""));
  analyzePaliToken(word);
  if(word)lookupToken(word);
}


function getAllPaliLocalStorage(){
  const data={};
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(k&&k.startsWith("pali")) data[k]=localStorage.getItem(k);
  }
  return data;
}
function countObj(o){return o&&typeof o==="object"?Object.keys(o).length:0}
function renderProgressSummary(){
  const box=$("progressSummaryBox");
  if(!box)return;
  let lessons={}, wrong={}, sent={}, lookup=[];
  try{lessons=JSON.parse(localStorage.getItem(STATUS_KEY)||"{}")}catch{}
  try{wrong=JSON.parse(localStorage.getItem(WRONG_KEY)||"{}")}catch{}
  try{sent=JSON.parse(localStorage.getItem("pali_sentence_analysis_status_v1")||"{}")}catch{}
  try{lookup=JSON.parse(localStorage.getItem("pali_lookup_history_v1")||"[]")}catch{}
  const mastered=Object.values(lessons).filter(x=>x==="已掌握").length;
  const reviewLessons=Object.values(lessons).filter(x=>x==="需复习").length;
  const sentMastered=Object.values(sent).filter(x=>x==="已掌握").length;
  const sentReview=Object.values(sent).filter(x=>x==="需复习").length;
  box.innerHTML=`<strong>当前学习进度</strong><br>
    语法点已标记：${countObj(lessons)}｜已掌握：${mastered}｜需复习：${reviewLessons}<br>
    错题：${countObj(wrong)}<br>
    句子分析已标记：${countObj(sent)}｜已掌握：${sentMastered}｜需复习：${sentReview}<br>
    最近查词：${lookup.length}`;
  const fb=$("feedbackTemplateText");
  if(fb&&!fb.value) fb.value=makeFeedbackTemplate();
}
function exportProgress(){
  const payload={version:VERSION, exported_at:new Date().toISOString(), localStorage:getAllPaliLocalStorage()};
  const text=JSON.stringify(payload,null,2);
  if($("progressDataText"))$("progressDataText").value=text;
  navigator.clipboard?.writeText(text).then(()=>alert("学习进度已导出并复制。")).catch(()=>alert("学习进度已导出到文本框。"));
}
function importProgress(){
  const text=($("progressDataText")?.value||"").trim();
  if(!text)return alert("请先粘贴导出的学习进度 JSON。");
  try{
    const payload=JSON.parse(text);
    const data=payload.localStorage||payload;
    Object.keys(data).forEach(k=>{if(k.startsWith("pali"))localStorage.setItem(k,data[k])});
    alert("学习进度已导入。页面将重新加载。");
    location.reload();
  }catch(e){alert("导入失败：JSON 格式不正确。")}
}
function clearProgress(){
  if(!confirm("确定清空本浏览器中的学习状态、错题、句子标记和查词历史吗？"))return;
  Object.keys(localStorage).forEach(k=>{if(k.startsWith("pali"))localStorage.removeItem(k)});
  renderProgressSummary();stats();renderWrong();
  alert("已清空本地学习进度。");
}
function makeFeedbackTemplate(){
  const title=currentLesson?currentLesson.title:"";
  const selected=window.getSelection?window.getSelection().toString():"";
  return `【巴利语学习网站错误反馈】
版本：Pali Grammar ${VERSION}
问题位置：${title||"请填写语法点/句子/查词页面"}
涉及内容：${selected||"请粘贴有问题的原文或截图说明"}
问题类型：语法错误 / 翻译问题 / 例句不自然 / 词形分析不准 / 页面功能问题
具体说明：
建议修改：`;
}
async function copyFeedbackTemplate(){
  const text=makeFeedbackTemplate();
  if($("feedbackTemplateText"))$("feedbackTemplateText").value=text;
  try{await navigator.clipboard.writeText(text);alert("反馈模板已复制。")}catch{alert("反馈模板已生成，请手动复制。")}
}
function copyCurrentLessonFeedback(){copyFeedbackTemplate();}



const TRIAL_TASK_KEY="pali_trial_tasks_v1";
const TRIAL_TASKS=[
  ["route","完成零基础路线第1步","进入“零基础路线”，打开“认识字母与转写”。"],
  ["lesson","学习1个语法点","打开任意一个语法点，阅读学习目标、说明、例句和易错点。"],
  ["exercise","完成10道练习","进入“练习中心”，完成一组10题练习。"],
  ["sentence","分析3个句子","进入“句子分析”，至少完成3个句子的“先自测—提示—完整分析”。"],
  ["lookup","查1个巴利语单词","进入“查巴利语单词”，输入并复制一个词，再打开首选词典。"],
  ["token","分析1个词形","在查词页输入 dhammaṃ / Buddhassa / sutvā 等，点击“分析这个词”。"],
  ["wrong","查看错题或需复习内容","进入“错题复习”或“句子分析→只看需复习”。"],
  ["feedback","复制1次反馈模板","进入“学习进度备份”，复制错误反馈模板。"]
];
function getTrialTaskState(){
  try{return JSON.parse(localStorage.getItem(TRIAL_TASK_KEY))||{}}catch{return {}}
}
function saveTrialTaskState(s){
  localStorage.setItem(TRIAL_TASK_KEY,JSON.stringify(s));
}
function renderTrialTasks(){
  const list=$("trialTaskList"), summary=$("trialTaskSummary");
  if(!list||!summary)return;
  const state=getTrialTaskState();
  const done=TRIAL_TASKS.filter(t=>state[t[0]]).length;
  summary.innerHTML=`<strong>试用进度：</strong>${done}/${TRIAL_TASKS.length} 项已完成。`;
  list.innerHTML="";
  TRIAL_TASKS.forEach(([id,title,desc])=>{
    const div=document.createElement("div");
    div.className="trial-task";
    div.innerHTML=`<label><input type="checkbox" data-trial-task="${id}" ${state[id]?"checked":""}>${title}</label><small>${desc}</small>`;
    list.appendChild(div);
  });
  document.querySelectorAll("[data-trial-task]").forEach(ch=>{
    ch.onchange=()=>{
      const s=getTrialTaskState();
      s[ch.dataset.trialTask]=ch.checked;
      saveTrialTaskState(s);
      renderTrialTasks();
    };
  });
  const fb=$("trialFeedbackText");
  if(fb&&!fb.value)fb.value=makeTrialFeedback();
}
function resetTrialTasks(){
  localStorage.removeItem(TRIAL_TASK_KEY);
  if($("trialFeedbackText"))$("trialFeedbackText").value="";
  renderTrialTasks();
}
function makeTrialFeedback(){
  const state=getTrialTaskState();
  const done=TRIAL_TASKS.filter(t=>state[t[0]]).map(t=>t[1]);
  const undone=TRIAL_TASKS.filter(t=>!state[t[0]]).map(t=>t[1]);
  return `【巴利语学习网站试用反馈】
版本：Pali Grammar ${VERSION}
已完成任务：${done.length?done.join("；"):"无"}
未完成任务：${undone.length?undone.join("；"):"无"}
使用设备：手机 / 电脑 / 平板
最容易使用的功能：
最不清楚的地方：
发现的错误或问题：
建议修改：`;
}
async function copyTrialFeedback(){
  const text=makeTrialFeedback();
  if($("trialFeedbackText"))$("trialFeedbackText").value=text;
  try{await navigator.clipboard.writeText(text);alert("试用反馈模板已复制。")}catch{alert("模板已生成，请手动复制。")}
}


function contentPolishHTML(lesson){
  if(!lesson)return "";
  let html="";
  if(lesson.study_tier){
    const cls=lesson.study_tier==="必学"?"tier-required":(lesson.study_tier==="进阶"?"tier-advanced":"tier-optional");
    html+=`<div class="content-tier-box ${cls}"><strong>学习层级：</strong>${lesson.study_tier}</div>`;
  }
  if(lesson.minimal_mastery&&lesson.minimal_mastery.length){
    html+=`<div class="minimal-mastery-box"><strong>本课最小掌握：</strong><ol>${lesson.minimal_mastery.map(x=>`<li>${x}</li>`).join("")}</ol></div>`;
  }
  if(lesson.common_misjudgments&&lesson.common_misjudgments.length){
    html+=`<div class="misjudge-box"><strong>常见误判对照：</strong><table><tr><td>容易误判</td><td>较稳妥判断</td><td>说明</td></tr>${lesson.common_misjudgments.map(r=>`<tr><td>${r.wrong}</td><td>${r.right}</td><td>${r.note}</td></tr>`).join("")}</table></div>`;
  }
  if(lesson.content_review_note){
    html+=`<div class="high-risk-box"><strong>内容复核提示：</strong>${lesson.content_review_note}</div>`;
  }
  return html;
}
function exampleHTML(a){
  let html=`<div class="pali">${a.pali||""}</div>`;
  if(a.literal_cn||a.natural_cn||a.grammar_note){
    html+=`<div class="translation-layer">`;
    if(a.literal_cn)html+=`<p><strong>直译：</strong>${a.literal_cn}</p>`;
    if(a.natural_cn)html+=`<p><strong>顺译：</strong>${a.natural_cn}</p>`;
    if(a.grammar_note)html+=`<p><strong>语法说明：</strong>${a.grammar_note}</p>`;
    html+=`</div>`;
  }else{
    html+=`<div>${a.cn||""}</div><div class="muted">${a.note||""}</div>`;
  }
  return html;
}


function renderModuleGuides(){
  const box=$("moduleGuideList");
  if(!box)return;
  box.innerHTML="";
  (window.MODULE_GUIDES||[]).forEach(g=>{
    const div=document.createElement("div");
    div.className="module-guide-card";
    div.innerHTML=`
      <h3>${g.module}</h3>
      <p><strong>学习目标：</strong>${g.goal}</p>
      <p><strong>必会内容：</strong>${(g.must_know||[]).join("、")}</p>
      <p><strong>学习方法：</strong></p>
      <ol>${(g.how_to_learn||[]).map(x=>`<li>${x}</li>`).join("")}</ol>
      <div class="module-warning"><strong>提醒：</strong>${g.warning}</div>
      <button class="route-lesson-btn" data-module-guide-open="${g.module}">进入这个模块</button>
    `;
    box.appendChild(div);
  });
  document.querySelectorAll("[data-module-guide-open]").forEach(btn=>{
    btn.onclick=()=>{openModule(btn.dataset.moduleGuideOpen);};
  });
}
function lessonStudyGuideHTML(lesson){
  if(!lesson)return "";
  let html="";
  if(lesson.prerequisites&&lesson.prerequisites.length){
    html+=`<div class="lesson-guide-box"><strong>课前预备：</strong><ol>${lesson.prerequisites.map(x=>`<li>${x}</li>`).join("")}</ol></div>`;
  }
  if(lesson.self_check_questions&&lesson.self_check_questions.length){
    html+=`<div class="lesson-guide-box"><strong>课后自检：</strong><ol>${lesson.self_check_questions.map(x=>`<li>${x}</li>`).join("")}</ol></div>`;
  }
  if(lesson.next_step_advice){
    html+=`<div class="lesson-guide-box next-step"><strong>下一步建议：</strong>${lesson.next_step_advice}</div>`;
  }
  return html;
}


function renderConfusionPairs(){
  const box=$("confusionPairsList");
  if(!box)return;
  const q=($("confusionSearchInput")?.value||"").trim().toLowerCase();
  const items=(window.CONFUSION_PAIRS||[]).filter(p=>{
    const text=[p.title,p.a,p.b,p.core,p.a_cue,p.b_cue,p.tip,...(p.examples||[]).map(e=>e.pali+" "+e.cn+" "+e.note)].join(" ").toLowerCase();
    return !q||text.includes(q);
  });
  box.innerHTML=items.length?"":"<p class='muted'>没有找到相关对照。</p>";
  items.forEach(p=>{
    const div=document.createElement("div");
    div.className="confusion-card";
    div.innerHTML=`
      <h3>${p.title}</h3>
      <p><strong>核心区别：</strong>${p.core}</p>
      <div class="confusion-two-col">
        <div><strong>${p.a}</strong><br><span>${p.a_cue}</span></div>
        <div><strong>${p.b}</strong><br><span>${p.b_cue}</span></div>
      </div>
      <div class="confusion-examples">
        ${(p.examples||[]).map(e=>`<div class="analysis-example"><strong>${e.pali}</strong><br>${e.cn}<br><span class="muted">${e.note}</span></div>`).join("")}
      </div>
      <div class="module-warning"><strong>学习提示：</strong>${p.tip}</div>
    `;
    box.appendChild(div);
  });
}
function linkedConfusionHTML(lesson){
  if(!lesson||!lesson.linked_confusions||!lesson.linked_confusions.length)return "";
  const pairs=(window.CONFUSION_PAIRS||[]).filter(p=>lesson.linked_confusions.includes(p.id));
  if(!pairs.length)return "";
  return `<div class="linked-confusion-box"><strong>相关易混概念：</strong><br>${pairs.map(p=>`<button class="confusion-link-btn" data-confusion-id="${p.id}">${p.title}</button>`).join("")}</div>`;
}
function bindConfusionButtons(){
  document.querySelectorAll("[data-confusion-id]").forEach(btn=>{
    btn.onclick=()=>{
      switchView("confusionPairsView");
      if($("confusionSearchInput"))$("confusionSearchInput").value=btn.textContent;
      renderConfusionPairs();
    };
  });
}


function renderSentencePatterns(){
  const box=$("sentencePatternList");
  if(!box)return;
  const q=($("patternSearchInput")?.value||"").trim().toLowerCase();
  const level=$("patternLevelSelect")?.value||"全部";
  const items=(window.SENTENCE_PATTERNS||[]).filter(p=>{
    const text=[p.title,p.level,p.formula,p.function,p.trap,...(p.signals||[]),...(p.examples||[]).map(e=>e.pali+" "+e.natural+" "+e.note)].join(" ").toLowerCase();
    return (level==="全部"||p.level===level)&&(!q||text.includes(q));
  });
  box.innerHTML=items.length?"":"<p class='muted'>没有找到相关句型。</p>";
  items.forEach(p=>{
    const div=document.createElement("div");
    div.className="pattern-card";
    div.innerHTML=`
      <span class="pattern-level ${p.level==='必学'?'tier-required':(p.level==='进阶'?'tier-advanced':'tier-optional')}">${p.level}</span>
      <h3>${p.title}</h3>
      <p><strong>句型公式：</strong>${p.formula}</p>
      <p><strong>功能：</strong>${p.function}</p>
      <p><strong>识别线索：</strong>${(p.signals||[]).join("；")}</p>
      <div class="pattern-steps"><strong>分析步骤：</strong><ol>${(p.steps||[]).map(x=>`<li>${x}</li>`).join("")}</ol></div>
      <div class="pattern-examples">${(p.examples||[]).map(e=>`
        <div class="analysis-example">
          <strong>${e.pali}</strong><br>
          <span><strong>直译：</strong>${e.literal}</span><br>
          <span><strong>顺译：</strong>${e.natural}</span><br>
          <span class="muted">${e.note}</span>
        </div>`).join("")}</div>
      <div class="module-warning"><strong>易错提醒：</strong>${p.trap}</div>
    `;
    box.appendChild(div);
  });
}
function linkedPatternHTML(lesson){
  if(!lesson||!lesson.linked_patterns||!lesson.linked_patterns.length)return "";
  const patterns=(window.SENTENCE_PATTERNS||[]).filter(p=>lesson.linked_patterns.includes(p.id));
  if(!patterns.length)return "";
  return `<div class="linked-pattern-box"><strong>相关句型模板：</strong><br>${patterns.map(p=>`<button class="pattern-link-btn" data-pattern-id="${p.id}">${p.title}</button>`).join("")}</div>`;
}
function bindPatternButtons(){
  document.querySelectorAll("[data-pattern-id]").forEach(btn=>{
    btn.onclick=()=>{
      const p=(window.SENTENCE_PATTERNS||[]).find(x=>x.id===btn.dataset.patternId);
      switchView("sentencePatternsView");
      if($("patternSearchInput"))$("patternSearchInput").value=p?p.title:btn.textContent;
      if($("patternLevelSelect"))$("patternLevelSelect").value="全部";
      renderSentencePatterns();
    };
  });
}


function buddhistReadingCategories(){
  return ["全部", ...new Set((window.BUDDHIST_READING_PATTERNS||[]).map(x=>x.category))];
}
function renderBuddhistReadingCategories(){
  const sel=$("buddhistReadingCategorySelect");
  if(!sel)return;
  sel.innerHTML="";
  buddhistReadingCategories().forEach(c=>{
    const o=document.createElement("option");
    o.value=c;o.textContent=c;sel.appendChild(o);
  });
}
function renderBuddhistReading(){
  const box=$("buddhistReadingList");
  if(!box)return;
  const q=($("buddhistReadingSearchInput")?.value||"").trim().toLowerCase();
  const cat=$("buddhistReadingCategorySelect")?.value||"全部";
  const level=$("buddhistReadingLevelSelect")?.value||"全部";
  const items=(window.BUDDHIST_READING_PATTERNS||[]).filter(p=>{
    const text=[p.title,p.category,p.level,p.formula,p.literal,p.natural,p.structure,p.warning,...(p.keywords||[]).map(k=>k.word+" "+k.note),...(p.related_grammar||[])].join(" ").toLowerCase();
    return (cat==="全部"||p.category===cat)&&(level==="全部"||p.level===level)&&(!q||text.includes(q));
  });
  box.innerHTML=items.length?"":"<p class='muted'>没有找到相关佛典句式。</p>";
  items.forEach(p=>{
    const div=document.createElement("div");
    div.className="buddhist-reading-card";
    div.innerHTML=`
      <span class="pattern-level ${p.level==='必学'?'tier-required':(p.level==='进阶'?'tier-advanced':'tier-optional')}">${p.level}</span>
      <span class="reading-category">${p.category}</span>
      <h3>${p.title}</h3>
      <p><strong>结构公式：</strong>${p.formula}</p>
      <div class="translation-layer">
        <p><strong>直译：</strong>${p.literal}</p>
        <p><strong>顺译：</strong>${p.natural}</p>
        <p><strong>结构说明：</strong>${p.structure}</p>
      </div>
      <div class="keyword-list"><strong>关键词：</strong><br>${(p.keywords||[]).map(k=>`<span class="keyword-chip">${k.word}：${k.note}</span>`).join("")}</div>
      <div class="module-warning"><strong>易错提醒：</strong>${p.warning}</div>
      <p><strong>相关语法点：</strong>${(p.related_grammar||[]).join("、")}</p>
    `;
    box.appendChild(div);
  });
}
function linkedBuddhistReadingHTML(lesson){
  if(!lesson||!lesson.linked_buddhist_reading||!lesson.linked_buddhist_reading.length)return "";
  const items=(window.BUDDHIST_READING_PATTERNS||[]).filter(p=>lesson.linked_buddhist_reading.includes(p.id));
  if(!items.length)return "";
  return `<div class="linked-buddhist-box"><strong>相关佛典阅读句式：</strong><br>${items.map(p=>`<button class="buddhist-link-btn" data-buddhist-id="${p.id}">${p.title}</button>`).join("")}</div>`;
}
function bindBuddhistButtons(){
  document.querySelectorAll("[data-buddhist-id]").forEach(btn=>{
    btn.onclick=()=>{
      const p=(window.BUDDHIST_READING_PATTERNS||[]).find(x=>x.id===btn.dataset.buddhistId);
      switchView("buddhistReadingView");
      renderBuddhistReadingCategories();
      if($("buddhistReadingSearchInput"))$("buddhistReadingSearchInput").value=p?p.title:btn.textContent;
      if($("buddhistReadingCategorySelect"))$("buddhistReadingCategorySelect").value="全部";
      if($("buddhistReadingLevelSelect"))$("buddhistReadingLevelSelect").value="全部";
      renderBuddhistReading();
    };
  });
}


let buddhistBackgroundTab="concepts";
function renderBuddhistBackground(tab){
  if(tab)buddhistBackgroundTab=tab;
  const box=$("buddhistBackgroundContent");
  if(!box)return;
  const data=window.BUDDHIST_BACKGROUND_DATA||{};
  const tabNow=buddhistBackgroundTab;
  document.querySelectorAll(".bg-tab").forEach(btn=>btn.classList.toggle("primary", btn.dataset.bgTab===tabNow));
  if(tabNow==="concepts"){
    box.innerHTML=`
      <h3>佛学概念小词典</h3>
      <p class="muted">只提供阅读入门所需的最小解释，避免展开复杂义理争论。</p>
      <label>搜索概念</label>
      <input id="conceptSearchInput" placeholder="例如 dhamma, dukkha, kamma, nibbāna, sati" />
      <label>选择类别</label>
      <select id="conceptCategorySelect"></select>
      <div id="conceptList" class="concept-list"></div>
    `;
    renderConceptCategories();
    renderConceptList();
    $("conceptSearchInput").oninput=renderConceptList;
    $("conceptCategorySelect").onchange=renderConceptList;
  }
  if(tabNow==="canon"){
    box.innerHTML=`<h3>巴利三藏结构与常见略号</h3><div class="canon-list">${(data.canon_structure||[]).map(sec=>`
      <div class="canon-card">
        <h3>${sec.title}</h3>
        <p>${sec.explanation}</p>
        <table><tr><td>略号/术语</td><td>名称</td><td>说明</td></tr>${(sec.items||[]).map(i=>`<tr><td><strong>${i.abbr}</strong></td><td>${i.name}</td><td>${i.note}</td></tr>`).join("")}</table>
      </div>`).join("")}</div>`;
  }
  if(tabNow==="refs"){
    box.innerHTML=`
      <h3>章节术语与引用格式</h3>
      <div class="canon-card">
        <h3>章节术语</h3>
        <table><tr><td>术语</td><td>常见汉译</td><td>说明</td></tr>${(data.reference_terms||[]).map(t=>`<tr><td><strong>${t.term}</strong></td><td>${t.cn}</td><td>${t.note}</td></tr>`).join("")}</table>
      </div>
      <div class="canon-card">
        <h3>引用格式怎么看</h3>
        <table><tr><td>格式</td><td>含义</td></tr>${(data.citation_examples||[]).map(r=>`<tr><td><strong>${r.ref}</strong></td><td>${r.meaning}</td></tr>`).join("")}</table>
      </div>`;
  }
  if(tabNow==="flow"){
    box.innerHTML=`<h3>佛经常见篇章结构</h3><p class="muted">并非每篇经都完整包含这些部分，但很多散文经会呈现类似推进方式。</p><div class="flow-list">${(data.sutta_flow||[]).map((s,idx)=>`
      <div class="flow-card">
        <span class="pattern-level tier-optional">${idx+1}</span>
        <h3>${s.stage}</h3>
        <p><strong>常见表达：</strong>${(s.patterns||[]).join("；")}</p>
        <p>${s.purpose}</p>
      </div>`).join("")}</div>`;
  }
}
function conceptCategories(){
  const data=window.BUDDHIST_BACKGROUND_DATA||{};
  return ["全部", ...new Set((data.concepts||[]).map(x=>x.category))];
}
function renderConceptCategories(){
  const sel=$("conceptCategorySelect");
  if(!sel)return;
  sel.innerHTML="";
  conceptCategories().forEach(c=>{
    const o=document.createElement("option");
    o.value=c;o.textContent=c;sel.appendChild(o);
  });
}
function renderConceptList(){
  const box=$("conceptList");
  if(!box)return;
  const data=window.BUDDHIST_BACKGROUND_DATA||{};
  const q=($("conceptSearchInput")?.value||"").trim().toLowerCase();
  const cat=$("conceptCategorySelect")?.value||"全部";
  const items=(data.concepts||[]).filter(c=>{
    const text=[c.pali,c.cn,c.en,c.category,c.basic,c.reading_tip,c.example,...(c.related||[])].join(" ").toLowerCase();
    return (cat==="全部"||c.category===cat)&&(!q||text.includes(q));
  });
  box.innerHTML=items.length?"":"<p class='muted'>没有找到相关概念。</p>";
  items.forEach(c=>{
    const div=document.createElement("div");
    div.className="concept-card";
    div.innerHTML=`
      <span class="pattern-level ${c.level==='必学'?'tier-required':(c.level==='进阶'?'tier-advanced':'tier-optional')}">${c.level}</span>
      <span class="reading-category">${c.category}</span>
      <h3>${c.pali} ｜ ${c.cn}</h3>
      <p><strong>英文参考：</strong>${c.en}</p>
      <p><strong>基础解释：</strong>${c.basic}</p>
      <p><strong>阅读提醒：</strong>${c.reading_tip}</p>
      <div class="analysis-example"><strong>例句：</strong>${c.example}</div>
      <p><strong>相关：</strong>${(c.related||[]).join("、")}</p>
    `;
    box.appendChild(div);
  });
}
function linkedBuddhistBackgroundHTML(lesson){
  if(!lesson||!lesson.linked_buddhist_background||!lesson.linked_buddhist_background.length)return "";
  const labels={concepts:"佛学概念小词典",canon:"三藏结构与略号",refs:"章节术语与引用格式",flow:"佛经篇章结构"};
  return `<div class="linked-background-box"><strong>相关佛典背景知识：</strong><br>${lesson.linked_buddhist_background.map(k=>`<button class="background-link-btn" data-bg-open="${k}">${labels[k]||k}</button>`).join("")}</div>`;
}
function bindBackgroundButtons(){
  document.querySelectorAll("[data-bg-open]").forEach(btn=>{
    btn.onclick=()=>{switchView("buddhistBackgroundView");renderBuddhistBackground(btn.dataset.bgOpen);};
  });
}


let academicTrainingTab="method";
function renderAcademicTraining(tab){
  if(tab)academicTrainingTab=tab;
  const box=$("academicTrainingContent");
  if(!box)return;
  const data=window.ACADEMIC_TRAINING_DATA||{};
  const tabNow=academicTrainingTab;
  document.querySelectorAll(".academic-tab").forEach(btn=>btn.classList.toggle("primary", btn.dataset.academicTab===tabNow));

  if(tabNow==="method"){
    box.innerHTML=`<h3>文献阅读方法</h3><p class="muted">重点不是“看懂大意”，而是把原文处理成可研究材料。</p>
    <div class="academic-list">${(data.method||[]).map(m=>`
      <div class="academic-card">
        <span class="pattern-level ${m.level==='必学'?'tier-required':'tier-optional'}">${m.level}</span>
        <h3>${m.title}</h3>
        <p><strong>训练目标：</strong>${m.goal}</p>
        <ol>${(m.steps||[]).map(s=>`<li>${s}</li>`).join("")}</ol>
        <div class="academic-example">
          <strong>示例记录</strong>
          <p><strong>原文：</strong>${m.example.source}</p>
          <p><strong>直译：</strong>${m.example.literal}</p>
          <p><strong>顺译：</strong>${m.example.natural}</p>
          <p><strong>语法点：</strong>${m.example.grammar}</p>
          <p><strong>阅读类型：</strong>${m.example.type}</p>
          <p><strong>研究提醒：</strong>${m.example.research_note}</p>
        </div>
      </div>`).join("")}</div>`;
  }

  if(tabNow==="citation"){
    const c=data.citation||{};
    box.innerHTML=`<h3>原典引用与学术规范</h3>
    <div class="academic-list">${(c.principles||[]).map(p=>`
      <div class="academic-card"><h3>${p.title}</h3><p>${p.content}</p></div>`).join("")}</div>
    <div class="academic-card">
      <h3>常见引用格式</h3>
      <table><tr><td>格式</td><td>含义</td></tr>${(c.citation_examples||[]).map(e=>`<tr><td><strong>${e.format}</strong></td><td>${e.meaning}</td></tr>`).join("")}</table>
    </div>
    <div class="academic-card">
      <h3>材料记录模板</h3>
      <pre>${(c.record_template||[]).join("\\n")}</pre>
      <button class="secondary" onclick="copyAcademicTemplate('citation')">复制模板</button>
    </div>`;
  }

  if(tabNow==="vocabulary"){
    box.innerHTML=`<h3>巴利词汇研究入门</h3><p class="muted">一个词的研究不能只靠词典义，要看词形、搭配和上下文。</p>
    <div class="academic-list">${(data.vocabulary||[]).map(v=>`
      <div class="academic-card">
        <h3>${v.title}</h3>
        <div class="module-warning"><strong>核心提醒：</strong>${v.core_warning}</div>
        <ol>${(v.steps||[]).map(s=>`<li>${s}</li>`).join("")}</ol>
        <table><tr><td>例句</td><td>用法判断</td></tr>${(v.sample_records||[]).map(r=>`<tr><td>${r.pali}</td><td>${r.use}</td></tr>`).join("")}</table>
      </div>`).join("")}</div>`;
  }

  if(tabNow==="analysis"){
    const t=data.analysis_template||{};
    box.innerHTML=`<h3>${t.title}</h3>
    <div class="academic-card">
      <table><tr><td>项目</td><td>说明</td></tr>${(t.fields||[]).map(f=>`<tr><td><strong>${f.name}</strong></td><td>${f.tip}</td></tr>`).join("")}</table>
      <button class="secondary" onclick="copyAcademicTemplate('analysis')">复制分析模板</button>
    </div>
    <div class="academic-card">
      <h3>示例分析</h3>
      <p><strong>原文：</strong>${t.example.source}</p>
      <p><strong>词形分析：</strong>${t.example.word_form}</p>
      <p><strong>句法功能：</strong>${t.example.syntax}</p>
      <p><strong>语义结构：</strong>${t.example.semantic}</p>
      <p><strong>结构类型：</strong>${t.example.type}</p>
      <p><strong>翻译选择：</strong>${t.example.translation}</p>
      <p><strong>可能误判：</strong>${t.example.pitfall}</p>
      <p><strong>研究价值：</strong>${t.example.research_value}</p>
    </div>`;
  }

  if(tabNow==="tasks"){
    box.innerHTML=`<h3>小型研究任务</h3><p class="muted">任务型训练用于把语言学习推进到研究能力训练。</p>
    <div class="academic-list">${(data.research_tasks||[]).map(t=>`
      <div class="academic-card">
        <span class="pattern-level ${t.level==='入门'?'tier-required':'tier-advanced'}">${t.level}</span>
        <h3>${t.title}</h3>
        <p><strong>任务目标：</strong>${t.goal}</p>
        <ol>${(t.steps||[]).map(s=>`<li>${s}</li>`).join("")}</ol>
        <div class="academic-output"><strong>提交形式：</strong>${t.output}</div>
      </div>`).join("")}</div>`;
  }

  if(tabNow==="pitfalls"){
    box.innerHTML=`<h3>学术研究常见误区</h3>
    <div class="academic-list">${(data.pitfalls||[]).map((p,i)=>`
      <div class="academic-card">
        <h3>${i+1}. ${p.title}</h3>
        <p><strong>修正方法：</strong>${p.fix}</p>
      </div>`).join("")}</div>`;
  }
}
function academicTemplateText(kind){
  const data=window.ACADEMIC_TRAINING_DATA||{};
  if(kind==="citation"){
    return (data.citation?.record_template||[]).join("\\n");
  }
  if(kind==="analysis"){
    const fields=data.analysis_template?.fields||[];
    return fields.map(f=>`${f.name}：`).join("\\n");
  }
  return "";
}
async function copyAcademicTemplate(kind){
  const text=academicTemplateText(kind);
  try{await navigator.clipboard.writeText(text);alert("模板已复制。")}catch{alert(text)}
}
function linkedAcademicTrainingHTML(lesson){
  if(!lesson||!lesson.linked_academic_training||!lesson.linked_academic_training.length)return "";
  const labels={method:"文献阅读方法",citation:"原典引用规范",vocabulary:"巴利词汇研究",analysis:"学术分析模板",tasks:"小型研究任务",pitfalls:"学术误区"};
  return `<div class="linked-academic-box"><strong>相关学术阅读训练：</strong><br>${lesson.linked_academic_training.map(k=>`<button class="academic-link-btn" data-academic-open="${k}">${labels[k]||k}</button>`).join("")}</div>`;
}
function bindAcademicButtons(){
  document.querySelectorAll("[data-academic-open]").forEach(btn=>{
    btn.onclick=()=>{switchView("academicTrainingView");renderAcademicTraining(btn.dataset.academicOpen);};
  });
}


function termCategories(){
  return ["全部", ...new Set((window.TERMINOLOGY_GLOSSARY||[]).map(x=>x.cat))];
}
function renderTermCategories(){
  const sel=$("termCategorySelect");
  if(!sel)return;
  const old=sel.value||"全部";
  sel.innerHTML="";
  termCategories().forEach(c=>{
    const o=document.createElement("option");
    o.value=c;o.textContent=c;sel.appendChild(o);
  });
  if([...sel.options].some(o=>o.value===old))sel.value=old;
}
function renderTerminologyGlossary(){
  const box=$("termGlossaryList");
  if(!box)return;
  const q=($("termSearchInput")?.value||"").trim().toLowerCase();
  const cat=$("termCategorySelect")?.value||"全部";
  const items=(window.TERMINOLOGY_GLOSSARY||[]).filter(t=>{
    const text=[t.cat,t.en,t.ipa,t.cn,t.pali,t.note].join(" ").toLowerCase();
    return (cat==="全部"||t.cat===cat)&&(!q||text.includes(q));
  });
  box.innerHTML=items.length?"":"<p class='muted'>没有找到相关术语。</p>";
  items.forEach(t=>{
    const details=document.createElement("details");
    details.className="term-card";
    details.innerHTML=`
      <summary>
        <span class="term-en">${t.en}</span>
        <span class="term-cn">${t.cn}</span>
        <span class="term-cat">${t.cat}</span>
      </summary>
      <div class="term-detail">
        <p><strong>英文：</strong>${t.en} <span class="ipa">${t.ipa}</span></p>
        <p><strong>中文：</strong>${t.cn}</p>
        <p><strong>巴利/传统术语：</strong>${t.pali}</p>
        <p><strong>说明：</strong>${t.note}</p>
      </div>
    `;
    box.appendChild(details);
  });
}
function linkedTerminologyHTML(lesson){
  if(!lesson)return "";
  const text=[lesson.title,lesson.summary,lesson.module,lesson.category,...(lesson.explanation||[])].join(" ").toLowerCase();
  const terms=(window.TERMINOLOGY_GLOSSARY||[]).filter(t=>{
    const keys=[t.en.toLowerCase(),t.cn.toLowerCase(),String(t.pali||"").toLowerCase()];
    return keys.some(k=>k&&k.length>2&&text.includes(k));
  }).slice(0,6);
  if(!terms.length)return "";
  return `<div class="linked-term-box"><strong>相关术语：</strong><br>${terms.map(t=>`<button class="term-link-btn" data-term-open="${t.en}">${t.en} / ${t.cn}</button>`).join("")}</div>`;
}
function bindTermButtons(){
  document.querySelectorAll("[data-term-open]").forEach(btn=>{
    btn.onclick=()=>{
      switchView("terminologyGlossaryView");
      renderTermCategories();
      if($("termSearchInput"))$("termSearchInput").value=btn.dataset.termOpen;
      if($("termCategorySelect"))$("termCategorySelect").value="全部";
      renderTerminologyGlossary();
    };
  });
}

async function init(){
  GRAMMAR=await (await fetch('grammar.json?v=11.4',{cache:'no-store'})).json();
  renderModules();renderSelect();renderWrong();search('');renderTraining();stats();

  if(typeof renderSentenceLevels==="function")renderSentenceLevels();
  if(typeof renderLinguisticsCategories==="function")renderLinguisticsCategories();
  if(typeof renderLinguisticsTips==="function")renderLinguisticsTips();
  if(typeof renderLearningRoutes==="function")renderLearningRoutes();
  if(typeof renderDictionarySites==="function")renderDictionarySites();
  if(typeof renderLookupHistory==="function")renderLookupHistory();
  if(typeof renderSiteHealth==="function")renderSiteHealth();
  if(typeof renderVersionStatus==="function")renderVersionStatus();
  if(typeof renderProgressSummary==="function")renderProgressSummary();
  if(typeof renderModuleGuides==="function")renderModuleGuides();

  document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{
    let a=b.dataset.action;
    if(a==='modules'){switchView('homeView');setTimeout(()=>document.getElementById('moduleGridCard')?.scrollIntoView({behavior:'smooth'}),50)}
    else if(a==='search')switchView('searchView');
    else if(a==='exercise')switchView('exerciseCenterView');
    else if(a==='training'){renderTraining();switchView('trainingView')}
    else if(a==='wrong'){renderWrong();switchView('wrongView')}
    else if(a==='learningRoute'){renderLearningRoutes();switchView('learningRouteView')}
    else if(a==='studentGuide')switchView('studentGuideView');
    else if(a==='dictionaryLookup'){renderDictionarySites();renderLookupHistory();switchView('dictionaryLookupView')}
    else if(a==='sentenceAnalysis'){renderSentenceLevels();switchView('sentenceAnalysisView')}
    else if(a==='sentencePatterns'){renderSentencePatterns();switchView('sentencePatternsView')}
    else if(a==='buddhistReading'){renderBuddhistReadingCategories();renderBuddhistReading();switchView('buddhistReadingView')}
    else if(a==='buddhistBackground'){renderBuddhistBackground('concepts');switchView('buddhistBackgroundView')}
    else if(a==='academicTraining'){renderAcademicTraining('method');switchView('academicTrainingView')}
    else if(a==='linguisticsTips'){renderLinguisticsCategories();renderLinguisticsTips();switchView('linguisticsTipsView')}
    else if(a==='terminologyGlossary'){renderTermCategories();renderTerminologyGlossary();switchView('terminologyGlossaryView')}
    else if(a==='learningProgress'){renderProgressSummary();switchView('learningProgressView')}
    else if(a==='moduleGuide'){renderModuleGuides();switchView('moduleGuideView')}
    else if(a==='confusionPairs'){renderConfusionPairs();switchView('confusionPairsView')}
    else if(a==='trialTasks'){renderTrialTasks();switchView('trialTasksView')}
    else if(a==='modules'){switchView('homeView');setTimeout(()=>document.getElementById('moduleGridCard')?.scrollIntoView({behavior:'smooth'}),80)}
    else switchView('homeView');
  });

  document.querySelectorAll('.back-home').forEach(b=>b.onclick=()=>switchView('homeView'));
  if($('backHomeFromListBtn'))$('backHomeFromListBtn').onclick=()=>switchView('homeView');
  if($('backToListBtn'))$('backToListBtn').onclick=()=>switchView(lastView==='searchView'?'searchView':'lessonListView');

  document.querySelectorAll('.status-btn').forEach(b=>b.onclick=()=>currentLesson&&setLStat(currentLesson.id,b.dataset.status));
  document.querySelectorAll('.filter-btn').forEach(b=>b.onclick=()=>{currentFilter=b.dataset.filter;document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderLessonList(currentModule)});
  if($('startCardsBtn'))$('startCardsBtn').onclick=()=>startCards(currentLesson.cards||[]);
  if($('showCardAnswerBtn'))$('showCardAnswerBtn').onclick=()=>{show('cardAnswer');hide('cardBeforeButtons');show('cardAfterButtons')};
  if($('cardKnowBtn'))$('cardKnowBtn').onclick=nextCard;
  if($('cardWrongBtn'))$('cardWrongBtn').onclick=nextCard;
  if($('exitCardsBtn'))$('exitCardsBtn').onclick=()=>hide('cardPanel');
  if($('startLessonExercisesBtn'))$('startLessonExercisesBtn').onclick=()=>startExercises((currentLesson.exercises||[]).map(ex=>({...ex,lesson_id:currentLesson.id,lesson_title:currentLesson.title,module:currentLesson.module})),'本课练习');
  if($('startMixedExercisesBtn'))$('startMixedExercisesBtn').onclick=()=>startExercises(shuffle(allEx($('exerciseModuleSelect').value)).slice(0,parseInt($('exerciseCountInput').value||'10')),'练习');
  if($('submitExerciseBtn'))$('submitExerciseBtn').onclick=submitExercise;
  if($('nextExerciseBtn'))$('nextExerciseBtn').onclick=nextEx;
  if($('exitExerciseBtn'))$('exitExerciseBtn').onclick=()=>hide('exercisePanel');
  document.querySelectorAll('#paliKeyboard button').forEach(b=>b.onclick=()=>{let i=$('exerciseInput'),ch=b.dataset.char,s=i.selectionStart||i.value.length,e=i.selectionEnd||i.value.length;i.value=i.value.slice(0,s)+ch+i.value.slice(e);i.focus();i.selectionStart=i.selectionEnd=s+ch.length});
  if($('startWrongBtn'))$('startWrongBtn').onclick=()=>startExercises(shuffle(Object.values(getW())),'错题复习');
  if($('clearWrongBtn'))$('clearWrongBtn').onclick=()=>{if(confirm('确定清空所有错题记录吗？')){saveW({});renderWrong()}};
  if($('searchInput'))$('searchInput').oninput=e=>search(e.target.value);

  if($('sentenceLevelSelect'))$('sentenceLevelSelect').onchange=renderSentenceSelect;
  if($('sentenceTagSelect'))$('sentenceTagSelect').onchange=renderSentenceSelect;
  if($('sentenceSourceSelect'))$('sentenceSourceSelect').onchange=renderSentenceSelect;
  if($('sentencePrioritySelect'))$('sentencePrioritySelect').onchange=renderSentenceSelect;
  if($('sentenceStatusSelect'))$('sentenceStatusSelect').onchange=renderSentenceSelect;
  if($('sentenceSelect'))$('sentenceSelect').onchange=()=>renderSentenceCard('question');
  if($('showSentenceHintBtn'))$('showSentenceHintBtn').onclick=()=>renderSentenceCard('hint');
  if($('showSentenceAnalysisBtn'))$('showSentenceAnalysisBtn').onclick=()=>renderSentenceCard('analysis');
  if($('nextSentenceBtn'))$('nextSentenceBtn').onclick=nextSentence;
  if($('randomSentenceBtn'))$('randomSentenceBtn').onclick=randomSentence;
  if($('markSentenceMasteredBtn'))$('markSentenceMasteredBtn').onclick=()=>{const item=currentSentence();if(item){setSentenceStatus(item.id,'已掌握');renderSentenceSelect(true)}};
  if($('markSentenceReviewBtn'))$('markSentenceReviewBtn').onclick=()=>{const item=currentSentence();if(item){setSentenceStatus(item.id,'需复习');renderSentenceSelect(true)}};
  if($('copySentenceAnalysisBtn'))$('copySentenceAnalysisBtn').onclick=copyCurrentSentenceAnalysis;
  if($('startBasicSentenceBtn'))$('startBasicSentenceBtn').onclick=startBasicSentenceRoute;
  if($('showReviewSentenceBtn'))$('showReviewSentenceBtn').onclick=showReviewSentenceRoute;
  if($('resetSentenceFiltersBtn'))$('resetSentenceFiltersBtn').onclick=resetSentenceFilters;

  if($('linguisticsSearchInput'))$('linguisticsSearchInput').oninput=renderLinguisticsTips;
  if($('linguisticsCategorySelect'))$('linguisticsCategorySelect').onchange=renderLinguisticsTips;
  if($('closeTipModalBtn'))$('closeTipModalBtn').onclick=closeTipModal;

  if($('copyLookupWordBtn'))$('copyLookupWordBtn').onclick=copyLookupWord;
  if($('openPrimaryDictBtn'))$('openPrimaryDictBtn').onclick=openPrimaryDictionary;
  if($('clearLookupWordBtn'))$('clearLookupWordBtn').onclick=clearLookupWord;
  if($('analyzeLookupWordBtn'))$('analyzeLookupWordBtn').onclick=()=>analyzePaliToken();
  if($('selectedWordAnalyzeBtn'))$('selectedWordAnalyzeBtn').onclick=analyzeSelectedText;
  if($('openDictAfterAnalyzeBtn'))$('openDictAfterAnalyzeBtn').onclick=analyzeAndLookup;

  if($('refreshCacheBtn'))$('refreshCacheBtn').onclick=refreshSiteCache;
  if($('runSiteCheckBtn'))$('runSiteCheckBtn').onclick=()=>{renderSiteHealth();checkRequiredFiles();};

  if($('exportProgressBtn'))$('exportProgressBtn').onclick=exportProgress;
  if($('importProgressBtn'))$('importProgressBtn').onclick=importProgress;
  if($('clearProgressBtn'))$('clearProgressBtn').onclick=clearProgress;
  if($('copyFeedbackBtn'))$('copyFeedbackBtn').onclick=copyFeedbackTemplate;
  if($('resetTrialTasksBtn'))$('resetTrialTasksBtn').onclick=resetTrialTasks;
  if($('copyTrialFeedbackBtn'))$('copyTrialFeedbackBtn').onclick=copyTrialFeedback;
  if($('goTrialRouteBtn'))$('goTrialRouteBtn').onclick=()=>{renderLearningRoutes();switchView('learningRouteView')};

  /* 11.9：停止注册新的 Service Worker，避免旧缓存导致按钮失效。 */
}
init().catch(e=>{
  console.error(e);
  alert('加载失败：请确认 21 个网站文件都已上传，并清理旧缓存。错误：'+(e&&e.message?e.message:e));
});



/* ===== Pali Grammar 11.9: all-button fallback patch ===== */
(function(){
  function byId(id){return document.getElementById(id);}
  function safeShow(id){const el=byId(id); if(el)el.classList.remove('hidden');}
  function safeHide(id){const el=byId(id); if(el)el.classList.add('hidden');}
  function safeSwitch(id){
    document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
    const target=byId(id)||byId('homeView');
    if(target)target.classList.remove('hidden');
    window.scrollTo({top:0, behavior:'smooth'});
  }
  function call(fnName, ...args){
    try{
      if(typeof window[fnName]==='function') return window[fnName](...args);
      if(typeof eval(fnName)==='function') return eval(fnName)(...args);
    }catch(e){console.warn('调用失败：'+fnName, e);}
  }
  function openHome(){safeSwitch('homeView');}
  function route(action){
    try{
      if(action==='modules'){
        safeSwitch('homeView');
        setTimeout(()=>byId('moduleGridCard')?.scrollIntoView({behavior:'smooth', block:'start'}),80);
        return;
      }
      const map={
        search:'searchView',
        exercise:'exerciseCenterView',
        training:'trainingView',
        wrong:'wrongView',
        learningRoute:'learningRouteView',
        studentGuide:'studentGuideView',
        trialTasks:'trialTasksView',
        moduleGuide:'moduleGuideView',
        sentenceAnalysis:'sentenceAnalysisView',
        sentencePatterns:'sentencePatternsView',
        confusionPairs:'confusionPairsView',
        dictionaryLookup:'dictionaryLookupView',
        linguisticsTips:'linguisticsTipsView',
        terminologyGlossary:'terminologyGlossaryView',
        buddhistReading:'buddhistReadingView',
        buddhistBackground:'buddhistBackgroundView',
        academicTraining:'academicTrainingView',
        learningProgress:'learningProgressView'
      };
      const init={
        training:['renderTraining'],
        wrong:['renderWrong'],
        learningRoute:['renderLearningRoutes'],
        trialTasks:['renderTrialTasks'],
        moduleGuide:['renderModuleGuides'],
        sentenceAnalysis:['renderSentenceLevels'],
        sentencePatterns:['renderSentencePatterns'],
        confusionPairs:['renderConfusionPairs'],
        dictionaryLookup:['renderDictionarySites','renderLookupHistory'],
        linguisticsTips:['renderLinguisticsCategories','renderLinguisticsTips'],
        terminologyGlossary:['renderTermCategories','renderTerminologyGlossary'],
        buddhistReading:['renderBuddhistReadingCategories','renderBuddhistReading'],
        learningProgress:['renderProgressSummary']
      };
      (init[action]||[]).forEach(name=>call(name));
      if(action==='buddhistBackground')call('renderBuddhistBackground','concepts');
      if(action==='academicTraining')call('renderAcademicTraining','method');
      safeSwitch(map[action]||'homeView');
    }catch(e){console.error('route failed', action, e); alert('页面打开失败：'+(e.message||e));}
  }
  function clickId(id){
    switch(id){
      case 'backHomeFromListBtn':
      case 'backHomeBtn':
        openHome(); return true;
      case 'backToListBtn':
        try{safeSwitch(typeof lastView!=='undefined' && lastView==='searchView' ? 'searchView' : 'lessonListView');}catch{safeSwitch('lessonListView');}
        return true;
      case 'startCardsBtn':
        try{if(typeof startCards==='function')startCards((currentLesson&&currentLesson.cards)||[]);}catch(e){alert('卡片打开失败：'+e.message);}
        return true;
      case 'showCardAnswerBtn':
        safeShow('cardAnswer'); safeHide('cardBeforeButtons'); safeShow('cardAfterButtons'); return true;
      case 'cardKnowBtn':
      case 'cardWrongBtn':
        call('nextCard'); return true;
      case 'exitCardsBtn':
        safeHide('cardPanel'); return true;
      case 'startLessonExercisesBtn':
        try{
          const items=((currentLesson&&currentLesson.exercises)||[]).map(ex=>({...ex,lesson_id:currentLesson.id,lesson_title:currentLesson.title,module:currentLesson.module}));
          if(typeof startExercises==='function')startExercises(items,'本课练习');
        }catch(e){alert('练习打开失败：'+e.message);}
        return true;
      case 'startMixedExercisesBtn':
        try{
          const mod=byId('exerciseModuleSelect')?.value||'入门与发音';
          const n=parseInt(byId('exerciseCountInput')?.value||'10');
          if(typeof startExercises==='function' && typeof shuffle==='function' && typeof allEx==='function')startExercises(shuffle(allEx(mod)).slice(0,n),'练习');
        }catch(e){alert('练习打开失败：'+e.message);}
        return true;
      case 'submitExerciseBtn':
        call('submitExercise'); return true;
      case 'nextExerciseBtn':
        call('nextEx'); return true;
      case 'exitExerciseBtn':
        safeHide('exercisePanel'); return true;
      case 'startWrongBtn':
        call('renderWrong'); safeSwitch('wrongView'); return true;
      case 'clearWrongBtn':
        try{localStorage.removeItem('pali_grammar_wrong_exercises_v1'); call('renderWrong'); alert('错题已清空。');}catch(e){}
        return true;
      case 'copyLookupWordBtn':
        call('copyLookupWord'); return true;
      case 'openPrimaryDictBtn':
        call('openPrimaryDictionary'); return true;
      case 'clearLookupWordBtn':
        call('clearLookupWord'); return true;
      case 'analyzeLookupWordBtn':
        call('analyzePaliToken'); return true;
      case 'selectedWordAnalyzeBtn':
        call('analyzeSelectedText'); return true;
      case 'openDictAfterAnalyzeBtn':
        call('analyzeAndLookup'); return true;
      case 'showSentenceHintBtn':
        call('renderSentenceCard','hint'); return true;
      case 'showSentenceAnalysisBtn':
        call('renderSentenceCard','analysis'); return true;
      case 'nextSentenceBtn':
        call('nextSentence'); return true;
      case 'randomSentenceBtn':
        call('randomSentence'); return true;
      case 'markSentenceMasteredBtn':
        call('markSentenceStatus','已掌握'); return true;
      case 'markSentenceReviewBtn':
        call('markSentenceStatus','需复习'); return true;
      case 'copySentenceAnalysisBtn':
        call('copySentenceAnalysis'); return true;
      case 'copyFeedbackBtn':
        call('copyFeedbackTemplate'); return true;
      case 'exportProgressBtn':
        call('exportProgress'); return true;
      case 'importProgressBtn':
        call('importProgress'); return true;
      case 'clearProgressBtn':
        call('clearProgress'); return true;
      case 'refreshCacheBtn':
        if(typeof forceClearAllCaches==='function')forceClearAllCaches(); else location.href='./cache-reset.html?v=11.9';
        return true;
      case 'runSiteCheckBtn':
        call('renderSiteHealth'); call('checkRequiredFiles'); return true;
      case 'resetTrialTasksBtn':
        call('resetTrialTasks'); return true;
      case 'copyTrialFeedbackBtn':
        call('copyTrialFeedback'); return true;
      case 'goTrialRouteBtn':
        call('renderLearningRoutes'); safeSwitch('learningRouteView'); return true;
    }
    return false;
  }
  document.addEventListener('click', function(e){
    const actionBtn=e.target.closest('[data-action]');
    if(actionBtn){e.preventDefault();e.stopImmediatePropagation();route(actionBtn.dataset.action);return;}
    if(e.target.closest('.back-home')){e.preventDefault();e.stopImmediatePropagation();openHome();return;}
    const idBtn=e.target.closest('button[id], a[id]');
    if(idBtn && clickId(idBtn.id)){e.preventDefault();e.stopImmediatePropagation();return;}
    const opt=e.target.closest('.option-btn');
    if(opt){
      try{
        selectedChoice=opt.textContent;
        document.querySelectorAll('.option-btn').forEach(x=>x.classList.remove('selected'));
        opt.classList.add('selected');
      }catch(e){}
      return;
    }
    const dict=e.target.closest('[data-dict-url]');
    if(dict){e.preventDefault();e.stopImmediatePropagation();window.open(dict.dataset.dictUrl,'_blank','noopener');return;}
    const lemma=e.target.closest('[data-lemma]');
    if(lemma){
      e.preventDefault();e.stopImmediatePropagation();
      if(byId('paliLookupInput'))byId('paliLookupInput').value=lemma.dataset.lemma;
      call('analyzePaliToken', lemma.dataset.lemma);
      return;
    }
    const hist=e.target.closest('[data-lookup-history]');
    if(hist){
      e.preventDefault();e.stopImmediatePropagation();
      if(byId('paliLookupInput'))byId('paliLookupInput').value=hist.dataset.lookupHistory;
      return;
    }
    const tokenLookup=e.target.closest('[data-token-lookup]');
    if(tokenLookup){e.preventDefault();e.stopImmediatePropagation();call('lookupToken',tokenLookup.dataset.tokenLookup);return;}
    const tokenAnalyze=e.target.closest('[data-token-analyze]');
    if(tokenAnalyze){e.preventDefault();e.stopImmediatePropagation();safeSwitch('dictionaryLookupView');call('renderDictionarySites');call('analyzePaliToken',tokenAnalyze.dataset.tokenAnalyze);return;}
  }, true);
  window.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('button').forEach(b=>{if(!b.getAttribute('type'))b.setAttribute('type','button')});
    const badge=document.querySelector('.visual-version-badge');
    if(badge)badge.textContent='Pāli Learning Lab · 12.1 术语全表版';
  });
})();

async function forceClearAllCaches(){
  try{
    if('serviceWorker' in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r=>r.unregister()));
    }
    if(window.caches){
      const keys=await caches.keys();
      await Promise.all(keys.map(k=>caches.delete(k)));
    }
    location.href='./index.html?v=11.4&cache=cleared&ts='+Date.now();
  }catch(e){
    alert('缓存清理失败，请手动 Ctrl+F5。'+e);
  }
}





/* ===== Pali Grammar 12.1: terminology full table patch ===== */
function renderTermCategories(){
  const sel=$("termCategorySelect");
  if(!sel)return;
  const old=sel.value||"全部";
  const categories=["全部", ...new Set((window.TERMINOLOGY_GLOSSARY||[]).map(x=>x.cat))];
  sel.innerHTML="";
  categories.forEach(c=>{
    const o=document.createElement("option");
    o.value=c;
    o.textContent=c;
    sel.appendChild(o);
  });
  if([...sel.options].some(o=>o.value===old))sel.value=old;
}

function renderTerminologyGlossary(){
  const box=$("termGlossaryList");
  if(!box)return;
  const q=($("termSearchInput")?.value||"").trim().toLowerCase();
  const cat=$("termCategorySelect")?.value||"全部";
  const items=(window.TERMINOLOGY_GLOSSARY||[]).filter(t=>{
    const text=[t.cat,t.en,t.ipa,t.cn,t.pali,t.note].join(" ").toLowerCase();
    return (cat==="全部"||t.cat===cat)&&(!q||text.includes(q));
  });

  if(!items.length){
    box.innerHTML="<p class='muted'>没有找到相关术语。</p>";
    return;
  }

  box.innerHTML=`
    <div class="term-count">共显示 <strong>${items.length}</strong> 条术语</div>
    <div class="term-table-wrap">
      <table class="term-table">
        <thead>
          <tr>
            <th>英文术语</th>
            <th>IPA</th>
            <th>中文</th>
            <th>巴利 / 传统术语</th>
            <th>类别</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(t=>`
            <tr>
              <td class="term-en-cell">${t.en}</td>
              <td><span class="ipa">${t.ipa}</span></td>
              <td class="term-cn-cell">${t.cn}</td>
              <td>${t.pali}</td>
              <td><span class="term-cat">${t.cat}</span></td>
              <td>${t.note}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}
