// Import the functions you need from the SDKs you need
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getAuth,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  updateProfile,
  createUserWithEmailAndPassword,
  OAuthProvider,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js';
import {
  getDatabase,
  ref,
  set
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "",
  authDomain: "cookpad-cfdac.firebaseapp.com",
  databaseURL: "https://cookpad-cfdac-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cookpad-cfdac",
  storageBucket: "cookpad-cfdac.appspot.com",
  messagingSenderId: "354452058669",
  appId: "1:354452058669:web:1c3c4a638c4ad82fbefea4",
  measurementId: "G-EGX5HH6ZB1"
};

// Inicializamos la aplicación de Firebase con la configuración proporcionada
const app = initializeApp(firebaseConfig);

// Obtenemos una instancia de la base de datos de Firebase
const db = getDatabase(app);

// Obtenemos una instancia del servicio de autenticación de Firebase
const auth = getAuth(app);
const storage = getStorage(app);
let user = null;
// Cuando el servicio este ready iniciamos la funcion "funcionalidad"
document.addEventListener("deviceready", funcionalidad, false);

// Función que contiene la lógica principal de la aplicación
function funcionalidad() {
  getDownloadURL(storageRef(storage, "gs://cookpad-cfdac.appspot.com/inicio.jpg")).then((url) => {
    // Agregar la imagen al fondo div de la sección
    let body = document.getElementById("body");
    body.style.backgroundImage = "url(" + url + ")";
  }).catch((error) => {
    console.error("Error obteniendo la URL de la imagen: ", error);
  });
  //cuando pulsemos el boton para registrarse
  document.getElementById('registrar').addEventListener("click", function () {

    // Obtenemos los valores de los campos de entrada
    let email = document.getElementById("newCorreo").value;
    let password = document.getElementById("newPassword").value;
    let comprobar = document.getElementById("comprobar").value;
    let username = document.getElementById("usuario").value;

    // Verificamos si las contraseñas coinciden
    if (password == comprobar) {

      // Creamos un nuevo usuario en Firebase con email y contraseña
      createUserWithEmailAndPassword(auth, email, password)
        .then((result) => {

          // Actualizamos el perfil del usuario con el nombre de usuario
          updateProfile(result.user, {
            displayName: username
          })
            .then(() => {
              console.log("Nombre de usuario agregado con éxito.");
              let user_info = result.user;
              console.log(user_info);

              // Obtenemos el nombre de usuario y correo electrónico del usuario
              user = user_info.email.replace(/[.@]/g, '');

              let name = user_info.displayName;
              let root_ref = ref(db, 'usuarios/' + user);

              // Guardamos la información del usuario en la base de datos
              set(root_ref, {
                nombre: name,
                email: user_info.email
              });

              // Redirigimos a la página de inicio
              volverInicio();
            })

            .catch((error) => {
              console.error("Error al actualizar el perfil:", error);
            });
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          if (errorCode === "auth/email-already-in-use") {
            console.error("El correo electrónico ya está registrado.");
            document.getElementById("mensajeRe").innerHTML = "El correo ya esta registrado";
          } else {
            console.error("Error al registrar nuevo usuario:", errorCode, errorMessage);
          }
        });
    } else {
      document.getElementById("mensajeRe").innerHTML = "La contraseña no coincide";
    }
  });

  // Evento de escuchas para el botón de inicio de sesión
  document.getElementById("iniSesion").addEventListener("click", function () {
    let email = document.getElementById("correo").value;
    let password = document.getElementById("contraseña").value;

    //cogemos el correo electronico y la contraseña para poder iniciar sesión
    signInWithEmailAndPassword(auth, email, password)
      .then((result) => {
        let user_info = result.user;
        //creamos el usuario el cual va a contener el correo sin caracteres especiales
        user = user_info.email.replace(/[.@]/g, '');

        iniciarSesion(user);
        window.location.href = "./categorias.html";
      })
      .catch((error) => {
        document.getElementById("mensaje").innerHTML = "Los datos no son correctos";
      });
  });

  //Funcion del boton de google cogemos la autetificación por google
  document.getElementById('google').addEventListener("click", function () {
    const provedor = new GoogleAuthProvider(auth);
    // Iniciamos sesión con la autenticación
    signInWithRedirect(auth, provedor);
  });


// Agregamos un evento de clic al botón con ID 'microsoft'
document.getElementById('microsoft').addEventListener('click', function () {
  // Creamos un proveedor de autenticación OAuth para Microsoft
  const provider = new OAuthProvider('microsoft.com');
  // Configuramos parámetros personalizados para el proveedor
  provider.setCustomParameters({
    prompt: 'consent'
  });

    // Iniciamos sesión con un popup utilizando el proveedor de autenticación de Microsoft
  signInWithPopup(auth, provider)
    .then((result) => {
      // Si la sesión se inicia correctamente, mostramos un mensaje de éxito en la consola
      console.log("Nombre de usuario agregado con éxito.");
      // Obtenemos la información del usuario autenticado
      const user_info = result.user;

      // Obtenemos el nombre de usuario y correo electrónico del usuario autenticado
      const user = user_info.email.replace(/[.@]/g, '');
      const name = user_info.displayName;
      const root_ref = ref(db, 'usuarios/' + user);

      // Llamamos a la función iniciarSesion con el nombre de usuario
      iniciarSesion(user);
      
      // Guardamos la información del usuario en la base de datos
      return set(root_ref, {
        nombre: name,
        email: user_info.email
      });
    })
    .then(() => {
      // Si la información del usuario se guarda correctamente en la base de datos, redirigimos al usuario a la página de categorías
      console.log("Datos del usuario guardados en la base de datos.");
      window.location.href = "./categorias.html";
    });
});

  // Tratamos el resultado de la autenticación
  getRedirectResult(auth).then((result) => {
    const credencial = GoogleAuthProvider.credentialFromResult(result);
    const token = credencial.accessToken;
    const user_info = result.user;

    user = user_info.email.replace(/[.@]/g, '');

    let name = user_info.displayName;
    let root_ref = ref(db, 'usuarios/' + user);
    iniciarSesion(user);
    // Guardamos la información del usuario en la base de datos
    return set(root_ref, {
      nombre: name,
      email: user_info.email
    });
  }).then(() => {
    // Iniciamos sesión y redirige a la página de inicio
    window.location.href = "./categorias.html";
  }).catch((error) => {
    console.error('Error durante la autenticación o redirección:', error);
  });
}

// Función para iniciar sesión y almacenar el usuario en la sesión
function iniciarSesion(nombreUsuario) {
  sessionStorage.setItem('usuario', nombreUsuario);
}

// Ocultamos el formulario de registro al cargar la página
document.getElementById("registrarse").style.display = "none";

// Evento de escucha para mostrar el formulario de registro al hacer clic en el enlace correspondiente
document.getElementById("registro").addEventListener("click", function () {
  document.getElementById("mensaje").innerHTML = "";
  document.getElementById("correo").innerHTML = "";
  document.getElementById("contraseña").innerHTML = "",
  document.getElementById("registrarse").style.display = "flex";
  document.getElementById("formulario").style.display = "none";
});

// Evento de escucha para volver al formulario de inicio de sesión desde el formulario de registro
document.getElementById("volverIniSesion").addEventListener("click", volverInicio);


// Función para volver al formulario de inicio de sesión desde el formulario de registro
function volverInicio() {
  document.getElementById("mensaje").innerHTML = "";
  document.getElementById("registrarse").style.display = "none";
  document.getElementById("formulario").style.display = "flex";
  document.getElementById("mensajeRe").innerHTML = "";
  document.getElementById("usuario").value = "";
  document.getElementById("newCorreo").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("comprobar").value = "";
}
