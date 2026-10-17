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