// Scroll reveal animation
const reveals = document.querySelectorAll(".reveal");
window.addEventListener("scroll", () => {
  reveals.forEach(el => {
    const windowHeight = window.innerHeight;
    const revealTop = el.getBoundingClientRect().top;
    if (revealTop < windowHeight - 100) {
      el.classList.add("active");
    }
  });
});

// FAQ toggle
const questions = document.querySelectorAll(".faq-question");
questions.forEach(q => {
  q.addEventListener("click", () => {
    const answer = q.nextElementSibling;
    answer.style.display =
      answer.style.display === "block" ? "none" : "block";
  });
});

// Language toggle
const langToggle = document.getElementById("lang-toggle");
let currentLang = localStorage.getItem("lang") || "KR";

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);

  if (lang === "KR") {
    document.querySelector("#hero h1").textContent = "푸드퓨처스";
    document.querySelector("#hero p").textContent = "미래 식자재 가격을 예측하는 글로벌 마켓";

    document.querySelector("#contracts h2").textContent = "계약 & 거래";
    document.querySelector("#contracts p").textContent = "식자재 가격 변동에 따라 수익을 얻을 수 있는 간단한 계약 구조.";

    document.querySelector("#mechanics h2").textContent = "시장 구조";
    document.querySelector("#mechanics p").textContent = "24/7 거래, 자동화된 가격 조정, 누구나 참여 가능한 오픈 마켓.";

    document.querySelector("#revenue h2").textContent = "수익 모델";
    document.querySelector("#revenue p").textContent = "거래 수수료, 레버리지 수익, 데이터 서비스로 운영을 지속.";

    document.querySelector("#risk h2").textContent = "리스크 관리";
    document.querySelector("#risk p").textContent = "포지션 한도, 시장 감시, 사용자 보호 기능을 통해 안전한 거래 환경 제공.";

    document.querySelector("#tech h2").textContent = "기술 인프라";
    document.querySelector("#tech p").textContent = "빠른 거래 엔진, 모바일 앱 지원, 고급 분석 도구 제공.";

    document.querySelector("#faq h2").textContent = "자주 묻는 질문";
    document.querySelectorAll(".faq-question")[0].textContent = "FoodFutures는 무엇인가요?";
    document.querySelectorAll(".faq-answer")[0].textContent = "식자재 가격 예측을 기반으로 한 합법적인 마켓 플랫폼입니다.";
    document.querySelectorAll(".faq-question")[1].textContent = "어떻게 시작하나요?";
    document.querySelectorAll(".faq-answer")[1].textContent = "회원가입 후 간단한 인증 절차를 거치면 거래할 수 있습니다.";

    langToggle.textContent = "KR | EN";
  } else {
    document.querySelector("#hero h1").textContent = "FoodFutures";
    document.querySelector("#hero p").textContent = "A global market for predicting future food prices";

    document.querySelector("#contracts h2").textContent = "Contracts & Trading";
    document.querySelector("#contracts p").textContent = "Simple contract structure that lets you profit from ingredient price changes.";

    document.querySelector("#mechanics h2").textContent = "Market Mechanics";
    document.querySelector("#mechanics p").textContent = "24/7 trading, automated pricing, open market accessible to everyone.";

    document.querySelector("#revenue h2").textContent = "Revenue Model";
    document.querySelector("#revenue p").textContent = "Sustainable through trading fees, leverage income, and data services.";

    document.querySelector("#risk h2").textContent = "Risk & Safety";
    document.querySelector("#risk p").textContent = "Position limits, market surveillance, and user protection features.";

    document.querySelector("#tech h2").textContent = "Technology";
    document.querySelector("#tech p").textContent = "Fast trading engine, mobile support, and advanced analytics tools.";

    document.querySelector("#faq h2").textContent = "Frequently Asked Questions";
    document.querySelectorAll(".faq-question")[0].textContent = "What is FoodFutures?";
    document.querySelectorAll(".faq-answer")[0].textContent = "A legitimate market platform based on food price prediction.";
    document.querySelectorAll(".faq-question")[1].textContent = "How do I start?";
    document.querySelectorAll(".faq-answer")[1].textContent = "Sign up, complete quick verification, and start trading.";

    langToggle.textContent = "EN | KR";
  }
}

// On load
setLanguage(currentLang);

// Toggle on click
langToggle.addEventListener("click", () => {
  setLanguage(currentLang === "KR" ? "EN" : "KR");
});
