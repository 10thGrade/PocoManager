// 変数定義
let total = 0;
let currentSet = [];
let allHistory = [];
let historyEl = document.getElementById("history");
let totalEl = document.getElementById("total");
let aikoLeftEl = document.getElementById("aikoLeft");
let aikoLeft = 2;    // aiko宣言の初期値を設定
let aikoPending = false;
let selectedHand = null;

const resultButtons = document.querySelectorAll(".result-btn");
const handButtons = document.querySelectorAll(".hand-btn");
const aikoButton = document.querySelector(".aiko-info button");

// イベントリスナー設定

// 手選択
function selectHand(hand, btn) {
    handButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedHand = hand;
    resultButtons.forEach(b => b.disabled = false);
}

// 勝敗選択
function selectResult(result) {
    if (!selectedHand) {
        return;
    }
    let entry = { hand: selectedHand, result: result };
    allHistory.push(entry);
    renderEntry(entry);

    resultButtons.forEach(b => b.disabled = true);
    handButtons.forEach(b => b.classList.remove("selected"));
    selectedHand = null;

    if (result === "win") {
        total += 1;    // じゃんけん勝利で+1点
        renderResultEntry("win");
        if (total < 0) {
            total = 0;
        }
        updateScore();
    } else if (result === "draw") {
        if (aikoPending) {
            total += 1;    // aiko宣言成功で+1点
            renderResultEntry("success");
            if (total < 0) {
                total = 0;
            }
            aikoPending = false;
            updateScore();
        }
        return;
    } else if (aikoPending) {
        if (aikoLeft > 0) {
            total -= 2;    // aiko宣言失敗で-2点
            if (total < 0) total = 0;
            renderResultEntry("miss");
        }
        aikoPending = false;
        updateScore();
    }

    currentSet.push(entry);
    if (currentSet.length === 3) {    // 3ターンで役判定
        evaluateSet(currentSet);
        currentSet = [];
    }
}

// aiko宣言
function declareAiko() {
    if (aikoLeft <= 0) {
        return;
    }
    aikoPending = true;
    aikoLeft--;
    aikoLeftEl.textContent = aikoLeft;
    if (aikoLeft <= 0) {
        aikoBtn.disabled = true;
    }
    renderResultEntry("dcl");
}

// aiko宣言関連描画
function renderResultEntry(act) {
    let div = document.createElement("div");
    if (act === "dcl") {
        div.className = "declareAiko";
        div.style.fontStyle = "italic";
        div.textContent = "Aiko宣言！少し背の高い〜♬！";
    } else if (act === "success") {
        div.className = "setResult";
        div.textContent = "Aiko成功！ / 獲得: +1 点";
        div.style.color = "red";

    } else if (act === "miss") {
        div.className = "setResult";
        div.textContent = "Aiko失敗... / 獲得: -2 点";
        div.style.color = "red";
    } else if (act === "win") {
        div.className = "setResult";
        div.textContent = "じゃんけん勝利！ / 獲得: +1 点";
        div.style.color = "red";
    }
    historyEl.appendChild(div);
    historyEl.scrollTop = historyEl.scrollHeight;
}

// 役判定 & 役描画
function evaluateSet(set) {
    let hands = set.map(e => e.hand);
    let results = set.map(e => e.result);
    let points = 0;
    let role = "";

    // 役による得点計算
    if (results.every(r => r === "lose") && hands.every(h => h === hands[0])) {
        role = "負け3連単";
        points += -3;
    } else if (results.every(r => r === "win") && hands.every(h => h === hands[0])) {
        role = "勝ち3連単";
        points += 4;
    } else if (hands.every(h => h === hands[0])) {
        role = "通常3連単";
        points += 2;
    } else if (results.every(r => r === "win") && ["gu", "choki", "pa"].every(h => hands.includes(h))) {
        role = "パグチひろこ";
        points += 3;
    } else if (["gu", "choki", "pa"].every(h => hands.includes(h))) {
        role = "パグチ";
        points += 1;
    }

    total += points;
    
    let log = document.createElement("div");
    log.className = "setResult";
    log.innerHTML = `役: ${role || "なし"} / 獲得: ${points > 0 ? "+" + points : points} 点`;
    historyEl.appendChild(log);
    historyEl.scrollTop = historyEl.scrollHeight;

    updateScore();
}

// 手描画
function renderEntry(entry) {
    let div = document.createElement("div");
    div.className = "entry";
    if (entry.hand === "gu") {
        handRender = "👊 グー";
    } else if (entry.hand === "choki") {
        handRender = "✌️ チョキ";
    } else if (entry.hand === "pa") {
        handRender = "🖐️ パー";
    } else {
        handRender = "";
    }
    if (entry.result === "win") {
        resultRender = "勝ち";
    } else if (entry.result === "lose") {
        resultRender = "負け";
    } else if (entry.result === "draw") {
        resultRender = "あいこ";
    } else {
        resultRender = "";
    }
    div.textContent = `${handRender} (${resultRender})`;
    historyEl.appendChild(div);
    historyEl.scrollTop = historyEl.scrollHeight;
}

// 得点描画 & 勝利判定
function updateScore() {
    if (total < 0) total = 0;
    totalEl.textContent = total;
    if (total >= 10) {    // 10点で勝利
        let div = document.createElement("div");
        div.className = "setResult";
        div.textContent = "🎉 10点に到達し勝利しました！";
        historyEl.appendChild(div);
        historyEl.scrollTop = historyEl.scrollHeight;
    }
}