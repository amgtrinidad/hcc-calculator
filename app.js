function getNum(id){ const v = parseFloat(document.getElementById(id).value); return isNaN(v)? 0 : v; }
function text(id){ return document.getElementById(id).value; }
function fmt(x, d=2){ if (isNaN(x)) return "—"; return Number(x).toFixed(d); }

function compute(){
  let bili = getNum('biliVal'); const biliU = text('biliUnit');
  let alb  = getNum('albVal');  const albU  = text('albUnit');
  const inr = getNum('inr');
  const asc = text('ascites');
  const enc = text('enceph');
  const ecog = parseInt(text('ecog'), 10);
  const nod  = parseInt(getNum('nodules'), 10);
  let size = getNum('sizeVal'); const sizeU = text('sizeUnit');
  const pvi = text('pvi'); const ehs = text('ehs');

  const bili_mgdl = (biliU === 'μmol/L') ? bili/17.1 : bili;
  const alb_gdl   = (albU  === 'g/L')    ? alb/10     : alb;
  const size_cm   = (sizeU === 'mm')     ? size/10    : size;

  document.getElementById('cpBiliVal').textContent = fmt(bili_mgdl,2);
  document.getElementById('cpAlbVal').textContent  = fmt(alb_gdl,2);
  document.getElementById('cpInrVal').textContent  = fmt(inr,2);
  document.getElementById('cpAscVal').textContent  = asc;
  document.getElementById('cpEncVal').textContent  = enc;

  const s_bili = (bili_mgdl < 2) ? 1 : (bili_mgdl <= 3 ? 2 : 3);
  const s_alb  = (alb_gdl >= 3.5) ? 1 : (alb_gdl >= 2.8 ? 2 : 3);
  const s_inr  = (inr < 1.7) ? 1 : (inr <= 2.3 ? 2 : 3);
  const s_asc  = (asc === 'None') ? 1 : (asc === 'Mild' ? 2 : 3);
  const s_enc  = (enc === 'None') ? 1 : (enc === 'I–II' ? 2 : 3);

  const cp_total = s_bili + s_alb + s_inr + s_asc + s_enc;
  const cp_class = (cp_total <= 6) ? 'A' : (cp_total <= 9 ? 'B' : 'C');

  document.getElementById('cpBiliScore').textContent = s_bili;
  document.getElementById('cpAlbScore').textContent  = s_alb;
  document.getElementById('cpInrScore').textContent  = s_inr;
  document.getElementById('cpAscScore').textContent  = s_asc;
  document.getElementById('cpEncScore').textContent  = s_enc;
  document.getElementById('cpTotal').textContent     = cp_total;
  document.getElementById('cpClass').textContent     = cp_class;

  const bili_umol = bili_mgdl * 17.1;
  const alb_gL    = alb_gdl * 10;
  document.getElementById('albiBiliUM').textContent = fmt(bili_umol,1);
  document.getElementById('albiAlbGL').textContent  = fmt(alb_gL,1);

  const albi_score = Math.log10(Math.max(bili_umol, 1e-9)) * 0.66 + (alb_gL * -0.0852);
  let albi_grade, albi_sub;
  if (albi_score <= -2.60){ albi_grade = "1"; albi_sub = "N/A"; }
  else if (albi_score <= -2.27){ albi_grade = "2"; albi_sub = "2a"; }
  else if (albi_score <= -1.39){ albi_grade = "2"; albi_sub = "2b"; }
  else { albi_grade = "3"; albi_sub = "N/A"; }
  document.getElementById('albiScore').textContent = fmt(albi_score,2);
  document.getElementById('albiGrade').textContent = albi_grade;
  document.getElementById('albiSub').textContent   = albi_sub;

  document.getElementById('bclcEcog').textContent = ecog;
  document.getElementById('bclcNod').textContent  = nod;
  document.getElementById('bclcSize').textContent = fmt(size_cm,1);
  document.getElementById('bclcPvi').textContent  = pvi;
  document.getElementById('bclcEhs').textContent  = ehs;
  document.getElementById('bclcCp').textContent   = cp_class;

  let bclc;
  if (cp_class === 'C' || ecog > 2) { bclc = 'D'; }
  else if (pvi === 'Yes' || ehs === 'Yes' || (ecog >=1 && ecog <=2)) { bclc = 'C'; }
  else if (ecog === 0 && (cp_class==='A'||cp_class==='B') && nod===1 && size_cm<2){ bclc='0'; }
  else if (ecog === 0 && (cp_class==='A'||cp_class==='B') && (nod===1 || (nod<=3 && size_cm<=3))){ bclc='A'; }
  else if (ecog === 0 && (cp_class==='A'||cp_class==='B') && pvi==='No' && ehs==='No'){ bclc='B'; }
  else { bclc='C'; }

  document.getElementById('bclcStage').textContent = bclc;
  const pill = document.getElementById('bclcStagePill');
  pill.classList.remove('good','mid','bad');
  pill.classList.add(bclc === '0' || bclc === 'A' ? 'good' : (bclc==='B' ? 'mid' : 'bad'));

  const state = { bili, biliU, alb, albU, inr, asc, enc, ecog, nod, size, sizeU, pvi, ehs };
  try { window.history.replaceState(null, "", "#"+encodeURIComponent(JSON.stringify(state))); } catch(e){}

  const tsEl = document.getElementById("lastCalc");
  if (tsEl) { tsEl.textContent = "Last calculated: " + new Date().toLocaleString(); }
}

function loadStateFromHash(){
  if (location.hash.length > 1){
    try{
      const s = JSON.parse(decodeURIComponent(location.hash.slice(1)));
      const set = (id,val)=>{ const el = document.getElementById(id); if (el) el.value = val; };
      set('biliVal', s.bili); set('biliUnit', s.biliU);
      set('albVal', s.alb); set('albUnit', s.albU);
      set('inr', s.inr);
      set('ascites', s.asc); set('enceph', s.enc);
      set('ecog', s.ecog);
      set('nodules', s.nod);
      set('sizeVal', s.size); set('sizeUnit', s.sizeU);
      set('pvi', s.pvi); set('ehs', s.ehs);
    }catch(e){ console.warn("Bad state in URL"); }
  }
}

function resetInputs(){
  document.getElementById('biliVal').value = 1.8;
  document.getElementById('biliUnit').value = 'mg/dL';
  document.getElementById('albVal').value = 3.6;
  document.getElementById('albUnit').value = 'g/dL';
  document.getElementById('inr').value = 1.2;
  document.getElementById('ascites').value = 'None';
  document.getElementById('enceph').value = 'None';
  document.getElementById('ecog').value = '0';
  document.getElementById('nodules').value = 1;
  document.getElementById('sizeVal').value = 2.5;
  document.getElementById('sizeUnit').value = 'cm';
  document.getElementById('pvi').value = 'No';
  document.getElementById('ehs').value = 'No';
  compute();
}

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("input,select").forEach(el=>{
    el.addEventListener("input", compute, {passive:true});
    el.addEventListener("change", compute, {passive:true});
  });
  document.getElementById("resetBtn").addEventListener("click", resetInputs);
  document.getElementById("shareBtn").addEventListener("click", ()=>{
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(location.href).then(()=>{
        alert("Link with current inputs copied to clipboard.");
      }, ()=>{ alert("Copy failed. Share the URL after # manually."); });
    } else {
      prompt("Copy this URL:", location.href);
    }
  });
  document.getElementById("calcBtn").addEventListener("click", compute);

  loadStateFromHash();
  compute();
});