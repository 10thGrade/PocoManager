let total = 0;
let currentSet = [];
let allHistory = [];
let historyEl = document.getElementById("history");
let totalEl = document.getElementById("total");
let aikoLeft = 2;
let aikoPending = false;
let selectedHand = null;

const resultButtons = document.querySelectorAll(".result-btn");
const handButtons = document.querySelectorAll(".hand-btn");

function selectHand(hand, btn) {
    handButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedHand = hand;
    resultButtons.forEach(b => b.disabled = false);
}

function selectResult(result) {
    if (!selectedHand) return;
    let entry = { hand: selectedHand, result: result };
    allHistory.push(entry);
    renderEntry(entry);

    resultButtons.forEach(b => b.disabled = true);
    handButtons.forEach(b => b.classList.remove("selected"));
    selectedHand = null;

    if (result === "あいこ") {
        if (aikoPending) {
            total += 1;
            renderAikoEntry("Aiko成功！ / 獲得: +1 点");
            if (total < 0) total = 0;
            aikoPending = false;
            updateScore();
        }
        return;
    } else if (aikoPending) {
        if (aikoLeft > 0) {
            total -= 2;
            if (total < 0) total = 0;
            renderAikoEntry("Aiko失敗... / 獲得: -2 点");
        }
        aikoPending = false;
        updateScore();
    }

    currentSet.push(entry);
    if (currentSet.length === 3) {
        evaluateSet(currentSet);
        currentSet = [];
    }
}

function declareAiko() {
    if (aikoLeft <= 0) return;
    aikoPending = true;
    aikoLeft--;
    document.getElementById("aikoLeft").textContent = aikoLeft;
    const aikoBtn = document.querySelector(".aiko-info button");
    if (aikoLeft <= 0) {
        aikoBtn.disabled = true;
    }
    renderDeclareAikoEntry("Aiko宣言！少し背の高い〜♬");
}

function renderDeclareAikoEntry(text) {
    let div = document.createElement("div");
    div.className = "declareAiko";
    div.style.fontStyle = "italic";
    div.textContent = text;
    historyEl.appendChild(div);
    historyEl.scrollTop = historyEl.scrollHeight;
}

function renderAikoEntry(text) {
    let div = document.createElement("div");
    div.className = "setResult";
    div.textContent = text;
    historyEl.appendChild(div);
    historyEl.scrollTop = historyEl.scrollHeight;
}

function evaluateSet(set) {
    let hands = set.map(e => e.hand);
    let results = set.map(e => e.result);
    let points = 0;
    let role = "";

    if (results.every(r => r === "負け") && hands.every(h => h === hands[0])) {
        role = "負け3連単"; points += -3;
    } else if (results.every(r => r === "勝ち") && hands.every(h => h === hands[0])) {
        role = "勝ち3連単"; points += 4;
    } else if (hands.every(h => h === hands[0])) {
        role = "通常3連単"; points += 2;
    } else if (results.every(r => r === "勝ち") && ["👊 グー", "✌️ チョキ", "🖐️ パー"].every(h => hands.includes(h))) {
        role = "パグチひろこ"; points += 3;
    } else if (["👊 グー", "✌️ チョキ", "🖐️ パー"].every(h => hands.includes(h))) {
        role = "パグチ"; points += 1;
    }

    let winCount = results.filter(r => r === "勝ち").length;
    if (winCount > 0) points += winCount;

    total += points;
    
    let log = document.createElement("div");
    log.className = "setResult";
    log.innerHTML = `役: ${role || "なし"} / 獲得: ${points > 0 ? "+" + points : points} 点`;
    historyEl.appendChild(log);
    historyEl.scrollTop = historyEl.scrollHeight;

    updateScore();
}

function renderEntry(entry) {
    let div = document.createElement("div");
    div.className = "entry";
    div.textContent = `${entry.hand} (${entry.result})`;
    historyEl.appendChild(div);
    historyEl.scrollTop = historyEl.scrollHeight;
}

function updateScore() {
    if (total < 0) total = 0;
    totalEl.textContent = total;
    document.getElementById("aikoLeft").textContent = aikoLeft;
    if (total >= 10) {
        let div = document.createElement("div");
        div.className = "setResult";
        div.textContent = "🎉 10点に到達し勝利しました！";
        historyEl.appendChild(div);
        historyEl.scrollTop = historyEl.scrollHeight;
    }
}