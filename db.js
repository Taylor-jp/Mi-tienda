import {createClient} from '@supabase/supabase-js'
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_ANON_KEY
export const sb=url&&key?createClient(url,key):null
const g=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}}
const s=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
const T=(id,name,cat,sub,descr,price,old,stock,emo,feat)=>({id,name,cat,sub,descr,price,old:old||0,img:'',emo,stock,status:'activo',feat:!!feat,offer:!!old})
const SEED=[T(1,'Cuaderno 100 hojas','Útiles escolares','Cuadernos','Cuaderno rayado tapa dura',3.5,4.5,40,'📓',1),T(2,'Caja de colores x12','Útiles escolares','Colores','Colores de madera x12',4,0,25,'🖍️',1),T(3,'Lápices HB','Útiles escolares','Lápices','Lápiz HB con borrador',.6,0,8,'✏️'),T(4,'Marcadores','Útiles escolares','Marcadores','Set de marcadores',5,6.5,15,'🖊️'),T(5,'Regla de 30 cm','Útiles escolares','Reglas','Regla transparente',1,0,30,'📏'),T(6,'Pegamento escolar','Útiles escolares','Pegamento','Pegamento blanco lavable',1.5,0,0,'🧴'),T(7,'Jabón líquido','Productos de limpieza','Jabón líquido','Jabón líquido 1 litro',3.5,0,20,'🫧',1),T(8,'Detergente en polvo','Productos de limpieza','Detergente en polvo','Bolsa de 1 kg',6,8,18,'🧺'),T(9,'Cloro','Productos de limpieza','Cloro','Cloro 1 litro',2.5,0,22,'🧪'),T(10,'Desinfectante','Productos de limpieza','Desinfectante','Aroma lavanda',4,0,14,'🧼'),T(11,'Desengrasante','Productos de limpieza','Desengrasante','Cocina limpia',4.5,0,12,'🍋'),T(12,'Suavizante','Productos de limpieza','Suavizante','Ropa suave',5,0,4,'🌸'),T(13,'Paletas','Helados','Paletas','Paleta de fruta',1,0,50,'🍭',1),T(14,'Conos','Helados','Conos','Cono de vainilla',1.5,0,35,'🍦'),T(15,'Barquillas','Helados','Barquillas','Barquilla crujiente',2,2.5,30,'🧇')]
const CFG={name:'Mi Tienda',logo:'',wa:'593999999999',phone:'',addr:'',ig:'',hours:'Lun-Sáb 8:00-18:00',welcome:'Todo lo que necesitas en un solo lugar'}
export const api={
 async products(){if(sb){const{data}=await sb.from('products').select('*').order('id');return data||[]}return g('p')||(s('p',SEED),SEED)},
 async saveProduct(p){if(sb){const{error}=await sb.from('products').upsert(p);if(error)throw error;return}
  const l=g('p')||SEED;if(!p.id)p.id=Math.max(0,...l.map(x=>x.id))+1;const i=l.findIndex(x=>x.id===p.id);i<0?l.push(p):l[i]=p;s('p',l)},
 async deleteProduct(id){if(sb)return sb.from('products').delete().eq('id',id);s('p',(g('p')||[]).filter(x=>x.id!==id))},
 async settings(){if(sb){const{data}=await sb.from('settings').select('data').eq('id',1).single();return{...CFG,...(data?.data||{})}}return{...CFG,...(g('c')||{})}},
 async saveSettings(c){if(sb)return sb.from('settings').upsert({id:1,data:c});s('c',c)},
 /* Descuenta inventario y guarda el pedido de forma atómica (función SQL place_order) */
 async placeOrder(items,name,phone){if(sb){const{error}=await sb.rpc('place_order',{p_items:items,p_name:name||'',p_phone:phone||''});if(error)throw error;return}
  const l=g('p')||SEED;items.forEach(i=>{const p=l.find(x=>x.id===i.id);if(p.stock<i.q)throw Error('stock');p.stock-=i.q});s('p',l)
  const o=g('o')||[];o.push({id:Date.now(),created_at:new Date().toISOString(),items,total:items.reduce((a,i)=>a+i.q*i.price,0),customer_name:name,status:'nuevo'});s('o',o)},
 async orders(){if(sb){const{data}=await sb.from('orders').select('*').order('created_at',{ascending:false});return data||[]}return[...(g('o')||[])].reverse()},
 async setOrderStatus(id,status){if(sb)return sb.from('orders').update({status}).eq('id',id);s('o',(g('o')||[]).map(o=>o.id===id?{...o,status}:o))},
 /* Autenticación del administrador */
 async login(email,pass){if(sb){const{error}=await sb.auth.signInWithPassword({email,password:pass});return!error}return pass==='1234'},
 async logout(){if(sb)await sb.auth.signOut()},
 async session(cb){if(sb){const{data}=await sb.auth.getSession();cb(data.session?.user||null);sb.auth.onAuthStateChange((_,x)=>cb(x?.user||null))}}}
