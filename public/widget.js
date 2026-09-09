(function(){
  if(window.__repairslotWidgetLoaded)return;
  window.__repairslotWidgetLoaded=true;
  var script=document.currentScript;
  var slug=(script&&script.getAttribute('data-slug'))||'demo';
  var label=(script&&script.getAttribute('data-label'))||'Book a Repair';
  var origin='https://repairslot.com';
  var page=origin+'/book/'+encodeURIComponent(slug)+'?embed=1';
  var style=document.createElement('style');
  style.textContent='.repairslot-fab{position:fixed;right:20px;bottom:20px;z-index:2147483000;border:0;border-radius:999px;background:#1e63ff;color:white;padding:14px 18px;font:700 15px system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 12px 32px rgba(20,40,90,.24);cursor:pointer}.repairslot-backdrop{position:fixed;inset:0;z-index:2147483001;background:rgba(10,16,28,.5);display:none;align-items:center;justify-content:center;padding:18px}.repairslot-modal{width:min(680px,100%);height:min(760px,92vh);background:white;border-radius:18px;overflow:hidden;box-shadow:0 28px 90px rgba(0,0,0,.28);position:relative}.repairslot-modal iframe{width:100%;height:100%;border:0}.repairslot-close{position:absolute;right:12px;top:12px;z-index:2;width:34px;height:34px;border-radius:50%;border:1px solid #e4e7ee;background:white;font:700 20px system-ui;cursor:pointer}.repairslot-backdrop.rs-open{display:flex}@media(max-width:640px){.repairslot-backdrop{padding:0}.repairslot-modal{width:100%;height:100vh;border-radius:0}.repairslot-fab{right:14px;bottom:14px}}';
  document.head.appendChild(style);
  var button=document.createElement('button');button.className='repairslot-fab';button.type='button';button.textContent=label;
  var backdrop=document.createElement('div');backdrop.className='repairslot-backdrop';backdrop.innerHTML='<div class="repairslot-modal"><button class="repairslot-close" aria-label="Close">×</button><iframe title="Book a repair" loading="lazy"></iframe></div>';
  document.body.appendChild(button);document.body.appendChild(backdrop);
  var iframe=backdrop.querySelector('iframe');
  function open(){if(!iframe.src)iframe.src=page;backdrop.classList.add('rs-open');document.documentElement.style.overflow='hidden'}
  function close(){backdrop.classList.remove('rs-open');document.documentElement.style.overflow=''}
  button.addEventListener('click',open);backdrop.querySelector('.repairslot-close').addEventListener('click',close);backdrop.addEventListener('click',function(e){if(e.target===backdrop)close()});document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
  document.querySelectorAll('[data-repairslot-open]').forEach(function(el){el.addEventListener('click',open)});
})();
