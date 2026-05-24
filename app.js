let GRAMMAR = [];
let currentLesson = null;
let cardIndex = 0;
let exerciseIndex = 0;
let selectedChoice = "";

function show(id) {
  document.getElementById(id).classList.remove("hidden");
}

function hide(id) {
  document.getElementById(id).classList.add("hidden");
}

function hideAllPanels() {
  hide("lessonPanel");
  hide("cardPanel");
  hide("exercisePanel");
}

function renderLessonList() {
  const container = document.getElementById("lessonList");
  container.innerHTML = "";

  GRAMMAR.forEach(lesson => {
    const div = document.createElement("div");
    div.className = "lesson-item";
    div.innerHTML = `
      <h3>${lesson.id}. ${lesson.title}</h3>
      <p>${lesson.category}｜${lesson.level}</p>
      <p>${lesson.summary}</p>
    `;
    div.addEventListener("click", () => openLesson(lesson.id));
    container.appendChild(div);
  });
}

function openLesson(id) {
  currentLesson = GRAMMAR.find(item => item.id === id);
  if (!currentLesson) return;

  hideAllPanels();
  show("lessonPanel");

  document.getElementById("lessonTitle").textContent = currentLesson.title;
  document.getElementById("lessonMeta").textContent = `${currentLesson.category}｜${currentLesson.level}`;
  document.getElementById("lessonSummary").textContent = currentLesson.summary;

  const exp = document.getElementById("lessonExplanation");
  exp.innerHTML = "";
  currentLesson.explanation.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    exp.appendChild(li);
  });

  const table = document.getElementById("lessonTable");
  table.innerHTML = "";
  currentLesson.table.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  const examples = document.getElementById("lessonExamples");
  examples.innerHTML = "";
  currentLesson.examples.forEach(ex => {
    const div = document.createElement("div");
    div.className = "example";
    div.innerHTML = `
      <div class="pali">${ex.pali}</div>
      <div>${ex.cn}</div>
      <div class="tag">${ex.note}</div>
    `;
    examples.appendChild(div);
  });
}

function startCards() {
  if (!currentLesson || !currentLesson.cards.length) return;
  cardIndex = 0;
  hideAllPanels();
  show("cardPanel");
  renderCard();
}

function renderCard() {
  const cards = currentLesson.cards;
  const card = cards[cardIndex];

  document.getElementById("cardProgress").textContent = `卡片：${cardIndex + 1}/${cards.length}`;
  document.getElementById("cardQuestion").textContent = card.q;
  document.getElementById("cardAnswer").textContent = card.a;

  hide("cardAnswer");
  show("cardBeforeButtons");
  hide("cardAfterButtons");
}

function showCardAnswer() {
  show("cardAnswer");
  hide("cardBeforeButtons");
  show("cardAfterButtons");
}

function nextCard() {
  const cards = currentLesson.cards;
  cardIndex += 1;

  if (cardIndex >= cards.length) {
    alert("本组语法卡片复习完成。");
    openLesson(currentLesson.id);
    return;
  }

  renderCard();
}

function startExercises() {
  if (!currentLesson || !currentLesson.exercises.length) return;
  exerciseIndex = 0;
  hideAllPanels();
  show("exercisePanel");
  renderExercise();
}

function renderExercise() {
  const exercises = currentLesson.exercises;
  const ex = exercises[exerciseIndex];

  selectedChoice = "";

  document.getElementById("exerciseProgress").textContent = `练习：${exerciseIndex + 1}/${exercises.length}`;
  document.getElementById("exerciseQuestion").textContent = ex.question;
  document.getElementById("exerciseFeedback").classList.add("hidden");
  document.getElementById("exerciseFeedback").innerHTML = "";

  const optionsDiv = document.getElementById("exerciseOptions");
  const input = document.getElementById("exerciseInput");

  optionsDiv.innerHTML = "";
  input.value = "";

  if (ex.type === "choice") {
    hide("exerciseInput");
    ex.options.forEach(option => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = option;
      btn.addEventListener("click", () => {
        selectedChoice = option;
        document.querySelectorAll(".option-btn").forEach(b => b.style.border = "none");
        btn.style.border = "2px solid #2563eb";
      });
      optionsDiv.appendChild(btn);
    });
  } else {
    show("exerciseInput");
  }
}

function submitExercise() {
  const exercises = currentLesson.exercises;
  const ex = exercises[exerciseIndex];

  let userAnswer = "";

  if (ex.type === "choice") {
    userAnswer = selectedChoice;
    if (!userAnswer) {
      alert("请先选择一个答案。");
      return;
    }
  } else {
    userAnswer = document.getElementById("exerciseInput").value.trim();
    if (!userAnswer) {
      alert("请先输入答案。");
      return;
    }
  }

  const correct = userAnswer === ex.answer;
  const feedback = document.getElementById("exerciseFeedback");

  feedback.classList.remove("hidden");
  feedback.innerHTML = `
    <strong>${correct ? "回答正确 ✅" : "回答错误 ❌"}</strong>
    <p>正确答案：${ex.answer}</p>
    <p>${ex.explanation}</p>
  `;

  setTimeout(() => {
    exerciseIndex += 1;

    if (exerciseIndex >= exercises.length) {
      alert("本组练习完成。");
      openLesson(currentLesson.id);
    } else {
      renderExercise();
    }
  }, 1200);
}

async function init() {
  const response = await fetch("grammar.json");
  GRAMMAR = await response.json();

  renderLessonList();

  document.getElementById("backBtn").addEventListener("click", () => hide("lessonPanel"));
  document.getElementById("cardModeBtn").addEventListener("click", startCards);
  document.getElementById("exerciseModeBtn").addEventListener("click", startExercises);
  document.getElementById("showCardAnswerBtn").addEventListener("click", showCardAnswer);
  document.getElementById("cardKnowBtn").addEventListener("click", nextCard);
  document.getElementById("cardWrongBtn").addEventListener("click", nextCard);
  document.getElementById("backToLessonFromCard").addEventListener("click", () => openLesson(currentLesson.id));
  document.getElementById("backToLessonFromExercise").addEventListener("click", () => openLesson(currentLesson.id));
  document.getElementById("submitExerciseBtn").addEventListener("click", submitExercise);
}

init().catch(error => {
  console.error(error);
  alert("语法数据加载失败。请确认 grammar.json 与网页文件在同一文件夹。");
});
