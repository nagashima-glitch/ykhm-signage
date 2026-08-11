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
    closedLabel: "休診：日曜・祝日",
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
const QR_YOYAKU = "data:image/png;base64,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";
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
    image: "images/welcome.jpg",
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
    image: "images/gyn.jpg",
    render: () => `
      <div class="kicker">産婦人科診療</div>
      <div class="headline small">婦人科診療のご案内</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>女性医師（産婦人科専門医）が担当いたします</div>
        <div class="point"><span class="dot"></span>ピル外来・子宮がん検診に対応しています</div>
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
    image: "images/gyn.jpg",
    imageReverse: true,
    render: () => `
      <div class="kicker">女性も安心して通える空間</div>
      <div class="headline small">女性にも安心な院内づくり</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>内科と婦人科の待合室を分けています</div>
        <div class="point"><span class="dot"></span>プライバシーに配慮した院内です</div>
      </div>
    `
  },
  {
    id: "tokushu-kounenki-1",
    title: "更年期特集 1/2（こんな症状はありませんか）",
    category: "series",
    months: "all",
    duration: 12,
    image: "images/kounenki.jpg",
    render: () => `
      <div class="series-badge">更年期特集 1/2</div>
      <div class="kicker">こんな症状はありませんか</div>
      <div class="headline small">更年期のサインかもしれません</div>
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
    title: "更年期特集 2/2（我慢しないでご相談を）",
    category: "series",
    months: "all",
    duration: 11,
    image: "images/kounenki.jpg",
    imageReverse: true,
    render: () => `
      <div class="series-badge">更年期特集 2/2</div>
      <div class="kicker">我慢しないでご相談を</div>
      <div class="headline small">お一人で抱え込まないでください</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>治療や付き合い方は人それぞれです</div>
        <div class="point"><span class="dot"></span>女性医師がお話を伺います</div>
      </div>
    `
  },
  {
    id: "tokushu-pill-1",
    title: "ピル外来特集 1/2（相談できること）",
    category: "series",
    months: "all",
    duration: 12,
    image: "images/pill.jpg",
    render: () => `
      <div class="series-badge">ピル外来特集 1/2</div>
      <div class="kicker">ピル外来で相談できること</div>
      <div class="headline small">こんなことも相談できます</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>生理痛がつらい</div>
        <div class="point"><span class="dot"></span>PMS（月経前のこころ・からだの不調）</div>
        <div class="point"><span class="dot"></span>生理日の移動・緊急避妊</div>
      </div>
    `
  },
  {
    id: "tokushu-pill-2",
    title: "ピル外来特集 2/2（受診はお気軽に）",
    category: "series",
    months: "all",
    duration: 11,
    image: "images/pill.jpg",
    imageReverse: true,
    render: () => `
      <div class="series-badge">ピル外来特集 2/2</div>
      <div class="kicker">受診はお気軽に</div>
      <div class="headline small">まずはご相談ください</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>女性医師（産婦人科専門医）が担当いたします</div>
        <div class="point"><span class="dot"></span>待合室は内科と分けております</div>
        <div class="point"><span class="dot"></span>ピルは正しく理解して使うことが大切です</div>
      </div>
    `
  },
  {
    id: "endoscopy-count",
    title: "内視鏡実績",
    category: "all",
    months: "all",
    duration: 12,
    weight: 2,
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
    `
  },
  {
    id: "ai-endoscopy",
    title: "AI内視鏡診断支援",
    category: "all",
    months: "all",
    duration: 12,
    image: "images/naishikyo.jpg",
    render: () => `
      <div class="kicker">内視鏡検査の質へのこだわり</div>
      <div class="headline small">AI内視鏡診断支援を導入</div>
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
    image: "images/naishikyo.jpg",
    imageReverse: true,
    render: () => `
      <div class="kicker">内視鏡検査を担当する医師</div>
      <div class="headline small">専門医による内視鏡検査</div>
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
      <div class="headline small">胃カメラのご案内</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>経鼻・経口、お選びいただけます</div>
        <div class="point"><span class="dot"></span>鎮静剤を使用した検査にも対応しております</div>
        <div class="point"><span class="dot"></span>当日の検査についてもお気軽にご相談ください</div>
      </div>
    `
  },
  {
    id: "tokushu-gastro-1",
    title: "胃カメラ特集 1/3（こんな症状はありませんか）",
    category: "series",
    months: "all",
    duration: 12,
    image: "images/gastro.jpg",
    render: () => `
      <div class="series-badge">胃カメラ特集 1/3</div>
      <div class="kicker">こんな症状はありませんか</div>
      <div class="headline small">胃カメラのご相談を</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>胃の痛みが続く</div>
        <div class="point"><span class="dot"></span>胸やけが続く</div>
        <div class="point"><span class="dot"></span>黒っぽい便が出た</div>
        <div class="point"><span class="dot"></span>食欲不振が続く</div>
      </div>
    `
  },
  {
    id: "tokushu-gastro-2",
    title: "胃カメラ特集 2/3（選べる検査方法）",
    category: "series",
    months: "all",
    duration: 12,
    image: "images/gastro.jpg",
    imageReverse: true,
    render: () => `
      <div class="series-badge">胃カメラ特集 2/3</div>
      <div class="kicker">選べる検査方法</div>
      <div class="headline small">ご希望に合わせた検査を</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>経鼻・経口、お選びいただけます</div>
        <div class="point"><span class="dot"></span>鎮静剤を使用した検査にも対応しております</div>
        <div class="point"><span class="dot"></span>検査後はリカバリールームでお休みいただけます</div>
      </div>
    `
  },
  {
    id: "tokushu-gastro-3",
    title: "胃カメラ特集 3/3（専門医による検査）",
    category: "series",
    months: "all",
    duration: 12,
    image: "images/naishikyo.jpg",
    render: () => `
      <div class="series-badge">胃カメラ特集 3/3</div>
      <div class="kicker">専門医による検査</div>
      <div class="headline small">専門医が担当いたします</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>消化器内視鏡専門医が検査を担当します</div>
        <div class="point"><span class="dot"></span>AI内視鏡診断支援を導入しています</div>
        <div class="point"><span class="dot"></span>当日検査についてもお気軽にご相談ください</div>
      </div>
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
      <div class="headline small">大腸カメラのご案内</div>
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
      <div class="sub">血便・下血など緊急性がある場合は毎日ご相談を受けています</div>
    `
  },
  {
    id: "polyp",
    title: "日帰り大腸ポリープ切除",
    category: "all",
    months: "all",
    duration: 12,
    image: "images/colono.jpg",
    render: () => `
      <div class="kicker">内視鏡検査</div>
      <div class="headline small">日帰り大腸ポリープ切除</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>大腸カメラ検査中にポリープが見つかった場合、その場での切除に対応しています（日帰り）</div>
        <div class="point"><span class="dot"></span>後日あらためて手術、といった負担を減らせます</div>
      </div>
    `
  },
  {
    id: "tokushu-colono-1",
    title: "大腸カメラ特集 1/3（なぜ大腸カメラ？）",
    category: "series",
    months: "all",
    duration: 12,
    image: "images/colono.jpg",
    imageReverse: true,
    render: () => `
      <div class="series-badge">大腸カメラ特集 1/3</div>
      <div class="kicker">なぜ大腸カメラ？</div>
      <div class="headline small">早期発見のために</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>大腸がんは日本人に多いがんのひとつです</div>
        <div class="point"><span class="dot"></span>早期には自覚症状がほとんどないことも</div>
        <div class="point"><span class="dot"></span>だからこそ検査での早期発見が大切です</div>
      </div>
    `
  },
  {
    id: "tokushu-colono-2",
    title: "大腸カメラ特集 2/3（検査の流れ）",
    category: "series",
    months: "all",
    duration: 13,
    image: "images/colono.jpg",
    render: () => `
      <div class="series-badge">大腸カメラ特集 2/3</div>
      <div class="kicker">検査の流れ</div>
      <div class="headline small">受診はかんたん2ステップ</div>
      <div class="numbered-list">
        ${["事前外来（症状・お薬の確認）", "検査日を決めて検査へ"].map((d, i) => `
          <div class="n-item"><span class="n-badge">${i + 1}</span>${d}</div>
        `).join("")}
      </div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>下剤は自宅・院内から選べます</div>
        <div class="point"><span class="dot"></span>鎮静剤を使った検査にも対応</div>
      </div>
    `
  },
  {
    id: "tokushu-colono-3",
    title: "大腸カメラ特集 3/3（検査後のサポート）",
    category: "series",
    months: "all",
    duration: 12,
    image: "images/colono.jpg",
    imageReverse: true,
    render: () => `
      <div class="series-badge">大腸カメラ特集 3/3</div>
      <div class="kicker">当日その場で</div>
      <div class="headline small">検査後も安心のサポート</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>ポリープが見つかれば日帰り切除に対応</div>
        <div class="point"><span class="dot"></span>検査後はリカバリールームでお休みいただけます</div>
        <div class="point"><span class="dot"></span>画像を見ながら結果をご説明します</div>
      </div>
    `
  },
  {
    id: "blood-stool",
    title: "便潜血陽性・血便について",
    category: "all",
    months: "all",
    duration: 12,
    render: () => `
      <div class="kicker">健診で便潜血陽性だった方へ</div>
      <div class="headline small">便潜血陽性・血便について</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>便潜血陽性・血便は放置せず、大腸カメラでの精密検査をおすすめします</div>
        <div class="point"><span class="dot"></span>当院では血便・下血のご相談を毎日受け付けています</div>
      </div>
    `
  },
  {
    id: "heartburn",
    title: "胸やけ・げっぷ",
    category: "all",
    months: "all",
    duration: 11,
    render: () => `
      <div class="kicker">胸やけ・げっぷにお悩みの方へ</div>
      <div class="headline small">胸やけ・げっぷが続く方へ</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>逆流性食道炎などの可能性があります</div>
        <div class="point"><span class="dot"></span>胃カメラで食道・胃の状態を確認できます</div>
      </div>
    `
  },
  {
    id: "stomach-discomfort",
    title: "胃の痛み・胃もたれ",
    category: "all",
    months: "all",
    duration: 11,
    render: () => `
      <div class="kicker">胃の不調にお悩みの方へ</div>
      <div class="headline small">胃の痛み・胃もたれが続く方へ</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>機能性ディスペプシア（FD）などの場合もあります</div>
        <div class="point"><span class="dot"></span>専門外来があり、胃カメラにも対応しています</div>
      </div>
    `
  },
  {
    id: "pylori",
    title: "ピロリ菌検査・除菌治療",
    category: "all",
    months: "all",
    duration: 11,
    render: () => `
      <div class="kicker">胃の健康チェック</div>
      <div class="headline small">ピロリ菌検査・除菌治療のご案内</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>ピロリ菌検査に対応しています</div>
        <div class="point"><span class="dot"></span>陽性の場合は除菌治療のご相談も承ります</div>
      </div>
    `
  },
  {
    id: "benpi",
    title: "便秘・下痢",
    category: "all",
    months: "all",
    duration: 11,
    render: () => `
      <div class="kicker">お腹の不調にお悩みの方へ</div>
      <div class="headline small">便秘・下痢が続く方へ</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>過敏性腸症候群（IBS）の専門外来があります</div>
        <div class="point"><span class="dot"></span>お一人で抱え込まずご相談ください</div>
      </div>
    `
  },
  {
    id: "bentsu-change",
    title: "便が細くなった・残便感",
    category: "all",
    months: "all",
    duration: 11,
    render: () => `
      <div class="kicker">排便の変化が気になる方へ</div>
      <div class="headline small">便が細くなった・残便感がある方へ</div>
      <div class="sub">大腸カメラでの確認をおすすめします。</div>
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
        <div class="point"><span class="dot"></span>経口補水液が役立つこともあります</div>
        <div class="point"><span class="dot"></span>水分がとれないほどつらいときは受診を</div>
      </div>
    `
  },
  {
    id: "hinketsu",
    title: "健診で貧血を指摘された方へ",
    category: "all",
    months: "all",
    duration: 11,
    render: () => `
      <div class="kicker">健診で貧血を指摘された方へ</div>
      <div class="headline small">その貧血、放置していませんか</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>消化管からの出血が隠れていることもあります</div>
        <div class="point"><span class="dot"></span>内視鏡検査でチェックできます</div>
      </div>
    `
  },
  {
    id: "ji-soudan",
    title: "痔のお悩み",
    category: "all",
    months: "all",
    duration: 12,
    image: "images/ji.jpg",
    render: () => `
      <div class="kicker">痔のお悩み</div>
      <div class="headline small">いぼ痔・切れ痔、恥ずかしがらずにご相談を</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>「血便は痔だろう」と思い込まず、一度大腸カメラでの確認を</div>
        <div class="point"><span class="dot"></span>肛門内科でしっかり診察いたします</div>
      </div>
    `
  },
  {
    id: "dock",
    title: "人間ドック",
    category: "all",
    months: "all",
    duration: 11,
    image: "images/dock.jpg",
    render: () => `
      <div class="kicker">人間ドック</div>
      <div class="headline small">人間ドックのご案内</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>胃カメラ・大腸カメラを組み合わせた人間ドックを実施しています</div>
        <div class="point"><span class="dot"></span>詳しくは受付、または当院ホームページをご覧ください</div>
      </div>
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
      <div class="kicker">生活習慣病外来</div>
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
      <div class="headline small">肥満外来のご案内</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>肥満は生活習慣病と関わりの深いテーマです</div>
        <div class="point"><span class="dot"></span>当院では肥満外来のご相談に対応しています（自費診療）</div>
      </div>
    `
  },
  {
    id: "kouketsuatsu",
    title: "健診で血圧を指摘された方へ",
    category: "all",
    months: "all",
    duration: 11,
    image: "images/seikatsu.jpg",
    render: () => `
      <div class="kicker">健診で血圧を指摘された方へ</div>
      <div class="headline small">その血圧、放置せず、まずはご相談を</div>
      <div class="sub">生活習慣病外来で継続的にサポートいたします。</div>
    `
  },
  {
    id: "tounyou",
    title: "健診で血糖値・HbA1cを指摘された方へ",
    category: "all",
    months: "all",
    duration: 11,
    image: "images/seikatsu.jpg",
    imageReverse: true,
    render: () => `
      <div class="kicker">血糖値・HbA1cが気になる方へ</div>
      <div class="headline small">放置せず、まずはご相談を</div>
      <div class="sub">生活習慣病外来で継続的にサポートいたします。</div>
    `
  },
  {
    id: "shishitsu",
    title: "健診でコレステロール・中性脂肪を指摘された方へ",
    category: "all",
    months: "all",
    duration: 11,
    image: "images/seikatsu.jpg",
    render: () => `
      <div class="kicker">コレステロール・中性脂肪を指摘された方へ</div>
      <div class="headline small">放置せず、まずはご相談を</div>
      <div class="sub">生活習慣病外来で継続的にサポートいたします。</div>
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
        <div class="point"><span class="dot"></span>高血圧・糖尿病・脂質異常症で通院中の方には、療養計画書をお渡しして治療目標を一緒に決めています</div>
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
    image: "images/kenshin.jpg",
    render: () => `
      <div class="kicker">健診結果、そのままにしていませんか</div>
      <div class="headline small">「要精密検査」「要再検査」は早めのご相談を</div>
      <div class="sub">健診結果を放置せず、お早めにご相談ください。</div>
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
      <div class="headline small">予防接種・各種健診に対応しています</div>
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
      <div class="headline small">自費診療のご案内</div>
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
      <div class="headline small">横浜市の検診を実施しています</div>
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
            <div class="point"><span class="dot"></span>横浜駅きた西口 徒歩3分</div>
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
      <div class="headline small">土曜も診療しています</div>
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
      <div class="sub">症状や検査について解説しています。当院ホームページからご覧いただけます。</div>
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
        <div class="point"><span class="dot"></span>だるさ・頭痛が続くときは無理せずご相談ください</div>
        <div class="point"><span class="dot"></span>食品の傷みにもご注意ください</div>
      </div>
    `
  },
  {
    id: "heatstroke",
    title: "熱中症",
    category: "seasonal",
    months: [6, 7, 8, 9],
    duration: 11,
    image: "images/heatstroke.jpg",
    render: () => `
      <div class="kicker">季節のお知らせ</div>
      <div class="headline small">熱中症にご注意ください</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>こまめな水分補給を心がけましょう</div>
        <div class="point"><span class="dot"></span>室内でも冷房を上手にご利用ください</div>
        <div class="point"><span class="dot"></span>ご高齢の方は特にご注意ください</div>
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
        <div class="point"><span class="dot"></span>お肉やお魚はしっかり加熱しましょう</div>
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
      <div class="sub">胃腸の不調が続くときはご相談ください。</div>
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
      <div class="sub">気候の良いこの時期に、今年まだ健診を受けていない方はぜひご検討ください。</div>
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
      <div class="sub">ブタクサなど、秋にも花粉症はあります。</div>
    `
  },
  {
    id: "flu-vaccine",
    title: "インフルエンザワクチン",
    category: "seasonal",
    months: [10, 11, 12],
    duration: 12,
    image: "images/flu.jpg",
    render: () => `
      <div class="kicker">季節のお知らせ</div>
      <div class="headline small">インフルエンザワクチンのご案内</div>
      <div class="point-list">
        <div class="point"><span class="dot"></span>10月ごろから接種を開始しています</div>
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
      <div class="headline small">花粉症・アレルギーのご相談</div>
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
      <div class="headline small">感染性胃腸炎にご注意ください</div>
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
        <div class="point"><span class="dot"></span>会食が増える季節です。暴飲暴食にはご注意ください</div>
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
        <div class="point"><span class="dot"></span>肌や喉の乾燥が続く方はご相談ください</div>
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
      <div class="sub">新生活のスタートに、一度健康状態を確認してみませんか。</div>
    `
  },
  {
    id: "web-yoyaku",
    title: "WEB予約（QRコード付き）",
    category: "institutional",
    months: "all",
    duration: 13,
    weight: 2,
    render: () => `
      <div class="kicker">ご予約について</div>
      <div class="two-col qr-layout">
        <div class="col">
          <div class="headline small">次回のご予約は<br>WEB予約が便利です</div>
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
      <div class="headline small">発熱・かぜ症状の方もご相談ください</div>
      <div class="sub">院内ではマスクの着用をお願いしております。</div>
    `
  },
  {
    id: "myna-hoken",
    title: "マイナ保険証のご用意のお願い",
    category: "institutional",
    months: "all",
    duration: 11,
    image: "images/myna.jpg",
    render: () => `
      <div class="kicker">受付でのお願い</div>
      <div class="headline small">マイナ保険証をご用意ください</div>
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
      <div class="headline small">医療DXへの取り組み</div>
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
      <div class="headline small">感染対策・発熱対応について</div>
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
        <div class="point"><span class="dot"></span>後発医薬品（ジェネリック）のある先発医薬品をご希望の場合、特別の料金がかかる場合があります</div>
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
    render: () => `
      <div class="kicker">皆さまへのお願い</div>
      <div class="headline small">スタッフへの暴力・暴言・迷惑行為はお断りいたします</div>
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
      <div class="headline small">マスクの着用にご協力ください</div>
      <div class="sub">発熱の患者様もいらっしゃいますので、院内ではマスクの着用にご協力をお願いいたします。</div>
    `
  }
];
// ▲▲▲ SLIDES ここまで ▲▲▲
