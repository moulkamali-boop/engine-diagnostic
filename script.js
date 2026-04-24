// ==================== ترجمة بسيطة ====================
const translations = {
  ar: {
    start_btn: "🔍 ابدأ التشخيص",
    mic_btn: "🎤 تسجيل الصوت (10 ثوانٍ)",
    photo_btn: "📸 تصوير العادم",
    diagnose_btn: "🔍 شخص الآن",
    result_title: "النتيجة",
    download_btn: "📄 تحميل PDF",
    subscribe_btn: "🔒 الاشتراك ($20/شهر)",
    recording: "جاري التسجيل...",
    recorded: "تم التسجيل",
    photo_taken: "تم التصوير",
    diagnosis_green: "✅ المحرك سليم",
    diagnosis_red: "🔴 عطل محتمل (فحص يدوي مطلوب)"
  },
  en: {
    start_btn: "🔍 Start Diagnosis",
    mic_btn: "🎤 Record Sound (10s)",
    photo_btn: "📸 Capture Exhaust",
    diagnose_btn: "🔍 Diagnose",
    result_title: "Result",
    download_btn: "📄 Download PDF",
    subscribe_btn: "🔒 Subscribe ($20/month)",
    recording: "Recording...",
    recorded: "Recorded",
    photo_taken: "Captured",
    diagnosis_green: "✅ Engine is healthy",
    diagnosis_red: "🔴 Potential issue (manual check required)"
  }
};

let currentLang = 'ar';
let audioBlob = null;
let imageData = null;
let freeCount = parseInt(localStorage.getItem('freeDiag')) || 0;

function t(key) { return translations[currentLang][key] || key; }

function updateUI() {
  document.getElementById('start-diagnose').textContent = t('start_btn');
  document.getElementById('result-title').textContent = t('result_title');
  document.getElementById('download-pdf').textContent = t('download_btn');
  document.getElementById('subscribe-btn').textContent = t('subscribe_btn');
  document.getElementById('counter').innerHTML = `🔓 المجانية: ${Math.max(0,3-freeCount)}/3`;
}

async function startDiagnosis() {
  document.getElementById('step1').classList.remove('hidden');
  document.getElementById('result-card').classList.add('hidden');
}

async function recordSound() {
  const btn = document.getElementById('mic-btn');
  btn.disabled = true;
  btn.textContent = t('recording');
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      audioBlob = new Blob(chunks, { type: 'audio/wav' });
      btn.textContent = t('recorded');
      stream.getTracks().forEach(t => t.stop());
    };
    recorder.start();
    setTimeout(() => recorder.stop(), 10000);
  } catch(e) {
    alert("لا يمكن الوصول للميكروفون. امنح الإذن.");
    btn.disabled = false;
    btn.textContent = t('mic_btn');
  }
}

async function takePhoto() {
  const btn = document.getElementById('photo-btn');
  btn.disabled = true;
  btn.textContent = t('recording');
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      imageData = canvas.toDataURL('image/jpeg', 0.8);
      btn.textContent = t('photo_taken');
      stream.getTracks().forEach(t => t.stop());
    }, 1000);
  } catch(e) {
    alert("لا يمكن الوصول للكاميرا. امنح الإذن.");
    btn.disabled = false;
    btn.textContent = t('photo_btn');
  }
}

function diagnose() {
  if(freeCount >= 3 && !localStorage.getItem('subscribed')) {
    alert("استنفذت المجانية. اشترك للمتابعة.");
    document.getElementById('subscribe-btn').classList.remove('hidden');
    return;
  }
  
  let result = t('diagnosis_green');
  if(!audioBlob || !imageData) {
    result = t('diagnosis_red');
  }
  
  document.getElementById('result-text').innerHTML = result;
  document.getElementById('result-card').classList.remove('hidden');
  
  if(freeCount < 3) {
    freeCount++;
    localStorage.setItem('freeDiag', freeCount);
    updateUI();
  }
  if(freeCount >= 3) document.getElementById('subscribe-btn').classList.remove('hidden');
}

function subscribe() {
  window.location.href = "https://ai-moto-maintenance.lemonsqueezy.com/checkout/buy/c3abadc2-c6cc-459e-a106-de43d4f2d3f0";
}

function generatePDF() {
  alert("PDF جاهز (سيتم تفعيله قريباً)");
}

// ربط الأحداث
document.getElementById('start-diagnose').onclick = startDiagnosis;
document.getElementById('mic-btn').onclick = recordSound;
document.getElementById('photo-btn').onclick = takePhoto;
document.getElementById('diagnose-btn').onclick = diagnose;
document.getElementById('download-pdf').onclick = generatePDF;
document.getElementById('subscribe-btn').onclick = subscribe;
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.onclick = () => { currentLang = btn.getAttribute('data-lang'); updateUI(); };
});

updateUI();