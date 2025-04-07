document.addEventListener("DOMContentLoaded", function () {
  // Configuración de Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyAduH05WpscAJq8u3zqIF6uQAU4y4-zh0U",
    authDomain: "fir-tamalero.firebaseapp.com",
    projectId: "fir-tamalero",
    storageBucket: "fir-tamalero.appspot.com",
    messagingSenderId: "233842132923",
    appId: "1:233842132923:web:175c9f8427ead12b38669e",
    measurementId: "G-12BEJN0Y7T",
  };

  // Inicializar Firebase solo si no existe
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();

  // Verificar estado de autenticación
  auth.onAuthStateChanged((user) => {
    const loginButton = document.getElementById("login-button");
    const logoutButton = document.getElementById("logout-button");

    if (user) {
      // Usuario logueado
      if (loginButton) loginButton.style.display = "none";
      if (logoutButton) logoutButton.style.display = "block";

      // Actualizar UI para usuario logueado
      const userDisplay = document.getElementById("user-display");
      if (userDisplay) {
        userDisplay.textContent = user.email || "Usuario";
        userDisplay.style.display = "inline-block";
      }
    } else {
      // Usuario no logueado
      if (loginButton) loginButton.style.display = "block";
      if (logoutButton) logoutButton.style.display = "none";
    }
  });

  // Manejar logout
  const logoutBtn = document.getElementById("logout-button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      auth
        .signOut()
        .then(() => {
          window.location.href = "index.html";
        })
        .catch((error) => {
          console.error("Error al cerrar sesión:", error);
          alert("Error al cerrar sesión: " + error.message);
        });
    });
  }
});
