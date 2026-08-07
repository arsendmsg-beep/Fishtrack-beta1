import { auth, db } from "./firebase.js";

import {
onAuthStateChanged,
signOut,
createUserWithEmailAndPassword,
signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


import {
ref,
get,
set,
push,
onValue,
remove,
update,
off
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


console.log("SOCIAL CARGADO");


const panelSocial=document.querySelector(".socialPanel");
const abrirPerfil=document.querySelector(".abrirPerfil");
const abrirSocial=document.querySelector(".abrirSocial");
const cerrarSocial=document.querySelector(".cerrarSocial");

const cerrarSesion=document.getElementById("cerrarSesion");

const fotoPerfil=document.getElementById("fotoPerfil");
const nombrePerfil=document.getElementById("nombrePerfil");

const nuevoNombre=document.getElementById("nuevoNombre");
const guardarNombre=document.getElementById("guardarNombre");

const buscarAmigo=document.getElementById("buscarAmigo");
const buscarUsuario=document.getElementById("buscarUsuario");
const resultadoBusqueda=document.getElementById("resultadoBusqueda");

const listaAmigos=document.getElementById("listaAmigos");
const listaChatAmigos=document.getElementById("listaChatAmigos");
const listaSolicitudes=document.getElementById("listaSolicitudes");

const mensajesPrivados=document.getElementById("mensajesPrivados");
const mensajePrivado=document.getElementById("mensajePrivado");
const enviarMensaje=document.getElementById("enviarMensaje");

const nombreChat=document.getElementById("nombreChat");

const listaComunidad=document.getElementById("listaComunidad");
const mensajeComunidad=document.getElementById("mensajeComunidad");
const publicarComunidad=document.getElementById("publicarComunidad");


const zonaPerfil=document.getElementById("zonaPerfil");
const zonaAmigos=document.getElementById("zonaAmigos");
const zonaChat=document.getElementById("zonaChat");
const zonaComunidad=document.getElementById("zonaComunidad");


const tabPerfil=document.querySelector(".tabPerfil");
const tabAmigos=document.querySelector(".tabAmigos");
const tabChat=document.querySelector(".tabChat");
const tabComunidad=document.querySelector(".tabComunidad");


let usuarioActual=null;
let amigoSeleccionado=null;
let chatActual=null;
let detenerChat=null;

let datosUsuarioActual={};



function mostrarZona(zona){

if(!zona)return;


[zonaPerfil,zonaAmigos,zonaChat,zonaComunidad]
.forEach(z=>{

if(z){
z.style.display="none";
}

});


if(zona===zonaChat || zona===zonaComunidad){

zona.style.display="flex";

}else{

zona.style.display="block";

}


}



tabPerfil?.addEventListener(
"click",
()=>{

mostrarZona(zonaPerfil);

}
);



tabAmigos?.addEventListener(
"click",
()=>{

mostrarZona(zonaAmigos);

cargarSolicitudes();
cargarAmigos();

}
);



tabChat?.addEventListener(
"click",
()=>{

mostrarZona(zonaChat);

cargarAmigosChat();

}
);



tabComunidad?.addEventListener(
"click",
()=>{

mostrarZona(zonaComunidad);

cargarComunidad();

}
);



function abrirPanel(){

panelSocial?.classList.remove("oculto");

}



abrirPerfil?.addEventListener(
"click",
abrirPanel
);



abrirSocial?.addEventListener(
"click",
abrirPanel
);



cerrarSocial?.addEventListener(
"click",
()=>{

panelSocial?.classList.add("oculto");

}
);



onAuthStateChanged(
auth,
async(user)=>{


const login=document.querySelector(".loginPantalla");
const bienvenida=document.querySelector(".bienvenida");
const inicio=document.querySelector(".inicioInfo");



if(!user){

usuarioActual=null;

login?.classList.remove("oculto");

bienvenida?.classList.add("oculto");

inicio?.classList.add("oculto");

return;

}



usuarioActual=user.uid;


login?.classList.add("oculto");

bienvenida?.classList.remove("oculto");

inicio?.classList.remove("oculto");



try{


const datos=
await get(
ref(db,"usuarios/"+usuarioActual)
);



if(datos.exists()){


datosUsuarioActual=datos.val();


if(nombrePerfil)
nombrePerfil.textContent=
datosUsuarioActual.nombre || "Usuario";


if(fotoPerfil)
fotoPerfil.src=
datosUsuarioActual.foto || "default.png";


}



await update(
ref(db,"usuarios/"+usuarioActual),
{

online:true,

ultimaConexion:Date.now()

}
);



}catch(error){

console.log(error);

}


});

function cargarSolicitudes(){

if(!usuarioActual || !listaSolicitudes)return;


onValue(
ref(db,"solicitudes/"+usuarioActual),
(snapshot)=>{


listaSolicitudes.innerHTML="";


if(!snapshot.exists()){

listaSolicitudes.innerHTML=
"No tienes solicitudes.";

return;

}



snapshot.forEach(solicitud=>{


let datos=solicitud.val();

let uid=solicitud.key;


let div=document.createElement("div");

div.className="solicitudUsuario";


div.innerHTML=`

<img src="${datos.foto || "default.png"}">

<span>${datos.nombre}</span>

<button class="aceptarSolicitud">
Aceptar
</button>

<button class="rechazarSolicitud">
Rechazar
</button>

`;



div.querySelector(".aceptarSolicitud")
.onclick=async()=>{


await set(
ref(db,"amigos/"+usuarioActual+"/"+uid),
{

uid:uid,

nombre:datos.nombre,

foto:datos.foto || "default.png"

}
);



await set(
ref(db,"amigos/"+uid+"/"+usuarioActual),
{

uid:usuarioActual,

nombre:nombrePerfil.textContent,

foto:fotoPerfil.src

}
);



await remove(
ref(db,"solicitudes/"+usuarioActual+"/"+uid)
);



cargarAmigos();


};



div.querySelector(".rechazarSolicitud")
.onclick=async()=>{


await remove(
ref(db,"solicitudes/"+usuarioActual+"/"+uid)
);


};



listaSolicitudes.appendChild(div);


});


}

);


}




function cargarAmigos(){


if(!usuarioActual || !listaAmigos)return;



onValue(
ref(db,"amigos/"+usuarioActual),
(snapshot)=>{


listaAmigos.innerHTML="";



if(!snapshot.exists()){


listaAmigos.innerHTML=
"No tienes amigos todavía";


return;


}




snapshot.forEach(amigo=>{


let datos=amigo.val();

let uid=amigo.key;



let div=document.createElement("div");


div.className="amigoLista";



div.innerHTML=`

<img src="${datos.foto || "default.png"}">

<span>${datos.nombre}</span>

<button class="eliminarAmigo">
Eliminar
</button>

`;



div.querySelector(".eliminarAmigo")
.onclick=async()=>{


await remove(
ref(db,"amigos/"+usuarioActual+"/"+uid)
);


};



listaAmigos.appendChild(div);



});



}

);



}




function cargarAmigosChat(){


if(!usuarioActual || !listaChatAmigos)return;



onValue(
ref(db,"amigos/"+usuarioActual),
(snapshot)=>{


listaChatAmigos.innerHTML="";



if(!snapshot.exists()){

listaChatAmigos.innerHTML=
"No tienes amigos";

return;

}



snapshot.forEach(amigo=>{


let datos=amigo.val();

let uid=amigo.key;



let div=document.createElement("div");


div.className="amigoChat";



div.innerHTML=`

<img src="${datos.foto || "default.png"}">

<span>
${datos.nombre}
</span>

`;



div.onclick=()=>{


amigoSeleccionado=uid;


chatActual=
[
usuarioActual,
uid
]
.sort()
.join("_");



if(nombreChat){

nombreChat.textContent=
"Chat con "+datos.nombre;

}



iniciarChat();



};



listaChatAmigos.appendChild(div);



});



}

);



}




cerrarSesion?.addEventListener(
"click",
async()=>{


if(usuarioActual){


await update(
ref(db,"usuarios/"+usuarioActual),
{

online:false,

ultimaConexion:Date.now()

}
);


}



await signOut(auth);


location.reload();


}
);

document.querySelector(".btnMostrarLogin")
?.addEventListener(
"click",
()=>{

document.querySelector(".loginFormulario")
?.classList.remove("oculto");


document.querySelector(".registroFormulario")
?.classList.add("oculto");

}
);



document.querySelector(".btnMostrarRegistro")
?.addEventListener(
"click",
()=>{


document.querySelector(".registroFormulario")
?.classList.remove("oculto");


document.querySelector(".loginFormulario")
?.classList.add("oculto");


}
);



document.querySelector(".registrar")
?.addEventListener(
"click",
async()=>{


let nombre=
document.querySelector(".nombreRegistro").value.trim();


let correo=
document.querySelector(".correoRegistro").value.trim();


let pass=
document.querySelector(".passRegistro").value;



try{


let cuenta=
await createUserWithEmailAndPassword(
auth,
correo,
pass
);



await set(
ref(db,"usuarios/"+cuenta.user.uid),
{

nombre:nombre,

foto:"default.png",

online:true,

ultimaConexion:Date.now()

}
);



alert("Cuenta creada correctamente");



}catch(error){


alert(error.message);


}



}
);





document.querySelector(".entrar")
?.addEventListener(
"click",
async()=>{


let correo=
document.querySelector(".correoLogin").value;


let pass=
document.querySelector(".passLogin").value;



try{


await signInWithEmailAndPassword(
auth,
correo,
pass
);



}catch(error){


alert("Correo o contraseña incorrectos");


}



}
);





buscarUsuario?.addEventListener(
"click",
async()=>{


let texto=
buscarAmigo.value
.toLowerCase()
.trim();



if(!texto)return;



resultadoBusqueda.innerHTML=
"Buscando...";



let usuarios=
await get(
ref(db,"usuarios")
);



resultadoBusqueda.innerHTML="";



usuarios.forEach(usuario=>{


let datos=usuario.val();

let uid=usuario.key;



if(
uid!==usuarioActual &&
datos.nombre &&
datos.nombre.toLowerCase().includes(texto)
){



let div=document.createElement("div");


div.className="resultadoUsuario";



div.innerHTML=`

<img src="${datos.foto || "default.png"}">

<span>${datos.nombre}</span>

<button class="enviarSolicitud">
Enviar solicitud
</button>

`;



div.querySelector(".enviarSolicitud")
.onclick=async()=>{


let existe=
await get(
ref(db,"solicitudes/"+uid+"/"+usuarioActual)
);



if(existe.exists()){

alert("Ya enviaste una solicitud");

return;

}



await set(
ref(db,"solicitudes/"+uid+"/"+usuarioActual),
{

uid:usuarioActual,

nombre:nombrePerfil.textContent,

foto:fotoPerfil.src,

fecha:Date.now()

}
);



alert("Solicitud enviada");



};



resultadoBusqueda.appendChild(div);



}



});



}
);





function iniciarChat(){


if(!chatActual || !mensajesPrivados)return;



if(detenerChat){

detenerChat();

}



mensajesPrivados.innerHTML="";



const chatRef=
ref(
db,
"mensajes_privados/"+chatActual
);



onValue(
chatRef,
(snapshot)=>{


mensajesPrivados.innerHTML="";



snapshot.forEach(mensaje=>{


let datos=
mensaje.val();



let div=document.createElement("div");



div.className=
datos.uid===usuarioActual
?
"mensaje mio"
:
"mensaje suyo";



div.innerHTML=`

<p>
${datos.texto}
</p>

`;



mensajesPrivados.appendChild(div);



});



mensajesPrivados.scrollTop=
mensajesPrivados.scrollHeight;



}

);



detenerChat=()=>{

off(chatRef);

};



}




enviarMensaje?.addEventListener(
"click",
async()=>{


let texto=
mensajePrivado.value.trim();



if(!texto)return;



if(!chatActual){

alert("Selecciona un amigo primero");

return;

}



let nuevoMensaje=
push(
ref(db,"mensajes_privados/"+chatActual)
);



await set(
nuevoMensaje,
{

uid:usuarioActual,

nombre:nombrePerfil.textContent,

foto:fotoPerfil.src,

texto:texto,

fecha:Date.now()

}
);



mensajePrivado.value="";



}
);

publicarComunidad?.addEventListener(
"click",
async()=>{


let texto=
mensajeComunidad.value.trim();



if(!texto)return;



let nuevo=
push(
ref(db,"comunidad")
);



await set(
nuevo,
{

uid:usuarioActual,

nombre:nombrePerfil.textContent,

foto:fotoPerfil.src,

mensaje:texto,

fecha:Date.now()

}
);



mensajeComunidad.value="";



}
);





function cargarComunidad(){


if(!listaComunidad)return;



onValue(
ref(db,"comunidad"),
(snapshot)=>{


listaComunidad.innerHTML="";



if(!snapshot.exists()){


listaComunidad.innerHTML=
"No hay publicaciones.";


return;


}



let publicaciones=[];



snapshot.forEach(pub=>{


publicaciones.push({

id:pub.key,

...pub.val()

});


});



publicaciones.sort(
(a,b)=>b.fecha-a.fecha
);



publicaciones.forEach(pub=>{


let div=document.createElement("div");


div.className="publicacion";



div.innerHTML=`

<div class="publicacionUsuario">

<img src="${pub.foto || "default.png"}">

<h3>
${pub.nombre || "Usuario"}
</h3>

</div>


<p class="publicacionTexto">

${pub.mensaje}

</p>


<div class="reacciones">

<button class="likePublicacion">

❤️ ${pub.likes ? Object.keys(pub.likes).length : 0}

</button>


${
pub.uid===usuarioActual
?
`
<button class="eliminarPublicacion">
🗑️
</button>
`
:
""
}

</div>

`;



let botonLike=
div.querySelector(".likePublicacion");



botonLike.onclick=async()=>{


let like=
ref(
db,
"comunidad/"+pub.id+"/likes/"+usuarioActual
);



let existe=
await get(like);



if(existe.exists()){


await remove(like);


}else{


await set(
like,
true
);


}



};





let botonEliminar=
div.querySelector(".eliminarPublicacion");



if(botonEliminar){


botonEliminar.onclick=async()=>{


if(confirm("¿Eliminar publicación?")){


await remove(
ref(db,"comunidad/"+pub.id)
);


}



};



}



listaComunidad.appendChild(div);



});



}

);



}







mensajePrivado?.addEventListener(
"keydown",
(e)=>{


if(e.key==="Enter"){


e.preventDefault();


enviarMensaje.click();


}



}
);






guardarNombre?.addEventListener(
"click",
async()=>{


let nombre=
nuevoNombre.value.trim();



if(!nombre)return;



await update(
ref(db,"usuarios/"+usuarioActual),
{

nombre:nombre

}
);



nombrePerfil.textContent=
nombre;



datosUsuarioActual.nombre=
nombre;



nuevoNombre.value="";



}
);







const cambiarFoto=
document.getElementById("cambiarFoto");



cambiarFoto?.addEventListener(
"change",
async(e)=>{


let archivo=
e.target.files[0];



if(!archivo)return;



let datos=
new FormData();



datos.append(
"file",
archivo
);



datos.append(
"upload_preset",
"fishtrack"
);



try{


let respuesta=
await fetch(
"https://api.cloudinary.com/v1_1/x0dxmtp5/image/upload",
{

method:"POST",

body:datos

}
);



let imagen=
await respuesta.json();



await update(
ref(db,"usuarios/"+usuarioActual),
{

foto:imagen.secure_url

}
);



fotoPerfil.src=
imagen.secure_url;



}catch(error){


alert("Error subiendo imagen");


}



}
);







window.addEventListener(
"beforeunload",
()=>{


if(usuarioActual){


update(
ref(db,"usuarios/"+usuarioActual),
{

online:false,

ultimaConexion:Date.now()

}
);


}



}
);







setInterval(
()=>{


if(usuarioActual){


update(
ref(db,"usuarios/"+usuarioActual),
{

online:true,

ultimaConexion:Date.now()

}
);


}



},
60000
);