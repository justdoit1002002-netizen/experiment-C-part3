// ===== 상태 =====
let currentIndex = 0; // 현재 표현 인덱스 (0 ~ EXPRESSIONS.length - 1)
let currentStep = 1;  // 현재 단계 (1 ~ 2)
let currentAudio = null;   // 현재(또는 마지막) 재생 중인 Audio 인스턴스
let isAudioPlaying = false; // 음성 중복 재생 방지 플래그
let repeatCount = 0;  // 1단계 1차(소리) "듣고 따라 말하기" 완료 횟수 (0~3)
let meaningRepeatCount = 0; // 1단계 2차(의미 연결) "듣고 따라 말하기" 완료 횟수 (0~3)
let soundHintOpen = false; // 2차 발화 연습에서 "소리 힌트 보기" 토글 열림 여부 (문장마다 초기화)
const soundHintUsedIndexes = new Set(); // 소리 힌트를 한 번이라도 열어본 표현 인덱스 (실험 분석용)

// 퀴즈 상태
let quizQueue = [];   // 랜덤으로 섞인 표현 목록 (퀴즈용)
let quizIndex = 0;    // 현재 퀴즈 문제 인덱스
let quizResults = []; // 각 문제의 결과 { item, selected, isCorrect, reactionTimeMs, replayCount }
let quizQuestionStartTime = 0; // 현재 문제의 음성이 처음 재생된 시각 (performance.now())
let quizReplayCount = 0;       // 현재 문제에서 🔊를 다시 누른 횟수 (첫 재생은 미포함)

// ===== DOM 참조 =====
const screenStart = document.getElementById("screen-start");
const screenTraining = document.getElementById("screen-training");
const screenComplete = document.getElementById("screen-complete");
const screenQuiz = document.getElementById("screen-quiz");
const screenQuizResult = document.getElementById("screen-quiz-result");

const progressText = document.getElementById("progressText");
const stepLabel = document.getElementById("stepLabel");
const stepBody = document.getElementById("stepBody");
const btnPlay = document.getElementById("btnPlay");
const btnNext = document.getElementById("btnNext");
const btnStart = document.getElementById("btnStart");
const btnRestart = document.getElementById("btnRestart");

const btnStartQuiz = document.getElementById("btnStartQuiz");
const quizProgressText = document.getElementById("quizProgressText");
const btnQuizPlay = document.getElementById("btnQuizPlay");
const quizChoiceArea = document.getElementById("quizChoiceArea");
const quizFeedback = document.getElementById("quizFeedback");
const btnQuizNext = document.getElementById("btnQuizNext");
const quizScoreText = document.getElementById("quizScoreText");
const quizWrongList = document.getElementById("quizWrongList");

// ===== 음성(MP3) 재생 =====
// 문장별로 녹음된 실제 MP3 파일(각 EXPRESSIONS 항목의 audio 필드)을 재생한다.
// speechSynthesis(TTS)는 더 이상 학습 음성 재생에 사용하지 않는다.
function playAudioFile(src, onEnd) {
  if (isAudioPlaying) return; // 재생 중에는 중복 재생 방지
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  isAudioPlaying = true;
  const audio = new Audio(src);
  currentAudio = audio;

  const finish = () => {
    isAudioPlaying = false;
    if (onEnd) onEnd();
  };

  audio.addEventListener("ended", finish, { once: true });
  audio.addEventListener("error", finish, { once: true });

  audio.play().catch(finish); // 자동재생 차단 등으로 play()가 거부되는 경우 콜백 진행
}

function playCurrentExpression(onEnd) {
  const item = EXPRESSIONS[currentIndex];
  playAudioFile(item.audio, onEnd);
}

function playCurrentQuizExpression(onEnd) {
  const item = quizQueue[quizIndex];
  playAudioFile(item.audio, onEnd);
}

// ===== 유틸 =====
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// koreanSound 표기의 강세 문법(**강하게**, ~약하게~)을 실제 크기 차이가 나는
// span으로 변환한다. (예: "~아일~ **겟백** ~트유~" -> 약하게/보통/강하게)
function formatKoreanSound(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<span class="stress-strong">$1</span>')
    .replace(/~(.+?)~/g, '<span class="stress-weak">$1</span>');
}

function showScreen(el) {
  [screenStart, screenTraining, screenComplete, screenQuiz, screenQuizResult].forEach(s =>
    s.classList.add("hidden")
  );
  el.classList.remove("hidden");
}

function updateProgressText() {
  progressText.textContent = `표현 ${currentIndex + 1} / ${EXPRESSIONS.length}`;
}

// ===== 1단계 전용 렌더링 (1차 소리 연습 -> 2차 의미 연결 발화 연습) =====
function renderStep1SoundPhase(item) {
  stepBody.innerHTML = `
    <p class="korean-sound">${formatKoreanSound(item.koreanSound)}</p>
    <button id="btnListenRepeat" class="btn-speaker" type="button">🔊 듣고 따라 말하기 (<span id="repeatCountText">0</span>/3)</button>
    <p class="hint-text">버튼을 누르면 음성이 자동으로 재생돼요. 소리를 듣고 그대로 따라 말해보세요.<br />3회를 모두 완료하면 다음 훈련으로 넘어가요.</p>
  `;
  const btnListenRepeat = document.getElementById("btnListenRepeat");
  const repeatCountText = document.getElementById("repeatCountText");
  btnListenRepeat.addEventListener("click", () => {
    if (repeatCount >= 3 || btnListenRepeat.disabled) return;
    btnListenRepeat.disabled = true; // 재생 중 연속 클릭 방지
    playCurrentExpression(() => {
      repeatCount += 1;
      repeatCountText.textContent = String(repeatCount);
      if (repeatCount >= 3) {
        btnListenRepeat.textContent = "✅ 3회 완료!";
        btnListenRepeat.classList.add("btn-speaker-done");
        renderStep1MeaningPhase(item);
      } else {
        btnListenRepeat.disabled = false;
      }
    });
  });
}

function renderStep1MeaningPhase(item) {
  soundHintOpen = false; // 새 문장에 진입할 때마다 힌트는 항상 닫힌 상태로 초기화
  stepBody.innerHTML = `
    <p class="step1-meaning-focus">${item.meaning}</p>
    <button id="btnSoundHintToggle" class="btn-sound-hint-toggle" type="button" aria-expanded="false">소리 힌트 보기 ▾</button>
    <p id="soundHintText" class="sound-hint-text hidden">${formatKoreanSound(item.koreanSound)}</p>
    <button id="btnListenRepeat2" class="btn-speaker" type="button">🔊 듣고 따라 말하기 (<span id="repeatCountText2">0</span>/3)</button>
    <p class="hint-text">한글 뜻을 보면서, 방금 들었던 영어 소리를 그대로 떠올려 따라 말해보세요.</p>
  `;
  // 별도의 "다음 단계" 버튼 없이, 3회 재생이 끝나면 자동으로 다음 단계로 넘어간다.

  const btnSoundHintToggle = document.getElementById("btnSoundHintToggle");
  const soundHintText = document.getElementById("soundHintText");
  btnSoundHintToggle.addEventListener("click", () => {
    soundHintOpen = !soundHintOpen;
    soundHintText.classList.toggle("hidden", !soundHintOpen);
    btnSoundHintToggle.setAttribute("aria-expanded", String(soundHintOpen));
    btnSoundHintToggle.textContent = soundHintOpen ? "소리 힌트 숨기기 ▴" : "소리 힌트 보기 ▾";
    if (soundHintOpen) {
      soundHintUsedIndexes.add(currentIndex); // 같은 문장에서 여러 번 열어도 1문장으로만 집계
    }
  });

  const btnListenRepeat2 = document.getElementById("btnListenRepeat2");
  const repeatCountText2 = document.getElementById("repeatCountText2");
  btnListenRepeat2.addEventListener("click", () => {
    if (meaningRepeatCount >= 3 || btnListenRepeat2.disabled) return;
    btnListenRepeat2.disabled = true; // 재생 중 연속 클릭 방지
    playCurrentExpression(() => {
      meaningRepeatCount += 1;
      repeatCountText2.textContent = String(meaningRepeatCount);
      if (meaningRepeatCount >= 3) {
        goToNextStep(); // 마지막 재생이 끝난 직후 자동 전환
      } else {
        btnListenRepeat2.disabled = false;
      }
    });
  });
}

// ===== 단계별 렌더링 =====
function renderStep() {
  const item = EXPRESSIONS[currentIndex];
  updateProgressText();

  // 공통 초기화
  btnNext.classList.add("hidden");
  btnNext.disabled = false;
  stepBody.innerHTML = "";
  btnPlay.classList.remove("hidden");

  if (currentStep === 1) {
    repeatCount = 0;
    meaningRepeatCount = 0;
    btnPlay.classList.add("hidden"); // 1단계에서는 통합 버튼만 사용
    stepLabel.textContent = "1단계 · 소리 익히기";
    btnNext.textContent = "다음 단계";
    // btnNext는 2차 의미 연결 발화 연습(2/2) 완료 전까지 숨김 상태 유지
    renderStep1SoundPhase(item);
  }

  else if (currentStep === 2) {
    stepLabel.textContent = "2단계 · 영어 원문 공개";
    const breakdownHtml = (item.breakdown || [])
      .map(b => `<p class="breakdown-item"><span class="breakdown-chunk">${b.chunk}</span><span class="breakdown-arrow">→</span>${b.meaning}</p>`)
      .join("");
    stepBody.innerHTML = `
      <p class="english-reveal">${item.english}</p>
      <p class="korean-sound">${formatKoreanSound(item.koreanSound)}</p>
      <p class="korean-meaning">${item.meaning}</p>
      ${breakdownHtml ? `<div class="breakdown-list">${breakdownHtml}</div>` : ""}
    `;
    const isLast = currentIndex === EXPRESSIONS.length - 1;
    btnNext.textContent = isLast ? "학습 완료" : "다음 표현";
    btnNext.classList.remove("hidden");
  }
}

// ===== 흐름 제어 =====
function goToNextStep() {
  if (currentStep < 2) {
    currentStep += 1;
    renderStep();
    playCurrentExpression();
  } else {
    // 2단계 완료 -> 다음 표현 또는 종료
    if (currentIndex < EXPRESSIONS.length - 1) {
      currentIndex += 1;
      currentStep = 1;
      renderStep();
      playCurrentExpression();
    } else {
      showScreen(screenComplete);
    }
  }
}

// ===== 퀴즈 =====
function startQuiz() {
  quizQueue = shuffle(EXPRESSIONS); // 문제 순서 랜덤
  quizIndex = 0;
  quizResults = [];
  showScreen(screenQuiz);
  renderQuizQuestion();
}

function updateQuizProgressText() {
  quizProgressText.textContent = `퀴즈 ${quizIndex + 1} / ${quizQueue.length}`;
}

function renderQuizQuestion() {
  const item = quizQueue[quizIndex];
  updateQuizProgressText();

  quizFeedback.classList.add("hidden");
  quizFeedback.textContent = "";
  btnQuizNext.classList.add("hidden");
  quizChoiceArea.innerHTML = "";
  quizReplayCount = 0;

  const options = shuffle([item.meaning, ...item.distractors]); // 보기 순서 랜덤

  options.forEach(optionText => {
    const btn = document.createElement("button");
    btn.className = "btn btn-choice";
    btn.textContent = optionText;
    btn.addEventListener("click", () => handleQuizChoice(optionText, item, btn));
    quizChoiceArea.appendChild(btn);
  });

  quizQuestionStartTime = performance.now(); // 음성 재생 시작 시점 기록
  playCurrentQuizExpression();
}

function handleQuizChoice(selected, item, btnEl) {
  const isCorrect = selected === item.meaning;
  const reactionTimeMs = performance.now() - quizQuestionStartTime;

  Array.from(quizChoiceArea.children).forEach(b => (b.disabled = true));

  if (isCorrect) {
    btnEl.classList.add("choice-correct");
  } else {
    btnEl.classList.add("choice-wrong");
    Array.from(quizChoiceArea.children)
      .find(b => b.textContent === item.meaning)
      ?.classList.add("choice-correct");
  }

  quizResults.push({ item, selected, isCorrect, reactionTimeMs, replayCount: quizReplayCount });

  quizFeedback.classList.remove("hidden");
  quizFeedback.textContent = isCorrect ? "✅ 정답이에요!" : "❌ 틀렸어요.";
  quizFeedback.className = isCorrect ? "feedback feedback-correct" : "feedback feedback-wrong";

  const isLast = quizIndex === quizQueue.length - 1;
  btnQuizNext.textContent = isLast ? "결과 보기" : "다음 문제";
  btnQuizNext.classList.remove("hidden");
}

function goToNextQuizQuestion() {
  if (quizIndex < quizQueue.length - 1) {
    quizIndex += 1;
    renderQuizQuestion();
  } else {
    renderQuizResult();
  }
}

function renderQuizResult() {
  const correctCount = quizResults.filter(r => r.isCorrect).length;
  const total = quizResults.length;
  const accuracy = Math.round((correctCount / total) * 100);

  const avgReactionSec = (
    quizResults.reduce((sum, r) => sum + r.reactionTimeMs, 0) / total / 1000
  ).toFixed(1);

  // 재청취 없이(한 번만 듣고) 답한 문제 중 정답률
  const firstListenResults = quizResults.filter(r => r.replayCount === 0);
  const firstListenAccuracyText =
    firstListenResults.length > 0
      ? `${Math.round(
          (firstListenResults.filter(r => r.isCorrect).length / firstListenResults.length) * 100
        )}% (${firstListenResults.length}문제 중)`
      : "해당 없음";

  const totalReplays = quizResults.reduce((sum, r) => sum + r.replayCount, 0);
  const avgReplays = (totalReplays / total).toFixed(1);

  quizScoreText.innerHTML = `
    <p class="quiz-score-main">정답률: ${correctCount} / ${total}개 (${accuracy}%)</p>
    <p class="quiz-stat-line">평균 반응시간: ${avgReactionSec}초</p>
    <p class="quiz-stat-line">한 번에 들은 정답률: ${firstListenAccuracyText}</p>
    <p class="quiz-stat-line">재청취 횟수: 총 ${totalReplays}회 (문제당 평균 ${avgReplays}회)</p>
    <p class="quiz-stat-line">소리 힌트 사용: ${EXPRESSIONS.length}문장 중 ${soundHintUsedIndexes.size}문장</p>
  `;

  const wrongResults = quizResults.filter(r => !r.isCorrect);
  quizWrongList.innerHTML = "";

  if (wrongResults.length === 0) {
    quizWrongList.innerHTML = `<p class="hint-text">틀린 문제가 없어요. 완벽해요! 🎉</p>`;
  } else {
    wrongResults.forEach(r => {
      const wrongItem = document.createElement("div");
      wrongItem.className = "quiz-wrong-item";
      wrongItem.innerHTML = `
        <p class="english-reveal">${r.item.english}</p>
        <p class="korean-sound">${formatKoreanSound(r.item.koreanSound)}</p>
        <p class="korean-meaning">정답: ${r.item.meaning}</p>
        <p class="quiz-wrong-selected">내가 고른 답: ${r.selected}</p>
        <p class="quiz-wrong-meta">반응시간 ${(r.reactionTimeMs / 1000).toFixed(1)}초 · 재청취 ${r.replayCount}회</p>
      `;
      quizWrongList.appendChild(wrongItem);
    });
  }

  showScreen(screenQuizResult);
}

// ===== 이벤트 바인딩 =====
btnStart.addEventListener("click", () => {
  currentIndex = 0;
  currentStep = 1;
  showScreen(screenTraining);
  renderStep();
  playCurrentExpression();
});

btnPlay.addEventListener("click", () => playCurrentExpression());

btnNext.addEventListener("click", goToNextStep);

btnStartQuiz.addEventListener("click", startQuiz);

btnQuizPlay.addEventListener("click", () => {
  if (isAudioPlaying) return; // 재생 중 중복 클릭 방지
  quizReplayCount += 1; // 최초 자동 재생 이후의 재청취만 카운트
  playCurrentQuizExpression();
});

btnQuizNext.addEventListener("click", goToNextQuizQuestion);

btnRestart.addEventListener("click", () => {
  currentIndex = 0;
  currentStep = 1;
  repeatCount = 0;
  meaningRepeatCount = 0;
  soundHintOpen = false;
  soundHintUsedIndexes.clear();
  quizQueue = [];
  quizIndex = 0;
  quizResults = [];
  quizReplayCount = 0;
  showScreen(screenStart);
});
