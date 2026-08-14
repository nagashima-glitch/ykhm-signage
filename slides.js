/* =====================================================================
   横浜駅前ながしまクリニック デジタルサイネージ：データ本体（slides.js）
   ---------------------------------------------------------------------
   このファイルには画面に出す内容（データ）だけが入っています。
   動作ロジック（ローテーション、季節判定、夜間モードなど）は index.html 側にあります。
   このファイルは index.html と preview.html の両方から
   <script src="slides.js"></script> で読み込まれます（単一ソース化）。

   編集ポイントは主にこの5つです。
     1) NIGHT_MODE … 夜間画面に切り替わる時刻（診療時間外の案内画面）
     2) CLINIC     … クリニックの基本情報・診療時間・実績数値
     3) QR_YOYAKU  … WEB予約QRコードの画像データ（予約システムが変わったら要更新）
     4) NOTICE     … 臨時休診などの一時的なお知らせ（enabled: true で表示）
     5) SLIDES     … スライドの内容・表示月・並び順
   README.md にそれぞれの編集例があります。

   各スライドには title / category を付与しています（preview.html の一覧表示用。
   index.html 自体はこれらを使いません）。
     title    … 一覧に出す日本語の短いタイトル
     category … "all"（通年の症状・診療案内）/ "seasonal"（季節もの）/
                "series"（特集シリーズ）/ "institutional"（院内・制度案内）/ "notice"（臨時お知らせ）
   ===================================================================== */

// ▼▼▼ ここから NIGHT_MODE（夜間画面の切り替え時刻） ▼▼▼
// この時間帯は自動ローテーションの代わりに「本日の診療は終了しました」画面を表示する。
// 日をまたぐ時間帯（19:00〜翌7:30 等）も指定できる。
const NIGHT_MODE = {
  startHour: 19,
  startMinute: 0,
  endHour: 7,
  endMinute: 30
};
// ▲▲▲ NIGHT_MODE ここまで ▲▲▲

// ▼▼▼ ここから CLINIC（クリニック基本情報） ▼▼▼
const CLINIC = {
  name: "横浜駅前ながしまクリニック",
  address: "神奈川県横浜市神奈川区鶴屋町2-11-8 4階",
  addressShort: "横浜駅きた西口 徒歩3分",
  tel: "045-534-8147",
  departments: ["消化器内科", "内視鏡内科", "肛門内科", "内科", "産婦人科"],
  motto: "大病を未病に",

  // 内科系（消化器内科・内視鏡内科・肛門内科・内科）の診療時間
  hoursNaika: {
    days: ["月", "火", "水", "木", "金", "土", "日"],
    // true=○ / false=× / "note"=○だが注記あり（土曜午後）
    am: [true, true, true, true, true, true, false],
    pm: [true, true, true, true, true, "note", false],
    amTime: "9:00-12:00",
    pmTime: "13:00-18:00",
    pmTimeNote: "13:00-17:00※",
    closedLabel: "休診：<em>日曜・祝日</em>",
    receptionEnd: "受付終了　午前 11:30 ／ 午後 17:30",
    note: "※土曜午後は13:00〜17:00。一般外来は15:00まで、15:00〜17:00は内視鏡検査のみとなります。"
  },

  // 産婦人科の診療時間
  hoursGyn: {
    days: ["月", "火", "水", "木", "金", "土", "日"],
    am: [true, true, false, true, false, false, false],
    pm: [true, true, false, true, false, false, false],
    amTime: "9:00-12:00",
    pmTime: "13:00-17:00",
    closedLabel: "休診：水・金・土・日・祝",
    note1: "女性医師（産婦人科専門医）が診療いたします",
    note2: "待合室は内科と分けております"
  },

  // 内視鏡実績（月次で更新）
  endoscopy: {
    asOf: "2026年7月時点",
    totalLabel: "開院からの累計",
    total: 2013,
    gastroTotal: 1012,
    colonoTotal: 1001,
    monthLabel: "2026年7月の実績",
    monthTotal: 177,
    monthGastro: 90,
    monthColono: 87
  }
};
// ▲▲▲ CLINIC ここまで ▲▲▲

// ▼▼▼ ここから QR_YOYAKU（WEB予約QRコード画像） ▼▼▼
// WEB予約システムのURLをQRコード化したPNG画像（データURI埋め込み・外部通信なし）。
// 予約システムのURLが変わった場合は、新しいQRコード画像を作り直してここを丸ごと差し替えること。
const QR_YOYAKU = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZoAAAGaCAIAAAC5ZBI0AAAJDUlEQVR4nO3dwXHjxhZA0RmXslAIPwTH7xAcAuOgt17h2+7p6teX5+xJkBB0C1K9Rv98v98/AO732+kPAPBryBkQIWdAhJwBEXIGRMgZECFnQIScARFyBkTIGRAhZ0CEnAERcgZEyBkQIWdAhJwBEXIGRMgZECFnQMTXyou/f//fj5bXH39u+r7P7/xs33Gf3/nGszHznfcd99N+B5+5OwMi5AyIkDMgQs6ACDkDIuQMiJAzIELOgAg5AyKWVgU82zdFvWLfFPXMefR9E+en1jl82hXb+0bf23767s6ACDkDIuQMiJAzIELOgAg5AyLkDIiQMyBCzoCIjasCbpzO3+fUHPzK2Zh5Jm+86k7tQvBpv4PuzoAIOQMi5AyIkDMgQs6ACDkDIuQMiJAzIELOgIhjqwJutG/y+/m1K9Pbpz7z82tX3nnFjcftrc3Yx90ZECFnQIScARFyBkTIGRAhZ0CEnAERcgZEyBkQYVXAv7Bvhn7mLHvvTD7bt3JjZY0E/5y7MyBCzoAIOQMi5AyIkDMgQs6ACDkDIuQMiJAzIOLYqoAbJ6F7c/8rP4WZuxA82/czutEr943cnQERcgZEyBkQIWdAhJwBEXIGRMgZECFnQIScAREbVwXc+Az7T3vC/anp/N7PaOZ5/s79Dj5zdwZEyBkQIWdAhJwBEXIGRMgZECFnQIScARFyBkQsrQqYORe+z6nZ7k87z5+2rmOFa+Pv3J0BEXIGRMgZECFnQIScARFyBkTIGRAhZ0CEnAERP9/v939+sWecz5/eXpllP7ULwcqnmnk29r3zvrPxGrn3xTN3Z0CEnAERcgZEyBkQIWdAhJwBEXIGRMgZECFnQMTSqoBnvTnpFaemt1fMnBrf58ZvNPNqf7bvinV3BkTIGRAhZ0CEnAERcgZEyBkQIWdAhJwBEXIGRHytvHjmVPGnfaobZ/dn7kLwbOZT+Wd+31OrXNydARFyBkTIGRAhZ0CEnAERcgZEyBkQIWdAhJwBEUurAmbOHO975xtnrJ+dmkffNxd+49qMFTO/7ynuzoAIOQMi5AyIkDMgQs6ACDkDIuQMiJAzIELOgIif7/f7o+aGTz3DfsW+4+5bUbBy3FPrOm48zzPP5DN7BQD8H/7YBCLkDIiQMyBCzoAIOQMi5AyIkDMgQs6AiK9T072nJrD3fap9rz2lt5/Dvv0NTrFW4e/cnQERcgZEyBkQIWdAhJwBEXIGRMgZECFnQIScARFLewXc+KR5s923z6OvOLWfwymvQ78Lp1YEuTsDIuQMiJAzIELOgAg5AyLkDIiQMyBCzoAIOQMillYF9Ca/Z+5+sOLUyo2Z9p2Nmef5e+T6mX3f190ZECFnQIScARFyBkTIGRAhZ0CEnAERcgZEyBkQMXRVwL75+1Oz+zc+S/7ZzDn4G38K+7wuXG9grwAAf2wCFf53BkTIGRAhZ0CEnAERcgZEyBkQIWdAxNKqgJlz//vc+PT03tnYd22ceudnN17tr0Of2d0ZECFnQIScARFyBkTIGRAhZ0CEnAERcgZEyBkQEdwrYMXMtQqnnss+c0p+5pWz4tRKhu+RPwV7BQD4YxOo8L8zIELOgAg5AyLkDIiQMyBCzoAIOQMivk4d+NTTxFeO25s43/eZZ06c7zNzjcSn7V/h7gyIkDMgQs6ACDkDIuQMiJAzIELOgAg5AyLkDIjYuFfAp02Nf9o+A89m7kIw8zyvvPM+L6sCAE7xxyYQIWdAhJwBEXIGRMgZECFnQIScARFyBkQsrQrYNzV+yqk1A89mztDfeK5WjrvvXN24guJ75O++uzMgQs6ACDkDIuQMiJAzIELOgAg5AyLkDIiQMyDia99bn5qTXjFzPnvltTNXI6wc95RT61hu3M/h+/G1+64rd2dAhJwBEXIGRMgZECFnQIScARFyBkTIGRAhZ0DElXsFnJpWXzHzSfM3PrO/d56fnTruilO/g+7OgAg5AyLkDIiQMyBCzoAIOQMi5AyIkDMgQs6AiI17BZxyaj5732tvfKL/zFn2fedq3/edeT3PXBPi7gyIkDMgQs6ACDkDIuQMiJAzIELOgAg5AyLkDIgYuipg5pPm9732Rjc+d//ZqePuO5OnfsvsFQCwxB+bQIScARFyBkTIGRAhZ0CEnAERcgZEyBkQcWxVwI2zzr0Z+pn7DDybufvByjufunJeh77RM3sFAPhjE6jwvzMgQs6ACDkDIuQMiJAzIELOgAg5AyI2rgq4caZ836zzzPn7T5s4n/nON17Pz+wVALDEH5tAhJwBEXIGRMgZECFnQIScARFyBkTIGRAxdK+AfZPQp57Kf+Mz7GeuVdhn5n4Oz05dkzO5OwMi5AyIkDMgQs6ACDkDIuQMiJAzIELOgAg5AyKWVgWsTG/vm/yeOVO+7517k/37Jt1nXrGnjvs9cp3DCndnQIScARFyBkTIGRAhZ0CEnAERcgZEyBkQIWdAxNKqgJmTwStOPXe/9yz5U3tBzDwbp77Ra+RKlZV3fubuDIiQMyBCzoAIOQMi5AyIkDMgQs6ACDkDIuQMiFhaFTDz2eo3Pof+lN6z80+tzTi16uPTrrpn7s6ACDkDIuQMiJAzIELOgAg5AyLkDIiQMyBCzoCIjasCnpmTbj+H/tRrZz5Zf0VvR4593J0BEXIGRMgZECFnQIScARFyBkTIGRAhZ0CEnAERx1YF8M+dmqHf99pTa0Kej3vjmoFnr20rKFaOu+88uzsDIuQMiJAzIELOgAg5AyLkDIiQMyBCzoAIOQMirAq4YMZ6ppXZ7lNrBlbsm5JfOe7Muf9T3J0BEXIGRMgZECFnQIScARFyBkTIGRAhZ0CEnAERx1YFzJwqXnFqenvfhL2J8191nmdeGytmrtxwdwZEyBkQIWdAhJwBEXIGRMgZECFnQIScARFyBkRsXBUwc274xm90au7/1Cz7vlUQM8/kzJ/g98g9Cp65OwMi5AyIkDMgQs6ACDkDIuQMiJAzIELOgAg5AyJ+vt/v058B4BdwdwZEyBkQIWdAhJwBEXIGRMgZECFnQIScARFyBkTIGRAhZ0CEnAERcgZEyBkQIWdAhJwBEXIGRMgZECFnwI+GvwD9Esjb/N0/UQAAAABJRU5ErkJggg==";
// ▲▲▲ QR_YOYAKU ここまで ▲▲▲

// ▼▼▼ ここから NOTICE（臨時お知らせ） ▼▼▼
// 休診のお知らせ等を一時的に出したいときはここを編集する。
//   enabled: true にすると、下の SLIDES 内の "notice" スライドが表示されるようになる
//   （false のままなら何も表示されず、他のスライドには一切影響しない）
//   title / lines を書き換えれば、そのまま画面に反映される
// 【使用例】
//   const NOTICE = {
//     enabled: true,
//     title: "臨時休診のお知らせ",
//     lines: [
//       "8月15日（土）は都合により休診とさせていただきます",
//       "ご不便をおかけし、誠に申し訳ございません"
//     ]
//   };
const NOTICE = {
  enabled: false,
  title: "臨時休診のお知らせ",
  lines: [
    "○月○日（○）は都合により休診とさせていただきます",
    "ご不便をおかけし、誠に申し訳ございません"
  ]
};
// ▲▲▲ NOTICE ここまで ▲▲▲

function chapterSlideWithIcon(seriesLabel, title, imageSrc){
  return `
    <div class="chapter-visual">
      <div class="chapter-icon"><img src="${imageSrc}" alt=""></div>
      <div class="chapter-copy">
        <div class="kicker">${seriesLabel}</div>
        <div class="headline chapter-title">${title}</div>
      </div>
    </div>
  `;
}

function singleStepSlide(seriesLabel, badgeLabel, step, text){
  return `
    ${seriesBadge(badgeLabel)}
    <div class="kicker">${seriesLabel}</div>
    <div class="single-step">
      <span class="step-big">${step}</span>
      <div class="step-text">${text}</div>
    </div>
  `;
}

// ▼▼▼ ここから SLIDES（スライド本体） ▼▼▼
// months: "all" または [表示したい月の配列]（例: [6,7,8,9]）
// duration: 表示秒数（通常は12でOK）
const SLIDES = [
  {
    id: "notice",
    title: "臨時お知らせ（enabled:falseのため通常は非表示）",
    category: "notice",
    months: "all",
    duration: 14,
    enabled: NOTICE.enabled,
    render: () => `
      <div class="kicker">お知らせ</div>
      <div class="headline small">${NOTICE.title}</div>
      <div class="point-list">
        ${NOTICE.lines.map(l => `<div class="point"><span class="dot"></span>${l}</div>`).join("")}
      </div>
    `
  },
  {
    id: "welcome",
    title: "院名・診療科紹介",
    category: "all",
    months: "all",
    duration: 12,
    weight: 2,
    tone: "navy",
    poster: "photos/photo_uketsuke.jpg",
    posterTextSide: "left",
    render: () => `
      <div class="kicker">${CLINIC.addressShort}</div>
      <div class="headline">${CLINIC.name}</div>
      <div class="motto-bar">「${CLINIC.motto}」</div>
      <div class="dept-list">
        ${CLINIC.departments.map(d => `<span class="dept-pill">${d}</span>`).join("")}
      </div>
    `
  },
  {
    id: "hours",
    title: "内科系診療時間",
    category: "all",
    months: "all",
    duration: 13,
    weight: 2,
    render: () => `
      <div class="kicker">診療時間のご案内</div>
      <div class="headline small">内科系診療</div>
      <div class="hours-wrap">
        ${renderHoursTable(CLINIC.hoursNaika)}
        <div class="hours-note">
          <strong>${CLINIC.hoursNaika.closedLabel}</strong>　／　${CLINIC.hoursNaika.receptionEnd}<br>
          ${CLINIC.hoursNaika.note}
        </div>
      </div>
    `
  },
  {
    id: "hours-gyn",
    title: "産婦人科診療時間",
    category: "all",
    months: "all",
    duration: 13,
    render: () => `
      <div class="kicker">診療時間のご案内</div>
      <div class="headline small">産婦人科</div>
      <div class="hours-wrap">
        ${renderHoursTable(CLINIC.hoursGyn)}
        <div class="hours-note">
          <strong>${CLINIC.hoursGyn.closedLabel}</strong><br>
          ${CLINIC.hoursGyn.note1}／${CLINIC.hoursGyn.note2}
        </div>
      </div>
    `
  },
  {
    id: "gyn-services",
    title: "婦人科診療のご案内（ピル外来・子宮がん検診）",
    category: "all",
    months: "all",
    duration: 12,
    image: "photos/photo_gyn_shinsatsu.jpg",
    render: () => `
      <div class="kicker">産婦人科診療</div>
      <div class="headline small">婦人科診療のご案内</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>女性医師（産婦人科専門医）が担当いたします</div>
        <div class="point"><span class="dot"></span><em>ピル外来</em>・子宮がん検診に対応しています</div>
        <div class="point"><span class="dot"></span>待合室は内科と分けております</div>
      </div>
    `
  },
  {
    id: "womens-space",
    title: "女性への配慮（待合室分離・プライバシー）",
    category: "all",
    months: "all",
    duration: 11,
    image: "photos/photo_machiai.jpg",
    imageReverse: true,
    render: () => `
      <div class="kicker">女性も安心して通える空間</div>
      <div class="headline small">女性にも安心な院内づくり</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>内科と婦人科の待合室を分けています</div>
        <div class="point"><span class="dot"></span><em>プライバシー</em>に配慮した院内です</div>
      </div>
    `
  },
  {
    id: "tokushu-kounenki-1",
    title: "更年期特集 1/5（こんな症状はありませんか）",
    category: "series",
    months: "all",
    duration: 12,
    tone: "rose",
    poster: "posters/poster_kounenki.jpg",
    posterTextSide: "left",
    render: () => `
      ${seriesBadge("更年期特集 1/5")}
      <div class="kicker">こんな症状はありませんか</div>
      <div class="headline small"><em>更年期</em>のサインかもしれません</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>ほてり・のぼせ</div>
        <div class="point"><span class="dot"></span>汗をかきやすい</div>
        <div class="point"><span class="dot"></span>眠れない</div>
        <div class="point"><span class="dot"></span>イライラ・気分の落ち込み</div>
      </div>
    `
  },
  {
    id: "tokushu-kounenki-2",
    title: "更年期特集 2/5（更年期のサイン）",
    category: "series",
    months: "all",
    duration: 11,
    image: "images/kounenki.jpg",
    tone: "rose",
    render: () => `
      ${seriesBadge("更年期特集 2/5")}
      <div class="kicker">更年期特集</div>
      <div class="headline small">それ、更年期のサインかもしれません</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>女性ホルモンの変化により、心とからだにさまざまな症状が現れます</div>
        <div class="point"><span class="dot"></span>症状の感じ方は人それぞれです</div>
      </div>
    `
  },
  {
    id: "tokushu-kounenki-3",
    title: "更年期特集 3/5（状態を知る）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "rose",
    render: () => `
      ${seriesBadge("更年期特集 3/5")}
      <div class="kicker">更年期特集</div>
      <div class="headline small">まずは、状態を知ることから</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>問診や、ホルモンの状態の確認などを行います</div>
      </div>
    `
  },
  {
    id: "tokushu-kounenki-4",
    title: "更年期特集 4/5（治療の選択肢）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "rose",
    render: () => `
      ${seriesBadge("更年期特集 4/5")}
      <div class="kicker">更年期特集</div>
      <div class="headline small">治療の選択肢があります</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>お薬や漢方薬など、症状やご希望に合わせて選べます</div>
        <div class="point"><span class="dot"></span>「年齢のせい」と我慢する必要はありません</div>
      </div>
    `
  },
  {
    id: "tokushu-kounenki-5",
    title: "更年期特集 5/5（女性医師がお話を伺います）",
    category: "series",
    months: "all",
    duration: 11,
    image: "photos/photo_gyn_shinsatsu.jpg",
    tone: "rose",
    render: () => `
      ${seriesBadge("更年期特集 5/5")}
      <div class="kicker">更年期特集</div>
      <div class="headline small">女性医師がお話を伺います</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>待合室は内科と分けています。安心してご来院ください</div>
      </div>
      <div class="dc-cta">婦人科へお気軽にご相談を</div>
    `
  },
  {
    id: "tokushu-pill-1",
    title: "ピル特集 1/11（女性の味方）",
    category: "series",
    months: "all",
    duration: 12,
    tone: "rose",
    poster: "posters/poster_pill.jpg",
    posterTextSide: "left",
    render: () => `
      ${seriesBadge("ピル特集 1/11")}
      <div class="kicker">ピル特集</div>
      <div class="headline small">ピルは、女性の味方です</div>
      <div class="sub">妊娠や月経と上手に付き合うための、選択肢のひとつです</div>
    `
  },
  {
    id: "tokushu-pill-2",
    title: "ピル特集 2/11（章扉：ピルはこんな目的で使われます）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "rose",
    centered: true,
    render: () => chapterSlide("ピル特集", "ピルはこんな目的で使われます")
  },
  {
    id: "tokushu-pill-3",
    title: "ピル特集 3/11（女性ならではのお悩みに）",
    category: "series",
    months: "all",
    duration: 11,
    image: "images/pill.jpg",
    tone: "rose",
    render: () => `
      ${seriesBadge("ピル特集 3/11")}
      <div class="kicker">ピル特集</div>
      <div class="headline small">女性ならではのお悩みに</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>月経困難症の治療</div>
        <div class="point"><span class="dot"></span>子宮内膜症の治療</div>
        <div class="point"><span class="dot"></span>避妊</div>
        <div class="point"><span class="dot"></span>生理日の移動</div>
        <div class="point"><span class="dot"></span>緊急避妊</div>
      </div>
    `
  },
  {
    id: "tokushu-pill-4",
    title: "ピル特集 4/11（章扉：ピルの仕組み）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "rose",
    centered: true,
    render: () => chapterSlide("ピル特集", "ピルの仕組み")
  },
  {
    id: "tokushu-pill-5",
    title: "ピル特集 5/11（ピルの仕組み）",
    category: "series",
    months: "all",
    duration: 11,
    image: "images/pill_hormone.jpg",
    tone: "rose",
    render: () => `
      ${seriesBadge("ピル特集 5/11")}
      <div class="kicker">ピル特集</div>
      <div class="headline small">2つのホルモンのはたらきで、排卵を抑えます</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>卵胞ホルモンと黄体ホルモンを含むお薬です</div>
        <div class="point"><span class="dot"></span>これにより月経のリズムをコントロールします</div>
      </div>
    `
  },
  {
    id: "tokushu-pill-6",
    title: "ピル特集 6/11（章扉：低用量ピル）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "rose",
    centered: true,
    render: () => chapterSlide("ピル特集", "低用量ピル")
  },
  {
    id: "tokushu-pill-7",
    title: "ピル特集 7/11（つらい生理の症状）",
    category: "series",
    months: "all",
    duration: 11,
    image: "images/step_hari.jpg",
    tone: "rose",
    render: () => `
      ${seriesBadge("ピル特集 7/11")}
      <div class="kicker">低用量ピル</div>
      <div class="headline small">つらい生理の症状をやわらげます</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>腹痛・腰痛・頭痛、吐き気、気分の落ち込みなど</div>
        <div class="point"><span class="dot"></span>月経困難症・子宮内膜症の治療に使われます</div>
      </div>
    `
  },
  {
    id: "tokushu-pill-8",
    title: "ピル特集 8/11（報告されている効果）",
    category: "series",
    months: "all",
    duration: 11,
    theme: "bold",
    tone: "rose",
    render: () => `
      ${seriesBadge("ピル特集 8/11")}
      <div class="kicker">低用量ピル</div>
      <div class="headline small">こんな効果も報告されています</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>生理不順や経血量の改善、ニキビの改善など</div>
        <div class="point"><span class="dot"></span>排卵を抑えるため、避妊にも有効です（理想的な使用での妊娠率は0.3％と報告されています）</div>
      </div>
    `
  },
  {
    id: "tokushu-pill-9",
    title: "ピル特集 9/11（中用量ピル）",
    category: "series",
    months: "all",
    duration: 11,
    image: "images/pill_calendar.jpg",
    tone: "rose",
    render: () => `
      ${seriesBadge("ピル特集 9/11")}
      <div class="kicker">中用量ピル</div>
      <div class="headline small">大切な予定に、生理日を合わせる</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>旅行・試合・結婚式などの予定に合わせ、あらかじめ服用して生理日をずらすことができます</div>
      </div>
    `
  },
  {
    id: "tokushu-pill-10",
    title: "ピル特集 10/11（アフターピル）",
    category: "series",
    months: "all",
    duration: 11,
    image: "images/pill_ec_clock.jpg",
    tone: "rose",
    render: () => `
      ${seriesBadge("ピル特集 10/11")}
      <div class="kicker">ピル特集</div>
      <div class="headline small">もしもの時は、72時間以内に</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>避妊がうまくいかなかった際、72時間以内の服用で望まない妊娠を避けるお薬があります（アフターピル）</div>
      </div>
    `
  },
  {
    id: "tokushu-pill-11",
    title: "ピル特集 11/11（正しく使えば、心強い選択肢）",
    category: "series",
    months: "all",
    duration: 11,
    image: "photos/photo_gyn_shinsatsu.jpg",
    tone: "rose",
    render: () => `
      ${seriesBadge("ピル特集 11/11")}
      <div class="kicker">ピル特集</div>
      <div class="headline small">正しく使えば、心強い選択肢です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>人によって処方できない場合や、注意が必要な場合があります</div>
        <div class="point"><span class="dot"></span>用法・用量を守って正しく使いましょう</div>
      </div>
      <div class="dc-cta">女性医師が診療しています。まずはご相談ください</div>
    `
  },
  {
    id: "endoscopy-count",
    title: "内視鏡実績",
    category: "all",
    months: "all",
    duration: 12,
    weight: 2,
    theme: "bold",
    tone: "green",
    render: () => `
      <div class="kicker">内視鏡検査 実績</div>
      <div class="sub">${CLINIC.endoscopy.totalLabel}（${CLINIC.endoscopy.asOf}）</div>
      <div class="huge-number">${formatNum(CLINIC.endoscopy.total)}<span class="unit">件</span></div>
      <div class="breakdown">
        <div class="item">胃カメラ<b>${formatNum(CLINIC.endoscopy.gastroTotal)}</b>件</div>
        <div class="item">大腸カメラ<b>${formatNum(CLINIC.endoscopy.colonoTotal)}</b>件</div>
      </div>
      <div class="month-badge">
        ${CLINIC.endoscopy.monthLabel}　<b>${formatNum(CLINIC.endoscopy.monthTotal)}件</b>
        （胃 ${CLINIC.endoscopy.monthGastro}・大腸 ${CLINIC.endoscopy.monthColono}）
      </div>
      <div class="mini-photo-card"><img src="photos/photo_naishikyo_room.jpg" alt=""></div>
    `
  },
  {
    id: "ai-endoscopy",
    title: "AI内視鏡診断支援",
    category: "all",
    months: "all",
    duration: 12,
    image: "photos/photo_naishikyo_room.jpg",
    render: () => `
      <div class="kicker">内視鏡検査の質へのこだわり</div>
      <div class="headline small"><em>AI内視鏡診断支援</em>を導入</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>大学病院レベルの検査機器を採用しています</div>
        <div class="point"><span class="dot"></span>AIが検査を支援し、見落としの少ない検査を目指しています</div>
      </div>
    `
  },
  {
    id: "senmon-i",
    title: "内視鏡担当医の専門医資格",
    category: "all",
    months: "all",
    duration: 11,
    image: "photos/photo_scope.jpg",
    imageReverse: true,
    render: () => `
      <div class="kicker">内視鏡検査を担当する医師</div>
      <div class="headline small"><em>専門医</em>による内視鏡検査</div>
      <div class="sub">消化器内視鏡専門医・消化器病専門医・肝臓専門医の資格を持つ医師が内視鏡検査を行います。</div>
    `
  },
  {
    id: "gastro",
    title: "胃カメラのご案内",
    category: "all",
    months: "all",
    duration: 12,
    image: "images/gastro.jpg",
    render: () => `
      <div class="kicker">胃カメラ検査</div>
      <div class="headline small"><em>胃カメラ</em>のご案内</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>経鼻・経口、お選びいただけます</div>
        <div class="point"><span class="dot"></span>鎮静剤を使用した検査にも対応しております</div>
        <div class="point"><span class="dot"></span>当日の検査についてもお気軽にご相談ください</div>
      </div>
    `
  },
  {
    id: "gastro-series-1",
    title: "胃カメラ特集 1/11（こんな症状ありませんか）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "green",
    poster: "posters/poster_gastro.jpg",
    posterTextSide: "right",
    render: () => `
      ${seriesBadge("胃カメラ特集 1/11")}
      <div class="kicker">胃カメラ特集</div>
      <div class="headline small">こんな症状、ありませんか？</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>胸やけ・げっぷが続く</div>
        <div class="point"><span class="dot"></span>胃の痛み・胃もたれ</div>
        <div class="point"><span class="dot"></span>黒っぽい便が出た</div>
        <div class="point"><span class="dot"></span>食欲不振が続く</div>
      </div>
    `
  },
  {
    id: "gastro-series-2",
    title: "胃カメラ特集 2/11（章扉：胃カメラとは）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "green",
    centered: true,
    render: () => chapterSlideWithIcon("胃カメラ特集", "胃カメラとは", "images/chapter_gastro.jpg")
  },
  {
    id: "gastro-series-3",
    title: "胃カメラ特集 3/11（胃カメラとは：直接確認する検査）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/gastro.jpg",
    theme: "bold",
    tone: "green",
    render: () => `
      ${seriesBadge("胃カメラ特集 3/11")}
      <div class="kicker">胃カメラ特集</div>
      <div class="headline small">食道・胃・十二指腸を、直接確認する検査です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>のど、または鼻からカメラを入れて粘膜を直接観察します</div>
        <div class="point"><span class="dot"></span>逆流性食道炎・胃潰瘍・ピロリ菌感染などの発見につながります</div>
      </div>
    `
  },
  {
    id: "gastro-series-4",
    title: "胃カメラ特集 4/11（章扉：検査の目的）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "green",
    centered: true,
    render: () => chapterSlide("胃カメラ特集", "検査の目的")
  },
  {
    id: "gastro-series-5",
    title: "胃カメラ特集 5/11（調べる・見つける）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    image: "images/naishikyo.jpg",
    render: () => `
      ${seriesBadge("胃カメラ特集 5/11")}
      ${diseaseCard({
        kicker: "胃カメラ特集",
        rows: [
          { label: "調べる", text: "胸やけ・胃痛などの原因を確認します" },
          { label: "見つける", text: "ピロリ菌は胃潰瘍や胃がんのリスク要因とされ、お薬による除菌治療につなげられます" }
        ]
      })}
      <div class="sub">健診のバリウム検査で異常を指摘された方の精密検査としても行われます</div>
    `
  },
  {
    id: "gastro-series-6",
    title: "胃カメラ特集 6/11（章扉：検査の流れ）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "green",
    centered: true,
    render: () => chapterSlide("胃カメラ特集", "検査の流れ")
  },
  {
    id: "gastro-series-7",
    title: "胃カメラ特集 7/11（検査の流れ：ステップ①）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    image: "images/zesshoku.jpg",
    render: () => singleStepSlide(
      "胃カメラ特集",
      "胃カメラ特集 7/11",
      1,
      "検査前の飲食はお控えいただきます（ご予約時に詳しくご案内します）"
    )
  },
  {
    id: "gastro-series-8",
    title: "胃カメラ特集 8/11（検査の流れ：ステップ②）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    image: "images/keibi_keiko.jpg",
    render: () => singleStepSlide(
      "胃カメラ特集",
      "胃カメラ特集 8/11",
      2,
      "経鼻・経口、鎮静剤の使用をお選びいただけます"
    )
  },
  {
    id: "gastro-series-9",
    title: "胃カメラ特集 9/11（検査の流れ：ステップ③）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    image: "photos/photo_recovery.jpg",
    render: () => singleStepSlide(
      "胃カメラ特集",
      "胃カメラ特集 9/11",
      3,
      "観察後はリカバリールームで休憩し、結果のご説明を聞いてご帰宅です"
    )
  },
  {
    id: "gastro-series-10",
    title: "胃カメラ特集 10/11（検査の注意点）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    image: "images/step_unten.jpg",
    render: () => `
      ${seriesBadge("胃カメラ特集 10/11")}
      <div class="kicker">検査の注意点</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>鎮静剤を使用した場合、当日はお車の運転はできません</div>
        <div class="point"><span class="dot"></span>組織検査を行った場合、結果のご説明まで少しお時間をいただきます</div>
      </div>
    `
  },
  {
    id: "gastro-series-11",
    title: "胃カメラ特集 11/11（思い立った日が検査日和・CTA）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    render: () => `
      ${seriesBadge("胃カメラ特集 11/11")}
      <div class="kicker">胃カメラ特集</div>
      <div class="headline small">思い立った日が、検査日和</div>
      <div class="sub">当日検査のご相談もできます。土曜午後も内視鏡検査を行っています</div>
      <div class="dc-cta">専門医＋AI支援の内視鏡。ご予約は受付・WEBで</div>
    `
  },
  {
    id: "gerd-series-1",
    title: "逆流性食道炎特集 1/5（胸やけ、くり返していませんか）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "green",
    render: () => `
      ${seriesBadge("逆流性食道炎特集 1/5")}
      <div class="kicker">逆流性食道炎特集</div>
      <div class="headline small">胸やけ、くり返していませんか？</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>胸やけ・げっぷが続く</div>
        <div class="point"><span class="dot"></span>酸っぱいものが上がってくる</div>
        <div class="point"><span class="dot"></span>のどの違和感・咳が続く</div>
      </div>
    `
  },
  {
    id: "gerd-series-2",
    title: "逆流性食道炎特集 2/5（章扉：逆流性食道炎とは）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "green",
    centered: true,
    render: () => chapterSlide("逆流性食道炎特集", "逆流性食道炎とは")
  },
  {
    id: "gerd-series-3",
    title: "逆流性食道炎特集 3/5（逆流性食道炎とは）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/gerd_stomach.jpg",
    tone: "green",
    render: () => `
      ${seriesBadge("逆流性食道炎特集 3/5")}
      <div class="kicker">逆流性食道炎特集</div>
      <div class="headline small">胃酸が食道に逆流して、炎症を起こす病気です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>食道は胃酸に弱く、粘膜が荒れてしまいます</div>
      </div>
    `
  },
  {
    id: "gerd-series-4",
    title: "逆流性食道炎特集 4/5（生活習慣）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "green",
    render: () => `
      ${seriesBadge("逆流性食道炎特集 4/5")}
      <div class="kicker">逆流性食道炎特集</div>
      <div class="headline small">生活習慣も、関係しています</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>食べてすぐ横になる</div>
        <div class="point"><span class="dot"></span>脂っこい食事・食べすぎ</div>
        <div class="point"><span class="dot"></span>前かがみの姿勢や、おなかの締めつけ</div>
      </div>
    `
  },
  {
    id: "gerd-series-5",
    title: "逆流性食道炎特集 5/5（まとめ）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/gastro.jpg",
    tone: "green",
    render: () => `
      ${seriesBadge("逆流性食道炎特集 5/5")}
      <div class="kicker">逆流性食道炎特集</div>
      <div class="headline small">胃カメラで、食道の状態を確認できます</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>お薬と生活習慣の工夫で改善を目指します</div>
      </div>
      <div class="dc-cta">つらい胸やけは、消化器内科へ</div>
    `
  },
  {
    id: "pylori-series-1",
    title: "ピロリ菌特集 1/5（調べたことはありますか）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/pylori_char.jpg",
    tone: "green",
    render: () => `
      ${seriesBadge("ピロリ菌特集 1/5")}
      <div class="kicker">ピロリ菌特集</div>
      <div class="headline small">ピロリ菌、調べたことはありますか？</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>胃の中にすみつく細菌です。多くは子どもの頃に感染するとされています</div>
      </div>
    `
  },
  {
    id: "pylori-series-2",
    title: "ピロリ菌特集 2/5（章扉：ピロリ菌のリスク）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "green",
    centered: true,
    render: () => chapterSlide("ピロリ菌特集", "ピロリ菌のリスク")
  },
  {
    id: "pylori-series-3",
    title: "ピロリ菌特集 3/5（かくれた原因）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    render: () => `
      ${seriesBadge("ピロリ菌特集 3/5")}
      <div class="kicker">ピロリ菌特集</div>
      <div class="headline small">胃の病気の、かくれた原因です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>【放置すると】慢性胃炎・胃潰瘍の原因になります</div>
        <div class="point"><span class="dot"></span>【放置すると】胃がんのリスク要因とされています</div>
      </div>
    `
  },
  {
    id: "pylori-series-4",
    title: "ピロリ菌特集 4/5（検査と除菌）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "green",
    render: () => `
      ${seriesBadge("ピロリ菌特集 4/5")}
      <div class="kicker">ピロリ菌特集</div>
      <div class="headline small">検査も除菌も、できます</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>検査で感染の有無を調べられます</div>
        <div class="point"><span class="dot"></span>除菌は約1週間、お薬を飲む治療です</div>
      </div>
    `
  },
  {
    id: "pylori-series-5",
    title: "ピロリ菌特集 5/5（まとめ）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "green",
    render: () => `
      ${seriesBadge("ピロリ菌特集 5/5")}
      <div class="kicker">ピロリ菌特集</div>
      <div class="headline small">除菌して終わり、ではありません</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>除菌後も、定期的な胃カメラでの経過観察がすすめられています</div>
      </div>
      <div class="dc-cta">胃の健康が気になる方は、ご相談を</div>
    `
  },
  {
    id: "colono",
    title: "大腸カメラのご案内",
    category: "all",
    months: "all",
    duration: 12,
    image: "images/colono.jpg",
    render: () => `
      <div class="kicker">大腸カメラ検査</div>
      <div class="headline small"><em>大腸カメラ</em>のご案内</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>下剤は自宅または院内から選べます</div>
        <div class="point"><span class="dot"></span>日帰りでのポリープ切除にも対応しております</div>
        <div class="point"><span class="dot"></span>鎮静剤を使用した検査にも対応しております</div>
      </div>
    `
  },
  {
    id: "colono-flow",
    title: "大腸カメラの受診の流れ（2ステップ）",
    category: "all",
    months: "all",
    duration: 12,
    render: () => `
      <div class="kicker">大腸カメラの流れ</div>
      <div class="headline small">大腸カメラは2ステップ</div>
      <div class="numbered-list">
        ${["事前外来で症状やお薬を確認", "検査日を決めて検査へ"].map((d, i) => `
          <div class="n-item"><span class="n-badge">${i + 1}</span>${d}</div>
        `).join("")}
      </div>
      <div class="sub">血便・下血など緊急性がある場合は<em>毎日ご相談</em>を受けています</div>
    `
  },
  {
    id: "colono-series-1",
    title: "大腸カメラ特集 1/13（こんなサインありませんか）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "green",
    poster: "posters/poster_colono.jpg",
    posterTextSide: "left",
    render: () => `
      ${seriesBadge("大腸カメラ特集 1/13")}
      <div class="kicker">大腸カメラ特集</div>
      <div class="headline small">こんなサイン、ありませんか？</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>便に血が混じる</div>
        <div class="point"><span class="dot"></span>便が細くなった</div>
        <div class="point"><span class="dot"></span>残便感がある</div>
        <div class="point"><span class="dot"></span>便秘や下痢をくり返す</div>
      </div>
      <div class="dc-cta">ひとつでも当てはまる方は、この続きをご覧ください</div>
    `
  },
  {
    id: "colono-series-2",
    title: "大腸カメラ特集 2/13（章扉：大腸カメラとは）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "green",
    centered: true,
    render: () => chapterSlideWithIcon("大腸カメラ特集", "大腸カメラとは", "images/chapter_colono.jpg")
  },
  {
    id: "colono-series-3",
    title: "大腸カメラ特集 3/13（大腸カメラとは：直接確認する検査）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/colono.jpg",
    theme: "bold",
    tone: "green",
    render: () => `
      ${seriesBadge("大腸カメラ特集 3/13")}
      <div class="kicker">大腸カメラ特集</div>
      <div class="headline small">大腸の中を、直接確認する検査です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>カメラのついた細い管で、大腸の粘膜を直接観察します</div>
        <div class="point"><span class="dot"></span>大腸がんは日本人に多いがん。早期はほとんど自覚症状がありません</div>
      </div>
    `
  },
  {
    id: "colono-series-4",
    title: "大腸カメラ特集 4/13（章扉：検査の目的）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "green",
    centered: true,
    render: () => chapterSlide("大腸カメラ特集", "検査の目的")
  },
  {
    id: "colono-series-5",
    title: "大腸カメラ特集 5/13（調べる・見つける・治す）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    image: "images/mokuteki_shiraberu.jpg",
    render: () => `
      ${seriesBadge("大腸カメラ特集 5/13")}
      ${diseaseCard({
        kicker: "大腸カメラ特集",
        rows: [
          { label: "調べる", text: "大腸に病変がないかを確認します" },
          { label: "見つける", text: "必要に応じて組織を採取し、詳しく調べます" },
          { label: "治す", text: "小さなポリープは、その場で日帰り切除できます" }
        ]
      })}
      <div class="sub">便潜血陽性の精密検査としても行われます</div>
    `
  },
  {
    id: "colono-series-6",
    title: "大腸カメラ特集 6/13（章扉：検査の流れ）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "green",
    centered: true,
    render: () => chapterSlide("大腸カメラ特集", "検査の流れ")
  },
  {
    id: "colono-series-7",
    title: "大腸カメラ特集 7/13（検査の流れ：ステップ①）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    image: "images/step_jizen.jpg",
    render: () => singleStepSlide(
      "大腸カメラ特集",
      "大腸カメラ特集 7/13",
      1,
      "事前外来で、症状やお薬を確認し検査のご説明をします"
    )
  },
  {
    id: "colono-series-8",
    title: "大腸カメラ特集 8/13（検査の流れ：ステップ②）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    image: "images/step_senjo.jpg",
    render: () => singleStepSlide(
      "大腸カメラ特集",
      "大腸カメラ特集 8/13",
      2,
      "検査当日、腸管洗浄液で大腸をきれいにします（ご自宅・院内から選べます）"
    )
  },
  {
    id: "colono-series-9",
    title: "大腸カメラ特集 9/13（検査の流れ：ステップ③）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    image: "images/step_chinsei.jpg",
    render: () => singleStepSlide(
      "大腸カメラ特集",
      "大腸カメラ特集 9/13",
      3,
      "ご希望に応じて、鎮静剤を使ってうとうとしている間に検査します"
    )
  },
  {
    id: "colono-series-10",
    title: "大腸カメラ特集 10/13（検査の流れ：ステップ④）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    image: "images/step_setsujo.jpg",
    render: () => singleStepSlide(
      "大腸カメラ特集",
      "大腸カメラ特集 10/13",
      4,
      "ポリープが見つかれば、その場で切除します"
    )
  },
  {
    id: "colono-series-11",
    title: "大腸カメラ特集 11/13（検査の流れ：ステップ⑤）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    image: "photos/photo_recovery.jpg",
    render: () => singleStepSlide(
      "大腸カメラ特集",
      "大腸カメラ特集 11/13",
      5,
      "リカバリールームで休憩し、結果のご説明を聞いてご帰宅です"
    )
  },
  {
    id: "colono-series-12",
    title: "大腸カメラ特集 12/13（検査の注意点）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    image: "images/step_unten.jpg",
    render: () => `
      ${seriesBadge("大腸カメラ特集 12/13")}
      <div class="kicker">検査の注意点</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>検査前は食事の注意があります（事前外来で詳しくご案内します）</div>
        <div class="point"><span class="dot"></span>検査後、お腹の張りを感じることがありますが、しばらくすると落ち着きます</div>
        <div class="point"><span class="dot"></span>鎮静剤を使用した場合、当日はお車の運転はできません</div>
      </div>
    `
  },
  {
    id: "colono-series-13",
    title: "大腸カメラ特集 13/13（早期発見・CTA）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    image: "images/step_kitaku.jpg",
    render: () => `
      ${seriesBadge("大腸カメラ特集 13/13")}
      <div class="kicker">大腸カメラ特集</div>
      <div class="headline small">大腸カメラは、大腸がんの早期発見に役立ちます</div>
      <div class="number-callout"><span class="num">35歳</span><span class="label">を過ぎた方も</span></div>
      <div class="sub">血便がある方・便潜血陽性の方・35歳を過ぎた方は、一度ご相談ください</div>
      <div class="dc-cta">当院で行っています。ご予約は受付・WEBで</div>
    `
  },
  {
    id: "benketsu-series-1",
    title: "便潜血特集 1/6（陽性のサイン）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "navy",
    poster: "posters/poster_kenshin.jpg",
    posterTextSide: "left",
    render: () => `
      ${seriesBadge("便潜血特集 1/6")}
      <div class="kicker">便潜血特集</div>
      <div class="headline small">健診で便潜血「陽性」、そのままにしていませんか？</div>
      <div class="sub">精密検査が必要というサインです</div>
    `
  },
  {
    id: "benketsu-series-2",
    title: "便潜血特集 2/6（章扉：便潜血検査とは）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "navy",
    centered: true,
    render: () => chapterSlide("便潜血特集", "便潜血検査とは")
  },
  {
    id: "benketsu-series-3",
    title: "便潜血特集 3/6（便潜血検査とは）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/benketsu_kit.jpg",
    tone: "navy",
    render: () => `
      ${seriesBadge("便潜血特集 3/6")}
      <div class="kicker">便潜血特集</div>
      <div class="headline small">大腸からの小さな出血を調べる検査です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>健診や横浜市大腸がん検診で広く行われています</div>
        <div class="point"><span class="dot"></span>目に見えない出血もとらえることができます</div>
      </div>
    `
  },
  {
    id: "benketsu-series-4",
    title: "便潜血特集 4/6（精密検査が必要なサイン）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "navy",
    render: () => `
      ${seriesBadge("便潜血特集 4/6")}
      <div class="kicker">便潜血特集</div>
      <div class="headline small">「陽性」は、精密検査が必要というサインです</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>「痔だろう」の自己判断は禁物です</div>
        <div class="point"><span class="dot"></span>【放置すると】大腸がんやポリープが隠れていることがあります</div>
      </div>
    `
  },
  {
    id: "benketsu-series-5",
    title: "便潜血特集 5/6（精密検査は大腸カメラで）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/colono.jpg",
    tone: "navy",
    render: () => `
      ${seriesBadge("便潜血特集 5/6")}
      <div class="kicker">便潜血特集</div>
      <div class="headline small">精密検査は、大腸カメラで</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>出血の原因を直接確認できます</div>
        <div class="point"><span class="dot"></span>ポリープが見つかれば、その場で日帰り切除も</div>
      </div>
    `
  },
  {
    id: "benketsu-series-6",
    title: "便潜血特集 6/6（陽性と言われたら）",
    category: "series",
    months: "all",
    duration: 10,
    image: "photos/photo_naishikyo_room.jpg",
    tone: "navy",
    render: () => `
      ${seriesBadge("便潜血特集 6/6")}
      <div class="kicker">便潜血特集</div>
      <div class="headline small">陽性と言われたら、お早めに</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>血便・下血のご相談は毎日受け付けています</div>
      </div>
      <div class="dc-cta">まずは事前外来へ。ご予約は受付・WEBで</div>
    `
  },
  {
    id: "onaka-series-1",
    title: "おなかの不調特集 1/6（くり返す不調）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/ibs_stress.jpg",
    tone: "green",
    render: () => `
      ${seriesBadge("おなかの不調特集 1/6")}
      <div class="kicker">おなかの不調特集</div>
      <div class="headline small">通勤中にお腹が痛くなる。会議の前に、下痢をする。</div>
      <div class="sub">くり返す便秘・下痢・お腹の張りや痛み</div>
    `
  },
  {
    id: "onaka-series-2",
    title: "おなかの不調特集 2/6（章扉：過敏性腸症候群（IBS）とは）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "green",
    centered: true,
    render: () => chapterSlide("おなかの不調特集", "過敏性腸症候群（IBS）とは")
  },
  {
    id: "onaka-series-3",
    title: "おなかの不調特集 3/6（IBSとは）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "green",
    render: () => `
      ${seriesBadge("おなかの不調特集 3/6")}
      <div class="kicker">おなかの不調特集</div>
      <div class="headline small">検査では異常がないのに、症状がくり返す状態です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>腸の動きや知覚が敏感になることで起こると考えられています</div>
        <div class="point"><span class="dot"></span>ストレスや生活リズムと関わりがあるとされています</div>
      </div>
    `
  },
  {
    id: "onaka-series-4",
    title: "おなかの不調特集 4/6（タイプはさまざま）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "green",
    render: () => `
      ${seriesBadge("おなかの不調特集 4/6")}
      <div class="kicker">おなかの不調特集</div>
      <div class="headline small">タイプはさまざまです</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>下痢が続くタイプ</div>
        <div class="point"><span class="dot"></span>便秘が続くタイプ</div>
        <div class="point"><span class="dot"></span>下痢と便秘をくり返すタイプ</div>
      </div>
    `
  },
  {
    id: "onaka-series-5",
    title: "おなかの不調特集 5/6（ほかの病気の確認）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/colono.jpg",
    tone: "green",
    render: () => `
      ${seriesBadge("おなかの不調特集 5/6")}
      <div class="kicker">おなかの不調特集</div>
      <div class="headline small">大切なのは、ほかの病気がないかの確認です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>大腸カメラで炎症やポリープなどがないかを調べられます</div>
      </div>
    `
  },
  {
    id: "onaka-series-6",
    title: "おなかの不調特集 6/6（IBS・FD専門外来）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "green",
    render: () => `
      ${seriesBadge("おなかの不調特集 6/6")}
      <div class="kicker">おなかの不調特集</div>
      <div class="headline small">IBS・FD専門外来があります</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>食事・生活の工夫とお薬で改善を目指します</div>
      </div>
      <div class="dc-cta">お一人で抱え込まずに、ご相談を</div>
    `
  },
  {
    id: "fd-series-1",
    title: "機能性ディスペプシア（FD）特集 1/4（胃もたれ・すぐ満腹）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/fd_stomach.jpg",
    tone: "green",
    render: () => `
      ${seriesBadge("機能性ディスペプシア（FD）特集 1/4")}
      <div class="kicker">機能性ディスペプシア（FD）特集</div>
      <div class="headline small">胃もたれ・すぐ満腹。でも「異常なし」？</div>
      <div class="sub">検査では異常がないのに、胃の不調が続く状態です</div>
    `
  },
  {
    id: "fd-series-2",
    title: "機能性ディスペプシア（FD）特集 2/4（章扉：機能性ディスペプシア（FD）とは）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "green",
    centered: true,
    render: () => chapterSlide("機能性ディスペプシア（FD）特集", "機能性ディスペプシア（FD）とは")
  },
  {
    id: "fd-series-3",
    title: "機能性ディスペプシア（FD）特集 3/4（胃の働きの問題）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "green",
    render: () => `
      ${seriesBadge("機能性ディスペプシア（FD）特集 3/4")}
      <div class="kicker">機能性ディスペプシア（FD）特集</div>
      <div class="headline small">胃の「働き」の問題で起こる不調です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>胃の動きや知覚が敏感になることで起こると考えられています</div>
        <div class="point"><span class="dot"></span>ストレスや生活リズムとも関わりがあります</div>
      </div>
    `
  },
  {
    id: "fd-series-4",
    title: "機能性ディスペプシア（FD）特集 4/4（まとめ）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/gastro.jpg",
    tone: "green",
    render: () => `
      ${seriesBadge("機能性ディスペプシア（FD）特集 4/4")}
      <div class="kicker">機能性ディスペプシア（FD）特集</div>
      <div class="headline small">まずは胃カメラで、ほかの病気がないかを確認</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>そのうえで、お薬や生活の工夫で改善を目指します</div>
      </div>
      <div class="dc-cta">IBS・FD専門外来へご相談を</div>
    `
  },
  {
    id: "sign-series-1",
    title: "からだからのサイン特集 1/5（見逃していませんか）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "navy",
    render: () => `
      ${seriesBadge("からだからのサイン特集 1/5")}
      <div class="kicker">からだからのサイン特集</div>
      <div class="headline small">からだからのサイン、見逃していませんか？</div>
      <div class="sub">痛みだけが、受診のきっかけではありません</div>
    `
  },
  {
    id: "sign-series-2",
    title: "からだからのサイン特集 2/5（黒い便）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "navy",
    render: () => `
      ${seriesBadge("からだからのサイン特集 2/5")}
      <div class="kicker">からだからのサイン特集</div>
      <div class="headline small">黒い便が、出た</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>胃や十二指腸からの出血で、便が黒くなることがあります</div>
        <div class="point"><span class="dot"></span>一度、胃カメラでの確認をおすすめします</div>
      </div>
    `
  },
  {
    id: "sign-series-3",
    title: "からだからのサイン特集 3/5（体重が減る）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/sign_taiju.jpg",
    tone: "navy",
    render: () => `
      ${seriesBadge("からだからのサイン特集 3/5")}
      <div class="kicker">からだからのサイン特集</div>
      <div class="headline small">ダイエットしていないのに、体重が減る</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>消化器の病気がかくれていることがあります</div>
        <div class="point"><span class="dot"></span>気になる減り方は、ご相談ください</div>
      </div>
    `
  },
  {
    id: "sign-series-4",
    title: "からだからのサイン特集 4/5（家族歴）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/sign_family.jpg",
    tone: "navy",
    render: () => `
      ${seriesBadge("からだからのサイン特集 4/5")}
      <div class="kicker">からだからのサイン特集</div>
      <div class="headline small">ご家族に、胃がん・大腸がんの方がいる</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>ご家族に病歴のある方は、リスクが高いとされています</div>
        <div class="point"><span class="dot"></span>症状がなくても、内視鏡検査を検討しましょう</div>
      </div>
    `
  },
  {
    id: "sign-series-5",
    title: "からだからのサイン特集 5/5（まとめ）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "navy",
    render: () => `
      ${seriesBadge("からだからのサイン特集 5/5")}
      <div class="kicker">からだからのサイン特集</div>
      <div class="headline small">サインに気づいたら、内視鏡で確認を</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>当日の胃カメラ相談・毎日の血便相談に対応しています</div>
      </div>
      <div class="dc-cta">消化器内科へお気軽にどうぞ</div>
    `
  },
  {
    id: "geri-suibun",
    title: "嘔吐・下痢のときの水分補給",
    category: "all",
    months: "all",
    duration: 11,
    image: "images/suibun.jpg",
    render: () => `
      <div class="kicker">嘔吐・下痢のときは</div>
      <div class="headline small">こまめな水分補給を</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>少量ずつ・こまめに水分を</div>
        <div class="point"><span class="dot"></span><em>経口補水液</em>が役立つこともあります</div>
        <div class="point"><span class="dot"></span>水分がとれないほどつらいときは受診を</div>
      </div>
    `
  },
  {
    id: "hinketsu-series-1",
    title: "貧血ミニ特集 1/3（そのだるさ、貧血かもしれません）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/hinketsu_fura.jpg",
    tone: "green",
    render: () => `
      ${seriesBadge("貧血ミニ特集 1/3")}
      <div class="kicker">貧血ミニ特集</div>
      <div class="headline small">そのだるさ、貧血かもしれません</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>だるい・疲れやすい</div>
        <div class="point"><span class="dot"></span>立ちくらみ・息切れ</div>
        <div class="point"><span class="dot"></span>健診で貧血を指摘された</div>
      </div>
    `
  },
  {
    id: "hinketsu-series-2",
    title: "貧血ミニ特集 2/3（出血がかくれていることも）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    render: () => `
      ${seriesBadge("貧血ミニ特集 2/3")}
      <div class="kicker">貧血ミニ特集</div>
      <div class="headline small">貧血の陰に、出血がかくれていることも</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>胃や大腸からの出血が原因のことがあります</div>
        <div class="point"><span class="dot"></span>特に男性の貧血は、一度検査での確認をおすすめします</div>
      </div>
    `
  },
  {
    id: "hinketsu-series-3",
    title: "貧血ミニ特集 3/3（まとめ）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "green",
    render: () => `
      ${seriesBadge("貧血ミニ特集 3/3")}
      <div class="kicker">貧血ミニ特集</div>
      <div class="headline small">血液検査と内視鏡で、原因を調べられます</div>
      <div class="dc-cta">健診で指摘された方は、お早めに</div>
    `
  },
  {
    id: "ji-series-1",
    title: "痔のお悩み特集 1/6（座るとつらい）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/ji.jpg",
    tone: "green",
    render: () => `
      ${seriesBadge("痔のお悩み特集 1/6")}
      <div class="kicker">痔のお悩み特集</div>
      <div class="headline small">座るとつらい。拭くと血がつく。</div>
      <div class="sub">出血・痛み・かゆみ・脱出感</div>
    `
  },
  {
    id: "ji-series-2",
    title: "痔のお悩み特集 2/6（章扉：痔とは）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "green",
    centered: true,
    render: () => chapterSlide("痔のお悩み特集", "痔とは")
  },
  {
    id: "ji-series-3",
    title: "痔のお悩み特集 3/6（痔のタイプ）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/ji_types.jpg",
    tone: "green",
    render: () => `
      ${seriesBadge("痔のお悩み特集 3/6")}
      <div class="kicker">痔のお悩み特集</div>
      <div class="headline small">いぼ痔と切れ痔、タイプがあります</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>いぼ痔（痔核）: 肛門のまわりの血流のうっ滞などでできます</div>
        <div class="point"><span class="dot"></span>切れ痔（裂肛）: 硬い便などで肛門が切れて起こります</div>
      </div>
    `
  },
  {
    id: "ji-series-4",
    title: "痔のお悩み特集 4/6（別の病気だったことも）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "green",
    render: () => `
      ${seriesBadge("痔のお悩み特集 4/6")}
      <div class="kicker">痔のお悩み特集</div>
      <div class="headline small">「痔だろう」と思っていたら、別の病気だったことも</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>【放置すると】血便の原因が痔とは限りません。大腸カメラでの確認が安心です</div>
      </div>
    `
  },
  {
    id: "ji-series-5",
    title: "痔のお悩み特集 5/6（お薬と生活習慣）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "green",
    render: () => `
      ${seriesBadge("痔のお悩み特集 5/6")}
      <div class="kicker">痔のお悩み特集</div>
      <div class="headline small">治療は、お薬と生活習慣の見直しから</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>便通を整えることも大切な治療のひとつです</div>
      </div>
    `
  },
  {
    id: "ji-series-6",
    title: "痔のお悩み特集 6/6（肛門内科へ）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "green",
    render: () => `
      ${seriesBadge("痔のお悩み特集 6/6")}
      <div class="kicker">痔のお悩み特集</div>
      <div class="headline small">恥ずかしがらずに、肛門内科へ</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>待合室のプライバシーにも配慮しています</div>
      </div>
      <div class="dc-cta">診察は数分です。まずはご相談を</div>
    `
  },
  {
    id: "dock",
    title: "人間ドック",
    category: "all",
    months: "all",
    duration: 11,
    image: "photos/photo_echo.jpg",
    render: () => `
      <div class="kicker">人間ドック</div>
      <div class="headline small"><em>人間ドック</em>のご案内</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>胃カメラ・大腸カメラを組み合わせた人間ドックを実施しています</div>
        <div class="point"><span class="dot"></span>詳しくは受付、または当院ホームページをご覧ください</div>
      </div>
    `
  },
  {
    id: "dock-series-1",
    title: "人間ドック特集 1/5（からだの総点検）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "navy",
    render: () => `
      ${seriesBadge("人間ドック特集 1/5")}
      <div class="kicker">人間ドック特集</div>
      <div class="headline small">からだの総点検、していますか？</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>症状が出る前に見つける。それが人間ドックの役割です</div>
      </div>
    `
  },
  {
    id: "dock-series-2",
    title: "人間ドック特集 2/5（章扉：当院の人間ドック）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "navy",
    centered: true,
    render: () => chapterSlide("人間ドック特集", "当院の人間ドック")
  },
  {
    id: "dock-series-3",
    title: "人間ドック特集 3/5（胃カメラ・大腸カメラ）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/naishikyo.jpg",
    tone: "navy",
    render: () => `
      ${seriesBadge("人間ドック特集 3/5")}
      <div class="kicker">人間ドック特集</div>
      <div class="headline small">胃カメラ・大腸カメラを組み合わせられます</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>内視鏡専門医＋AI支援の検査を、ドックでも</div>
      </div>
    `
  },
  {
    id: "dock-series-4",
    title: "人間ドック特集 4/5（おすすめの方）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "navy",
    render: () => `
      ${seriesBadge("人間ドック特集 4/5")}
      <div class="kicker">人間ドック特集</div>
      <div class="headline small">こんな方に、おすすめです</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>35歳を過ぎて、内視鏡を受けたことがない</div>
        <div class="point"><span class="dot"></span>ご家族に胃がん・大腸がんの方がいる</div>
        <div class="point"><span class="dot"></span>健診の結果が気になっている</div>
      </div>
    `
  },
  {
    id: "dock-series-5",
    title: "人間ドック特集 5/5（まとめ）",
    category: "series",
    months: "all",
    duration: 10,
    image: "photos/photo_echo.jpg",
    tone: "navy",
    render: () => `
      ${seriesBadge("人間ドック特集 5/5")}
      <div class="kicker">人間ドック特集</div>
      <div class="headline small">年に1度の、からだへの投資です</div>
      <div class="dc-cta">詳しくは受付・当院ホームページへ</div>
    `
  },
  {
    id: "seikatsu-shukan",
    title: "生活習慣病外来",
    category: "all",
    months: "all",
    duration: 11,
    image: "images/seikatsu.jpg",
    render: () => `
      <div class="kicker"><em>生活習慣病外来</em></div>
      <div class="headline small">血圧・血糖・コレステロールが気になる方へ</div>
      <div class="sub">継続的な通院でのサポートに対応しています。</div>
    `
  },
  {
    id: "himan-gairai",
    title: "肥満外来のご案内（自費診療）",
    category: "all",
    months: "all",
    duration: 11,
    image: "images/seikatsu.jpg",
    imageReverse: true,
    render: () => `
      <div class="kicker">肥満外来</div>
      <div class="headline small"><em>肥満外来</em>のご案内</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>肥満は生活習慣病と関わりの深いテーマです</div>
        <div class="point"><span class="dot"></span>当院では肥満外来のご相談に対応しています（自費診療）</div>
      </div>
    `
  },
  {
    id: "seikatsu-series-1",
    title: "生活習慣病特集 1/14（健診の数値チェック）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "navy",
    render: () => `
      ${seriesBadge("生活習慣病特集 1/14")}
      <div class="kicker">生活習慣病特集</div>
      <div class="headline small">健診の数値、見なかったことにしていませんか？</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>血圧が高め</div>
        <div class="point"><span class="dot"></span>血糖値・HbA1cが高め</div>
        <div class="point"><span class="dot"></span>コレステロール・中性脂肪が高め</div>
      </div>
    `
  },
  {
    id: "seikatsu-series-2",
    title: "生活習慣病特集 2/14（章扉：生活習慣病とは）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "navy",
    centered: true,
    render: () => chapterSlide("生活習慣病特集", "生活習慣病とは")
  },
  {
    id: "seikatsu-series-3",
    title: "生活習慣病特集 3/14（サイレントキラー）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "navy",
    render: () => `
      ${seriesBadge("生活習慣病特集 3/14")}
      <div class="kicker">生活習慣病特集</div>
      <div class="headline small">生活習慣病は「サイレントキラー」とも呼ばれます</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>自覚症状がほとんどないまま、静かに進行します</div>
      </div>
    `
  },
  {
    id: "seikatsu-series-4",
    title: "生活習慣病特集 4/14（章扉：高血圧）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "navy",
    centered: true,
    render: () => chapterSlide("生活習慣病特集", "高血圧")
  },
  {
    id: "seikatsu-series-5",
    title: "生活習慣病特集 5/14（高血圧とは）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/kouketsuatsu_cuff.jpg",
    tone: "navy",
    render: () => `
      ${seriesBadge("生活習慣病特集 5/14")}
      <div class="kicker">高血圧</div>
      <div class="headline small">血管に、常に高い圧力がかかる状態です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>血管が傷つきやすくなり、動脈硬化が進む原因になります</div>
        <div class="point"><span class="dot"></span>自覚症状はほとんどありません</div>
      </div>
    `
  },
  {
    id: "seikatsu-series-6",
    title: "生活習慣病特集 6/14（高血圧の管理）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "navy",
    render: () => `
      ${seriesBadge("生活習慣病特集 6/14")}
      <div class="kicker">高血圧</div>
      <div class="headline small">減塩・運動・体重管理が基本です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>必要に応じてお薬で管理します</div>
        <div class="point"><span class="dot"></span>ご家庭での血圧測定も大切です</div>
      </div>
    `
  },
  {
    id: "seikatsu-series-7",
    title: "生活習慣病特集 7/14（章扉：糖尿病）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "navy",
    centered: true,
    render: () => chapterSlide("生活習慣病特集", "糖尿病")
  },
  {
    id: "seikatsu-series-8",
    title: "生活習慣病特集 8/14（糖尿病とは）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/tounyou_sugar.jpg",
    tone: "navy",
    render: () => `
      ${seriesBadge("生活習慣病特集 8/14")}
      <div class="kicker">糖尿病</div>
      <div class="headline small">血糖を下げるホルモンの働きが弱くなる病気です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>のどが渇く・疲れやすいなどのサインが出ることもあります</div>
      </div>
    `
  },
  {
    id: "seikatsu-series-9",
    title: "生活習慣病特集 9/14（糖尿病の合併症）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "navy",
    render: () => `
      ${seriesBadge("生活習慣病特集 9/14")}
      <div class="kicker">糖尿病</div>
      <div class="headline small">こわいのは、合併症です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>【放置すると】目・腎臓・神経などに合併症が起こることがあります</div>
        <div class="point"><span class="dot"></span>早めの管理で防ぐことが大切です</div>
      </div>
    `
  },
  {
    id: "seikatsu-series-10",
    title: "生活習慣病特集 10/14（章扉：脂質異常症）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "navy",
    centered: true,
    render: () => chapterSlide("生活習慣病特集", "脂質異常症")
  },
  {
    id: "seikatsu-series-11",
    title: "生活習慣病特集 11/14（脂質異常症とは）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/shishitsu_vessel.jpg",
    tone: "navy",
    render: () => `
      ${seriesBadge("生活習慣病特集 11/14")}
      <div class="kicker">脂質異常症</div>
      <div class="headline small">コレステロールや中性脂肪のバランスの乱れです</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>自覚症状のないまま、血管の中で動脈硬化が進むことがあります</div>
      </div>
    `
  },
  {
    id: "seikatsu-series-12",
    title: "生活習慣病特集 12/14（そのままにしておくと）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/seikatsu_kessen.jpg",
    tone: "navy",
    render: () => `
      ${seriesBadge("生活習慣病特集 12/14")}
      <div class="kicker">生活習慣病特集</div>
      <div class="headline small">そのままにしておくと…</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>【放置すると】脳卒中・心筋梗塞・腎臓の病気などのリスクが高まるとされています</div>
      </div>
    `
  },
  {
    id: "seikatsu-series-13",
    title: "生活習慣病特集 13/14（数値は変えていける）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "navy",
    render: () => `
      ${seriesBadge("生活習慣病特集 13/14")}
      <div class="kicker">生活習慣病特集</div>
      <div class="headline small">数値は、変えていけます</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>生活習慣の見直しと、必要に応じたお薬で管理します</div>
        <div class="point"><span class="dot"></span>療養計画書で治療目標を一緒に決めます</div>
      </div>
    `
  },
  {
    id: "seikatsu-series-14",
    title: "生活習慣病特集 14/14（まとめ）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "navy",
    render: () => `
      ${seriesBadge("生活習慣病特集 14/14")}
      <div class="kicker">生活習慣病特集</div>
      <div class="headline small">健診の数値が気になったら</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>「まだ大丈夫」のうちが、始めどきです</div>
      </div>
      <div class="dc-cta">生活習慣病外来で継続サポート</div>
    `
  },
  {
    id: "shikyu-series-1",
    title: "子宮頸がん検診特集 1/5（最後に受けたのはいつですか）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/gyn.jpg",
    tone: "rose",
    render: () => `
      ${seriesBadge("子宮頸がん検診特集 1/5")}
      <div class="kicker">子宮頸がん検診特集</div>
      <div class="headline small">最後に子宮頸がん検診を受けたのは、いつですか？</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>20歳から、2年に1回の検診がすすめられています</div>
      </div>
    `
  },
  {
    id: "shikyu-series-2",
    title: "子宮頸がん検診特集 2/5（章扉：子宮頸がん検診とは）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "rose",
    centered: true,
    render: () => chapterSlide("子宮頸がん検診特集", "子宮頸がん検診とは")
  },
  {
    id: "shikyu-series-3",
    title: "子宮頸がん検診特集 3/5（検査内容）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/shikyu_kenshin.jpg",
    tone: "rose",
    render: () => `
      ${seriesBadge("子宮頸がん検診特集 3/5")}
      <div class="kicker">子宮頸がん検診特集</div>
      <div class="headline small">子宮の入り口の細胞を調べる検査です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>検査そのものは数分で終わります</div>
        <div class="point"><span class="dot"></span>早期には自覚症状がほとんどありません</div>
      </div>
    `
  },
  {
    id: "shikyu-series-4",
    title: "子宮頸がん検診特集 4/5（女性医師が行います）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "rose",
    render: () => `
      ${seriesBadge("子宮頸がん検診特集 4/5")}
      <div class="kicker">子宮頸がん検診特集</div>
      <div class="headline small">当院では、女性医師が行います</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>横浜市の検診にも対応しています</div>
        <div class="point"><span class="dot"></span>痛みや不安に配慮して行います</div>
      </div>
    `
  },
  {
    id: "shikyu-series-5",
    title: "子宮頸がん検診特集 5/5（まとめ）",
    category: "series",
    months: "all",
    duration: 10,
    image: "photos/photo_gyn_room.jpg",
    tone: "rose",
    render: () => `
      ${seriesBadge("子宮頸がん検診特集 5/5")}
      <div class="kicker">子宮頸がん検診特集</div>
      <div class="headline small">次の検診、そろそろかも</div>
      <div class="dc-cta">婦人科検診のご予約は受付・WEBで</div>
    `
  },
  {
    id: "josei-series-1",
    title: "女性のからだ相談 1/3（がまんしていませんか）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "rose",
    render: () => `
      ${seriesBadge("女性のからだ相談 1/3")}
      <div class="kicker">女性のからだ相談</div>
      <div class="headline small">がまんして、いませんか？</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>不正出血がある</div>
        <div class="point"><span class="dot"></span>おりものの変化が気になる</div>
        <div class="point"><span class="dot"></span>デリケートゾーンのかゆみ・痛み</div>
      </div>
    `
  },
  {
    id: "josei-series-2",
    title: "女性のからだ相談 2/3（放置しないで）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "rose",
    render: () => `
      ${seriesBadge("女性のからだ相談 2/3")}
      <div class="kicker">女性のからだ相談</div>
      <div class="headline small">「よくあること」と、放置しないで</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>特に不正出血は、一度婦人科での確認をおすすめします</div>
      </div>
    `
  },
  {
    id: "josei-series-3",
    title: "女性のからだ相談 3/3（まとめ）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/josei_soudan.jpg",
    tone: "rose",
    render: () => `
      ${seriesBadge("女性のからだ相談 3/3")}
      <div class="kicker">女性のからだ相談</div>
      <div class="headline small">女性医師が、お話を伺います</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>待合室は内科と分けています</div>
      </div>
      <div class="dc-cta">婦人科へお気軽にご相談を</div>
    `
  },
  {
    id: "seiritsu-series-1",
    title: "生理痛特集 1/4（寝込むのは当たり前ではありません）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/seiri_pain.jpg",
    tone: "rose",
    render: () => `
      ${seriesBadge("生理痛特集 1/4")}
      <div class="kicker">生理痛特集</div>
      <div class="headline small">生理痛で寝込むのは、「当たり前」ではありません</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>毎月、痛み止めが手放せない</div>
        <div class="point"><span class="dot"></span>学校や仕事を休むことがある</div>
      </div>
    `
  },
  {
    id: "seiritsu-series-2",
    title: "生理痛特集 2/4（章扉：月経困難症）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "rose",
    centered: true,
    render: () => chapterSlide("生理痛特集", "月経困難症")
  },
  {
    id: "seiritsu-series-3",
    title: "生理痛特集 3/4（治療できる症状）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "rose",
    render: () => `
      ${seriesBadge("生理痛特集 3/4")}
      <div class="kicker">生理痛特集</div>
      <div class="headline small">それは、治療できる症状です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>日常生活にさしつかえる生理痛は「月経困難症」と呼ばれます</div>
        <div class="point"><span class="dot"></span>【放置すると】背景に子宮内膜症などがかくれていることがあります</div>
      </div>
    `
  },
  {
    id: "seiritsu-series-4",
    title: "生理痛特集 4/4（まとめ）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "rose",
    render: () => `
      ${seriesBadge("生理痛特集 4/4")}
      <div class="kicker">生理痛特集</div>
      <div class="headline small">がまんしないで、相談してください</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>痛み止めの使い方や、ピルなどの選択肢があります</div>
      </div>
      <div class="dc-cta">女性医師が診療しています</div>
    `
  },
  {
    id: "pms-series-1",
    title: "PMS特集 1/4（自分じゃないみたい）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/pms_mood.jpg",
    tone: "rose",
    render: () => `
      ${seriesBadge("PMS特集 1/4")}
      <div class="kicker">PMS特集</div>
      <div class="headline small">生理前になると、自分じゃないみたい</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>イライラする・涙もろくなる</div>
        <div class="point"><span class="dot"></span>からだが重い・眠くてたまらない</div>
      </div>
    `
  },
  {
    id: "pms-series-2",
    title: "PMS特集 2/4（章扉：PMS（月経前症候群）とは）",
    category: "series",
    months: "all",
    duration: 5,
    theme: "bold",
    tone: "rose",
    centered: true,
    render: () => chapterSlide("PMS特集", "PMS（月経前症候群）とは")
  },
  {
    id: "pms-series-3",
    title: "PMS特集 3/4（こころとからだの不調）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "rose",
    render: () => `
      ${seriesBadge("PMS特集 3/4")}
      <div class="kicker">PMS特集</div>
      <div class="headline small">ホルモンの変動で起こる、こころとからだの不調です</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>生理の3〜10日ほど前から始まり、生理が来るとやわらぐのが特徴です</div>
        <div class="point"><span class="dot"></span>「性格のせい」ではありません</div>
      </div>
    `
  },
  {
    id: "pms-series-4",
    title: "PMS特集 4/4（まとめ）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "rose",
    render: () => `
      ${seriesBadge("PMS特集 4/4")}
      <div class="kicker">PMS特集</div>
      <div class="headline small">つらさは、やわらげられます</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>生活の工夫や、お薬・ピルなどの選択肢があります</div>
      </div>
      <div class="dc-cta">お一人で抱え込まず、婦人科へ</div>
    `
  },
  {
    id: "keiketsu-series-1",
    title: "経血量が多い方へ 1/3（多いかも）",
    category: "series",
    months: "all",
    duration: 10,
    image: "images/kata_geketsu.jpg",
    tone: "rose",
    render: () => `
      ${seriesBadge("経血量が多い方へ 1/3")}
      <div class="kicker">経血量が多い方へ</div>
      <div class="headline small">経血の量、多いかも？と思ったら</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>昼でも夜用が手放せない</div>
        <div class="point"><span class="dot"></span>1時間ごとに交換が必要</div>
        <div class="point"><span class="dot"></span>レバーのようなかたまりが出る</div>
      </div>
    `
  },
  {
    id: "keiketsu-series-2",
    title: "経血量が多い方へ 2/3（体質と思い込まないで）",
    category: "series",
    months: "all",
    duration: 10,
    theme: "bold",
    tone: "rose",
    render: () => `
      ${seriesBadge("経血量が多い方へ 2/3")}
      <div class="kicker">経血量が多い方へ</div>
      <div class="headline small">「体質」と思い込まないでください</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>貧血の原因になります</div>
        <div class="point"><span class="dot"></span>【放置すると】子宮筋腫などの病気がかくれていることがあります</div>
      </div>
    `
  },
  {
    id: "keiketsu-series-3",
    title: "経血量が多い方へ 3/3（まとめ）",
    category: "series",
    months: "all",
    duration: 10,
    tone: "rose",
    render: () => `
      ${seriesBadge("経血量が多い方へ 3/3")}
      <div class="kicker">経血量が多い方へ</div>
      <div class="headline small">婦人科で、原因を調べられます</div>
      <div class="dc-cta">女性医師がお話を伺います。お気軽にどうぞ</div>
    `
  },
  {
    id: "ryoyo-keikaku",
    title: "療養計画書について",
    category: "institutional",
    months: "all",
    duration: 12,
    render: () => `
      <div class="kicker">当院からのお知らせ</div>
      <div class="headline small">療養計画書について</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>高血圧・糖尿病・脂質異常症で通院中の方には、<em>療養計画書</em>をお渡しして治療目標を一緒に決めています</div>
        <div class="point"><span class="dot"></span>内容のご説明の際、署名をお願いすることがあります</div>
      </div>
    `
  },
  {
    id: "kenshin-hoochi",
    title: "健診結果の放置に注意",
    category: "institutional",
    months: "all",
    duration: 11,
    tone: "navy",
    poster: "posters/poster_kenshin.jpg",
    posterTextSide: "left",
    render: () => `
      <div class="kicker">健診結果、そのままにしていませんか</div>
      <div class="headline small">「要精密検査」「要再検査」は早めのご相談を</div>
      <div class="sub">健診結果はそのままにせず、<em>お早めに</em>ご相談ください。</div>
    `
  },
  {
    id: "vaccine",
    title: "予防接種・各種健診",
    category: "institutional",
    months: "all",
    duration: 11,
    render: () => `
      <div class="kicker">予防接種・健診</div>
      <div class="headline small"><em>予防接種</em>・各種健診に対応しています</div>
      <div class="sub">詳しくは受付までお声がけください。</div>
    `
  },
  {
    id: "jihi",
    title: "自費診療",
    category: "all",
    months: "all",
    duration: 12,
    render: () => `
      <div class="kicker">自費診療</div>
      <div class="headline small"><em>自費診療</em>のご案内</div>
      <div class="dept-list">
        ${["美容注射", "アフターピル", "AGA治療", "ED治療", "肥満外来"].map(d => `<span class="dept-pill">${d}</span>`).join("")}
      </div>
      <div class="sub">お気軽にご相談ください</div>
    `
  },
  {
    id: "yokohama-kenshin",
    title: "横浜市の検診",
    category: "all",
    months: "all",
    duration: 13,
    render: () => `
      <div class="kicker">横浜市の検診</div>
      <div class="headline small"><em>横浜市の検診</em>を実施しています</div>
      <div class="numbered-list">
        ${["大腸がん検診", "特定健診", "婦人科検診", "前立腺がん検診（PSA）"].map((d, i) => `
          <div class="n-item"><span class="n-badge">${i + 1}</span>${d}</div>
        `).join("")}
      </div>
      <div class="sub">対象・受け方は受付までお気軽にお尋ねください</div>
    `
  },
  {
    id: "access",
    title: "アクセス",
    category: "institutional",
    months: "all",
    duration: 13,
    tone: "navy",
    poster: "photos/photo_gaikan.jpg",
    posterTextSide: "left",
    render: () => `
      <div class="kicker">アクセス</div>
      <div class="headline small">${CLINIC.name}</div>
      <div class="two-col">
        <div class="col">
          <div class="access-label">住所</div>
          <div class="access-line">${CLINIC.address}</div>
          <div class="access-label">電話番号</div>
          <div class="access-line">${CLINIC.tel}</div>
        </div>
        <div class="col">
          <div class="point-list">
            <div class="point"><span class="dot"></span>横浜駅きた西口 <em>徒歩3分</em></div>
            <div class="point"><span class="dot"></span>横浜モアーズから徒歩2分</div>
            <div class="point"><span class="dot"></span>土曜も診療しております</div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "saturday-endoscopy",
    title: "土曜診療・土曜午後の内視鏡検査",
    category: "institutional",
    months: "all",
    duration: 12,
    render: () => `
      <div class="kicker">平日お忙しい方へ</div>
      <div class="headline small"><em>土曜も診療</em>しています</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>土曜午後（15:00〜17:00）は内視鏡検査を行っています</div>
        <div class="point"><span class="dot"></span>お仕事帰り・お買い物のついでにご相談ください</div>
      </div>
    `
  },
  {
    id: "blog-info",
    title: "医療ブログのご案内",
    category: "institutional",
    months: "all",
    duration: 11,
    render: () => `
      <div class="kicker">医療ブログ</div>
      <div class="headline small">医療ブログを更新中です</div>
      <div class="sub">症状や検査について解説しています。当院<em>ホームページ</em>からご覧いただけます。</div>
    `
  },
  {
    id: "tsuyu",
    title: "梅雨時の体調管理",
    category: "seasonal",
    months: [6],
    duration: 11,
    render: () => `
      <div class="kicker">季節のお知らせ</div>
      <div class="headline small">梅雨時の体調管理</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>気圧や湿度の変化で体調を崩しやすい時期です</div>
        <div class="point"><span class="dot"></span>だるさ・頭痛が続くときは無理せず<em>ご相談ください</em></div>
        <div class="point"><span class="dot"></span>食品の傷みにもご注意ください</div>
      </div>
    `
  },
  {
    id: "necchusho-series-1",
    title: "熱中症ミニ番組 1/3（そのめまい、熱中症かも）",
    category: "seasonal",
    months: [6, 7, 8, 9],
    duration: 10,
    tone: "summer",
    poster: "posters/poster_heatstroke.jpg",
    posterTextSide: "left",
    render: () => `
      ${seriesBadge("熱中症ミニ番組 1/3")}
      <div class="kicker">熱中症ミニ番組</div>
      <div class="headline small">そのめまい、熱中症かも</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>めまい・頭痛・だるさは、熱中症のサインのことがあります</div>
      </div>
    `
  },
  {
    id: "necchusho-series-2",
    title: "熱中症ミニ番組 2/3（水分と塩分）",
    category: "seasonal",
    months: [6, 7, 8, 9],
    duration: 10,
    theme: "bold",
    tone: "summer",
    render: () => `
      ${seriesBadge("熱中症ミニ番組 2/3")}
      <div class="kicker">熱中症ミニ番組</div>
      <div class="headline small">まずは、涼しい場所で水分と塩分を</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>こまめな水分補給と、涼しい環境が第一です</div>
        <div class="point"><span class="dot"></span>室内でも油断せず、冷房を上手に使いましょう</div>
      </div>
    `
  },
  {
    id: "necchusho-series-3",
    title: "熱中症ミニ番組 3/3（受診・救急要請）",
    category: "seasonal",
    months: [6, 7, 8, 9],
    duration: 10,
    theme: "bold",
    tone: "summer",
    render: () => `
      ${seriesBadge("熱中症ミニ番組 3/3")}
      <div class="kicker">熱中症ミニ番組</div>
      <div class="headline small">こんな時は、ためらわず受診を</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>水分がとれない・ぐったりしている・意識がおかしい</div>
        <div class="point"><span class="dot"></span>重い症状のときは、ためらわず救急要請（119番）を</div>
      </div>
    `
  },
  {
    id: "shokuchudoku",
    title: "食中毒",
    category: "seasonal",
    months: [6, 7, 8],
    duration: 12,
    render: () => `
      <div class="kicker">季節のお知らせ</div>
      <div class="headline small">食中毒にご注意ください</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>こまめな手洗いを心がけましょう</div>
        <div class="point"><span class="dot"></span>お肉やお魚はしっかり<em>加熱</em>しましょう</div>
        <div class="point"><span class="dot"></span>作り置きのお料理は早めに召し上がりましょう</div>
      </div>
    `
  },
  {
    id: "natsubate",
    title: "夏バテ・食欲不振",
    category: "seasonal",
    months: [7, 8, 9],
    duration: 11,
    render: () => `
      <div class="kicker">季節のお知らせ</div>
      <div class="headline small">夏バテ・食欲不振にご注意を</div>
      <div class="sub">胃腸の不調が続くときは<em>ご相談ください</em>。</div>
    `
  },
  {
    id: "autumn-checkup",
    title: "秋の健診のすすめ",
    category: "seasonal",
    months: [9, 10, 11],
    duration: 11,
    image: "images/kenshin.jpg",
    render: () => `
      <div class="kicker">季節のお知らせ</div>
      <div class="headline small">秋は健診・検査のチャンスです</div>
      <div class="sub">気候の良いこの時期に、今年まだ<em>健診</em>を受けていない方はぜひご検討ください。</div>
    `
  },
  {
    id: "aki-kafun",
    title: "秋の花粉",
    category: "seasonal",
    months: [9, 10],
    duration: 11,
    image: "images/kafun.jpg",
    render: () => `
      <div class="kicker">季節のお知らせ</div>
      <div class="headline small">秋の花粉にもご注意ください</div>
      <div class="sub">ブタクサなど、秋にも<em>花粉症</em>はあります。</div>
    `
  },
  {
    id: "flu-vaccine",
    title: "インフルエンザワクチン",
    category: "seasonal",
    months: [10, 11, 12],
    duration: 12,
    tone: "winter",
    poster: "posters/poster_flu.jpg",
    posterTextSide: "left",
    render: () => `
      <div class="kicker">季節のお知らせ</div>
      <div class="headline small">インフルエンザワクチンのご案内</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>10月ごろから<em>接種</em>を開始しています</div>
        <div class="point"><span class="dot"></span>ご予約・当日の接種については受付までお尋ねください</div>
        <div class="point"><span class="dot"></span>手洗い・うがいも引き続き心がけましょう</div>
      </div>
    `
  },
  {
    id: "kafun",
    title: "花粉症・アレルギー",
    category: "seasonal",
    months: [2, 3, 4],
    duration: 11,
    image: "images/kafun.jpg",
    render: () => `
      <div class="kicker">季節のお知らせ</div>
      <div class="headline small"><em>花粉症</em>・アレルギーのご相談</div>
      <div class="sub">つらくなる前に、お早めにご相談ください。</div>
    `
  },
  {
    id: "norovirus",
    title: "感染性胃腸炎",
    category: "seasonal",
    months: [11, 12, 1, 2],
    duration: 11,
    image: "images/tearai.jpg",
    render: () => `
      <div class="kicker">季節のお知らせ</div>
      <div class="headline small"><em>感染性胃腸炎</em>にご注意ください</div>
      <div class="sub">こまめな手洗いにご協力をお願いいたします。</div>
    `
  },
  {
    id: "newyear",
    title: "年末年始の胃腸ケア",
    category: "seasonal",
    months: [12, 1],
    duration: 12,
    render: () => `
      <div class="kicker">季節のお知らせ</div>
      <div class="headline small">年末年始の胃腸をいたわりましょう</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>会食が増える季節です。<em>暴飲暴食</em>にはご注意ください</div>
        <div class="point"><span class="dot"></span>胃の不調が続くときは、早めにご相談ください</div>
      </div>
    `
  },
  {
    id: "dry-winter",
    title: "冬の乾燥対策",
    category: "seasonal",
    months: [12, 1, 2],
    duration: 11,
    render: () => `
      <div class="kicker">季節のお知らせ</div>
      <div class="headline small">冬の乾燥対策</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>空気が乾燥する季節、加湿と水分補給を心がけましょう</div>
        <div class="point"><span class="dot"></span>手洗い・うがいで感染対策をお願いします</div>
        <div class="point"><span class="dot"></span>肌や喉の<em>乾燥</em>が続く方はご相談ください</div>
      </div>
    `
  },
  {
    id: "spring-checkup",
    title: "新年度の健康チェック",
    category: "seasonal",
    months: [3, 4, 5],
    duration: 11,
    image: "images/kenshin.jpg",
    render: () => `
      <div class="kicker">季節のお知らせ</div>
      <div class="headline small">新年度は健康チェックのタイミングです</div>
      <div class="sub">新生活のスタートに、一度<em>健康状態</em>を確認してみませんか。</div>
    `
  },
  {
    id: "web-yoyaku",
    title: "WEB予約（QRコード付き）",
    category: "institutional",
    months: "all",
    duration: 13,
    weight: 2,
    theme: "bold",
    tone: "navy",
    render: () => `
      <div class="kicker">ご予約について</div>
      <div class="two-col qr-layout">
        <div class="col">
          <div class="headline small">次回のご予約は<br><em>WEB予約</em>が便利です</div>
          <div class="sub">スマートフォンのカメラでQRコードを読み取ってください</div>
        </div>
        <div class="col qr-col">
          <div class="qr-card"><img class="qr-image" src="${QR_YOYAKU}" alt="WEB予約QRコード"></div>
        </div>
      </div>
    `
  },
  {
    id: "fever",
    title: "発熱外来",
    category: "institutional",
    months: "all",
    duration: 11,
    render: () => `
      <div class="kicker">発熱外来</div>
      <div class="headline small"><em>発熱</em>・かぜ症状の方もご相談ください</div>
      <div class="sub">院内ではマスクの着用をお願いしております。</div>
    `
  },
  {
    id: "myna-hoken",
    title: "マイナ保険証のご用意のお願い",
    category: "institutional",
    months: "all",
    duration: 11,
    tone: "navy",
    poster: "posters/poster_myna.jpg",
    posterTextSide: "left",
    render: () => `
      <div class="kicker">受付でのお願い</div>
      <div class="headline small"><em>マイナ保険証</em>をご用意ください</div>
      <div class="sub">受診の際はマイナ保険証（または資格確認書）をご用意ください。ご不明な点は受付までお気軽にどうぞ。</div>
    `
  },
  {
    id: "dx-taisei",
    title: "医療DXへの取り組み",
    category: "institutional",
    months: "all",
    duration: 11,
    render: () => `
      <div class="kicker">当院からのお知らせ</div>
      <div class="headline small"><em>医療DX</em>への取り組み</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>当院は医療DX推進体制を整備しています</div>
        <div class="point"><span class="dot"></span>マイナ保険証の利用促進や、診療情報の活用により、質の高い医療の提供に努めています</div>
      </div>
    `
  },
  {
    id: "kansen-taisaku",
    title: "感染対策・発熱対応について",
    category: "institutional",
    months: "all",
    duration: 11,
    render: () => `
      <div class="kicker">当院からのお知らせ</div>
      <div class="headline small"><em>感染対策</em>・発熱対応について</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>当院は院内感染対策を実施し、発熱・感染症症状のある方の受け入れ体制を整えています</div>
        <div class="point"><span class="dot"></span>発熱症状のある方は、受付にお申し出ください</div>
      </div>
    `
  },
  {
    id: "okusuri-seido",
    title: "お薬に関するお知らせ（ジェネリック・リフィル処方箋）",
    category: "institutional",
    months: "all",
    duration: 12,
    render: () => `
      <div class="kicker">当院からのお知らせ</div>
      <div class="headline small">お薬に関するお知らせ</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>後発医薬品（<em>ジェネリック</em>）のある先発医薬品をご希望の場合、特別の料金がかかる場合があります</div>
        <div class="point"><span class="dot"></span>症状が安定している方には、医師の判断でリフィル処方箋を発行できる場合があります</div>
        <div class="point"><span class="dot"></span>詳しくは医師・受付にご相談ください</div>
      </div>
    `
  },
  {
    id: "meiwaku-boushi",
    title: "スタッフへの迷惑行為はお断り",
    category: "institutional",
    months: "all",
    duration: 11,
    tone: "navy",
    poster: "posters/poster_meiwaku.jpg",
    posterTextSide: "right",
    render: () => `
      <div class="kicker">皆さまへのお願い</div>
      <div class="headline small">スタッフへの暴力・暴言・<em>迷惑行為</em>はお断りいたします</div>
      <div class="sub">安心して受診いただける環境を守るため、ご理解とご協力をお願いいたします。</div>
    `
  },
  {
    id: "mask",
    title: "マスク着用のお願い",
    category: "institutional",
    months: "all",
    duration: 11,
    render: () => `
      <div class="kicker">院内でのお願い</div>
      <div class="headline small"><em>マスク</em>の着用にご協力ください</div>
      <div class="sub">発熱の患者様もいらっしゃいますので、院内ではマスクの着用にご協力をお願いいたします。</div>
    `
  }
];
// ▲▲▲ SLIDES ここまで ▲▲▲
