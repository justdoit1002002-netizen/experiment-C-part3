// 학습 표현 데이터 (토익 LC 300~400점대 학습자를 위한 실전 표현 15개)
// 난이도/문장 길이가 한쪽으로 치우치지 않도록 짧은 표현, 중간 길이, 관용구 위주의
// 긴 표현을 고르게 섞어서 구성함.
// english      : 실제 TTS로 재생할 영어 원문 (4단계 전에는 절대 화면에 노출하지 않음)
// koreanSound  : 실제 발화(연음·축약·약화)를 반영한 한글 소리표기. 정확한 발음기호가 아니라
//                "실제로 들리는 소리"를 옮긴 것이며, 아래 강세 표시 문법을 사용한다.
//                  **강하게 들리는 부분**  -> 크고 진하게 표시
//                  ~약하게 들리는 부분~    -> 작고 흐리게 표시
//                  표시 없는 부분         -> 기본 크기 (중간 강도)
// meaning      : 한국어 의미
// breakdown    : 4단계에서 보여줄 단어·표현 뜻풀이 (chunk: 구간, meaning: 뜻)
// distractors  : 최종 퀴즈 4지선다에 쓰일 오답 보기 (한국어)
const EXPRESSIONS = [
  {
    english: "As soon as possible",
    audio: "audio/01.mp3.mp3",
    koreanSound: "~어즈~ **쑨** ~어즈~ **파서블**",
    meaning: "가능한 한 빨리",
    breakdown: [
      { chunk: "as soon as", meaning: "~하자마자, ~하는 대로" },
      { chunk: "possible", meaning: "가능한" }
    ],
    distractors: [
      "예정보다 늦게",
      "다음 기회에",
      "필요할 때만"
    ]
  },
  {
    english: "I'll get back to you",
    audio: "audio/02.mp3.mp3",
    koreanSound: "~아일~ **겟백** ~트유~",
    meaning: "다시 연락드릴게요",
    breakdown: [
      { chunk: "I'll", meaning: "저는 ~할게요" },
      { chunk: "get back to you", meaning: "당신에게 다시 연락하다" }
    ],
    distractors: [
      "지금 바로 알려드릴게요",
      "제가 대신 처리할게요",
      "곧 도착할게요"
    ]
  },
  {
    english: "Let me check on that",
    audio: "audio/03.mp3.mp3",
    koreanSound: "~레미~ **첵칸** ~댓~",
    meaning: "제가 확인해 볼게요",
    breakdown: [
      { chunk: "let me", meaning: "제가 ~할게요" },
      { chunk: "check on", meaning: "~을 확인하다" },
      { chunk: "that", meaning: "그것" }
    ],
    distractors: [
      "그건 이미 확인했어요",
      "제가 처리했어요",
      "나중에 다시 물어봐 주세요"
    ]
  },
  {
    english: "Could you send me the file?",
    audio: "audio/04.mp3.mp3",
    koreanSound: "~커쥬~ 센미 ~더~ **파일**",
    meaning: "그 파일 좀 보내주실 수 있나요?",
    breakdown: [
      { chunk: "could you ~?", meaning: "~해 주실 수 있나요" },
      { chunk: "send me", meaning: "저에게 보내다" },
      { chunk: "the file", meaning: "그 파일" }
    ],
    distractors: [
      "그 파일을 이미 받았어요",
      "그 파일은 삭제됐어요",
      "그 파일을 찾을 수가 없어요"
    ]
  },
  {
    english: "I'm afraid I can't make it.",
    audio: "audio/05.mp3.mp3",
    koreanSound: "아머**프레이**드 ~아~ **캔트** 메이낏",
    meaning: "죄송하지만 저는 못 갈 것 같아요",
    breakdown: [
      { chunk: "I'm afraid", meaning: "유감이지만 ~인 것 같다" },
      { chunk: "can't make it", meaning: "가지 못하다, 참석하지 못하다" }
    ],
    distractors: [
      "다행히 시간 맞춰 갈 수 있어요",
      "이미 도착해서 기다리고 있어요",
      "다른 사람이 대신 갈 거예요"
    ]
  },
  {
    english: "Let's go over the schedule.",
    audio: "audio/06.mp3.mp3",
    koreanSound: "렛츠 고우버 ~더~ **스케쥴**",
    meaning: "일정을 한번 검토해 봅시다",
    breakdown: [
      { chunk: "let's", meaning: "~합시다" },
      { chunk: "go over", meaning: "검토하다, 살펴보다" },
      { chunk: "schedule", meaning: "일정" }
    ],
    distractors: [
      "일정을 완전히 취소합시다",
      "일정을 다음 주로 미룹시다",
      "일정에 대해 아무것도 하지 맙시다"
    ]
  },
  {
    english: "Thanks so much for waiting.",
    audio: "audio/07.mp3.mp3",
    koreanSound: "땡스 쏘 머치 ~풔~ **웨이팅**",
    meaning: "기다려 주셔서 정말 감사해요",
    breakdown: [
      { chunk: "thanks for ~ing", meaning: "~해 줘서 고맙다" },
      { chunk: "wait", meaning: "기다리다" }
    ],
    distractors: [
      "기다리게 해서 죄송해요",
      "오래 걸리지 않을 거예요",
      "먼저 가셔도 괜찮아요"
    ]
  },
  {
    english: "I need to reschedule the meeting.",
    audio: "audio/08.mp3.mp3",
    koreanSound: "아이 ~니투~ 리스케쥴 ~더~ **미팅**",
    meaning: "회의 일정을 다시 잡아야 해요",
    breakdown: [
      { chunk: "need to", meaning: "~해야 한다" },
      { chunk: "reschedule", meaning: "일정을 다시 잡다" },
      { chunk: "meeting", meaning: "회의" }
    ],
    distractors: [
      "회의를 예정대로 진행할 거예요",
      "회의를 완전히 취소할 거예요",
      "회의 시간을 이미 확인했어요"
    ]
  },
  {
    english: "Can you give me a hand?",
    audio: "audio/09.mp3.mp3",
    koreanSound: "~캐뉴~ 기미어 **핸드**",
    meaning: "저 좀 도와주실 수 있어요?",
    breakdown: [
      { chunk: "give someone a hand", meaning: "~을 도와주다" },
      { chunk: "hand", meaning: "도움, 손" }
    ],
    distractors: [
      "혼자서도 할 수 있어요",
      "제가 당신을 도와드릴게요",
      "도움은 필요 없어요"
    ]
  },
  {
    english: "I'll take care of it.",
    audio: "audio/10.mp3.mp3",
    koreanSound: "~아일~ 테익 **케어**러빗",
    meaning: "제가 처리할게요",
    breakdown: [
      { chunk: "take care of", meaning: "~을 처리하다, 맡다" },
      { chunk: "it", meaning: "그것" }
    ],
    distractors: [
      "그건 이미 처리됐어요",
      "제가 할 수 없는 일이에요",
      "다른 분께 부탁드려 보세요"
    ]
  },
  {
    english: "That sounds good to me.",
    audio: "audio/11.mp3.mp3",
    koreanSound: "댓 **사운즈 굿** ~트미~",
    meaning: "저는 그게 좋은 것 같아요",
    breakdown: [
      { chunk: "sound good", meaning: "좋게 들리다, 괜찮은 것 같다" },
      { chunk: "to me", meaning: "내가 보기에는" }
    ],
    distractors: [
      "저는 별로 마음에 안 들어요",
      "다시 생각해 봐야 할 것 같아요",
      "그건 저한테 안 맞아요"
    ]
  },
  {
    english: "I'm running a bit late.",
    audio: "audio/12.mp3.mp3",
    koreanSound: "아임 러닝어빗 **레잇**",
    meaning: "제가 좀 늦고 있어요",
    breakdown: [
      { chunk: "run late", meaning: "늦다, 지각하다" },
      { chunk: "a bit", meaning: "조금" }
    ],
    distractors: [
      "제가 좀 일찍 도착했어요",
      "이미 제시간에 왔어요",
      "오늘은 안 늦을 것 같아요"
    ]
  },
  {
    english: "It slipped my mind.",
    audio: "audio/13.mp3.mp3",
    koreanSound: "~잇~ **슬립트** 마이 **마인드**",
    meaning: "깜빡 잊어버렸어요",
    breakdown: [
      { chunk: "slip one's mind", meaning: "깜빡 잊다" },
      { chunk: "mind", meaning: "생각, 마음" }
    ],
    distractors: [
      "잘 기억하고 있었어요",
      "일부러 말하지 않았어요",
      "처음부터 몰랐던 일이에요"
    ]
  },
  {
    english: "Let's wrap this up.",
    audio: "audio/14.mp3.mp3",
    koreanSound: "렛츠 **랩디썹**",
    meaning: "이제 마무리합시다",
    breakdown: [
      { chunk: "wrap up", meaning: "마무리하다, 끝내다" },
      { chunk: "this", meaning: "이것" }
    ],
    distractors: [
      "이제 막 시작합시다",
      "처음부터 다시 합시다",
      "잠시 쉬었다가 합시다"
    ]
  },
  {
    english: "I'll email you the details.",
    audio: "audio/15.mp3.mp3",
    koreanSound: "~아일~ 이메일류 ~더~ **디테일즈**",
    meaning: "자세한 내용은 이메일로 보내드릴게요",
    breakdown: [
      { chunk: "email", meaning: "이메일을 보내다" },
      { chunk: "details", meaning: "세부사항" }
    ],
    distractors: [
      "자세한 내용은 전화로 알려드릴게요",
      "자세한 내용은 이미 보내드렸어요",
      "세부사항은 아직 정해지지 않았어요"
    ]
  }
];

// 이번 프로토타입(실험 C)에서 실제로 학습에 사용할 표현 개수.
// EXPRESSIONS 배열의 앞에서부터 TRAINING_COUNT개만 한글소리 훈련에 사용한다.
const TRAINING_COUNT = 5;

// ===== 2단계: 실전 Part 3 대화 =====
// 위에서 학습한 5개 표현(As soon as possible / I'll get back to you /
// Let me check on that / Could you send me the file? / I'm afraid I can't make it.)이
// 자연스럽게 포함된 짧은 TOEIC Part 3 스타일 남녀 대화.
//
// audio / questionAudio / startSound: 실제 audio 폴더에 저장된 파일명 그대로 연결.
const PART3 = {
  startSound: "audio/A_clean,_professiona_#4-1790039877913.mp3", // "실전 Part 3 도전하기" 클릭 직후 재생되는 시작 효과음
  audio: "audio/part3.mp3.mp3",
  questionAudio: "audio/part3-question.mp3.mp3",

  // 대화 스크립트 (해설 화면에서만 공개됨). 반드시 실제 재생되는 audio/part3.mp3.mp3
  // 음성 대본과 정확히 일치해야 한다.
  script: [
    { speaker: "W", english: "I'm afraid I can't make it to the meeting this afternoon.",
      korean: "죄송하지만 오늘 오후 회의에 참석하지 못할 것 같아요." },
    { speaker: "M", english: "No problem. Let me check on that. We can probably move it to tomorrow morning.",
      korean: "괜찮아요. 제가 확인해볼게요. 아마 내일 아침으로 옮길 수 있을 것 같아요." },
    { speaker: "W", english: "That would be great. Could you send me the file for the meeting?",
      korean: "그러면 좋겠네요. 회의에 필요한 파일을 보내주시겠어요?" },
    { speaker: "M", english: "Sure. I'll send it as soon as possible.",
      korean: "물론이죠. 가능한 한 빨리 보내드릴게요." },
    { speaker: "W", english: "Thanks. I'll get back to you after I check my schedule.",
      korean: "고마워요. 제 일정을 확인한 후 다시 연락드릴게요." }
  ],

  question: "What does the woman ask the man to do?",
  // 문제 제작 원칙 (앞으로 Part 3 문제를 추가할 때도 이 원칙을 지킨다):
  //  1) 정답 보기는 대화문의 핵심 표현을 그대로 복사하지 않는다.
  //  2) 반드시 자연스러운 패러프레이징(다른 단어/표현으로 바꿔 말하기)을 사용한다.
  //  3) 핵심 단어 한두 개만 듣고 정답을 고를 수 없게 한다.
  //  4) 오답도 대화 내용과 관련된 매력적인(그럴듯한) 오답으로 구성한다.
  options: [
    "Confirm an appointment",  // (A) 오답: 대화의 "meeting"에서 연상되지만 실제 요청은 아님
    "Contact a customer",      // (B) 오답: 업무 맥락상 그럴듯하지만 대화에 없는 내용
    "Provide a document",      // (C) 정답: "send the file"을 send→provide, file→document로 패러프레이징
    "Participate in a meeting" // (D) 오답: "meeting"이 대화에 언급되어 매력적이지만 여자의 요청이 아님
  ],
  answerIndex: 2, // (C) Provide a document

  evidence: {
    english: "Could you send me the file for the meeting?",
    korean: "회의에 필요한 파일을 보내주시겠어요?",
    paraphrase: "Provide a document",
    paraphraseKorean: "문서를 제공하다 / 보내주다"
  },

  explanation: "여자는 \"Could you send me the file for the meeting?\"이라고 요청했어요. 보기 (C)는 이 표현을 그대로 쓰지 않고 send → provide, file → document로 자연스럽게 바꿔 말한(패러프레이징) 것입니다. 따라서 정답은 (C) Provide a document입니다."
};
