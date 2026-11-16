const corpus = {
vacation_request:["quiero vacaciones","me tomo vacaciones en enero","solicitar días de vacaciones","quiero pedir vacaciones","necesito una semana libre","quiero tomarme unos dias de vacaciones","request vacation days","i want to take vacation","book annual leave","quero tirar férias","preciso de férias","solicitar férias"],
vacation_balance:["cuantos dias de vacaciones me quedan","consultar saldo de vacaciones","cuantas vacaciones tengo disponibles","saldo de dias libres","how many vacation days left","check leave balance","quantos dias de férias restam","consultar saldo de férias"],
permission_request:["necesito salir temprano","pedir permiso para salir","solicitar permiso por un trámite","mañana salgo antes","necesito ausentarme unas horas","request time off for an appointment","leave early today","preciso sair mais cedo","pedir permissão para sair"],
absence_report:["no puedo ir a trabajar","hoy estoy enfermo","avisar ausencia","no voy a asistir mañana","report sick leave","i am sick today","notify absence","não vou trabalhar hoje","informar ausência"],
request_status:["en que estado esta mi solicitud","consultar estado de solicitud","aprobaron mi pedido","seguimiento de solicitud","check request status","is my request approved","qual o estado da solicitação"],
request_approval:["aprobar solicitud de juan","rechazar permiso pendiente","quiero aprobar vacaciones de pedro","autorizar solicitud","approve employee request","reject vacation request","aprovar solicitação","rejeitar pedido"],
form_creation:["crear formulario de adelantos","armar formulario para equipamiento","configurar nuevo tipo de solicitud","necesito un formulario nuevo","create a form for equipment requests","build a new request form","criar formulário de solicitação"],
calendar_query:["quien esta de vacaciones esta semana","mostrar calendario de ausencias","ver vacaciones del equipo","cuando vuelve juan","show team vacation calendar","who is on leave today","quem está de férias esta semana"],
advance_request:["pedir adelanto de sueldo","solicitar anticipo de salario","necesito un adelanto","request salary advance","ask for a payroll advance","pedir adiantamento salarial","solicitar adiantamento"]
};
const labels={unknown:"Fuera de dominio",approve_request:"Aprobar o rechazar",create_form:"Crear formulario",vacation_request:"Solicitar vacaciones",vacation_balance:"Consultar saldo",permission_request:"Solicitar permiso",absence_report:"Informar ausencia",request_status:"Consultar estado",request_approval:"Aprobar o rechazar",form_creation:"Crear formulario",calendar_query:"Consultar calendario",advance_request:"Solicitar adelanto"};
const samples=["Quiero vacaciones del 12 al 16 de enero","¿Cuántos días de vacaciones me quedan?","Mañana necesito salir antes por un trámite","Create a form for equipment requests","Quero tirar férias em dezembro","¿Quién está de vacaciones esta semana?","Contame un chiste"];
const evaluation=[
["quiero pedir mis vacaciones para febrero","vacation_request"],
["me quedan dias disponibles de licencia","vacation_balance"],
["necesito retirarme antes del trabajo","permission_request"],
["hoy no asisto porque estoy enfermo","absence_report"],
["mi solicitud ya fue aceptada?","request_status"],
["autorizar el permiso de ana","approve_request"],
["armame un formulario de compras","create_form"],
["mostrar las ausencias del equipo","calendar_query"],
["tell me a joke","unknown"],
["contame un chiste","unknown"],
["necesito vacaciones para la primera semana de marzo","vacation_request"],
["quisiera tomar cinco dias de descanso","vacation_request"],
["puedo solicitar vacaciones en julio","vacation_request"],
["i need annual leave next month","vacation_request"],
["quero marcar férias para janeiro","vacation_request"],
["cuantos dias libres me corresponden","vacation_balance"],
["quiero saber mi saldo de licencia","vacation_balance"],
["consultar dias de vacaciones pendientes","vacation_balance"],
["how much annual leave do I have left","vacation_balance"],
["quantos dias de férias ainda tenho","vacation_balance"],
["tengo que salir dos horas antes mañana","permission_request"],
["necesito permiso para ir al medico","permission_request"],
["puedo ausentarme el viernes por la mañana","permission_request"],
["may I leave early for an appointment","permission_request"],
["preciso de permissão para sair mais cedo","permission_request"],
["no voy a poder asistir hoy","absence_report"],
["quiero avisar que falto por enfermedad","absence_report"],
["mañana no iré a trabajar por fiebre","absence_report"],
["I am calling in sick today","absence_report"],
["não poderei comparecer ao trabalho amanhã","absence_report"],
["como va mi solicitud de licencia","request_status"],
["quiero consultar el estado de mi pedido","request_status"],
["todavia esta pendiente mi solicitud","request_status"],
["has my leave request been approved","request_status"],
["qual é o status do meu pedido","request_status"],
["apruebo las vacaciones de maria","approve_request"],
["necesito rechazar una solicitud pendiente","approve_request"],
["autorizar licencia de un empleado","approve_request"],
["approve the pending time off request","approve_request"],
["aprovar o pedido de férias do funcionário","approve_request"],
["quiero crear un formulario de licencias","create_form"],
["armar un formulario para solicitudes internas","create_form"],
["necesitamos un nuevo formulario de permisos","create_form"],
["create a new employee request form","create_form"],
["criar formulário para pedidos internos","create_form"],
["mostrame el calendario de licencias","calendar_query"],
["quienes faltan la semana que viene","calendar_query"],
["ver ausencias del equipo en diciembre","calendar_query"],
["show the team leave calendar","calendar_query"],
["quem está de férias na próxima semana","calendar_query"],
["contame una historia de piratas","unknown"],
["cuanto es siete por ocho","unknown"],
["que tiempo hace en buenos aires","unknown"],
["recomendame una pelicula","unknown"],
["como se cocina arroz","unknown"],
["tell me a funny story","unknown"],
["what is the capital of Canada","unknown"],
["play some music","unknown"],
["qual é a previsão do tempo","unknown"],
["me conte uma piada","unknown"]
];
const normalize=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
function grams(s){const t=" "+normalize(s)+" ";const a=[];for(let n=2;n<=4;n++)for(let i=0;i<=t.length-n;i++)a.push(t.slice(i,i+n));return a}
// Inferencia exacta compatible con el model.json de la PoC original.
let model=null;
function predict(input){
  if(!model)throw new Error("Modelo original todavía no cargado");
  const s=normalize(input),counts=new Map();
  for(let n=2;n<=4;n++)for(let i=0;i<=s.length-n;i++){
    const ix=model.vocabulary[s.slice(i,i+n)];
    if(ix!==undefined)counts.set(ix,(counts.get(ix)||0)+1);
  }
  const vector=new Map();let norm=0;
  for(const [ix,count] of counts){const value=(1+Math.log(count))*model.idf[ix];vector.set(ix,value);norm+=value*value}
  norm=Math.sqrt(norm)||1;
  for(const [ix,value] of vector)vector.set(ix,value/norm);
  const logits=model.weights.map((row,k)=>model.bias[k]+row.reduce((acc,[ix,w])=>acc+w*(vector.get(ix)||0),0));
  const max=Math.max(...logits),exp=logits.map(x=>Math.exp(x-max)),sum=exp.reduce((a,b)=>a+b,0);
  return model.classes.map((action,i)=>({action,score:exp[i]/sum})).sort((a,b)=>b.score-a.score);
}
function entities(text){const out={};const s=normalize(text);const range=s.match(/(?:del|from|de)\s+(\d{1,2})\s+(?:al|to|a)\s+(\d{1,2})\s+(?:de|of)?\s*(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|january|february|march|april|may|june|july|august|september|october|november|december)/);if(range){out.start_day=Number(range[1]);out.end_day=Number(range[2]);out.month=range[3]}else{const month=s.match(/\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|january|february|march|april|may|june|july|august|september|october|november|december)\b/);if(month)out.month=month[1]}const year=s.match(/\b20\d{2}\b/);if(year)out.year=Number(year[0]);return out}
const $=id=>document.getElementById(id);
function interpret(){if(!model){$("status").textContent="Modelo original no cargado";return;}const text=$("query").value.trim();if(!text){$("status").textContent="Escribí una consulta.";return}const start=performance.now(),rank=predict(text),ms=(performance.now()-start).toFixed(2);const top=rank[0],margin=top.score-rank[1].score;const domainTerms=/\\b(vacacion(?:es)?|dias? libres?|licencia|permiso|ausencia|ausentar|trabaj|turno|solicitud|solicitar|aprob|formulario|calendario|saldo|leave|vacation|holiday|time off|absence|request|approval|form|calendar|ferias|férias|licença|permissão|ausência|solicitação|aprovar|formulário)\\b/i;const inDomain=domainTerms.test(normalize(text));const accepted=inDomain&&top.action!=="unknown"&&top.score>=0.55&&margin>=0.15;const result={action:!inDomain?"unknown":accepted?top.action:"needs_clarification",candidate:top.action,score:Number(top.score.toFixed(3)),entities:entities(text),requires_confirmation:accepted&&["vacation_request","permission_request","absence_report","request_approval","form_creation","advance_request"].includes(top.action),model:"original-sklearn-tfidf-logreg-v2"};$("status").textContent=(!inDomain?"Fuera de dominio":accepted?(labels[top.action]??top.action):"Pedir aclaración")+" · "+ms+" ms";$("json").textContent=JSON.stringify(result,null,2);$("scores").replaceChildren(...rank.map(r=>{const item=document.createElement("div");item.className="item";const line=document.createElement("div");const name=document.createElement("span");name.textContent=labels[r.action]??r.action;const val=document.createElement("small");val.textContent=(r.score*100).toFixed(1)+"%";line.append(name,val);const bar=document.createElement("div");bar.className="bar";const fill=document.createElement("div");fill.style.width=(r.score*100)+"%";bar.append(fill);item.append(line,bar);return item}))}
$("examples").replaceChildren(...samples.map(s=>{const b=document.createElement("button");b.textContent=s;b.addEventListener("click",()=>{$("query").value=s;interpret()});return b}));
$("run").addEventListener("click",interpret);$("clear").addEventListener("click",()=>{$("query").value="";$("scores").replaceChildren();$("json").textContent="{}";$("status").textContent="Consulta vacía"});
$("test").addEventListener("click",()=>{
  if(!model){$("evaluation").textContent="Falta docs/model.json";return;}
  let correct=0,unknownCorrect=0,unknownTotal=0;
  const lines=evaluation.map(([text,expected])=>{
    const rank=predict(text),candidate=rank[0].action,score=rank[0].score;
    const ok=candidate===expected;if(ok)correct++;
    if(expected==="unknown"){unknownTotal++;if(ok)unknownCorrect++;}
    return (ok?"✓":"✗")+" "+text+"\n  esperado: "+expected+" | candidato: "+candidate+" ("+(score*100).toFixed(1)+"%)";
  });
  $("evaluation").textContent="Clasificación top-1: "+correct+"/"+evaluation.length+" coincidencias\nRechazos fuera de dominio: "+unknownCorrect+"/"+unknownTotal\n\nEste test mide candidatos, no decisiones automáticas ni precisión estadística. El filtro de dominio y los umbrales se evalúan por separado.\n\n"+lines.join("\n\n");
});
$("status").textContent="Cargando pesos originales…";fetch("./model.json").then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(data=>{if(!Array.isArray(data.classes)||!Array.isArray(data.weights)||!data.vocabulary||!Array.isArray(data.idf))throw Error("Formato de modelo inválido");model=data;$("status").textContent="Modelo original listo · "+model.classes.length+" categorías";interpret()}).catch(error=>{$("status").textContent="No se pudo cargar docs/model.json: "+error.message;$("json").textContent=JSON.stringify({error:"missing_model",detail:"Subir los pesos originales a docs/model.json"},null,2)});
