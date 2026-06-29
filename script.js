<script src="script.js"></script>

// 1. 返回頂部按鈕與行李清單記憶功能
const topBtn = document.getElementById('top');
window.addEventListener('scroll', () => { topBtn.style.display = scrollY > 500 ? 'block' : 'none' });
topBtn.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

// 這裡的 Key 改成大阪專用，避免與舊網頁衝突
const key = 'osakaTripChecklist'; 
const boxes = [...document.querySelectorAll('.checklist input')];
try {
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  boxes.forEach((b, i) => b.checked = !!saved[i]);
} catch (e) {}

boxes.forEach((b, i) => b.addEventListener('change', () => 
  localStorage.setItem(key, JSON.stringify(boxes.map(x => x.checked)))
));


// 2. 大阪跨年旅程倒數計時器 (目標：2026/12/26 08:55 泰國獅航起飛)
(function(){
  const target = new Date('2026-12-26T08:55:00+08:00').getTime();
  const ids = ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'].map(id => document.getElementById(id));
  if(ids.some(x => !x)) return;
  
  function pad(n) { return String(n).padStart(2, '0') }
  
  function tick() {
    let diff = target - Date.now();
    if(diff <= 0) {
      ids[0].textContent = '0'; ids[1].textContent = '00'; ids[2].textContent = '00'; ids[3].textContent = '00';
      return;
    }
    const d = Math.floor(diff / 86400000); diff %= 86400000;
    const h = Math.floor(diff / 3600000); diff %= 3600000;
    const m = Math.floor(diff / 60000); diff %= 60000;
    const s = Math.floor(diff / 1000);
    
    ids[0].textContent = d; 
    ids[1].textContent = pad(h); 
    ids[2].textContent = pad(m); 
    ids[3].textContent = pad(s);
  }
  tick(); setInterval(tick, 1000);
})();


// 3. 透過 Open-Meteo 自動動態抓取當地即時天氣 (免 API Key)
(function(){
  const codeMap = {
    0:'晴朗', 1:'大體晴朗', 2:'局部多雲', 3:'陰天',
    45:'霧', 48:'霧凇',
    51:'毛毛雨', 53:'毛毛雨', 55:'毛毛雨',
    61:'小雨', 63:'中雨', 65:'大雨',
    71:'小雪', 73:'中雪', 75:'大雪',
    80:'陣雨', 81:'陣雨', 82:'強陣雨',
    95:'雷雨', 96:'雷雨冰雹', 99:'強雷雨冰雹'
  };
  
  document.querySelectorAll('[data-weather-lat]').forEach(async card => {
    const lat = card.dataset.weatherLat, lon = card.dataset.weatherLon;
    const temp = card.querySelector('.weather-temp');
    const code = card.querySelector('.weather-code');
    const rain = card.querySelector('.weather-rain');
    const wind = card.querySelector('.weather-wind');
    
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=precipitation_probability_max&timezone=Asia%2FTokyo&forecast_days=1`;
      const res = await fetch(url);
      if(!res.ok) throw new Error('weather fetch failed');
      const data = await res.json();
      
      temp.textContent = Math.round(data.current.temperature_2m) + '°C';
      code.textContent = codeMap[data.current.weather_code] || '天氣更新';
      rain.textContent = (data.daily.precipitation_probability_max?.[0] ?? '--') + '%';
      wind.textContent = Math.round(data.current.wind_speed_10m ?? 0) + ' km/h';
    } catch(e) {
      temp.textContent = '--°C';
      code.textContent = '無法載入';
      rain.textContent = '--%';
      wind.textContent = '-- km/h';
    }
  });
})();
