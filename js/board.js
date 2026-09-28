/* KQIBoard — jonli plata rasmlari uchun yordamchi kutubxona.
   Ishlatish:
     KQIBoard.scene(figureEl, async function(ctx){ ... }, {auto:true, loop:false});
   ctx: {svg, token(label,cls,pts,ms), dot(cls,pts,ms), lit(ids,on), unlit(), led(id,on), unit(id,state),
         cell(id,state), flash(id), text(id,str), delay(ms), step(i,msg), alive(), reduce}
   Figure ichida: <svg class="board">…</svg>, ixtiyoriy <div class="board-steps"> va <div class="board-narr">.
   Sahna ko'rinish maydoniga kirganda avtomatik ishga tushadi (auto), "↻ qayta" tugmasi qayta yuritadi.
   figure[data-replay] atributi site.js ga replay tugmasini qo'shishni aytadi. */
(function(){
  var SVGNS='http://www.w3.org/2000/svg';
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag,attrs,text){ var e=document.createElementNS(SVGNS,tag); for(var k in attrs) e.setAttribute(k,attrs[k]); if(text!==undefined) e.textContent=text; return e; }
  function delay(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }

  function makeCtx(fig,svg,run){
    var $=function(id){ return svg.querySelector('#'+id)||svg.querySelector('[data-id="'+id+'"]'); };
    var layer=svg.querySelector('.tokens'); if(!layer){ layer=el('g',{'class':'tokens'}); svg.appendChild(layer); }
    var ctx={
      svg:svg, reduce:reduce, el:el, delay:function(ms){ return run.alive()?delay(ms):Promise.resolve(); },
      alive:function(){ return run.alive(); },
      $:$,
      token:function(label,cls,pts,ms,shape){
        return new Promise(function(res){
          if(reduce||!run.alive()||ms<40||pts.length<2){ res(); return; }
          var g=el('g',{'class':'tok '+cls});
          if(shape==='dot'){ g.setAttribute('class','tok dot '+cls); g.appendChild(el('circle',{cx:0,cy:0,r:6})); }
          else { var w=Math.max(24,String(label).length*7+10); g.appendChild(el('rect',{x:-w/2,y:-9,width:w,height:18})); g.appendChild(el('text',{x:0,y:4,'text-anchor':'middle'},label)); }
          layer.appendChild(g);
          var segs=[],total=0;
          for(var i=1;i<pts.length;i++){ var d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]); segs.push(d); total+=d; }
          var t0=null;
          function frame(ts){
            if(!run.alive()){ g.remove(); res(); return; }
            if(t0===null) t0=ts;
            var p=Math.min(1,(ts-t0)/ms), dist=p*total, i=0;
            while(i<segs.length-1&&dist>segs[i]){ dist-=segs[i]; i++; }
            var f=segs[i]?dist/segs[i]:1, a=pts[i], b=pts[i+1];
            g.setAttribute('transform','translate('+(a[0]+(b[0]-a[0])*f)+','+(a[1]+(b[1]-a[1])*f)+')');
            if(p<1) requestAnimationFrame(frame); else { g.remove(); res(); }
          }
          requestAnimationFrame(frame);
        });
      },
      dot:function(cls,pts,ms){ return ctx.token('',cls,pts,ms,'dot'); },
      lit:function(ids,on){ (Array.isArray(ids)?ids:[ids]).forEach(function(id){ var e=$(id); if(e) e.classList.toggle('lit',on!==false); }); },
      unlit:function(){ svg.querySelectorAll('.lit').forEach(function(e){ e.classList.remove('lit'); }); },
      led:function(id,on,cls){ var e=$(id); if(!e) return; e.classList.toggle('on',!!on); if(cls!==undefined){ e.classList.remove('warn','bad','blue','blink'); if(cls) cls.split(' ').forEach(function(c){ e.classList.add(c); }); } },
      unit:function(id,state){ var e=$(id); if(!e) return; e.classList.remove('on','warn','bad'); if(state) e.classList.add(state); },
      cell:function(id,state){ var e=$(id); if(!e) return; e.classList.remove('hi','warn'); if(state) e.classList.add(state); },
      flash:function(id){ var e=typeof id==='string'?$(id):id; if(!e) return; e.classList.remove('flash'); void e.getBBox&&e.getBBox(); e.classList.add('flash'); },
      text:function(id,str,cls){ var e=$(id); if(!e) return; e.textContent=str; if(cls!==undefined){ e.classList.remove('label-on','label-warn','label-bad'); if(cls) e.classList.add(cls); } },
      narr:function(html,warn){ var n=fig.querySelector('.board-narr'); if(!n) return; n.classList.toggle('warn',!!warn); n.innerHTML=html; },
      step:function(i,msg,warn){
        var steps=fig.querySelectorAll('.board-steps span');
        steps.forEach(function(s,j){ s.classList.toggle('on',j===i); s.classList.toggle('done',j<i); });
        if(msg!==undefined) ctx.narr(msg,warn);
      },
      reset:function(){ ctx.unlit(); layer.innerHTML=''; svg.querySelectorAll('.led.on').forEach(function(e){ e.classList.remove('on','blink'); }); svg.querySelectorAll('.unit.on,.unit.warn,.unit.bad').forEach(function(e){ e.classList.remove('on','warn','bad'); }); svg.querySelectorAll('.cell.hi,.cell.warn').forEach(function(e){ e.classList.remove('hi','warn'); }); svg.querySelectorAll('.rowhi.on').forEach(function(e){ e.classList.remove('on'); }); fig.querySelectorAll('.board-steps span').forEach(function(s){ s.classList.remove('on','done'); }); }
    };
    return ctx;
  }

  function scene(fig,fn,opts){
    opts=opts||{}; var svg=fig.querySelector('svg.board'); if(!svg) return null;
    var current=0, started=false, ctx=null;
    function start(){
      current++; var my=current;
      var run={id:my,alive:function(){ return my===current; }}; /* har yurish o'z run obyekti: eski sahna replay dan keyin to'xtaydi */
      ctx=makeCtx(fig,svg,run);
      ctx.reset();
      Promise.resolve(fn(ctx)).then(function(){ if(opts.loop&&my===current&&!reduce) setTimeout(function(){ if(my===current) start(); },opts.loopDelay||1800); }).catch(function(e){ if(window.console) console.error(e); });
    }
    function stop(){ current++; }
    fig.addEventListener('replay',function(){ start(); });
    if(opts.auto!==false){
      if('IntersectionObserver' in window){
        new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ if(!started||opts.loop){ started=true; start(); } } else if(opts.loop) stop(); }); },{threshold:.35}).observe(fig);
      } else start();
    }
    var api={start:start,stop:stop,ctx:function(){ return ctx; }};
    fig.__scene=api; return api;
  }

  /* Yordamchi: SVG ichida n ta kataklar qatori yasash */
  function cells(parent,opts){
    var n=opts.n, x0=opts.x, y0=opts.y, w=opts.w||28, h=opts.h||36, gap=opts.gap||4, cols=opts.cols||n, prefix=opts.prefix||'c', vals=opts.vals||[], labels=opts.labels;
    for(var i=0;i<n;i++){
      var cx=x0+(i%cols)*(w+gap), cy=y0+Math.floor(i/cols)*(h+gap);
      var g=el('g',{'data-i':i});
      g.appendChild(el('rect',{x:cx,y:cy,width:w,height:h,rx:4,'class':'cell',id:prefix+i}));
      g.appendChild(el('text',{x:cx+w/2,y:cy+11,'text-anchor':'middle','class':'mut xs'},labels?labels[i]:'['+i+']'));
      g.appendChild(el('text',{x:cx+w/2,y:cy+h-8,'text-anchor':'middle','class':'val',id:prefix+'v'+i},vals[i]!==undefined?String(vals[i]):''));
      parent.appendChild(g);
    }
  }
  /* Yordamchi: LED qatori (bitlar) */
  function leds(parent,opts){
    var n=opts.n||8, x0=opts.x, y=opts.y, step=opts.step||14, prefix=opts.prefix||'b', bits=opts.bits||'';
    for(var i=0;i<n;i++) parent.appendChild(el('circle',{cx:x0+i*step,cy:y,r:opts.r||4.5,'class':'led'+(bits.charAt(i)==='1'?' on':''),id:prefix+i}));
  }
  function setLeds(svg,prefix,bits){ for(var i=0;i<bits.length;i++){ var e=svg.querySelector('#'+prefix+i); if(e) e.classList.toggle('on',bits.charAt(i)==='1'); } }
  function bin(n,w){ var s=(n>>>0).toString(2); while(s.length<w) s='0'+s; return s; }

  window.KQIBoard={scene:scene,el:el,cells:cells,leds:leds,setLeds:setLeds,bin:bin,delay:delay,reduce:reduce};
})();
