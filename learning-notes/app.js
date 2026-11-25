const $ = id => document.getElementById(id);
const key = 'laoxu-garden-learning-plc-v1';
const day = new Intl.DateTimeFormat('zh-CN',{dateStyle:'medium'});
const initial = {active:2, status:{0:'已完成',1:'已完成',2:'学习中'}, attempts:[], due:{}};
let state;
try { state = JSON.parse(localStorage.getItem(key)) || initial; } catch { state = initial; }
let tab = '原理与梯形图', view = 'study', storageOK = true;
const tabs = ['原理与梯形图','模拟练习','即时测验','阶段总结'];
const status = i => state.status[i] || '未开始';
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{storageOK=false;}}
function setView(next){view=next;render();}
function openLesson(i){state.active=i;if(status(i)==='未开始')state.status[i]='学习中';tab=tabs[0];view='study';save();render();$('main').scrollIntoView({block:'start'});}
function catalog(){
  const n=lessons.filter((_,i)=>status(i)==='已完成').length;
  $('progress').value=n;$('progress').setAttribute('aria-label','课程完成进度');$('count').textContent=n+' / '+lessons.length+' 已完成';
  const filter=$('filter').value;
  $('catalog').innerHTML=lessons.map((l,i)=>filter==='全部状态'||status(i)===filter?'<button class="lesson" data-lesson="'+i+'" aria-current="'+(i===state.active&&view==='study')+'"><span class="num">'+String(i+1).padStart(2,'0')+'</span><span>'+l.title+'<small>'+status(i)+'</small></span></button>':'').join('')||'<p class="muted">暂无符合条件的课程</p>';
}
function render(){
  catalog();
  if(view==='records'){renderRecords();return;}
  const i=state.active,l=lessons[i];
  $('main').innerHTML='<section class="hero"><span class="kicker">第 '+(i+1)+' 节 · '+l.phase+'</span><h1>'+l.title+'</h1><p>'+l.goal+'</p></section><div class="tabs" aria-label="学习环节">'+tabs.map((t,j)=>'<button data-tab="'+j+'" aria-pressed="'+(t===tab)+'">'+t+'</button>').join('')+'</div><div id="content"></div>';
  if(tab===tabs[0]){
    $('content').innerHTML='<div class="grid"><section class="card"><span class="tag">原理</span><h3>怎么理解</h3><p>'+l.principle+'</p></section><section class="card"><span class="tag">示例</span><h3>仓储自动化案例</h3><p>'+l.case+'</p></section></div><section class="card"><h2>梯形图 · 示例</h2><p class="muted">[ X ] 常开 · [/ X ] 常闭 · ( Y ) 线圈。符号名称用于教学。</p><pre class="diagram">'+esc(l.ladder)+'</pre>'+(i===2?'<p>上面的回路展示启动和自锁。到位停止、Done 保持与 Ack 清位在下面的状态机练习中演示。</p>':'')+'<button class="primary" data-tab="1">开始模拟练习</button>'+(i===3||i===4?'<div class="link"><a href="https://www.modbus.org/docs/Modbus_Application_Protocol_V1_1b3.pdf" target="_blank" rel="noopener">Modbus 官方协议规范</a></div>':'')+'</section>';
  } else if(tab===tabs[1]) { if(l.lab==='conveyor') conveyor();else modbus(); }
  else if(tab===tabs[2])quiz();
  else summary();
}
const freshLine=()=>({PE_In:0,Ready:1,Permit:1,Fault:0,Running:0,Done:0,elapsed:0,seen:false,msg:'打开入口光电，然后推进 2 秒，观察 T1.Q。'});
let line=freshLine();
let freshRegister=42;
function refreshLine(){
  if(!line.PE_In)line.elapsed=0;
  if(!line.Ready||!line.Permit||line.Fault)line.Running=0;
}
function conveyor(){
  const s=line,Q=Number(s.elapsed>=2);
  $('content').innerHTML='<section class="card"><h2>输送线控制台</h2><span class="tag">示例 · 浏览器模拟</span><p>先让光电持续有效 2 秒，再发 Start。关闭光电观察自锁，随后用末端到位触发 Done，最后发送 Ack。</p><div class="labline"><span class="parcel '+(s.seen?'moved':'')+'">模拟箱</span></div><div class="signals">'+Object.entries({PE_In:s.PE_In,Ready:s.Ready,Permit:s.Permit,'T1.ET':s.elapsed+' / 2 s','T1.Q':Q,RunCmd:s.Running,Running:s.Running,Done:s.Done,Fault:s.Fault}).map(([k,v])=>'<span class="signal '+(v===1?'on':'')+'">'+k+' = '+v+'</span>').join('')+'</div><div class="controls">'+[['PE_In','切换入口光电'],['tick','推进 1 秒'],['start','发 Start'],['arrive','末端到位'],['ack','发 Ack'],['Ready','切换 Ready'],['Permit','切换 Permit'],['Fault','切换 Fault'],['stop','停机'],['reset','重置']].map(([a,b])=>'<button data-line="'+a+'">'+b+'</button>').join('')+'</div><div class="feedback" role="status">'+s.msg+'</div><p><button class="primary" data-tab="2">进行即时测验</button></p></section>';
}
function lineAction(a){
  const s=line;
  if(a==='reset')line=freshLine();
  else if(a==='tick'){if(s.PE_In)s.elapsed=Math.min(2,s.elapsed+1);s.msg=s.elapsed===2?'T1.Q 已置 1，可以尝试启动。':'观察计时值。入口光电关闭时计时清零。';}
  else if(a==='start'){if(s.elapsed>=2&&s.Ready&&s.Permit&&!s.Fault&&!s.Done){s.Running=1;s.seen=false;s.msg='Start 已接收。关闭入口光电，观察 RunCmd 保持。';}else{s.msg='启动未接受。检查 T1.Q、Ready、Permit、Fault 和待确认的 Done。';}}
  else if(a==='arrive'){if(s.Running){s.Running=0;s.Done=1;s.seen=true;s.msg='到位，Running 清零，Done 等待 Ack。';}else{s.msg='输送线尚未运行。';}}
  else if(a==='ack'){s.msg=s.Done?'Ack 已确认，Done 清零。':'当前没有待确认的完成信号。';s.Done=0;}
  else if(a==='stop'){s.Running=0;s.msg='停机，保持回路已解除。';}
  else{s[a]=1-s[a];s.msg=a+' 变为 '+s[a]+'。观察计时和运行反馈。';}
  refreshLine();conveyor();
  $('content').querySelector('[data-line="'+a+'"]')?.focus();
}
function modbus(){
  $('content').innerHTML='<section class="card"><h2>Modbus TCP 模拟客户端</h2><span class="tag">示例 · 浏览器模拟</span><p>模拟点位表只提供 Coil 偏移 0（布尔反馈）和 Holding Register 偏移 0（可写计数）。先读，再写入 120，再回读。把偏移改为 1 观察协议异常，把端口改为 503 观察连接失败。</p><form id="mb"><div class="fields"><label>示例 IP<input name="ip" value="192.0.2.10" required></label><label>示例端口<input name="port" type="number" value="502" min="1" max="65535" required></label><label>示例 Unit ID<input name="unit" type="number" value="1" min="0" max="255" required></label><label>功能码<select name="fc"><option value="03">03 读保持寄存器</option><option value="01">01 读 Coil</option><option value="06">06 写单个寄存器</option><option value="04">04 读输入寄存器</option></select></label><label>示例协议偏移<input name="addr" type="number" value="0" min="0" max="65535" required></label><label>示例写入值（06）<input name="val" type="number" value="120" min="0" max="65535" required></label></div><p class="controls"><button class="primary">执行模拟请求</button><button type="button" data-tab="2">进行即时测验</button></p></form><div id="reply" class="feedback" role="status">等待模拟请求。</div></section>';
  $('mb').onsubmit=e=>{
    e.preventDefault();
    const f=Object.fromEntries(new FormData(e.target));
    let message;
    if(f.ip.trim()!=='192.0.2.10'||Number(f.port)!==502)message='示例结果 · 连接失败。先检查目标 IP、端口与服务监听。';
    else if(Number(f.unit)!==1)message='示例结果 · Unit ID 未匹配。模拟网关无响应，核对目标单元。实际设备处理方式取决于配置。';
    else if(f.fc==='04')message='示例结果 · 异常 01（非法功能）。本模拟服务未实现 04。';
    else if(Number(f.addr)!==0)message='示例结果 · 异常 02（非法数据地址）。本模拟对象只映射偏移 0。';
    else if(f.fc==='06'){freshRegister=Number(f.val);message='示例结果 · 06 已回显写入值 '+freshRegister+'。切换至 03 回读。';}
    else message='示例结果 · '+f.fc+' 读取成功，值为 '+(f.fc==='01'?1:freshRegister)+'。';
    $('reply').textContent=message;
  };
}
function quiz(){
  const l=lessons[state.active];
  $('content').innerHTML='<section class="card"><h2>即时测验</h2><p>选择答案或直接输入。提交后查看每道题的解析和下一步练习。</p><form class="quizform" id="quiz">'+l.q.map(([prompt,opts],j)=>'<fieldset><legend>'+(j+1)+'. '+prompt+'</legend>'+(Array.isArray(opts)?opts.map((it,k)=>'<label class="answer"><input required type="radio" name="q'+j+'" value="'+k+'">'+it+'</label>').join(''):'<input required type="text" name="q'+j+'" placeholder="输入答案" aria-label="'+esc(prompt)+'">')+'</fieldset>').join('')+'<button class="primary">提交并评分</button></form><div id="grade" aria-live="polite"></div></section>';
  $('quiz').onsubmit=e=>{
    e.preventDefault();
    const inputs=new FormData(e.target);
    const i=state.active;
    const results=l.q.map(([prompt,opts,index,explanation,topic],j)=>{
      const raw=inputs.get('q'+j).trim();
      const answer=Array.isArray(opts)?opts[Number(raw)]:raw;
      const expected=Array.isArray(opts)?opts[index]:opts;
      const normalize=v=>v.normalize('NFKC').trim().toLowerCase();
      const actual=normalize(answer);
      const ok=actual===normalize(expected)||(expected==='03'&&['3','0x03','fc03','fc3'].includes(actual));
      return {prompt,answer,expected,ok,explanation,topic};
    });
    const score=results.filter(x=>x.ok).length;
    state.attempts.push({lesson:i,time:Date.now(),score,results});
    state.status[i]=score===results.length?'已完成':'需复习';
    state.due[i]=Date.now()+(score===results.length?7:1)*86400000;
    save();catalog();
    $('grade').innerHTML='<div class="feedback"><strong>得分 '+score+' / '+results.length+'</strong><p>下次复习 · '+day.format(state.due[i])+'</p>'+results.map(r=>'<div class="record"><strong>'+(r.ok?'正确':'待复习')+' · '+r.topic+'</strong><p>你的答案 '+esc(r.answer)+'。正确答案 '+r.expected+'。</p><p>'+r.explanation+'</p></div>').join('')+'<div class="controls">'+(score<results.length?'<button data-tab="1">回模拟器验证错题</button><button data-tab="2">重做本节</button>':'<button class="primary" data-tab="3">查看阶段总结</button>'+(i+1<lessons.length?'<button data-lesson="'+(i+1)+'">学习下一节</button>':''))+'</div></div>';
  };
}
function summary(){
  const i=state.active,l=lessons[i],last=state.attempts.filter(a=>a.lesson===i).at(-1);
  $('content').innerHTML='<section class="card"><h2>'+l.phase+' · 阶段总结</h2><p>'+l.goal+'</p><p>'+l.principle+'</p><h3>能独立解释的知识点</h3><ul>'+l.q.map(q=>'<li>'+q[4]+'</li>').join('')+'</ul><p>本节状态 · '+status(i)+(last?' · 最近得分 '+last.score+'/'+last.results.length:'')+'</p><div class="controls"><button data-tab="1">复练本节</button>'+(i+1<lessons.length?'<button class="primary" data-lesson="'+(i+1)+'">学习下一节</button>':'<button class="primary" data-records>查看全部学习记录</button>')+'</div></section>';
}
function reportRows(){
  const rows=[['h','PLC 与 Modbus 实战学习记录'],['p','导出日期 '+day.format(Date.now())],['h','课程进度与复习提醒']];
  lessons.forEach((l,i)=>rows.push(['p','第 '+(i+1)+' 节 '+l.title+' · '+status(i)+(state.due[i]?' · 复习 '+day.format(state.due[i]):'')]));
  rows.push(['h','答题记录与错题']);
  if(!state.attempts.length)rows.push(['p','暂无测验记录。']);
  for(const a of state.attempts.slice().reverse()){
    rows.push(['h',lessons[a.lesson].title+' · '+a.score+'/'+a.results.length+' · '+day.format(a.time)]);
    for(const r of a.results)rows.push(['p',r.topic+' · '+(r.ok?'正确':'待复习')+' · '+r.prompt+' 你的答案：'+r.answer+'。正确答案：'+r.expected+'。'+r.explanation]);
  }
  return rows;
}
function renderRecords(){
  const due=Object.entries(state.due).sort((a,b)=>a[1]-b[1]);
  const latest=new Map();
  state.attempts.forEach(a=>a.results.forEach(r=>latest.set(a.lesson+'|'+r.prompt,{...r,lesson:a.lesson})));
  const weak=[...latest.values()].filter(r=>!r.ok);
  $('main').innerHTML='<section class="hero"><span class="kicker">学习档案</span><h1>学习记录</h1><p>'+(storageOK?'进度、答案和复习日期保存在当前浏览器。':'当前浏览器无法保存记录，请先导出备份。')+'</p></section><section class="card"><div class="tools"><h2>复习提醒</h2><div class="controls"><button data-export="html">导出 HTML</button><button data-export="docx">导出 Word</button></div></div><p class="muted">测验有错题时安排次日复习，满分后安排七天复习。打开手册即可查看到期项。</p>'+(due.map(([i,t])=>'<div class="record actions"><span>'+day.format(t)+' · '+(t<=Date.now()?'已到期':'待复习')+'</span><button data-lesson="'+i+'">'+lessons[i].title+'</button></div>').join('')||'<p>完成测验后生成提醒。</p>')+'</section><section class="card"><h2>错题与薄弱点</h2>'+(weak.map(r=>'<div class="record"><strong>'+r.topic+'</strong><p>'+r.prompt+'</p><p>你的答案 '+esc(r.answer)+'。'+r.explanation+'</p><button data-lesson="'+r.lesson+'">复习本节</button></div>').join('')||'<p>当前没有待纠正的错题。</p>')+'</section><section class="card"><h2>答题历史</h2>'+(state.attempts.slice().reverse().map(a=>'<details class="record"><summary>'+day.format(a.time)+' · '+lessons[a.lesson].title+' · '+a.score+'/'+a.results.length+'</summary>'+a.results.map(r=>'<p>'+r.prompt+' · '+esc(r.answer)+' · '+(r.ok?'正确':'待复习')+'</p>').join('')+'</details>').join('')||'<p>前两节已按你的进度标为已完成。新测验记录将在这里显示。</p>')+'</section>';
}
function download(format){
  const rows=reportRows();
  const data=format==='docx'?makeWord(rows):new Blob(['<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>PLC 与 Modbus 学习记录</title><style>body{font:16px/1.6 system-ui;max-width:850px;margin:30px auto;padding:0 20px}h2{color:#254561}</style>'+rows.map(([type,content])=>type==='h'?'<h2>'+esc(content)+'</h2>':'<p>'+esc(content)+'</p>').join('')+'</html>'],{type:'text/html;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(data);a.download='PLC-Modbus-学习记录.'+format;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),3000);
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.lesson!==undefined)openLesson(Number(b.dataset.lesson));
  else if(b.dataset.tab!==undefined){tab=tabs[Number(b.dataset.tab)];render();$('content').setAttribute('tabindex','-1');$('content').focus({preventScroll:true});}
  else if(b.dataset.line)lineAction(b.dataset.line);
  else if(b.dataset.export)download(b.dataset.export);
  else if(b.id==='records'||b.hasAttribute('data-records'))setView('records');
  else if(b.id==='study')setView('study');
});
$('filter').onchange=catalog;
render();
