document.addEventListener("DOMContentLoaded", function () {
  // Configuración de Firebase (debe coincidir con auth.js)
  const firebaseConfig = {
    apiKey: "AIzaSyAduH05WpscAJq8u3zqIF6uQAU4y4-zh0U",
    authDomain: "fir-tamalero.firebaseapp.com",
    projectId: "fir-tamalero",
    storageBucket: "fir-tamalero.appspot.com",
    messagingSenderId: "233842132923",
    appId: "1:233842132923:web:175c9f8427ead12b38669e",
    measurementId: "G-12BEJN0Y7T",
  };

  // Inicializar Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();

  // Elementos del DOM
  const container = document.getElementById("login-container");
  const registerBtn = document.getElementById("register");
  const loginBtn = document.getElementById("login");

  // Toggle entre formularios
  registerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    container.classList.add("active");
  });

  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    container.classList.remove("active");
  });

  // Manejo de formulario de login
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });
  });

  // Manejo de formulario de registro
  document.getElementById("register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const name = document.getElementById("register-name").value;
    const lastname = document.getElementById("register-lastname").value;

    auth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        return userCredential.user.updateProfile({
          displayName: `${name} ${lastname}`,
        });
      })
      .then(() => {
        alert("Registro exitoso!");
        container.classList.remove("active");
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });
  });

  // Configuración de proveedores de autenticación
  const providers = {
    google: new firebase.auth.GoogleAuthProvider(),
    facebook: new firebase.auth.FacebookAuthProvider(),
    twitter: new firebase.auth.TwitterAuthProvider(),
    github: new firebase.auth.GithubAuthProvider(),
  };

  // Configurar todos los botones de proveedores
  Object.keys(providers).forEach((provider) => {
    [`${provider}-login`, `${provider}-register`].forEach((id) => {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          auth
            .signInWithPopup(providers[provider])
            .then(() => {
              window.location.href = "index.html";
            })
            .catch((error) => {
              alert("Error: " + error.message);
            });
        });
      }
    });
  });

  // Restablecer contraseña
  document.querySelector(".forgot-password").addEventListener("click", (e) => {
    e.preventDefault();
    const email = prompt("Por favor ingresa tu correo electrónico:");
    if (email) {
      auth
        .sendPasswordResetEmail(email)
        .then(() => {
          alert(
            "Correo de restablecimiento enviado. Revisa tu bandeja de entrada."
          );
        })
        .catch((error) => {
          alert("Error: " + error.message);
        });
    }
  });
});
