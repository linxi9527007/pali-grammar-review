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

const WRONG_KEY = "pali_grammar_wrong_exercises_v1";
const STATUS_KEY = "pali_grammar_lesson_status_v2";
const FEEDBACK_KEY = "pali_grammar_feedback_drafts_v1";
const VERSION = "7.5";

const MODULE_ORDER = [
  "入门与发音",
  "动词系统",
  "名词变格",
  "代词与形容词",
  "分词与非限定动词",
  "不变词与常用句式",
  "句法与阅读",
  "其他"
];

const PATHS = [
  {
    title: "第一阶段：先能读懂词形",
    modules: ["入门与发音", "动词系统", "名词变格"],
    note: "重点：发音、现在时、-a 名词、基础格位。"
  },
  {
    title: "第二阶段：进入动词系统",
    modules: ["动词系统", "分词与非限定动词"],
    note: "重点：将来时、过去时、命令/祈愿、不定式、连续体。"
  },
  {
    title: "第三阶段：读句子",
    modules: ["代词与形容词", "不变词与常用句式", "句法与阅读"],
    note: "重点：代词、ca/vā/eva/iti、关联结构、八格用法。"
  },
  {
    title: "第四阶段：综合复习",
    modules: ["全部模块"],
    note: "混合练习、错题复习、卡片复习。"
  }
];


const TRAINING_PRESETS = [
  {
    key: "case",
    title: "格位识别专项",
    desc: "集中练习主格、宾格、工具格、处格、属格等。",
  },
  {
    key: "verb",
    title: "动词变位专项",
    desc: "集中练习现在时、将来时、过去时、命令语气、祈愿语气等。",
  },
  {
    key: "nonfinite",
    title: "非限定动词专项",
    desc: "集中练习不定式、连续体、现在分词、过去分词。",
  },
  {
    key: "particles",
    title: "不变词与句型专项",
    desc: "集中练习 na、mā、ca、vā、eva、iti、yo...so... 等。",
  },
  {
    key: "reading",
    title: "阅读分析专项",
    desc: "集中练习短句中的主语、宾语、动词、格位和结构。",
  },
  {
    key: "input",
    title: "输入生成专项",
    desc: "只练需要手动输入答案的题目，适合背词形。",
  }
];

function exercisesForTraining(key) {
  const all = GRAMMAR.flatMap(lesson => (lesson.exercises || []).map(ex => ({
    ...ex,
    lesson_id: lesson.id,
    lesson_title: lesson.title,
    module: lesson.module,
    category: lesson.category,
    difficulty: lesson.difficulty || lesson.level
  })));

  if (key === "input") {
    return all.filter(ex => ex.type === "input");
  }

  if (key === "case") {
    return all.filter(ex => {
      const text = `${ex.question} ${ex.explanation || ""} ${ex.lesson_title || ""} ${ex.category || ""}`;
      return /格|主格|宾格|工具格|处格|属格|与格|从格|呼格|形式/.test(text)
        && !/动词|不定式|连续体/.test(text);
    });
  }

  if (key === "verb") {
    return all.filter(ex => {
      const text = `${ex.question} ${ex.explanation || ""} ${ex.lesson_title || ""} ${ex.category || ""}`;
      return /动词|现在时|将来时|过去|命令|祈愿|条件式|使役|被动|人称|词尾/.test(text);
    });
  }

  if (key === "nonfinite") {
    return all.filter(ex => {
      const text = `${ex.question} ${ex.explanation || ""} ${ex.lesson_title || ""} ${ex.category || ""}`;
      return /不定式|连续体|分词|gantvā|gantuṃ|katvā|kātuṃ|sutvā|desetuṃ|bhavituṃ/.test(text);
    });
  }

  if (key === "particles") {
    return all.filter(ex => {
      const text = `${ex.question} ${ex.explanation || ""} ${ex.lesson_title || ""} ${ex.category || ""}`;
      return /不变词|na|mā|ca|vā|eva|yeva|iti|ti|kho|pana|hi|yo|so|yadā|tadā|yattha|tattha|yathā|tathā|yāva|tāva|关联|引语|否定|并列|选择/.test(text);
    });
  }

  if (key === "reading") {
    return all.filter(ex => ex.lesson_id === 75 || ex.category === "阅读训练");
  }

  return all;
}

function renderTrainingPresets() {
  const grid = $("trainingGrid");
  if (!grid) return;
  grid.innerHTML = "";

  TRAINING_PRESETS.forEach(preset => {
    const count = exercisesForTraining(preset.key).length;
    const div = document.createElement("div");
    div.className = "training-card";
    div.innerHTML = `
      <h3>${preset.title}</h3>
      <p class="muted">${preset.desc}</p>
      <p class="muted">${count} 道可练习题</p>
      <button class="primary">开始专项训练</button>
    `;
    div.addEventListener("click", () => {
      const items = shuffle(exercisesForTraining(preset.key)).slice(0, 20);
      startExercises(items, preset.title);
    });
    grid.appendChild(div);
  });
}

function $(id) {
  return document.getElementById(id);
}

function show(id) {
  $(id).classList.remove("hidden");
}

function hide(id) {
  $(id).classList.add("hidden");
}

function normalizeAnswer(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function stripPaliDiacritics(text) {
  const map = {
    "ā": "a", "ī": "i", "ū": "u",
    "ṅ": "n", "ñ": "n", "ṭ": "t", "ḍ": "d",
    "ṇ": "n", "ḷ": "l", "ṃ": "m", "ṁ": "m",
    "Ā": "a", "Ī": "i", "Ū": "u",
    "Ṅ": "n", "Ñ": "n", "Ṭ": "t", "Ḍ": "d",
    "Ṇ": "n", "Ḷ": "l", "Ṃ": "m", "Ṁ": "m"
  };
  return String(text || "").replace(/[āīūṅñṭḍṇḷṃṁĀĪŪṄÑṬḌṆḶṂṀ]/g, ch => map[ch] || ch);
}

function answerAccepted(userAnswer, expectedAnswer) {
  const user = normalizeAnswer(userAnswer);
  const expected = normalizeAnswer(expectedAnswer);

  if (user === expected) return true;

  const looseUser = stripPaliDiacritics(user);
  const looseExpected = stripPaliDiacritics(expected);

  if (looseUser === looseExpected) return true;

  const alternatives = expected
    .split(/\s*\/\s*|；|;|，|,|、/)
    .map(item => item.trim())
    .filter(Boolean);

  return alternatives.some(item => {
    const normalized = normalizeAnswer(item);
    return user === normalized || looseUser === stripPaliDiacritics(normalized);
  });
}

function getWrongRecords() {
  try {
    return JSON.parse(localStorage.getItem(WRONG_KEY)) || {};
  } catch {
    return {};
  }
}

function saveWrongRecords(records) {
  localStorage.setItem(WRONG_KEY, JSON.stringify(records));
  updateStats();
}

function addWrong(exercise) {
  const records = getWrongRecords();
  records[exercise.id] = {
    ...exercise,
    wrong_at: new Date().toISOString()
  };
  saveWrongRecords(records);
}

function removeWrong(exerciseId) {
  const records = getWrongRecords();
  delete records[exerciseId];
  saveWrongRecords(records);
}

function getStatuses() {
  try {
    return JSON.parse(localStorage.getItem(STATUS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveStatuses(statuses) {
  localStorage.setItem(STATUS_KEY, JSON.stringify(statuses));
  updateStats();
}

function getLessonStatus(id) {
  return getStatuses()[id] || "未学";
}

function setLessonStatus(id, status) {
  const statuses = getStatuses();
  statuses[id] = status;
  saveStatuses(statuses);
  updateStatusButtons();
  renderModules();
  renderPath();
  renderDailyBox();
  if (currentModule) renderLessonList(currentModule);
  renderSearchResults($("searchInput")?.value || "");
}

function statusClass(status) {
  if (status === "已掌握") return "mastered";
  if (status === "学习中") return "learning";
  if (status === "需复习") return "review";
  return "new";
}

function updateStats() {
  const totalExercises = GRAMMAR.reduce((sum, lesson) => sum + (lesson.exercises || []).length, 0);
  const statuses = getStatuses();
  const mastered = GRAMMAR.filter(lesson => statuses[lesson.id] === "已掌握").length;

  $("totalLessons").textContent = GRAMMAR.length;
  $("totalExercises").textContent = totalExercises;
  $("masteredCount").textContent = mastered;
  $("wrongCount").textContent = Object.keys(getWrongRecords()).length;
}

function lessonsForModule(moduleName) {
  if (moduleName === "全部模块") return GRAMMAR;
  return GRAMMAR.filter(item => item.module === moduleName);
}

function groupByModule() {
  const grouped = {};
  for (const moduleName of MODULE_ORDER) grouped[moduleName] = [];
  GRAMMAR.forEach(lesson => {
    const moduleName = lesson.module || "其他";
    if (!grouped[moduleName]) grouped[moduleName] = [];
    grouped[moduleName].push(lesson);
  });
  return grouped;
}

function progressHTML(lessons) {
  const mastered = lessons.filter(lesson => getLessonStatus(lesson.id) === "已掌握").length;
  const percent = lessons.length ? Math.round((mastered / lessons.length) * 100) : 0;
  return `
    <div class="progress-wrap">
      <div class="progress-bar" style="width:${percent}%"></div>
    </div>
    <p class="muted">掌握进度：${mastered}/${lessons.length}（${percent}%）</p>
  `;
}

function lessonCardHTML(lesson) {
  const status = getLessonStatus(lesson.id);
  const exercises = (lesson.exercises || []).length;
  return `
    <h3>${lesson.lesson_number || lesson.id}. ${lesson.title}</h3>
    <div class="lesson-badges">
      <span class="badge ${statusClass(status)}">${status}</span>
      <span class="badge">${lesson.category || ""}</span>
      <span class="badge">${lesson.difficulty || lesson.level || ""}</span>
      <span class="badge">${exercises} 题</span>
    </div>
    <p>${lesson.summary || ""}</p>
  `;
}

function renderPath() {
  const grid = $("pathGrid");
  grid.innerHTML = "";

  PATHS.forEach(path => {
    const lessons = path.modules.includes("全部模块")
      ? GRAMMAR
      : path.modules.flatMap(m => lessonsForModule(m));
    const div = document.createElement("div");
    div.className = "path-card";
    div.innerHTML = `
      <h3>${path.title}</h3>
      <p class="muted">${path.note}</p>
      ${progressHTML(lessons)}
    `;
    div.addEventListener("click", () => {
      if (path.modules.length === 1 && path.modules[0] !== "全部模块") {
        switchView("modulesView");
        openModule(path.modules[0]);
      } else {
        switchView("exerciseCenterView");
        $("exerciseModuleSelect").value = path.modules[0] || "全部模块";
      }
    });
    grid.appendChild(div);
  });
}

function renderDailyBox() {
  const statuses = getStatuses();
  const reviewLessons = GRAMMAR.filter(l => statuses[l.id] === "需复习");
  const learningLessons = GRAMMAR.filter(l => statuses[l.id] === "学习中");
  const wrongCount = Object.keys(getWrongRecords()).length;

  $("dailyBox").innerHTML = `
    <div class="daily-item"><strong>${reviewLessons.length}</strong><span>需复习语法点</span></div>
    <div class="daily-item"><strong>${learningLessons.length}</strong><span>学习中语法点</span></div>
    <div class="daily-item"><strong>${wrongCount}</strong><span>待复习错题</span></div>
  `;
}

function renderModules() {
  const grid = $("moduleGrid");
  grid.innerHTML = "";

  const grouped = groupByModule();

  MODULE_ORDER.forEach(moduleName => {
    const lessons = grouped[moduleName] || [];
    if (!lessons.length) return;

    const exercises = lessons.reduce((sum, lesson) => sum + (lesson.exercises || []).length, 0);
    const div = document.createElement("div");
    div.className = "module-card";
    div.innerHTML = `
      <h3>${moduleName}</h3>
      <p class="muted">${lessons.length} 个语法点｜${exercises} 道练习</p>
      ${progressHTML(lessons)}
    `;
    div.addEventListener("click", () => openModule(moduleName));
    grid.appendChild(div);
  });
}

function renderLessonList(moduleName) {
  currentModule = moduleName;
  const lessons = lessonsForModule(moduleName).filter(lesson => {
    if (currentFilter === "全部") return true;
    return getLessonStatus(lesson.id) === currentFilter;
  });

  $("moduleTitle").textContent = moduleName;
  $("moduleSubtitle").textContent = `${lessonsForModule(moduleName).length} 个语法点`;
  $("lessonList").innerHTML = "";

  if (!lessons.length) {
    $("lessonList").innerHTML = `<p class="muted">当前筛选下没有语法点。</p>`;
    return;
  }

  lessons.forEach(lesson => {
    const div = document.createElement("div");
    div.className = "lesson-item";
    div.innerHTML = lessonCardHTML(lesson);
    div.addEventListener("click", () => openLesson(lesson.id));
    $("lessonList").appendChild(div);
  });
}

function openModule(moduleName) {
  currentFilter = "全部";
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === "全部");
  });
  renderLessonList(moduleName);
  show("lessonListPanel");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateStatusButtons() {
  if (!currentLesson) return;
  const status = getLessonStatus(currentLesson.id);
  document.querySelectorAll(".status-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.status === status);
  });
}

function openLesson(id) {
  currentLesson = GRAMMAR.find(item => item.id === id);
  if (!currentLesson) return;

  $("lessonModule").textContent = currentLesson.module || "";
  $("lessonTitle").textContent = currentLesson.title;
  $("lessonMeta").textContent = `${currentLesson.category || ""}｜${currentLesson.difficulty || currentLesson.level || ""}`;

  $("sourceStatus").textContent = currentLesson.source_status || currentLesson.status || "";
  const sources = currentLesson.verified_sources || [];
  $("sourceList").innerHTML = sources.length
    ? `<ul>${sources.map(s => `<li>${s}</li>`).join("")}</ul>`
    : "";

  $("lessonSummary").textContent = currentLesson.summary || "";

  const exp = $("lessonExplanation");
  exp.innerHTML = "";
  (currentLesson.explanation || []).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    exp.appendChild(li);
  });

  const table = $("lessonTable");
  table.innerHTML = "";
  (currentLesson.table || []).forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  const examples = $("lessonExamples");
  examples.innerHTML = "";
  (currentLesson.examples || []).forEach(ex => {
    const div = document.createElement("div");
    div.className = "example";
    div.innerHTML = `
      <div class="pali">${ex.pali || ""}</div>
      <div>${ex.cn || ""}</div>
      <div class="muted">${ex.note || ""}</div>
    `;
    examples.appendChild(div);
  });

  updateStatusButtons();
  show("lessonPanel");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeLesson() {
  hide("lessonPanel");
}

function startCards(cards) {
  cardItems = cards || [];
  cardIndex = 0;
  if (!cardItems.length) {
    alert("当前没有卡片。");
    return;
  }
  show("cardPanel");
  hide("exercisePanel");
  renderCard();
}

function renderCard() {
  const card = cardItems[cardIndex];
  $("cardProgress").textContent = `卡片 ${cardIndex + 1}/${cardItems.length}`;
  $("cardQuestion").textContent = card.q;
  $("cardAnswer").textContent = card.a;
  hide("cardAnswer");
  show("cardBeforeButtons");
  hide("cardAfterButtons");
}

function nextCard() {
  cardIndex += 1;
  if (cardIndex >= cardItems.length) {
    alert("卡片复习完成。");
    hide("cardPanel");
    return;
  }
  renderCard();
}

function allExercisesForModule(moduleName) {
  return lessonsForModule(moduleName).flatMap(lesson => (lesson.exercises || []).map(ex => ({
    ...ex,
    lesson_id: lesson.id,
    lesson_title: lesson.title,
    module: lesson.module,
    difficulty: lesson.difficulty || lesson.level
  })));
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function startExercises(items, title = "练习") {
  exerciseItems = items || [];
  exerciseIndex = 0;
  selectedChoice = "";
  exerciseStats = { total: 0, right: 0, wrong: 0 };

  if (!exerciseItems.length) {
    alert("当前没有练习题。");
    return;
  }

  $("exerciseModeTitle").textContent = title;
  show("exercisePanel");
  hide("cardPanel");
  renderExercise();
}

function renderExercise() {
  const ex = exerciseItems[exerciseIndex];
  selectedChoice = "";

  $("exerciseProgress").textContent = `题目 ${exerciseIndex + 1}/${exerciseItems.length}｜正确 ${exerciseStats.right}｜错误 ${exerciseStats.wrong}`;
  $("exerciseLessonLabel").textContent = `${ex.module || ""}｜${ex.lesson_title || ""}`;
  $("exerciseQuestion").textContent = ex.question;
  $("exerciseFeedback").innerHTML = "";
  $("exerciseFeedback").className = "answer-box hidden";
  hide("exerciseFeedback");
  hide("nextExerciseBtn");
  show("submitExerciseBtn");
  $("submitExerciseBtn").disabled = false;

  const optionsDiv = $("exerciseOptions");
  const input = $("exerciseInput");
  optionsDiv.innerHTML = "";
  input.value = "";

  if (ex.type === "choice") {
    hide("exerciseInput");
    hide("paliKeyboard");
    (ex.options || []).forEach(option => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = option;
      btn.addEventListener("click", () => {
        selectedChoice = option;
        document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
      optionsDiv.appendChild(btn);
    });
  } else {
    show("exerciseInput");
    show("paliKeyboard");
  }
}

function submitExercise() {
  const ex = exerciseItems[exerciseIndex];
  let userAnswer = "";

  if (ex.type === "choice") {
    userAnswer = selectedChoice;
    if (!userAnswer) {
      alert("请先选择一个答案。");
      return;
    }
  } else {
    userAnswer = $("exerciseInput").value;
    if (!userAnswer.trim()) {
      alert("请先输入答案。");
      return;
    }
  }

  const correct = answerAccepted(userAnswer, ex.answer);
  exerciseStats.total += 1;

  if (correct) {
    exerciseStats.right += 1;
    removeWrong(ex.id);
  } else {
    exerciseStats.wrong += 1;
    addWrong(ex);
  }

  $("exerciseFeedback").innerHTML = `
    <strong>${correct ? "回答正确 ✅" : "回答错误 ❌"}</strong>
    <p>你的答案：${userAnswer}</p>
    <p>标准答案：${ex.answer}</p>
    <p>${ex.explanation || ""}</p>
    <p class="muted">提示：输入题支持无变音符号的宽松判定，但标准答案仍以这里显示的巴利语拼写为准。</p>
  `;
  $("exerciseFeedback").classList.remove("hidden", "correct", "incorrect");
  $("exerciseFeedback").classList.add(correct ? "correct" : "incorrect");
  show("nextExerciseBtn");
  hide("submitExerciseBtn");
}

function goNextExercise() {
  exerciseIndex += 1;
  if (exerciseIndex >= exerciseItems.length) {
    alert(`本轮练习完成：正确 ${exerciseStats.right}，错误 ${exerciseStats.wrong}`);
    hide("exercisePanel");
    renderWrongList();
    updateStats();
    renderDailyBox();
  } else {
    renderExercise();
  }
}

function renderExerciseModuleSelect() {
  const select = $("exerciseModuleSelect");
  select.innerHTML = "";

  const optAll = document.createElement("option");
  optAll.value = "全部模块";
  optAll.textContent = "全部模块";
  select.appendChild(optAll);

  MODULE_ORDER.forEach(moduleName => {
    if (GRAMMAR.some(item => item.module === moduleName)) {
      const opt = document.createElement("option");
      opt.value = moduleName;
      opt.textContent = moduleName;
      select.appendChild(opt);
    }
  });
}

function renderWrongList() {
  const records = getWrongRecords();
  const list = $("wrongList");
  const items = Object.values(records);
  list.innerHTML = "";

  if (!items.length) {
    list.innerHTML = `<p class="muted">目前没有错题。</p>`;
    return;
  }

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "wrong-item";
    div.innerHTML = `
      <strong>${item.question}</strong>
      <p class="muted">${item.module || ""}｜${item.lesson_title || ""}</p>
      <p>答案：${item.answer}</p>
    `;
    list.appendChild(div);
  });
}

function renderSearchResults(keyword) {
  const resultBox = $("searchResults");
  if (!resultBox) return;

  const q = String(keyword || "").trim().toLowerCase();
  resultBox.innerHTML = "";

  if (!q) {
    resultBox.innerHTML = `<p class="muted">输入关键词后显示搜索结果。</p>`;
    return;
  }

  const results = GRAMMAR.filter(lesson => {
    const text = [
      lesson.title,
      lesson.category,
      lesson.module,
      lesson.summary,
      ...(lesson.explanation || []),
      ...(lesson.examples || []).flatMap(ex => [ex.pali, ex.cn, ex.note]),
      ...(lesson.cards || []).flatMap(card => [card.q, card.a])
    ].join(" ").toLowerCase();
    return text.includes(q);
  });

  if (!results.length) {
    resultBox.innerHTML = `<p class="muted">没有找到相关语法点。</p>`;
    return;
  }

  results.forEach(lesson => {
    const div = document.createElement("div");
    div.className = "lesson-item";
    div.innerHTML = lessonCardHTML(lesson);
    div.addEventListener("click", () => openLesson(lesson.id));
    resultBox.appendChild(div);
  });
}

function switchView(viewId) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  show(viewId);
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.view === viewId);
  });
  if (viewId === "wrongView") renderWrongList();
  if (viewId === "reportView") renderReportView();
  if (viewId === "feedbackView") {
    renderFeedbackLessonSelect();
    renderFeedbackDrafts();
  }
  if (viewId === "trainingView") renderTrainingPresets();
  if (viewId === "teacherView") renderTeacherView();
  if (viewId === "preflightView") renderReleaseInfo();
  if (viewId === "pathView") {
    renderPath();
    renderDailyBox();
  }
}

function startTodayReview() {
  const statuses = getStatuses();
  const wrongItems = Object.values(getWrongRecords());
  const reviewLessons = GRAMMAR.filter(l => statuses[l.id] === "需复习");
  const learningLessons = GRAMMAR.filter(l => statuses[l.id] === "学习中");
  const newLessons = GRAMMAR.filter(l => !statuses[l.id] || statuses[l.id] === "未学");

  if (wrongItems.length) {
    startExercises(shuffle(wrongItems).slice(0, 10), "今日错题复习");
    return;
  }

  const candidates = [...reviewLessons, ...learningLessons, ...newLessons].filter(l => (l.cards || []).length);
  if (!candidates.length) {
    alert("暂无可复习内容。");
    return;
  }

  const cards = shuffle(candidates).slice(0, 5).flatMap(l => l.cards || []);
  startCards(shuffle(cards).slice(0, 10));
}

function getFeedbackDrafts() {
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFeedbackDrafts(drafts) {
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(drafts));
}

function renderFeedbackLessonSelect() {
  const select = $("feedbackLessonSelect");
  const currentValue = select.value;
  select.innerHTML = "";
  const optGeneral = document.createElement("option");
  optGeneral.value = "";
  optGeneral.textContent = "通用反馈 / 不确定是哪一课";
  select.appendChild(optGeneral);

  GRAMMAR.forEach(lesson => {
    const opt = document.createElement("option");
    opt.value = String(lesson.id);
    opt.textContent = `${lesson.lesson_number || lesson.id}. ${lesson.title}`;
    select.appendChild(opt);
  });

  if (currentValue) select.value = currentValue;
}

function getFeedbackText() {
  const lessonId = $("feedbackLessonSelect").value;
  const lesson = GRAMMAR.find(item => String(item.id) === String(lessonId));
  const type = $("feedbackType").value;
  const desc = $("feedbackDesc").value.trim();
  const suggest = $("feedbackSuggest").value.trim();
  const source = $("feedbackSource").value.trim();
  const contact = $("feedbackContact").value.trim();

  return [
    "【巴利语语法网站反馈】",
    `反馈时间：${new Date().toLocaleString()}`,
    `问题类型：${type}`,
    `相关语法点：${lesson ? `${lesson.lesson_number || lesson.id}. ${lesson.title}` : "通用反馈 / 不确定"}`,
    `模块：${lesson ? lesson.module : "无"}`,
    "",
    "【问题描述】",
    desc || "未填写",
    "",
    "【建议修改】",
    suggest || "未填写",
    "",
    "【参考依据】",
    source || "未填写",
    "",
    "【反馈人联系方式】",
    contact || "未填写"
  ].join("\\n");
}

async function copyFeedback() {
  const text = getFeedbackText();
  try {
    await navigator.clipboard.writeText(text);
    alert("反馈文本已复制，可以粘贴发给老师。");
  } catch {
    alert("复制失败。请手动选择文本或下载反馈文件。");
  }
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadFeedback() {
  const filename = `pali-feedback-${new Date().toISOString().slice(0, 10)}.txt`;
  downloadTextFile(filename, getFeedbackText());
}

function saveFeedbackDraft() {
  const drafts = getFeedbackDrafts();
  drafts.unshift({
    id: `fb-${Date.now()}`,
    created_at: new Date().toISOString(),
    text: getFeedbackText()
  });
  saveFeedbackDrafts(drafts);
  renderFeedbackDrafts();
  alert("已保存到本机反馈草稿。");
}

function renderFeedbackDrafts() {
  const box = $("feedbackDraftList");
  if (!box) return;
  const drafts = getFeedbackDrafts();
  box.innerHTML = "";
  if (!drafts.length) {
    box.innerHTML = `<p class="muted">暂无反馈草稿。</p>`;
    return;
  }
  drafts.forEach(draft => {
    const div = document.createElement("div");
    div.className = "feedback-draft";
    div.innerHTML = `
      <p class="muted">${new Date(draft.created_at).toLocaleString()}</p>
      <pre>${draft.text.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</pre>
    `;
    box.appendChild(div);
  });
}

function exportFeedbackDrafts() {
  const drafts = getFeedbackDrafts();
  if (!drafts.length) {
    alert("没有反馈草稿可导出。");
    return;
  }
  const text = JSON.stringify({
    app: "pali-grammar-review-feedback",
    version: VERSION,
    exported_at: new Date().toISOString(),
    drafts
  }, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pali-feedback-drafts-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportData() {
  const data = {
    app: "pali-grammar-review",
    version: VERSION,
    exported_at: new Date().toISOString(),
    statuses: getStatuses(),
    wrong_records: getWrongRecords()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pali-grammar-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = event => {
    try {
      const data = JSON.parse(event.target.result);
      if (data.statuses && typeof data.statuses === "object") {
        localStorage.setItem(STATUS_KEY, JSON.stringify(data.statuses));
      }
      if (data.wrong_records && typeof data.wrong_records === "object") {
        localStorage.setItem(WRONG_KEY, JSON.stringify(data.wrong_records));
      }
      alert("导入成功。");
      renderPath();
      renderDailyBox();
      renderModules();
      renderWrongList();
      updateStats();
    } catch (error) {
      alert("导入失败：文件格式不正确。");
    }
  };
  reader.readAsText(file);
}

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (error) {
      console.log("Service worker registration failed", error);
    }
  }
}


function moduleReportRows() {
  const statuses = getStatuses();
  return MODULE_ORDER
    .map(moduleName => {
      const lessons = lessonsForModule(moduleName);
      if (!lessons.length) return null;
      const total = lessons.length;
      const mastered = lessons.filter(l => statuses[l.id] === "已掌握").length;
      const learning = lessons.filter(l => statuses[l.id] === "学习中").length;
      const review = lessons.filter(l => statuses[l.id] === "需复习").length;
      const unlearned = total - mastered - learning - review;
      const percent = total ? Math.round((mastered / total) * 100) : 0;
      return { moduleName, total, mastered, learning, review, unlearned, percent };
    })
    .filter(Boolean);
}

function renderReportView() {
  const statuses = getStatuses();
  const wrongCount = Object.keys(getWrongRecords()).length;
  const mastered = GRAMMAR.filter(l => statuses[l.id] === "已掌握").length;
  const learning = GRAMMAR.filter(l => statuses[l.id] === "学习中").length;
  const review = GRAMMAR.filter(l => statuses[l.id] === "需复习").length;
  const unlearned = GRAMMAR.length - mastered - learning - review;

  $("reportSummary").innerHTML = `
    <div class="report-item"><strong>${mastered}</strong><span>已掌握</span></div>
    <div class="report-item"><strong>${learning}</strong><span>学习中</span></div>
    <div class="report-item"><strong>${review}</strong><span>需复习</span></div>
    <div class="report-item"><strong>${wrongCount}</strong><span>错题</span></div>
  `;

  const table = $("moduleReportTable");
  table.innerHTML = "";
  const head = document.createElement("tr");
  ["模块", "总数", "已掌握", "学习中", "需复习", "未学", "掌握率"].forEach(text => {
    const td = document.createElement("td");
    td.textContent = text;
    head.appendChild(td);
  });
  table.appendChild(head);

  moduleReportRows().forEach(row => {
    const tr = document.createElement("tr");
    [row.moduleName, row.total, row.mastered, row.learning, row.review, row.unlearned, `${row.percent}%`].forEach(text => {
      const td = document.createElement("td");
      td.textContent = text;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  const reviewBox = $("reviewLessonList");
  const reviewLessons = GRAMMAR.filter(l => statuses[l.id] === "需复习" || statuses[l.id] === "学习中");
  reviewBox.innerHTML = "";
  if (!reviewLessons.length) {
    reviewBox.innerHTML = `<p class="muted">暂无“学习中”或“需复习”的语法点。</p>`;
  } else {
    reviewLessons.forEach(lesson => {
      const div = document.createElement("div");
      div.className = "lesson-item";
      div.innerHTML = lessonCardHTML(lesson);
      div.addEventListener("click", () => openLesson(lesson.id));
      reviewBox.appendChild(div);
    });
  }
}

function buildProgressReportText() {
  const statuses = getStatuses();
  const wrongCount = Object.keys(getWrongRecords()).length;
  const mastered = GRAMMAR.filter(l => statuses[l.id] === "已掌握").length;
  const learning = GRAMMAR.filter(l => statuses[l.id] === "学习中").length;
  const review = GRAMMAR.filter(l => statuses[l.id] === "需复习").length;
  const unlearned = GRAMMAR.length - mastered - learning - review;

  const lines = [
    "【巴利语语法学习报告】",
    `生成时间：${new Date().toLocaleString()}`,
    `语法点总数：${GRAMMAR.length}`,
    `练习题总数：${GRAMMAR.reduce((sum, lesson) => sum + (lesson.exercises || []).length, 0)}`,
    `已掌握：${mastered}`,
    `学习中：${learning}`,
    `需复习：${review}`,
    `未学：${unlearned}`,
    `错题数：${wrongCount}`,
    "",
    "【模块掌握情况】"
  ];

  moduleReportRows().forEach(row => {
    lines.push(`${row.moduleName}：${row.mastered}/${row.total}，掌握率 ${row.percent}%；学习中 ${row.learning}，需复习 ${row.review}，未学 ${row.unlearned}`);
  });

  lines.push("", "【学习中 / 需复习清单】");
  GRAMMAR
    .filter(l => statuses[l.id] === "学习中" || statuses[l.id] === "需复习")
    .forEach(l => lines.push(`${l.lesson_number || l.id}. ${l.title}｜${l.module}｜${statuses[l.id]}`));

  return lines.join("\n");
}

async function copyReport() {
  const text = buildProgressReportText();
  try {
    await navigator.clipboard.writeText(text);
    alert("学习报告已复制。");
  } catch {
    alert("复制失败，可以尝试下载学习报告。");
  }
}

function exportReport() {
  const filename = `pali-progress-report-${new Date().toISOString().slice(0, 10)}.txt`;
  downloadTextFile(filename, buildProgressReportText());
}

function exportReportTsv() {
  const rows = [
    ["模块", "总数", "已掌握", "学习中", "需复习", "未学", "掌握率"],
    ...moduleReportRows().map(row => [
      row.moduleName,
      row.total,
      row.mastered,
      row.learning,
      row.review,
      row.unlearned,
      `${row.percent}%`
    ])
  ];
  const text = rows.map(row => row.join("\t")).join("\n");
  downloadTextFile(`pali-progress-report-${new Date().toISOString().slice(0, 10)}.tsv`, text);
}

function exportFeedbackTsv() {
  const drafts = getFeedbackDrafts();
  if (!drafts.length) {
    alert("没有反馈草稿可导出。");
    return;
  }

  const rows = [["序号", "创建时间", "反馈文本"]];
  drafts.forEach((draft, index) => {
    rows.push([index + 1, new Date(draft.created_at).toLocaleString(), String(draft.text || "").replace(/\n/g, " / ")]);
  });
  const text = rows.map(row => row.join("\t")).join("\n");
  downloadTextFile(`pali-feedback-drafts-${new Date().toISOString().slice(0, 10)}.tsv`, text);
}

async function copyAllFeedbackDrafts() {
  const drafts = getFeedbackDrafts();
  if (!drafts.length) {
    alert("没有反馈草稿可复制。");
    return;
  }
  const text = drafts.map((draft, index) => `【反馈 ${index + 1}】\n${draft.text}`).join("\n\n");
  try {
    await navigator.clipboard.writeText(text);
    alert("全部反馈草稿已复制。");
  } catch {
    alert("复制失败，可以尝试导出反馈文件。");
  }
}


const VERSION_LOG = [
  { version: "7.4", note: "增加教师维护页、反馈处理模板、版本记录，并扩充阅读分析题。" },
  { version: "7.3", note: "增加学习报告、模块掌握率、学习报告导出、反馈TSV导出。" },
  { version: "7.2", note: "增加专项训练页面和阅读训练语法点。" },
  { version: "7.1", note: "优化练习体验：手动下一题、巴利语字符小键盘、输入题宽松判定。" },
  { version: "7.0", note: "扩充三类重点练习题：不定式/连续体、名词变格、不变词与句型。" },
  { version: "6.4", note: "增加反馈功能：复制反馈、下载反馈、保存本地反馈草稿。" },
  { version: "6.3", note: "增加PWA支持、学习记录导入导出、模块进度条。" },
  { version: "6.2", note: "增加学习路径、搜索、学习状态、今日复习。" },
  { version: "6.1", note: "根据老师讲义 Lesson 1—6 逐课核查扩充部分内容。" },
  { version: "6.0", note: "从条目列表升级为模块课程版。" }
];

function renderTeacherView() {
  const table = $("feedbackTemplateTable");
  if (table) {
    table.innerHTML = "";
    const rows = [
      ["反馈编号", "提交时间", "反馈人", "相关语法点", "问题类型", "问题描述", "建议修改", "参考依据", "处理状态", "教师备注"],
      ["FB-001", "", "", "", "", "", "", "", "未处理 / 已采纳 / 不采纳 / 待核查", ""]
    ];
    rows.forEach(row => {
      const tr = document.createElement("tr");
      row.forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
  }

  const box = $("versionLogBox");
  if (box) {
    box.innerHTML = "";
    VERSION_LOG.forEach(item => {
      const div = document.createElement("div");
      div.className = "version-item";
      div.innerHTML = `<h4>${item.version}</h4><p class="muted">${item.note}</p>`;
      box.appendChild(div);
    });
  }
}

function studentGuideText() {
  return [
    "【巴利语语法复习网站使用说明】",
    "1. 先从“学习路径”进入，按阶段学习，不建议直接跳到高级语法。",
    "2. 每学完一个语法点，请标记学习状态：未学 / 学习中 / 已掌握 / 需复习。",
    "3. 每个语法点包含学习说明、表格、例句、卡片和练习题。",
    "4. 做错的题会进入“错题复习”。建议每次学习前先清理错题。",
    "5. 如果发现语法变化、例句、翻译或答案有疑问，请进入“反馈”页填写并复制反馈文本发给老师。",
    "6. 换手机或清缓存前，请在“数据管理”中导出学习记录。"
  ].join("\\n");
}

function feedbackTemplateText() {
  return [
    ["反馈编号", "提交时间", "反馈人", "相关语法点", "问题类型", "问题描述", "建议修改", "参考依据", "处理状态", "教师备注"].join("\\t")
  ].join("\\n");
}

function versionLogText() {
  return VERSION_LOG.map(item => `${item.version}\\t${item.note}`).join("\\n");
}

async function copyStudentGuide() {
  try {
    await navigator.clipboard.writeText(studentGuideText());
    alert("学生使用说明已复制。");
  } catch {
    downloadTextFile("student-guide.txt", studentGuideText());
  }
}

async function copyFeedbackTemplate() {
  try {
    await navigator.clipboard.writeText(feedbackTemplateText());
    alert("反馈处理表头已复制，可直接粘贴到 Excel。");
  } catch {
    downloadTextFile("feedback-template.tsv", feedbackTemplateText());
  }
}

async function copyVersionLog() {
  try {
    await navigator.clipboard.writeText(versionLogText());
    alert("版本记录已复制。");
  } catch {
    downloadTextFile("version-log.tsv", versionLogText());
  }
}

function downloadVersionLog() {
  downloadTextFile(`pali-version-log-${new Date().toISOString().slice(0, 10)}.tsv`, versionLogText());
}


const RELEASE_FILES = [
  "index.html",
  "style.css",
  "app.js",
  "grammar.json",
  "manifest.json",
  "sw.js",
  "icon-192.png",
  "icon-512.png"
];

function publishChecklistText() {
  return [
    "【Pali Grammar 发布前检查清单】",
    `版本：${VERSION}`,
    `生成时间：${new Date().toLocaleString()}`,
    "",
    "一、必须上传的 8 个文件：",
    "1. index.html",
    "2. style.css",
    "3. app.js",
    "4. grammar.json",
    "5. manifest.json",
    "6. sw.js",
    "7. icon-192.png",
    "8. icon-512.png",
    "",
    "二、电脑端检查：",
    "□ 首页能打开",
    "□ 学习路径能打开",
    "□ 模块学习能打开",
    "□ 搜索能搜索到语法点",
    "□ 练习题能提交",
    "□ 错题能保存",
    "□ 反馈能复制或下载",
    "□ 学习报告能导出",
    "",
    "三、手机端检查：",
    "□ 手机浏览器能打开网站",
    "□ 练习题按钮能点击",
    "□ 输入题能弹出巴利语字符小键盘",
    "□ 学习状态能保存",
    "□ 可以添加到主屏幕",
    "",
    "四、缓存处理：",
    "□ 如果页面仍是旧版本，刷新几次",
    "□ 如果仍不更新，清除该网站的浏览器缓存/网站数据",
    "□ PWA 桌面图标如仍旧，删除后重新添加到主屏幕"
  ].join("\\n");
}

function renderReleaseInfo() {
  const el = $("releaseInfo");
  if (!el) return;
  const totalExercises = GRAMMAR.reduce((sum, lesson) => sum + (lesson.exercises || []).length, 0);
  el.innerHTML = `
    <p><strong>当前版本：</strong>${VERSION}</p>
    <p><strong>语法点：</strong>${GRAMMAR.length} 个</p>
    <p><strong>练习题：</strong>${totalExercises} 道</p>
    <p><strong>必需文件：</strong>${RELEASE_FILES.length} 个</p>
  `;
}

function addCheckResult(title, okLevel, detail) {
  const box = $("preflightResults");
  const div = document.createElement("div");
  div.className = `check-item ${okLevel}`;
  const icon = okLevel === "ok" ? "✅" : okLevel === "warn" ? "⚠️" : "❌";
  div.innerHTML = `<strong>${icon} ${title}</strong><p class="muted">${detail}</p>`;
  box.appendChild(div);
}

async function runPreflightChecks() {
  const box = $("preflightResults");
  box.innerHTML = "";

  addCheckResult("版本检查", "ok", `当前 app.js 版本为 ${VERSION}。`);

  const totalExercises = GRAMMAR.reduce((sum, lesson) => sum + (lesson.exercises || []).length, 0);
  if (GRAMMAR.length >= 70 && totalExercises >= 150) {
    addCheckResult("内容数量检查", "ok", `语法点 ${GRAMMAR.length} 个，练习题 ${totalExercises} 道。`);
  } else {
    addCheckResult("内容数量检查", "warn", `语法点 ${GRAMMAR.length} 个，练习题 ${totalExercises} 道。数量偏少时建议继续补题。`);
  }

  try {
    localStorage.setItem("__pali_test__", "ok");
    localStorage.removeItem("__pali_test__");
    addCheckResult("本地存储检查", "ok", "localStorage 可用，学习状态、错题和反馈草稿可以保存在当前浏览器。");
  } catch {
    addCheckResult("本地存储检查", "bad", "localStorage 不可用，学习状态和错题可能无法保存。");
  }

  if ("serviceWorker" in navigator) {
    addCheckResult("PWA 支持检查", "ok", "当前浏览器支持 Service Worker，可使用 PWA 缓存。");
  } else {
    addCheckResult("PWA 支持检查", "warn", "当前浏览器不支持 Service Worker，手机添加桌面或离线缓存可能受限。");
  }

  for (const file of RELEASE_FILES) {
    try {
      const res = await fetch(`./${file}`, { cache: "no-store" });
      if (res.ok) {
        addCheckResult(`文件检查：${file}`, "ok", "文件可访问。");
      } else {
        addCheckResult(`文件检查：${file}`, "bad", `服务器返回状态 ${res.status}，可能未上传或路径错误。`);
      }
    } catch (error) {
      addCheckResult(`文件检查：${file}`, "bad", "文件无法访问，可能未上传、路径错误，或本地没有通过 http.server 打开。");
    }
  }

  try {
    const res = await fetch("./grammar.json", { cache: "no-store" });
    const data = await res.json();
    const exercises = data.reduce((sum, lesson) => sum + (lesson.exercises || []).length, 0);
    addCheckResult("grammar.json 数据检查", "ok", `成功读取 ${data.length} 个语法点、${exercises} 道练习题。`);
  } catch {
    addCheckResult("grammar.json 数据检查", "bad", "grammar.json 无法解析。请检查文件是否完整。");
  }
}

async function copyPublishChecklist() {
  try {
    await navigator.clipboard.writeText(publishChecklistText());
    alert("发布清单已复制。");
  } catch {
    downloadTextFile("publish-checklist.txt", publishChecklistText());
  }
}

function downloadPublishChecklist() {
  downloadTextFile(`pali-publish-checklist-${new Date().toISOString().slice(0, 10)}.txt`, publishChecklistText());
}

async function init() {
  const response = await fetch("grammar.json");
  GRAMMAR = await response.json();

  renderPath();
  renderDailyBox();
  renderModules();
  renderExerciseModuleSelect();
  renderWrongList();
  renderSearchResults("");
  renderFeedbackLessonSelect();
  renderFeedbackDrafts();
  renderTrainingPresets();
  renderReportView();
  renderTeacherView();
  renderReleaseInfo();
  updateStats();

  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });

  document.querySelectorAll(".status-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (currentLesson) setLessonStatus(currentLesson.id, btn.dataset.status);
    });
  });

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (currentModule) renderLessonList(currentModule);
    });
  });

  $("backToModulesBtn").addEventListener("click", () => {
    hide("lessonListPanel");
  });

  $("closeLessonBtn").addEventListener("click", closeLesson);
  $("startTodayBtn").addEventListener("click", startTodayReview);
  $("copyReportBtn").addEventListener("click", copyReport);
  $("exportReportBtn").addEventListener("click", exportReport);
  $("exportReportTsvBtn").addEventListener("click", exportReportTsv);
  $("copyStudentGuideBtn").addEventListener("click", copyStudentGuide);
  $("copyFeedbackTemplateBtn").addEventListener("click", copyFeedbackTemplate);
  $("copyVersionLogBtn").addEventListener("click", copyVersionLog);
  $("downloadVersionLogBtn").addEventListener("click", downloadVersionLog);
  $("runPreflightBtn").addEventListener("click", runPreflightChecks);
  $("copyPublishChecklistBtn").addEventListener("click", copyPublishChecklist);
  $("downloadPublishChecklistBtn").addEventListener("click", downloadPublishChecklist);

  $("startCardsBtn").addEventListener("click", () => startCards(currentLesson.cards || []));
  $("showCardAnswerBtn").addEventListener("click", () => {
    show("cardAnswer");
    hide("cardBeforeButtons");
    show("cardAfterButtons");
  });
  $("cardKnowBtn").addEventListener("click", nextCard);
  $("cardWrongBtn").addEventListener("click", nextCard);
  $("exitCardsBtn").addEventListener("click", () => hide("cardPanel"));

  $("startLessonExercisesBtn").addEventListener("click", () => {
    const items = (currentLesson.exercises || []).map(ex => ({
      ...ex,
      lesson_id: currentLesson.id,
      lesson_title: currentLesson.title,
      module: currentLesson.module
    }));
    startExercises(items, "本课练习");
  });

  $("feedbackThisLessonBtn").addEventListener("click", () => {
    if (currentLesson) {
      switchView("feedbackView");
      $("feedbackLessonSelect").value = String(currentLesson.id);
      $("feedbackDesc").focus();
    }
  });

  $("startMixedExercisesBtn").addEventListener("click", () => {
    const moduleName = $("exerciseModuleSelect").value;
    const count = parseInt($("exerciseCountInput").value || "10", 10);
    const items = shuffle(allExercisesForModule(moduleName)).slice(0, count);
    startExercises(items, moduleName === "全部模块" ? "混合练习" : `${moduleName}练习`);
  });

  $("submitExerciseBtn").addEventListener("click", submitExercise);
  $("nextExerciseBtn").addEventListener("click", goNextExercise);
  $("exitExerciseBtn").addEventListener("click", () => hide("exercisePanel"));

  document.querySelectorAll("#paliKeyboard button").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = $("exerciseInput");
      const char = btn.dataset.char;
      const start = input.selectionStart || input.value.length;
      const end = input.selectionEnd || input.value.length;
      input.value = input.value.slice(0, start) + char + input.value.slice(end);
      input.focus();
      input.selectionStart = input.selectionEnd = start + char.length;
    });
  });

  $("startWrongBtn").addEventListener("click", () => {
    const items = Object.values(getWrongRecords());
    startExercises(shuffle(items), "错题复习");
  });

  $("clearWrongBtn").addEventListener("click", () => {
    if (confirm("确定清空所有错题记录吗？")) {
      saveWrongRecords({});
      renderWrongList();
      renderDailyBox();
    }
  });

  $("clearStatusBtn").addEventListener("click", () => {
    if (confirm("确定清空所有学习状态吗？错题不会被清空。")) {
      saveStatuses({});
      renderPath();
      renderDailyBox();
      renderModules();
      if (currentModule) renderLessonList(currentModule);
      updateStatusButtons();
    }
  });

  $("exportDataBtn").addEventListener("click", exportData);
  $("importDataInput").addEventListener("change", event => {
    const file = event.target.files[0];
    if (file) importData(file);
  });

  $("searchInput").addEventListener("input", event => {
    renderSearchResults(event.target.value);
  });

  $("copyFeedbackBtn").addEventListener("click", copyFeedback);
  $("downloadFeedbackBtn").addEventListener("click", downloadFeedback);
  $("saveFeedbackDraftBtn").addEventListener("click", saveFeedbackDraft);
  $("exportFeedbackDraftsBtn").addEventListener("click", exportFeedbackDrafts);
  $("exportFeedbackTsvBtn").addEventListener("click", exportFeedbackTsv);
  $("copyAllFeedbackBtn").addEventListener("click", copyAllFeedbackDrafts);
  $("clearFeedbackDraftsBtn").addEventListener("click", () => {
    if (confirm("确定清空本机反馈草稿吗？")) {
      saveFeedbackDrafts([]);
      renderFeedbackDrafts();
    }
  });

  registerServiceWorker();
}

init().catch(error => {
  console.error(error);
  alert("加载失败：请确认 grammar.json、app.js、style.css、index.html 在同一文件夹。");
});
