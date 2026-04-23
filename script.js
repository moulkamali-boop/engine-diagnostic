// ==================== الترجمة ====================
const translations = {
  ar: {
    cam_title: "تصوير العادم",
    cam_desc: "وجّه الكاميرا نحو مخرج العادم لتحليل لون الدخان",
    mic_title: "تسجيل صوت المحرك",
    mic_desc: "قرب الهاتف من المحرك وسجل الصوت لمدة 5 ثوانٍ",
    diagnose_btn: "🔍 شخص الآن",
    result_title: "نتيجة التشخيص",
    download_btn: "📄 تحميل التقرير (PDF)",
    subscribe_btn: "🔒 الاشتراك ($20/شهر)",
    smoke_black: "دخان أسود",
    smoke_blue: "دخان أزرق",
    smoke_white: "دخان أبيض كثيف",
    smoke_none: "لا دخان",
    sound_normal: "صوت منتظم",
    sound_knock: "طقطقة (knocking)",
    sound_backfire: "صراخ عادم",
    sound_empty: "صوت دوران فارغ",
    diagnosis_fuel: "المشكلة في **الوقود**",
    diagnosis_air: "المشكلة في **الهواء**",
    diagnosis_spark: "المشكلة في **الشرارة**",
    diagnosis_oil: "المشكلة في **الزيت** (يحتاج فحص)",
    diagnosis_water: "المشكلة في **الماء** (حشوة رأس محتملة)",
    hint_fuel: "نوصي بفحص جودة الوقود والبخاخات",
    hint_air: "نوصي بفحص فلتر الهواء ومجرى السحب",
    hint_spark: "نوصي بفحص الشمعة، السلك، البوبينة، والبطارية",
    hint_oil: "نوصي بفحص ضغط المحرك وحلقات المكبس",
    hint_water: "نوصي بفحص حشوة الرأس ونظام التبريد",
    recording: "جاري التسجيل...",
    recorded: "تم التسجيل بنجاح",
    photo_taken: "تم التقاط الصورة"
  },
  en: {
    cam_title: "Exhaust Capture",
    cam_desc: "Point camera at exhaust to analyze smoke color",
    mic_title: "Engine Sound Recording",
    mic_desc: "Place phone near engine, record for 5 seconds",
    diagnose_btn: "🔍 Diagnose Now",
    result_title: "Diagnosis Result",
    download_btn: "📄 Download PDF Report",
    subscribe_btn: "🔒 Subscribe ($20/month)",
    smoke_black: "Black smoke",
    smoke_blue: "Blue smoke",
    smoke_white: "Thick white smoke",
    smoke_none: "No smoke",
    sound_normal: "Normal sound",
    sound_knock: "Knocking",
    sound_backfire: "Backfire",
    sound_empty: "Empty cranking",
    diagnosis_fuel: "Issue with **Fuel**",
    diagnosis_air: "Issue with **Air**",
    diagnosis_spark: "Issue with **Spark**",
    diagnosis_oil: "Issue with **Oil** (needs inspection)",
    diagnosis_water: "Issue with **Coolant** (possible head gasket)",
    hint_fuel: "Check fuel quality and injectors",
    hint_air: "Check air filter and intake",
    hint_spark: "Check spark plug, wire, coil, battery",
    hint_oil: "Check compression and piston rings",
    hint_water: "Check head gasket and cooling system",
    recording: "Recording...",
    recorded: "Recording saved",
    photo_taken: "Photo captured"
  },
  fr: {
    cam_title: "Capture de l'échappement",
    cam_desc: "Dirigez la caméra vers l'échappement pour analyser la fumée",
    mic_title: "Enregistrement du moteur",
    mic_desc: "Placez le téléphone près du moteur, enregistrez 5 secondes",
    diagnose_btn: "🔍 Diagnostiquer",
    result_title: "Résultat",
    download_btn: "📄 Télécharger PDF",
    subscribe_btn: "🔒 Abonnement (20$/mois)",
    smoke_black: "Fumée noire",
    smoke_blue: "Fumée bleue",
    smoke_white: "Fumée blanche épaisse",
    smoke_none: "Pas de fumée",
    sound_normal: "Son normal",
    sound_knock: "Cliquetis",
    sound_backfire: "Contre-explosion",
    sound_empty: "Rotation à vide",
    diagnosis_fuel: "Problème de **Carburant**",
    diagnosis_air: "Problème d'**Air**",
    diagnosis_spark: "Problème d'**Allumage**",
    diagnosis_oil: "Problème d'**Huile**",
    diagnosis_water: "Problème de **Liquide de refroidissement**",
    hint_fuel: "Vérifiez la qualité du carburant et les injecteurs",
    hint_air: "Vérifiez le filtre à air et l'admission",
    hint_spark: "Vérifiez bougie, filtre, bobine, batterie",
    hint_oil: "Vérifiez la compression et les segments",
    hint_water: "Vérifiez le joint de culasse",
    recording: "Enregistrement...",
    recorded: "Enregistré",
    photo_taken: "Photo prise"
  }
};

// ==================== المتغيرات العامة ====================
let currentLang = 'ar';
let mediaStream = null;
let photoData = null;
let audioBlob = null;
let smokeColor = null;
let soundType = null;
let diagnosticResult = null;

// عداد التشخيصات المجانية (يُحفظ في localStorage)
let freeDiagnostics = parseInt(localStorage.getItem('engine_diag_free')) || 0;
const MAX_FREE = 3;
let subscriptionActive = localStorage.getItem('engine_diag_subscription') === 'true';

// ==================== تحميل اللغة ====================
function loadLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];
  
  document.getElementById('cam-title').textContent = t.cam_title;
  document.getElementById('cam-desc').textContent = t.cam_desc;
  document.getElementById('mic-title').textContent = t.mic_title;
  document.getElementById('mic-desc').textContent = t.mic_desc;
  document.getElementById('diagnose-btn').textContent = t.diagnose_btn;
  document.getElementById('result-title').textContent = t.result_title;
  document.getElementById('download-pdf').textContent = t.download_btn;
  document.getElementById('subscribe-btn').textContent = t.subscribe_btn;
  
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if(btn.getAttribute('data-lang') === lang) btn.classList.add('active');
  });
  
  updateCounterDisplay();
}

function updateCounterDisplay() {
  const remaining = Math.max(0, MAX_FREE - freeDiagnostics);
  document.getElementById('counter-display').innerHTML = `🔓 التشخيصات المجانية المتبقية: ${remaining} / ${MAX_FREE}`;
  
  if(subscriptionActive) {
    document.getElementById('counter-display').innerHTML = `✅ اشتراك نشط - تشخيص غير محدود (كل 72 ساعة)`;
    document.getElementById('subscribe-btn').classList.add('hidden');
  } else {
    if(freeDiagnostics >= MAX_FREE) {
      document.getElementById('subscribe-btn').classList.remove('hidden');
    } else {
      document.getElementById('subscribe-btn').classList.add('hidden');
    }
  }
}

// ==================== تشغيل الكاميرا ====================
async function startCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const video = document.getElementById('camera-preview');
    video.srcObject = mediaStream;
  } catch(err) {
    console.error("Camera error:", err);
    document.getElementById('photo-result').innerHTML = '<span style="color:#ff4444">⚠️ لا يمكن الوصول للكاميرا</span>';
  }
}

// ==================== التقاط صورة ====================
function capturePhoto() {
  const video = document.getElementById('camera-preview');
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  photoData = canvas.toDataURL('image/jpeg', 0.8);
  
  analyzeSmokeColor();
  
  const t = translations[currentLang];
  document.getElementById('photo-result').innerHTML = `<span style="color:#00a86b">✅ ${t.photo_taken}</span>`;
}

function analyzeSmokeColor() {
  const t = translations[currentLang];
  smokeColor = prompt(t.cam_desc + "\nاختر لون الدخان:\n1- أسود\n2- أزرق\n3- أبيض كثيف\n4- لا دخان");
  if(smokeColor === '1') smokeColor = 'black';
  else if(smokeColor === '2') smokeColor = 'blue';
  else if(smokeColor === '3') smokeColor = 'white';
  else smokeColor = 'none';
}

// ==================== تسجيل الصوت ====================
async function recordSound() {
  const t = translations[currentLang];
  const statusDiv = document.getElementById('recording-status');
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];
    
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      audioBlob = new Blob(chunks, { type: 'audio/wav' });
      statusDiv.innerHTML = `<span style="color:#00a86b">✅ ${t.recorded}</span>`;
      stream.getTracks().forEach(track => track.stop());
      
      soundType = prompt(t.mic_desc + "\nاختر نوع الصوت:\n1- منتظم\n2- طقطقة\n3- صراخ عادم\n4- دوران فارغ");
      if(soundType === '1') soundType = 'normal';
      else if(soundType === '2') soundType = 'knock';
      else if(soundType === '3') soundType = 'backfire';
      else soundType = 'empty';
    };
    
    mediaRecorder.start();
    statusDiv.innerHTML = `<span class="status recording">🔴 ${t.recording}</span>`;
    setTimeout(() => {
      mediaRecorder.stop();
    }, 5000);
    
  } catch(err) {
    console.error("Microphone error:", err);
    statusDiv.innerHTML = '<span style="color:#ff4444">⚠️ لا يمكن الوصول للميكروفون</span>';
  }
}

// ==================== التشخيص الرئيسي ====================
function performDiagnosis() {
  const t = translations[currentLang];
  
  if(!smokeColor || !soundType) {
    alert("الرجاء إكمال خطوات التصوير والتسجيل أولاً");
    return;
  }
  
  // التحقق من إمكانية التشخيص (مجاني أم مدفوع)
  if(!subscriptionActive && freeDiagnostics >= MAX_FREE) {
    alert("لقد استنفذت التشخيصات المجانية الثلاثة. يرجى الاشتراك للمتابعة.");
    document.getElementById('subscribe-btn').classList.remove('hidden');
    return;
  }
  
  let diagnosis = "";
  let hint = "";
  
  // منطق التشخيص
  if(smokeColor === 'black' && soundType === 'knock') {
    diagnosis = t.diagnosis_fuel;
    hint = t.hint_fuel;
  }
  else if(smokeColor === 'black' && soundType === 'backfire') {
    diagnosis = t.diagnosis_air;
    hint = t.hint_air;
  }
  else if(soundType === 'empty') {
    diagnosis = t.diagnosis_spark;
    hint = t.hint_spark;
  }
  else if(smokeColor === 'blue') {
    diagnosis = t.diagnosis_oil;
    hint = t.hint_oil;
  }
  else if(smokeColor === 'white') {
    diagnosis = t.diagnosis_water;
    hint = t.hint_water;
  }
  else if(soundType === 'backfire') {
    diagnosis = t.diagnosis_air;
    hint = t.hint_air;
  }
  else if(soundType === 'knock') {
    diagnosis = t.diagnosis_fuel;
    hint = t.hint_fuel;
  }
  else {
    diagnosis = "✅ لا توجد مشكلة واضحة";
    hint = "يمكنك متابعة القيادة بأمان، أو إجراء فحص عميق للاطمئنان";
  }
  
  diagnosticResult = { diagnosis, hint, smokeColor, soundType };
  
  document.getElementById('result-text').innerHTML = diagnosis;
  document.getElementById('result-hint').innerHTML = hint;
  
  // الحصول على الموقع (GPS)
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude.toFixed(4);
      const lon = pos.coords.longitude.toFixed(4);
      document.getElementById('result-location').innerHTML = `📍 ${lat}°N, ${lon}°E | ${new Date().toLocaleString()}`;
    }, () => {
      document.getElementById('result-location').innerHTML = `📍 الموقع غير متاح | ${new Date().toLocaleString()}`;
    });
  } else {
    document.getElementById('result-location').innerHTML = `📍 ${new Date().toLocaleString()}`;
  }
  
  document.getElementById('result-card').classList.remove('hidden');
  document.getElementById('download-pdf').classList.remove('hidden');
  
  // إذا لم يكن مشتركاً، زود العداد
  if(!subscriptionActive) {
    freeDiagnostics++;
    localStorage.setItem('engine_diag_free', freeDiagnostics);
    updateCounterDisplay();
    
    if(freeDiagnostics >= MAX_FREE) {
      document.getElementById('subscribe-btn').classList.remove('hidden');
    }
  }
}

// ==================== إنشاء ملف PDF ====================
async function generatePDF() {
  if(!diagnosticResult) return;
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  const title = "تشخيص المحرك - تقرير علمي";
  const diagnosis = diagnosticResult.diagnosis.replace(/\*\*/g, '');
  const hint = diagnosticResult.hint;
  const timestamp = new Date().toLocaleString();
  let locationText = document.getElementById('result-location').innerText || "الموقع غير محدد";
  
  doc.setFont("helvetica");
  doc.setFontSize(18);
  doc.text(title, 20, 20);
  
  doc.setFontSize(12);
  doc.text(`التاريخ والوقت: ${timestamp}`, 20, 40);
  doc.text(`الموقع: ${locationText}`, 20, 50);
  doc.text(`نوع التشخيص: عميق (محرك، سوائل، تسربات، سير، هيكل)`, 20, 60);
  doc.text(`نتيجة التشخيص: ${diagnosis}`, 20, 80);
  doc.text(`التوصية: ${hint}`, 20, 90);
  
  if(freeDiagnostics >= MAX_FREE && !subscriptionActive) {
    doc.setTextColor(255, 0, 0);
    doc.text("⚠️ هذا التقرير مجاني (المرة الثالثة). للتشخيصات القادمة، يلزم الاشتراك.", 20, 110);
    doc.setTextColor(0, 0, 0);
  }
  
  doc.setFontSize(10);
  doc.text("© منظومة تشخيص المحرك - التوقيع السيادي", 20, 280);
  
  doc.save(`engine_diagnostic_${Date.now()}.pdf`);
}

// ==================== الاشتراك ====================
function subscribe() {
    // رابط الدفع عبر Lemon Squeezy
    window.location.href = "https://ai-moto-maintenance.lemonsqueezy.com/checkout/buy/c3abadc2-c6cc-459e-a106-de43d4f2d3f0";
}

// ==================== الأحداث ====================
document.getElementById('capture-photo').addEventListener('click', capturePhoto);
document.getElementById('record-sound').addEventListener('click', recordSound);
document.getElementById('diagnose-btn').addEventListener('click', performDiagnosis);
document.getElementById('download-pdf').addEventListener('click', generatePDF);
document.getElementById('subscribe-btn').addEventListener('click', subscribe);

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => loadLanguage(btn.getAttribute('data-lang')));
});

// بدء التشغيل
startCamera();
loadLanguage('ar');
updateCounterDisplay();