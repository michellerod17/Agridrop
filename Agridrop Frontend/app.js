// ===== Slider =====
const slidesContainer = document.querySelector('.slides');
const slides = document.querySelectorAll('.slide');
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');
const sliderContainer = document.querySelector('.slider-container');
const appContainer = document.querySelector('.app-container');
const enterAppBtn = document.getElementById('enterApp');

let currentIndex = 0;
function showSlide(index) {
  if(index < 0) index = slides.length - 1;
  if(index >= slides.length) index = 0;
  slidesContainer.style.transform = `translateX(-${index * 100}%)`;
  currentIndex = index;
}
prev.addEventListener('click', ()=>showSlide(currentIndex-1));
next.addEventListener('click', ()=>showSlide(currentIndex+1));

enterAppBtn.addEventListener('click', ()=>{
  sliderContainer.style.display='none';
  appContainer.style.display='block';
});

// ===== Form Submission =====
const cropForm = document.getElementById('cropForm');
const resultsDiv = document.getElementById('results');

cropForm.addEventListener('submit', async e=>{
  e.preventDefault();

  const region = document.getElementById('region').value.trim();
  const water = document.getElementById('water').value.trim();
  const landSize = parseFloat(document.getElementById('landSize').value) || 1;

  if(!water || !region || landSize<=0){
    alert("Please fill all fields with valid values.");
    return;
  }

  const params = new URLSearchParams({ water, region, land: landSize });

  try{
    const response = await fetch(`https://agridrop.onrender.com/recommend?${params}`);
    if(!response.ok){
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch data from backend.");
    }

    const data = await response.json();
    displayResults(data, landSize);

  }catch(err){
    console.error(err);
    resultsDiv.innerHTML = `<p style="color:red;">Error fetching recommendations. Try again later.</p>`;
  }
});

// ===== Display Results with Chart =====
function displayResults(crops, landSize){
  if(!crops || crops.length===0){
    resultsDiv.innerHTML = `<p>No crops found for your selection.</p>`;
    return;
  }

  let html = `<h3>Recommended Crops for ${landSize} acre(s):</h3><div class="crop-cards">`;

  const labels = [], profitData=[], yieldData=[];

  crops.forEach(crop=>{
    labels.push(crop.crop);
    profitData.push(parseFloat(crop.total_profit));
    yieldData.push(parseFloat(crop.total_yield));

    html+=`
      <div class="crop-card">
        <h4>${crop.crop}</h4>
        <p>Water Requirement: ${crop.water_need}</p>
        <p>Region: ${crop.region}</p>
        <p>Yield per acre: ${crop.yield_per_acre}</p>
        <p>Profit per acre: ₹${crop.profit_per_acre}</p>
        <p>Total Yield: ${crop.total_yield}</p>
        <p>Total Profit: ₹${crop.total_profit}</p>
      </div>
    `;
  });

  html += `</div><canvas id="resultsChart" style="max-width:600px;margin-top:30px;"></canvas>`;
  resultsDiv.innerHTML = html;

  const ctx = document.getElementById('resultsChart').getContext('2d');
  new Chart(ctx,{
    type:'bar',
    data:{
      labels: labels,
      datasets:[
        { label:'Total Profit (₹)', data: profitData, backgroundColor:'rgba(54,162,235,0.6)' }
      ]
    },
    options:{
      responsive:true,
      scales:{ y:{ beginAtZero:true } }
    }
  });
}