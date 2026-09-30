import {useState,useEffect} from 'react'
import {api} from './db'
import {CATS,icon} from './cats'
const m=n=>'$'+(+n).toFixed(2).replace(/\.00$/,'')
const sold=p=>p.status==='agotado'||p.stock<=0
const disc=p=>p.old>p.price?Math.round((1-p.price/p.old)*100):0
// Reduce imagen a 500px para que no pese (luego se puede usar Supabase Storage)
const shrink=(file,cb)=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,500/i.width),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.75))};i.src=r.result};r.readAsDataURL(file)}

function Card({p,add}){const so=sold(p),lo=!so&&p.stock<=5,d=disc(p),of=d&&p.offer
 return <div className="card">{of&&<span className="tag">{d}% OFF</span>}
  <div className="ph">{p.img?<img src={p.img} alt=""/>:p.emo||icon(p.cat)}</div>
  <small>{p.cat}</small><h3>{p.name}</h3><p>{p.descr}</p>
  <div className="pr">{of&&<s>{m(p.old)}</s>}<b>{m(p.price)}</b></div>
  <em className={so?'no':lo?'low':'ok'}>{so?'Agotado':lo?'Últimas unidades':'Disponible'}</em>
  <button className="btn" disabled={so} onClick={()=>add(p.id)}>Agregar al carrito</button></div>}

export default function App(){
 const [v,setV]=useState('home'),[P,setP]=useState([]),[cfg,setCfg]=useState({name:''}),[cart,setCart]=useState({}),[toast,setToast]=useState(''),[user,setUser]=useState(null)
 const [F,setF]=useState({q:'',cat:'',sort:'',av:''}),[who,setWho]=useState({name:'',phone:''})
 const load=async()=>{setP(await api.products());setCfg(await api.settings())}
 useEffect(()=>{load();api.session(setUser)},[])
 useEffect(()=>{document.title=cfg.name},[cfg.name])
 const tell=t=>{setToast(t);setTimeout(()=>setToast(''),1500)}
 const n=Object.values(cart).reduce((a,b)=>a+b,0),total=Object.entries(cart).reduce((a,[id,q])=>a+q*(P.find(p=>p.id==id)?.price||0),0)
 const add=(id,d=1)=>{const p=P.find(x=>x.id==id),q=(cart[id]||0)+d;if(q>p.stock)return tell('Solo hay '+p.stock+' disponibles')
  setCart(c=>{const o={...c};q<=0?delete o[id]:o[id]=q;return o});d>0&&tell('Agregado 🛒')}
 const go=(x,cat='',av='')=>{setV(x);setF(f=>({...f,cat,av}));scrollTo(0,0)}
 const order=async()=>{const items=Object.entries(cart).map(([id,q])=>{const p=P.find(x=>x.id==id);return{id:p.id,name:p.name,q,price:p.price}})
  try{await api.placeOrder(items,who.name,who.phone)}catch(e){tell('Inventario cambió, revisa tu pedido');load();return}
  const msg='Hola, quiero realizar el siguiente pedido:\n'+items.map(i=>`${i.name} x${i.q} — ${m(i.price*i.q)}`).join('\n')+`\nTotal: ${m(total)}\n`+(who.name?`Nombre: ${who.name}\n`:'')+'Quedo atento/a para confirmar disponibilidad.'
  setCart({});load();setV('home');location.href='https://wa.me/'+String(cfg.wa).replace(/\D/g,'')+'?text='+encodeURIComponent(msg)}
 const list=P.filter(p=>(!F.cat||p.cat===F.cat)&&p.name.toLowerCase().includes(F.q.toLowerCase())&&(F.av==='ok'?!sold(p):F.av==='no'?sold(p):F.av==='offer'?p.offer:1)).sort((a,b)=>F.sort==='a'?a.price-b.price:F.sort==='d'?b.price-a.price:0)
 const N=[['home','🏠','Inicio'],['cat','🛍️','Catálogo'],['off','🔥','Ofertas'],['cart','🛒','Carrito'+(n?` (${n})`:'')]]
 return <>
 <header>{cfg.logo?<img src={cfg.logo} alt="logo"/>:'🏪'}<h1>{cfg.name}</h1><button aria-label="Admin" onClick={()=>go('admin')}>⚙️</button></header>
 <main>
 {v==='home'&&<><div className="hero"><h2>{cfg.welcome}</h2><p>{cfg.hours}</p><button className="btn y" onClick={()=>go('cat')}>Ver catálogo</button></div>
  <div className="tiles">{CATS.slice(0,3).map(k=><div key={k.n} className="tile" style={{background:k.c}} onClick={()=>go('cat',k.n)}><span>{k.i}</span>{k.n}</div>)}
  <div className="tile" style={{background:'#e5484d'}} onClick={()=>go('off')}><span>🔥</span>OFERTAS</div></div>
  <h3>⭐ Productos destacados</h3><div className="grid">{P.filter(p=>p.feat).map(p=><Card key={p.id} p={p} add={add}/>)}</div>
  <div className="box">📍 {cfg.addr} · 📞 {cfg.phone} {cfg.ig&&'· 📸 '+cfg.ig}</div></>}
 {(v==='cat'||v==='off')&&<><h3>{v==='off'?'🔥 OFERTAS':'Catálogo'}</h3>
  <input placeholder="🔍 Buscar producto..." value={F.q} onChange={e=>setF({...F,q:e.target.value})}/>
  <div className="chips"><button className={'chip'+(F.cat?'':' on')} onClick={()=>setF({...F,cat:''})}>Todo</button>{CATS.map(k=><button key={k.n} className={'chip'+(F.cat===k.n?' on':'')} onClick={()=>setF({...F,cat:k.n})}>{k.i} {k.n}</button>)}</div>
  <div className="row"><select value={F.sort} onChange={e=>setF({...F,sort:e.target.value})}><option value="">Ordenar por precio</option><option value="a">Menor a mayor</option><option value="d">Mayor a menor</option></select>
  <select value={v==='off'?'offer':F.av} onChange={e=>{setV('cat');setF({...F,av:e.target.value})}}><option value="">Todos</option><option value="ok">Disponibles</option><option value="no">Agotados</option><option value="offer">Solo ofertas</option></select></div>
  <div className="grid">{(v==='off'?list.filter(p=>p.offer):list).map(p=><Card key={p.id} p={p} add={add}/>)}</div></>}
 {v==='cart'&&(!n?<><h3>🛒 Tu carrito está vacío</h3><button className="btn" onClick={()=>go('cat')}>Ir al catálogo</button></>:<><h3>🛒 Revisar pedido</h3>
  {Object.keys(cart).map(id=>{const p=P.find(x=>x.id==id);return <div className="line" key={id}><div><b>{p.name}</b><br/>{m(p.price)} c/u</div><div className="q"><button onClick={()=>add(id,-1)}>−</button><b>{cart[id]}</b><button onClick={()=>add(id,1)}>+</button></div><button className="q" style={{border:0,background:'none',fontSize:22}} onClick={()=>add(id,-cart[id])}>🗑️</button></div>})}
  <div className="tot">Total: {m(total)}</div>
  <div className="row"><input placeholder="Tu nombre (opcional)" value={who.name} onChange={e=>setWho({...who,name:e.target.value})}/><input placeholder="Tu teléfono (opcional)" value={who.phone} onChange={e=>setWho({...who,phone:e.target.value})}/></div>
  <button className="btn g" onClick={order}>REALIZAR PEDIDO POR WHATSAPP</button>
  <div className="row"><button className="btn l" onClick={()=>setCart({})}>Vaciar carrito</button></div></>)}
 {v==='admin'&&(user?<Admin {...{P,cfg,load,tell}} out={()=>{api.logout();setUser(null);go('home')}}/>:<Login ok={u=>{setUser(u||{});}} tell={tell}/>)}
 </main>
 {toast&&<div className="toast">{toast}</div>}
 <nav>{N.map(([k,i,l])=><button key={k} className={v===k?'on':''} onClick={()=>k==='cat'?go('cat'):go(k)}><span>{i}</span>{l}</button>)}</nav></>}

function Login({ok,tell}){const [e,setE]=useState(''),[p,setP]=useState('')
 return <div className="box"><h3>Acceso del administrador</h3><input placeholder="Correo (modo local: déjalo vacío)" value={e} onChange={x=>setE(x.target.value)}/><br/><br/>
 <input type="password" placeholder="Contraseña (modo local: 1234)" value={p} onChange={x=>setP(x.target.value)}/><br/><br/>
 <button className="btn" onClick={async()=>(await api.login(e,p))?ok():tell('Datos incorrectos')}>Entrar</button></div>}

function Admin({P,cfg,load,tell,out}){
 const [tab,setTab]=useState('stats'),[O,setO]=useState([]),[e,setE]=useState(null),[c,setC]=useState(cfg)
 const refresh=async()=>setO(await api.orders());useEffect(()=>{refresh()},[])
 const T=[['stats','📊 Estadísticas'],['prods','📦 Productos'],['orders','🧾 Pedidos'],['cfg','⚙️ Configuración']]
 const now=new Date(),same=(d,f)=>{d=new Date(d);return f==='d'?d.toDateString()===now.toDateString():d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()}
 const sum=l=>l.reduce((a,x)=>a+ +x.total,0)
 const days=[...Array(7)].map((_,i)=>{const d=new Date(now-(6-i)*864e5);return sum(O.filter(x=>new Date(x.created_at).toDateString()===d.toDateString()))}),mx=Math.max(...days,1)
 const top={};O.forEach(x=>x.items.forEach(i=>top[i.name]=(top[i.name]||0)+i.q));const tp=Object.entries(top).sort((a,b)=>b[1]-a[1]).slice(0,5)
 const set=(k,v)=>setE(x=>({...x,[k]:v})),cur=e&&CATS.find(k=>k.n===e.cat)||CATS[0]
 const save=async()=>{if(!e.name||!e.price)return tell('Nombre y precio obligatorios');const{id,...rest}=e
  await api.saveProduct({...(id?{id}:{}),...rest,price:+e.price,old:+e.old||0,stock:+e.stock||0});setE(null);await load();tell('Guardado ✅')}
 const blank={name:'',cat:CATS[0].n,sub:CATS[0].subs[0],descr:'',price:'',old:'',stock:0,img:'',emo:'',status:'activo',feat:false,offer:false}
 return <><h3>Administración</h3><div className="chips">{T.map(([k,l])=><button key={k} className={'chip'+(tab===k?' on':'')} onClick={()=>{setTab(k);setE(null);refresh()}}>{l}</button>)}</div>
 {tab==='stats'&&<><div className="kpi"><div>Ventas del día<b>{m(sum(O.filter(x=>same(x.created_at,'d'))))}</b></div><div>Ventas del mes<b>{m(sum(O.filter(x=>same(x.created_at,'m'))))}</b></div><div>Pedidos<b>{O.length}</b></div></div>
  <b>Últimos 7 días</b><div className="bars">{days.map((v,i)=><i key={i} style={{height:v/mx*100+'%'}}/>)}</div>
  <div className="box"><b>🏆 Más vendidos</b>{tp.map(x=><div key={x[0]}>{x[0]} — {x[1]} uds</div>)}{!tp.length&&<div>Sin ventas</div>}</div>
  <div className="box"><b>⚠️ Poco inventario</b>{P.filter(p=>p.stock<=5).map(p=><div key={p.id}>{p.name}: {p.stock}</div>)}</div></>}
 {tab==='prods'&&<>{!e?<button className="btn" onClick={()=>setE(blank)}>+ Nuevo producto</button>:<div className="box"><b>{e.id?'Editar #'+e.id:'Nuevo producto'}</b>
  <input placeholder="Nombre" value={e.name} onChange={x=>set('name',x.target.value)}/>
  <div className="row"><select value={e.cat} onChange={x=>setE({...e,cat:x.target.value,sub:CATS.find(k=>k.n===x.target.value).subs[0]})}>{CATS.map(k=><option key={k.n}>{k.n}</option>)}</select><select value={e.sub} onChange={x=>set('sub',x.target.value)}>{cur.subs.map(s=><option key={s}>{s}</option>)}</select></div>
  <input placeholder="Descripción" value={e.descr||''} onChange={x=>set('descr',x.target.value)}/>
  <div className="row"><input type="number" placeholder="Precio" value={e.price} onChange={x=>set('price',x.target.value)}/><input type="number" placeholder="Precio anterior" value={e.old||''} onChange={x=>set('old',x.target.value)}/><input type="number" placeholder="Inventario" value={e.stock} onChange={x=>set('stock',x.target.value)}/></div>
  <div className="row"><input type="file" accept="image/*" onChange={x=>x.target.files[0]&&shrink(x.target.files[0],d=>set('img',d))}/><input placeholder="Emoji" value={e.emo||''} onChange={x=>set('emo',x.target.value)}/></div>
  <div className="row"><select value={e.status} onChange={x=>set('status',x.target.value)}><option>activo</option><option>agotado</option></select>
  <label><input type="checkbox" checked={!!e.feat} onChange={x=>set('feat',x.target.checked)}/> Destacado</label><label><input type="checkbox" checked={!!e.offer} onChange={x=>set('offer',x.target.checked)}/> Oferta</label></div>
  <button className="btn" onClick={save}>Guardar</button> <button className="btn l" style={{marginTop:8}} onClick={()=>setE(null)}>Cancelar</button></div>}
  <div className="tbl"><table><tbody><tr><th>ID</th><th>Producto</th><th>$</th><th>Stock</th><th/></tr>{P.map(p=><tr key={p.id}><td>{p.id}</td><td>{p.name}</td><td>{m(p.price)}</td><td>{p.stock}</td><td><button className="btn s" onClick={()=>setE(p)}>✏️</button> <button className="btn s l" onClick={async()=>{if(confirm('¿Eliminar?')){await api.deleteProduct(p.id);load()}}}>🗑️</button></td></tr>)}</tbody></table></div></>}
 {tab==='orders'&&<div className="tbl"><table><tbody><tr><th>Fecha</th><th>Detalle</th><th>Total</th><th>Estado</th></tr>{O.map(o=><tr key={o.id}><td>{new Date(o.created_at).toLocaleString()}</td><td>{o.customer_name} {o.items.map(i=>i.name+' x'+i.q).join(', ')}</td><td>{m(o.total)}</td>
  <td><select value={o.status} onChange={async x=>{await api.setOrderStatus(o.id,x.target.value);refresh()}}><option>nuevo</option><option>confirmado</option><option>entregado</option></select></td></tr>)}</tbody></table></div>}
 {tab==='cfg'&&<div className="box">{[['name','Nombre del negocio'],['wa','WhatsApp (con código de país, ej. 593999999999)'],['phone','Teléfono'],['addr','Dirección'],['ig','Instagram'],['hours','Horario'],['welcome','Texto de bienvenida']].map(([k,l])=><p key={k}><small>{l}</small><input value={c[k]||''} onChange={x=>setC({...c,[k]:x.target.value})}/></p>)}
  <p><small>Logo</small><input type="file" accept="image/*" onChange={x=>x.target.files[0]&&shrink(x.target.files[0],d=>setC({...c,logo:d}))}/></p>
  <button className="btn" onClick={async()=>{await api.saveSettings(c);await load();tell('Guardado ✅')}}>Guardar configuración</button></div>}
 <button className="btn l" style={{marginTop:16}} onClick={out}>Cerrar sesión</button></>}
