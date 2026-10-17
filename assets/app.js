const ROOT="data/";
const $=id=>document.getElementById(id);
const n=v=>{const x=Number(String(v??"").replace(/,/g,"").replace(/%/g,""));return Number.isFinite(x)?x:0};
const f=v=>n(v).toLocaleString("en-IN");
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const kpi=(label,value,note)=>`<article class="kpi"><span>${esc(label)}</span><strong>${esc(value??"—")}</strong><small>${esc(note||"")}</small></article>`;
const layout={margin:{l:65,r:15,t:10,b:50},paper_bgcolor:"rgba(0,0,0,0)",plot_bgcolor:"rgba(0,0,0,0)",font:{family:"Segoe UI,Arial",color:"#29252a",size:11},xaxis:{gridcolor:"#eee7ea",automargin:true},yaxis:{gridcolor:"#eee7ea",automargin:true}};
const config={responsive:true,displaylogo:false};
async function get(file){const url=new URL(ROOT+file,document.baseURI);const r=await fetch(url);if(!r.ok)throw Error(`${file}: HTTP ${r.status}`);return r.json()}
function kpis(id,arr){$(id).innerHTML=arr.map(x=>kpi(...x)).join("")}
function hbar(id,items,label,value,color,limit=12){const a=[...items].sort((x,y)=>n(y[value])-n(x[value])).slice(0,limit).reverse();Plotly.newPlot(id,[{x:a.map(x=>n(x[value])),y:a.map(x=>x[label]),type:"bar",orientation:"h",marker:{color},hovertemplate:"%{y}<br>%{x:,}<extra></extra>"}],{...layout,margin:{l:170,r:12,t:8,b:40},xaxis:{...layout.xaxis,title:"Scholarly output"}},config)}
function subjects(d,q=""){const a=d.subjects.filter(x=>x.subject_area.toLowerCase().includes(q.toLowerCase()));$("subjectRows").innerHTML=a.map(x=>`<tr><td>${esc(x.subject_area)}</td><td>${f(x.publications)}</td><td>${f(x.citations)}</td><td>${f(x.authors)}</td><td>${esc(x.citations_per_publication)}</td><td>${esc(x.fwci)}</td></tr>`).join("")||'<tr><td colspan="6">No matching subject areas.</td></tr>'}
function authors(d,q=""){const a=d.authors.filter(x=>String(x.Name||"").toLowerCase().includes(q.toLowerCase()));$("authorRows").innerHTML=a.map(x=>`<tr><td>${esc(x.Name)}</td><td>${f(x["Scholarly Output"])}</td><td>${esc(x["Most recent publication"])}</td><td>${f(x.Citations)}</td><td>${esc(x["Citations per Publication"])}</td><td>${esc(x["Field-Weighted Citation Impact"])}</td><td>${esc(x["h-index"])}</td><td>${x["Scopus author profile"]?`<a target="_blank" rel="noopener" href="${esc(x["Scopus author profile"])}">Scopus ↗</a>`:"—"}</td></tr>`).join("")||'<tr><td colspan="8">No matching authors.</td></tr>'}
function institutions(d,q=""){const a=d.institutions.filter(x=>(x.institution+" "+x.country).toLowerCase().includes(q.toLowerCase()));$("institutionRows").innerHTML=a.map(x=>`<tr><td>${esc(x.institution)}</td><td>${esc(x.country)}</td><td>${f(x.publications)}</td><td>${f(x.citations)}</td><td>${f(x.coauthors)}</td><td>${esc(x.cpp)}</td><td>${esc(x.fwci)}</td></tr>`).join("")||'<tr><td colspan="7">No matching institutions.</td></tr>'}
async function init(){try{
const [o,c,y]=await Promise.all([get("scival_overall.json"),get("scival_current.json"),get("scival_yearwise.json")]);
const metrics=(d)=>[
["Scholarly output",f(d.metrics["Scholarly Output"]),d.period],
["Citation count",f(d.metrics["Citation Count"]),"As reported by SciVal"],
["Authors",f(d.metrics.Authors),"Author records"],
["h5-index",f(d.metrics["h5-index"]),"SciVal five-year h-index metric"],
["Citations/publication",d.metrics["Citations per Publication"],"SciVal indicator"],
["Mean FWCI",d.metrics["Field-Weighted Citation Impact (Mean)"],"Field-weighted citation impact"],
["Open-access share",`${d.metrics["Scholarly Output (Open Access %)"]}%`,"As reported by SciVal"]];
kpis("overallKpis",metrics(o));kpis("currentKpis",metrics(c));
$("updatedAt").textContent=`SciVal updated ${o.last_updated}; exported ${o.exported}`;$("scivalUpdated").textContent=o.last_updated;$("scivalExported").textContent=o.exported;
$("status").textContent=`Loaded institutional reports for ${o.period} and ${c.period}.`;
hbar("overallSubjectsChart",o.subjects,"subject_area","publications","#64172d",12);
hbar("currentSubjectsChart",c.subjects,"subject_area","publications","#9a6b32",12);
Plotly.newPlot("collabChart",[{labels:o.collaboration.map(x=>x.type),values:o.collaboration.map(x=>n(x.publications)),type:"pie",hole:.45,textinfo:"label+percent",hovertemplate:"%{label}<br>%{value:,} publications<extra></extra>",marker:{colors:["#64172d","#d6b56d","#7c8798","#a9c4b5"]}}],{margin:{l:8,r:8,t:8,b:8},paper_bgcolor:"rgba(0,0,0,0)",font:layout.font,showlegend:false},config);
const ys=[...y.years].sort((a,b)=>a.year-b.year);
Plotly.newPlot("yearChart",[{x:ys.map(x=>x.year),y:ys.map(x=>x.citations),type:"scatter",mode:"lines+markers",line:{color:"#64172d",width:3},marker:{color:"#d6b56d",size:6},hovertemplate:"Year %{x}<br>Citations %{y:,}<extra></extra>"}],{...layout,xaxis:{...layout.xaxis,title:"Year",dtick:2},yaxis:{...layout.yaxis,title:"Citations"}},config);
hbar("currentTopicsChart",c.topics,"topic","publications","#9a6b32",8);hbar("topicsChart",o.topics,"topic","publications","#64172d",18);
subjects(o);authors(o);institutions(o);
$("topicRows").innerHTML=o.topics.map(x=>`<tr><td>${esc(x.topic)}</td><td>${esc(x.topic_number)}</td><td>${f(x.publications)}</td><td>${esc(x.publication_share)}%</td><td>${esc(x.fwci)}</td></tr>`).join("");
$("subjectSearch").addEventListener("input",e=>subjects(o,e.target.value));$("authorSearch").addEventListener("input",e=>authors(o,e.target.value));$("institutionSearch").addEventListener("input",e=>institutions(o,e.target.value));
}catch(e){$("status").textContent="Data loading failed: "+e.message+". Confirm the data folder and JSON filenames are uploaded to GitHub.";console.error(e)}}
init();

// Single-page tabs: all three views live in the same GitHub Pages dashboard.
document.querySelectorAll(".tab-button").forEach(btn=>btn.addEventListener("click",()=>{
 document.querySelectorAll(".tab-button").forEach(b=>{b.classList.toggle("active",b===btn);b.setAttribute("aria-selected",b===btn?"true":"false")});
 document.querySelectorAll(".dashboard-view").forEach(v=>{const active=v.id==="view-"+btn.dataset.view;v.classList.toggle("active",active);v.hidden=!active});
 // Plotly needs a resize when a chart is shown after being hidden.
 setTimeout(()=>{document.querySelectorAll("#view-"+btn.dataset.view+" .js-plotly-plot").forEach(p=>{try{Plotly.Plots.resize(p)}catch(e){}})},60);
}));
async function initOpenAlexTab(){
 const status=document.getElementById("status");
 try{
  const r=await fetch(new URL("data/openalex_institution.json",document.baseURI));
  if(!r.ok)throw Error("openalex_institution.json HTTP "+r.status);
  const d=await r.json(),f=v=>Number(v||0).toLocaleString("en-IN"),e=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const cards=[["Works",f(d.works_count),"OpenAlex profile"],["Cited-by count",f(d.cited_by_count),"OpenAlex citations"],["h-index",f(d.summary_stats?.h_index),"OpenAlex summary"],["i10-index",f(d.summary_stats?.i10_index),"OpenAlex summary"],["2-year mean citedness",Number(d.summary_stats?.["2yr_mean_citedness"]||0).toFixed(2),"OpenAlex summary"],["Institution ID","I122964287","OpenAlex profile"]];
  document.getElementById("openalexKpis").innerHTML=cards.map(x=>`<article class="kpi"><span>${e(x[0])}</span><strong>${e(x[1])}</strong><small>${e(x[2])}</small></article>`).join("");
  const layout={margin:{l:65,r:15,t:10,b:50},paper_bgcolor:"rgba(0,0,0,0)",plot_bgcolor:"rgba(0,0,0,0)",font:{family:"Segoe UI,Arial",color:"#29252a",size:11},xaxis:{gridcolor:"#eee7ea",automargin:true},yaxis:{gridcolor:"#eee7ea",automargin:true}},cfg={responsive:true,displaylogo:false};
  const ys=[...(d.counts_by_year||[])].sort((a,b)=>a.year-b.year);
  Plotly.newPlot("openalexYearChart",[{x:ys.map(x=>x.year),y:ys.map(x=>x.works_count),type:"bar",marker:{color:"#64172d"},hovertemplate:"Year %{x}<br>Works %{y:,}<extra></extra>"}],{...layout,xaxis:{...layout.xaxis,title:"Year",dtick:2},yaxis:{...layout.yaxis,title:"Works"}},cfg);
  Plotly.newPlot("openalexOpenChart",[{x:ys.map(x=>x.year),y:ys.map(x=>x.oa_works_count),type:"bar",marker:{color:"#9a6b32"},hovertemplate:"Year %{x}<br>Open-access works %{y:,}<extra></extra>"}],{...layout,xaxis:{...layout.xaxis,title:"Year",dtick:2},yaxis:{...layout.yaxis,title:"Open-access works"}},cfg);
  const topics=[...(d.topics||[])].sort((a,b)=>Number(b.count||0)-Number(a.count||0)),top=topics.slice(0,15).reverse();
  Plotly.newPlot("openalexTopicsChart",[{x:top.map(x=>Number(x.count||0)),y:top.map(x=>x.name),type:"bar",orientation:"h",marker:{color:"#9a6b32"}}],{...layout,margin:{l:245,r:15,t:10,b:40},xaxis:{...layout.xaxis,title:"Works"}},cfg);
  document.getElementById("openalexTopicRows").innerHTML=topics.map(x=>`<tr><td>${e(x.name)}</td><td>${f(x.count)}</td><td>${e(x.subfield)}</td><td>${e(x.field)}</td><td>${e(x.domain)}</td></tr>`).join("");
  document.getElementById("openalexNote").textContent=`Institution: ${d.display_name}. Snapshot last updated ${d.updated_date||"date not provided"}. Counts reflect the supplied OpenAlex API response.`;
 }catch(err){console.error(err);status.textContent+=" OpenAlex data could not load: "+err.message;}
}
initOpenAlexTab();
