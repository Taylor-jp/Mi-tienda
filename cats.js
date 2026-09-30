export const CATS=[
{n:'Útiles escolares',i:'📚',c:'#1e6fd9',subs:['Cuadernos','Lápices','Bolígrafos','Colores','Marcadores','Reglas','Compases','Tijeras','Pegamento','Cartulinas','Carpetas','Sacapuntas','Otros útiles escolares']},
{n:'Productos de limpieza',i:'🧹',c:'#25a9d8',subs:['Jabón líquido','Detergente en polvo','Cloro','Desinfectante','Desengrasante','Suavizante','Limpiavidrios','Productos para pisos','Esponjas','Cepillos','Otros productos de limpieza']},
{n:'Helados',i:'🍦',c:'#ff8a1f',subs:['Paletas','Conos','Barquillas','Vasitos','Copas','Otros productos']},
{n:'Otros artículos',i:'📦',c:'#7a8cff',subs:['Otros']}]
export const icon=n=>(CATS.find(c=>c.n===n)||{i:'📦'}).i
