// ==================== الترجمة ====================
const translations = {
  ar: {
    cam_title: "تصوير العادم",
    cam_desc: "وجّه الكاميرا نحو مخرج العادم لتحليل لون الدخان",
    mic_title: "تسجيل صوت المحرك",
    mic_desc: "قرب الهاتف من المحرك وسجل الصوت لمدة 5 ثوانٍ",
    diagnose_btn: "🔍 شخص الآن",
    result_title: "نتيجة التشخيص",
    deep_btn: "📄 التقرير العميق (مدفوع)",
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
    deep_btn: "📄 Deep Report (Paid)",
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
    deep_btn: "📄 Rapport complet (Payant)",
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
  document.getElementById('deep-diagnose').textContent = t.deep_btn;
  
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if(btn.getAttribute('data-lang') === lang) btn.classList.add('active');
  });
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
  
  // تحليل بسيط للون الدخان (سطحياً)
  analyzeSmokeColor(photoData);
  
  const t = translations[currentLang];
  document.getElementById('photo-result').innerHTML = `<span style="color:#00a86b">✅ ${t.photo_taken}</span>`;
}

// ==================== تحليل لون الدخان ====================
function analyzeSmokeColor(imageDataURL) {
  // في النسخة الكاملة، سنستخدم تحليل أكثر دقة
  // حالياً، نطلب من المستخدم إدخال لون الدخان يدوياً (للتجربة)
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
      
      // محاكاة تحليل الصوت (سطحياً)
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
function diagnose() {
  const t = translations[currentLang];
  const resultDiv = document.getElementById('result-card');
  const resultText = document.getElementById('result-text');
  const resultHint = document.getElementById('result-hint');
  const deepBtn = document.getElementById('deep-diagnose');
  
  if(!smokeColor || !soundType) {
    alert("الرجاء إكمال خطوات التصوير والتسجيل أولاً");
    return;
  }
  
  let diagnosis = "";
  let hint = "";
  
  // منطق التشخيص بناءً على الجدول المعتمد
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
  
  resultText.innerHTML = diagnosis;
  resultHint.innerHTML = hint;
  resultDiv.classList.remove('hidden');
  deepBtn.classList.remove('hidden');
  
  // تخزين نتيجة التشخيص للاستخدام في التقرير العميق
  localStorage.setItem('lastDiagnosis', JSON.stringify({
    smokeColor, soundType, diagnosis, hint, timestamp: Date.now()
  }));
}

// ==================== التقرير العميق (مدفوع) ====================
function deepDiagnose() {
  const t = translations[currentLang];
  alert(t.deep_btn + "\n" + "سيتم ربط بوابة الدفع قريباً (Lemon Squeezy / Patreon)");
  // هنا سنضيف رابط الدفع لاحقاً
}

// ==================== الأحداث ====================
document.getElementById('capture-photo').addEventListener('click', capturePhoto);
document.getElementById('record-sound').addEventListener('click', recordSound);
document.getElementById('diagnose-btn').addEventListener('click', diagnose);
document.getElementById('deep-diagnose').addEventListener('click', deepDiagnose);

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => loadLanguage(btn.getAttribute('data-lang')));
});

// بدء التشغيل
startCamera();
loadLanguage('ar');