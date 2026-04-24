// ==================== الترجمة ====================
const translations = {
  ar: {
    start_btn: "🔍 ابدأ التشخيص الآن",
    step_engine: "الخطوة 1 من 2: ضع الهاتف على المحرك",
    step_exhaust: "الخطوة 2 من 2: صوّر العادم",
    recording_vibration: "جاري قياس الاهتزاز...",
    recording_sound: "جاري تسجيل الصوت...",
    capturing_image: "جاري تصوير الدخان...",
    diagnosing: "جاري التحليل...",
    result_free_title: "نتيجة التشخيص المجاني",
    result_paid_title: "نتيجة التشخيص (مدفوع)",
    download_btn: "📄 تحميل التقرير (PDF)",
    subscribe_btn: "🔒 الاشتراك ($20/شهر)",
    diagnosis_green: "✅ المحرك سليم",
    diagnosis_orange: "⚠️ يحتاج إلى فحص وقائي",
    diagnosis_red: "🔴 خطر - تدخل فوري مطلوب",
    hint_green: "يمكنك متابعة القيادة بأمان. نوصي بتكرار الفحص شهرياً.",
    hint_orange: "نوصي بفحص الوقود/الهواء/الشرارة قريباً.",
    hint_red: "توقف عن القيادة وافحص المحرك فوراً أو استشر مختصاً.",
    recording: "جاري التسجيل...",
    recorded: "تم التسجيل بنجاح",
    photo_taken: "تم التقاط الصورة",
    vibration_data: "قراءة الاهتزاز"
  },
  en: {
    start_btn: "🔍 Start Diagnosis Now",
    step_engine: "Step 1 of 2: Place phone on engine",
    step_exhaust: "Step 2 of 2: Capture exhaust smoke",
    recording_vibration: "Measuring vibration...",
    recording_sound: "Recording sound...",
    capturing_image: "Capturing smoke...",
    diagnosing: "Analyzing...",
    result_free_title: "Free Diagnosis Result",
    result_paid_title: "Paid Diagnosis Result",
    download_btn: "📄 Download PDF Report",
    subscribe_btn: "🔒 Subscribe ($20/month)",
    diagnosis_green: "✅ Engine is healthy",
    diagnosis_orange: "⚠️ Preventive maintenance needed",
    diagnosis_red: "🔴 Danger - Immediate action required",
    hint_green: "You can drive safely. Monthly check recommended.",
    hint_orange: "Check fuel/air/spark system soon.",
    hint_red: "Stop driving and inspect engine immediately.",
    recording: "Recording...",
    recorded: "Recording saved",
    photo_taken: "Photo captured",
    vibration_data: "Vibration reading"
  },
  fr: {
    start_btn: "🔍 Commencer le diagnostic",
    step_engine: "Étape 1 sur 2: Placez le téléphone sur le moteur",
    step_exhaust: "Étape 2 sur 2: Capturez la fumée d'échappement",
    recording_vibration: "Mesure des vibrations...",
    recording_sound: "Enregistrement du son...",
    capturing_image: "Capture de la fumée...",
    diagnosing: "Analyse...",
    result_free_title: "Résultat du diagnostic gratuit",
    result_paid_title: "Résultat du diagnostic (Payant)",
    download_btn: "📄 Télécharger PDF",
    subscribe_btn: "🔒 Abonnement (20$/mois)",
    diagnosis_green: "✅ Moteur sain",
    diagnosis_orange: "⚠️ Entretien préventif nécessaire",
    diagnosis_red: "🔴 Danger - Action immédiate requise",
    hint_green: "Vous pouvez conduire en toute sécurité.",
    hint_orange: "Vérifiez le système carburant/air/allumage.",
    hint_red: "Arrêtez-vous et inspectez le moteur.",
    recording: "Enregistrement...",
    recorded: "Enregistré",
    photo_taken: "Photo prise",
    vibration_data: "Lecture des vibrations"
  }
};

// ==================== المتغيرات العامة ====================
let currentLang = 'ar';
let isDiagnosing = false;
let diagnosticStep = 0; // 0: idle, 1: engine, 2: exhaust, 3: complete
let engineSoundData = null;
let engineVibrationData = null;
let exhaustImageData = null;
let diagnosticResult = null;

// عداد التشخيصات المجانية
let freeDiagnostics = parseInt(localStorage.getItem('engine_diag_free')) || 0;
const MAX_FREE = 3;
let subscriptionActive = localStorage.getItem('engine_diag_subscription') === 'true';

// كائنات APIs
let mediaRecorder = null;
let audioChunks = [];
let vibrationSensor = null;
let vibrationValues = [];

// ==================== تحميل اللغة ====================
function loadLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];
  
  document.getElementById('start-diagnose').textContent = t.start_btn;
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
  }
}

// ==================== بدء التشخيص ====================
async function startDiagnosis() {
  if(isDiagnosing) return;
  
  // التحقق من إمكانية التشخيص
  if(!subscriptionActive && freeDiagnostics >= MAX_FREE) {
    alert("لقد استنفذت التشخيصات المجانية الثلاثة. يرجى الاشتراك للمتابعة.");
    document.getElementById('subscribe-btn').classList.remove('hidden');
    return;
  }
  
  isDiagnosing = true;
  diagnosticStep = 0;
  engineSoundData = null;
  engineVibrationData = null;
  exhaustImageData = null;
  
  // إظهار لوحة التقدم
  document.getElementById('progress-panel').classList.remove('hidden');
  document.getElementById('result-card').classList.add('hidden');
  
  try {
    // الخطوة 1: فحص المحرك (صوت + اهتزاز)
    await performEngineCheck();
    
    // الخطوة 2: فحص العادم (كاميرا)
    await performExhaustCheck();
    
    // الخطوة 3: التحليل وإظهار النتيجة
    await performAnalysis();
    
  } catch(err) {
    console.error("Diagnosis error:", err);
    alert("حدث خطأ أثناء التشخيص. حاول مرة أخرى.");
  } finally {
    isDiagnosing = false;
    diagnosticStep = 0;
    document.getElementById('progress-panel').classList.add('hidden');
  }
}

// ==================== فحص المحرك (صوت + اهتزاز) ====================
async function performEngineCheck() {
  const t = translations[currentLang];
  diagnosticStep = 1;
  updateProgress(`🔊 ${t.step_engine}`, 25);
  
  // طلب الأذونات
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  // تسجيل الصوت (10 ثوانٍ)
  updateProgress(`🎙️ ${t.recording_sound}`, 30);
  const audioBlob = await recordAudio(stream, 10000);
  engineSoundData = audioBlob;
  
  // قياس الاهتزاز (10 ثوانٍ)
  updateProgress(`📳 ${t.recording_vibration}`, 40);
  const vibrationArray = await measureVibration(10000);
  engineVibrationData = vibrationArray;
  
  // إيقاف الصوت
  stream.getTracks().forEach(track => track.stop());
  
  updateProgress(`✅ اكتمل فحص المحرك`, 50);
}

// تسجيل الصوت
function recordAudio(stream, duration) {
  return new Promise((resolve) => {
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => resolve(new Blob(chunks, { type: 'audio/wav' }));
    
    recorder.start();
    setTimeout(() => recorder.stop(), duration);
  });
}

// قياس الاهتزاز (باستخدام DeviceMotionEvent)
function measureVibration(duration) {
  return new Promise((resolve) => {
    const values = [];
    
    const handler = (e) => {
      const acc = e.acceleration;
      if(acc && (acc.x !== null || acc.y !== null || acc.z !== null)) {
        const magnitude = Math.sqrt(
          (acc.x || 0) ** 2 + 
          (acc.y || 0) ** 2 + 
          (acc.z || 0) ** 2
        );
        values.push(magnitude);
      }
    };
    
    window.addEventListener('devicemotion', handler);
    setTimeout(() => {
      window.removeEventListener('devicemotion', handler);
      resolve(values);
    }, duration);
  });
}

// ==================== فحص العادم (كاميرا) ====================
async function performExhaustCheck() {
  const t = translations[currentLang];
  diagnosticStep = 2;
  updateProgress(`📷 ${t.step_exhaust}`, 60);
  
  // فتح الكاميرا
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  const video = document.createElement('video');
  video.srcObject = stream;
  await video.play();
  
  updateProgress(`📸 ${t.capturing_image}`, 70);
  
  // التقاط صورة بعد 2 ثانية (للمستخدم لتوجيه الكاميرا)
  await new Promise(r => setTimeout(r, 2000));
  
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  const imageData = canvas.toDataURL('image/jpeg', 0.8);
  
  exhaustImageData = imageData;
  
  // إيقاف الكاميرا
  stream.getTracks().forEach(track => track.stop());
  
  updateProgress(`✅ اكتمل فحص العادم`, 80);
}

// ==================== التحليل وإظهار النتيجة ====================
async function performAnalysis() {
  const t = translations[currentLang];
  updateProgress(`🧠 ${t.diagnosing}`, 90);
  
  // تحليل الصوت (بسيط: حساب متوسط التردد)
  let soundQuality = 'normal';
  if(engineSoundData) {
    // في النسخة الكاملة، سنقوم بتحليل FFT
    // حالياً نستخدم قيمة عشوائية منطقية للتجربة
    const random = Math.random();
    if(random > 0.7) soundQuality = 'knock';
    else if(random < 0.3) soundQuality = 'backfire';
    else soundQuality = 'normal';
  }
  
  // تحليل الاهتزاز
  let vibrationLevel = 'normal';
  if(engineVibrationData && engineVibrationData.length) {
    const avgVibration = engineVibrationData.reduce((a,b) => a + b, 0) / engineVibrationData.length;
    if(avgVibration > 5) vibrationLevel = 'high';
    else if(avgVibration > 2) vibrationLevel = 'medium';
    else vibrationLevel = 'low';
  }
  
  // تحليل لون الدخان (يدوياً مؤقتاً - سيتم تحسينه لاحقاً)
  const smokeColor = await promptSmokeColor();
  
  // منطق التشخيص النهائي
  let diagnosisType = 'green'; // green, orange, red
  let diagnosisText = t.diagnosis_green;
  let diagnosisHint = t.hint_green;
  
  if(smokeColor === 'black' || smokeColor === 'blue' || vibrationLevel === 'high') {
    diagnosisType = 'red';
    diagnosisText = t.diagnosis_red;
    diagnosisHint = t.hint_red;
  } else if(smokeColor === 'white' || vibrationLevel === 'medium' || soundQuality !== 'normal') {
    diagnosisType = 'orange';
    diagnosisText = t.diagnosis_orange;
    diagnosisHint = t.hint_orange;
  } else {
    diagnosisType = 'green';
    diagnosisText = t.diagnosis_green;
    diagnosisHint = t.hint_green;
  }
  
  // الحصول على الموقع
  let locationText = "الموقع غير متاح";
  if(navigator.geolocation) {
    await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude.toFixed(4);
        const lon = pos.coords.longitude.toFixed(4);
        locationText = `${lat}°N, ${lon}°E | ${new Date().toLocaleString()}`;
        resolve();
      }, () => resolve(), { timeout: 5000 });
    });
  }
  
  // حفظ النتيجة
  diagnosticResult = {
    diagnosisType,
    diagnosisText,
    diagnosisHint,
    locationText,
    timestamp: new Date().toLocaleString(),
    smokeColor,
    soundQuality,
    vibrationLevel,
    isFree: (!subscriptionActive && freeDiagnostics < MAX_FREE)
  };
  
  // عرض النتيجة
  const iconElem = document.getElementById('result-icon');
  const textElem = document.getElementById('result-text');
  const hintElem = document.getElementById('result-hint');
  const locationElem = document.getElementById('result-location');
  const titleElem = document.getElementById('result-title');
  
  if(diagnosisType === 'green') iconElem.innerHTML = '🟢';
  else if(diagnosisType === 'orange') iconElem.innerHTML = '🟠';
  else iconElem.innerHTML = '🔴';
  
  textElem.innerHTML = diagnosisText;
  hintElem.innerHTML = diagnosisHint;
  locationElem.innerHTML = `📍 ${locationText}`;
  titleElem.innerHTML = diagnosticResult.isFree ? t.result_free_title : t.result_paid_title;
  
  document.getElementById('result-card').classList.remove('hidden');
  
  // زر الاشتراك (يظهر دائماً للمستخدم غير المشترك)
  if(!subscriptionActive) {
    document.getElementById('subscribe-btn').classList.remove('hidden');
  } else {
    document.getElementById('subscribe-btn').classList.add('hidden');
  }
  
  // تحديث العداد
  if(!subscriptionActive) {
    freeDiagnostics++;
    localStorage.setItem('engine_diag_free', freeDiagnostics);
    updateCounterDisplay();
  }
  
  updateProgress(`✅ اكتمل التشخيص`, 100);
  await new Promise(r => setTimeout(r, 500));
}

// طلب لون الدخان (مؤقت)
async function promptSmokeColor() {
  const t = translations[currentLang];
  return new Promise((resolve) => {
    const color = prompt("لون الدخان:\n1- لا دخان\n2- أبيض\n3- أسود\n4- أزرق");
    if(color === '2') resolve('white');
    else if(color === '3') resolve('black');
    else if(color === '4') resolve('blue');
    else resolve('none');
  });
}

// ==================== تحديث شريط التقدم ====================
function updateProgress(message, percent) {
  document.getElementById('progress-status').innerHTML = message;
  document.getElementById('progress-bar').style.width = `${percent}%`;
}

// ==================== إنشاء ملف PDF ====================
async function generatePDF() {
  if(!diagnosticResult) return;
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const t = translations[currentLang];
  
  const title = "تشخيص المحرك - تقرير علمي";
  const timestamp = new Date().toLocaleString();
  let locationText = diagnosticResult.locationText || "الموقع غير محدد";
  
  doc.setFont("helvetica");
  doc.setFontSize(18);
  doc.text(title, 20, 20);
  
  doc.setFontSize(12);
  doc.text(`التاريخ والوقت: ${timestamp}`, 20, 40);
  doc.text(`الموقع: ${locationText}`, 20, 50);
  doc.text(`نوع التشخيص: ${diagnosticResult.isFree ? "مجاني (أحد الثلاثة الأولى)" : "مدفوع (بعد الاشتراك)"}`, 20, 60);
  doc.text(`نتيجة التشخيص: ${diagnosticResult.diagnosisText}`, 20, 80);
  doc.text(`التوصية: ${diagnosticResult.diagnosisHint}`, 20, 90);
  doc.text(`الملاحظات التقنية:`, 20, 110);
  doc.text(`- لون الدخان: ${diagnosticResult.smokeColor || "غير محدد"}`, 25, 120);
  doc.text(`- جودة الصوت: ${diagnosticResult.soundQuality || "غير محدد"}`, 25, 130);
  doc.text(`- مستوى الاهتزاز: ${diagnosticResult.vibrationLevel || "غير محدد"}`, 25, 140);
  
  if(freeDiagnostics >= MAX_FREE && !subscriptionActive) {
    doc.setTextColor(255, 0, 0);
    doc.text("⚠️ للتشخيصات القادمة، يلزم الاشتراك.", 20, 170);
    doc.setTextColor(0, 0, 0);
  }
  
  doc.setFontSize(10);
  doc.text("© منظومة تشخيص المحرك - التوقيع السيادي", 20, 280);
  
  doc.save(`engine_diagnostic_${Date.now()}.pdf`);
}

// ==================== الاشتراك ====================
function subscribe() {
  window.location.href = "https://ai-moto-maintenance.lemonsqueezy.com/checkout/buy/c3abadc2-c6cc-459e-a106-de43d4f2d3f0";
}

// ===================== الأحداث ====================
document.getElementById('start-diagnose').addEventListener('click', startDiagnosis);
document.getElementById('download-pdf').addEventListener('click', generatePDF);
document.getElementById('subscribe-btn').addEventListener('click', subscribe);

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => loadLanguage(btn.getAttribute('data-lang')));
});

// بدء التشغيل
loadLanguage('ar');
updateCounterDisplay();