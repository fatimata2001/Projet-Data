// Helpers
const € = n => n.toLocaleString("fr-FR", {style:"currency", currency:"EUR", maximumFractionDigits:0});
const pct = x => (x*100).toFixed(2) + "%";

const ETF = {
  EUNL: { exp: 0.07, vol: 0.15 },
  CW8: { exp: 0.068, vol: 0.15 },
  "PEA-WLD": { exp: 0.065, vol: 0.16 },
  EM: { exp: 0.09, vol: 0.22 },
  BONDS: { exp: 0.03, vol: 0.07 },
};
const FREQ = { monthly:12, quarterly:4, semiannual:2, annual:1 };

let growthChart, returnsChart;

function simulate(params){
  const {initial, recurring, years, feePct, freq, etf, begin} = params;
  const periods = years * FREQ[freq];
  const r_a = ETF[etf].exp;
  const r_p = Math.pow(1+r_a, 1/FREQ[freq]) - 1;
  const fee_p = Math.pow(1+feePct, 1/FREQ[freq]) - 1;

  let value = initial;
  let contrib = 0;
  const points = [value];
  const returns = [];

  for(let i=1;i<=periods;i++){
    if(begin){ value += recurring; contrib += recurring; }
    const gross = value * (1+r_p);
    const fees  = gross * fee_p;
    const newVal = gross - fees;
    returns.push((newVal - value)/value);
    value = newVal;
    if(!begin){ value += recurring; contrib += recurring; }
    // sample yearly for nicer x-axis
    if(i % FREQ[freq] === 0) points.push(value);
  }

  // Lump sum: tout investi dès le début (initial + contrib total)
  let lump = initial + contrib;
  const yearsLabels = Array.from({length: years+1}, (_,i)=>i);
  const lumpPts = [lump];
  for(let y=1;y<=years;y++){ lump *= (1+r_a); lumpPts.push(lump); }

  const invested = initial + contrib;
  const finalValue = value;
  const yearsElapsed = years || 1;
  const cagr = Math.pow(finalValue / (invested || 1), 1/yearsElapsed) - 1;

  // annualized vol + sharpe (approx)
  const perAvg = returns.reduce((a,b)=>a+b,0) / (returns.length||1);
  const perVar = returns.reduce((a,r)=>a + Math.pow(r - perAvg, 2), 0) / (returns.length||1);
  const vol = Math.sqrt(perVar) * Math.sqrt(FREQ[freq]);
  const riskFree = 0.02;
  const sharpe = vol>0 ? ((perAvg*FREQ[freq]) - riskFree)/vol : 0;

  return {yearsLabels, points, lumpPts, invested, finalValue, cagr, sharpe, vol};
}

function renderCharts(data){
  const {yearsLabels, points, lumpPts, cagr} = data;

  // Growth
  const ctx1 = document.getElementById("chartGrowth");
  growthChart && growthChart.destroy();
  growthChart = new Chart(ctx1, {
    type: "line",
    data: {
      labels: yearsLabels,
      datasets: [
        { label:"DCA", data: points, fill:false, borderWidth:2 },
        { label:"Lump Sum", data: lumpPts, fill:false, borderWidth:2 }
      ]
    },
    options: { responsive:true, plugins:{legend:{position:"bottom"}} }
  });

  // Returns (simple mock from points)
  const rets = [];
  for(let i=1;i<points.length;i++){
    rets.push( (points[i]-points[i-1]) / points[i-1] );
  }
  const ctx2 = document.getElementById("chartReturns");
  returnsChart && returnsChart.destroy();
  returnsChart = new Chart(ctx2, {
    type: "bar",
    data: { labels: yearsLabels.slice(1), datasets:[{label:"Rendement", data: rets}] },
    options: { responsive:true, plugins:{legend:{display:false}}, scales:{y:{ticks:{ callback: v => (v*100).toFixed(0) + '%' }}} }
  });
}

function updateTiles(data){
  document.getElementById("tInvested").textContent = €(Math.round(data.invested));
  document.getElementById("tFinal").textContent    = €(Math.round(data.finalValue));
  document.getElementById("tCAGR").textContent     = pct(data.cagr);
  document.getElementById("tSharpe").textContent   = data.sharpe.toFixed(2);
}

function getParams(){
  const f = document.getElementById("formParams");
  return {
    initial:  Number(f.initial.value || 0),
    recurring:Number(f.recurring.value || 0),
    years:    Number(f.years.value || 1),
    feePct:   Number(f.feePct.value || 0)/100,
    freq:     f.freq.value,
    etf:      f.etf.value,
    begin:    document.getElementById("dcaBegin").checked
  };
}

function run(){
  const data = simulate(getParams());
  renderCharts(data);
  updateTiles(data);
}

document.getElementById("formParams").addEventListener("submit", (e)=>{
  e.preventDefault();
  run();
});
document.getElementById("dcaBegin").addEventListener("change", run);

// première exécution
run();

// 👉 Pour brancher au backend (exemple) :
// fetch('/api/simulate/', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(getParams())})
//   .then(r=>r.json())
//   .then(dataFromAPI => { /* remplacer simulate() et renderCharts() par les données reçues */ });
