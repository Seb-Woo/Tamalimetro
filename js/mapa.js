// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAduH05WpscAJq8u3zqIF6uQAU4y4-zh0U",
  authDomain: "fir-tamalero.firebaseapp.com",
  projectId: "fir-tamalero",
  storageBucket: "fir-tamalero.appspot.com",
  messagingSenderId: "233842132923",
  appId: "1:233842132923:web:175c9f8427ead12b38669e",
  measurementId: "G-12BEJN0Y7T",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Variables globales
let map;
let interesLocations = false;
let interesMarkers = [];
let directionsService;
let directionsRenderer;
let manualMarkerPosition = null;
let currentMarker = null;
let userLocation = null; // Almacenará la ubicación del usuario
let isRouteVisible = true; // Controla si la ruta está visible
const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
const dialog = document.querySelector(".popup");

const lat = document.getElementById("latitude");
const lng = document.getElementById("longitude");
const buttonSet = document.getElementById("buttonSet");
const locationSelect = document.getElementById("locationSelect");
const iconSelect = document.getElementById("iconSelect");
const iconImage = document.getElementById("iconImage");
const popupLatitude = document.querySelector("#inpLatitude");
const popupLongitude = document.querySelector("#inpLongitude");
const pupopButton = document.querySelector("#pupopButton");
const inputPlace = document.querySelector("#placeName");
const smallWarning = document.querySelector("#warning");
const toggleRouteBtn = document.getElementById("toggleRouteBtn");

// Lista de iconos disponibles
const icons = [
  {
    iconName: "FLAG",
    src: "./images/mapIcons/flag.png",
    description: "Banderin",
  },
  { iconName: "PIN", src: "./images/mapIcons/pin.png", description: "Pin" },
  {
    iconName: "UBICATION",
    src: "./images/mapIcons/ubicacion.png",
    description: "Ubicacion",
  },
  { iconName: "X", src: "./images/mapIcons/x.png", description: "x" },
  { iconName: "CLIP", src: "./images/mapIcons/clip.png", description: "Clip" },
  { iconName: "LUPA", src: "./images/mapIcons/zoom.png", description: "zoom" },
];

// Lista de ubicaciones predefinidas
const locations = [
  { place: "UTLD", lat: "25.501762794398427", lng: "-103.55174782656077" },
  {
    place: "UJED CHEMISTRY AND ARCHITECTURE",
    lat: "25.584757",
    lng: "-103.501907",
  },
  {
    place: "UJED PSYCHOLOGY AND COMPUTING",
    lat: "25.558489",
    lng: "-103.510399",
  },
  { place: "TEC LERDO", lat: "25.552014736025964", lng: "-103.53654932166197" },
  {
    place: "UNI POLI NVV",
    lat: "24.022364974692273",
    lng: "-104.55388810430193",
  },
  {
    place: "A GREAT PLACE FOR EDDI",
    lat: "25.59254282079296",
    lng: "-103.50935972768204",
  },
  { place: "MY HOUSE", lat: "25.6042085848817", lng: "-103.48503127926602" },
];

// Llenar el select de ubicaciones
locations.forEach((location, i) => {
  let opt = document.createElement("option");
  opt.value = i;
  opt.innerHTML = location.place;
  locationSelect.appendChild(opt);
});

// Llenar el select de iconos
icons.forEach((icon, i) => {
  let opt = document.createElement("option");
  opt.value = i;
  opt.innerHTML = icon.iconName;
  iconSelect.appendChild(opt);
});

// Función para establecer la ubicación seleccionada
function setLocations() {
  let x1 = locationSelect.value;
  lat.value = locations[x1].lat;
  lng.value = locations[x1].lng;

  const y1 = { lat: parseFloat(lat.value), lng: parseFloat(lng.value) };
  map.setCenter(y1);
}

// Función para establecer las coordenadas
function setCoordinates() {
  const x1 = { lat: parseFloat(lat.value), lng: parseFloat(lng.value) };
  map.setCenter(x1);
}

// Función para agregar un marcador
function addMarker(location) {
  if (currentMarker) {
    currentMarker.setMap(null);
  }

  const selectedIconIndex = parseInt(iconSelect.value);
  if (isNaN(selectedIconIndex) || selectedIconIndex < 0) {
    alert("Please select an icon first.");
    return;
  }

  const selectedIcon = icons[selectedIconIndex];
  const image = {
    url: selectedIcon.src,
    size: new google.maps.Size(92, 92),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(10, 12),
  };

  currentMarker = new google.maps.Marker({
    map,
    position: location,
    icon: image,
  });

  manualMarkerPosition = location;
}

// Función para agregar información al popup
function addInfo(location) {
  lat.value = location.lat();
  lng.value = location.lng();
}

// Función para agregar datos a Firestore
async function addDB(data) {
  try {
    const selectedIconIndex = parseInt(iconSelect.value);
    await addDoc(collection(db, "locations"), {
      lat: data.lat,
      lng: data.lng,
      placename: data.placename,
      iconIndex: selectedIconIndex, // Guardar el índice del ícono
    });
    console.log("Location added to Firestore");
  } catch (error) {
    console.error("Error adding document: ", error);
  }
}

// Función para mostrar el popup
function showPopup(location) {
  popupLatitude.value = location.lat();
  popupLongitude.value = location.lng();
  dialog.showModal();
}

// Función para calcular la distancia y el tiempo de viaje
function calculateAndDisplayRoute(
  directionsService,
  directionsRenderer,
  origin,
  destination
) {
  directionsService.route(
    {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
        directionsRenderer.setMap(isRouteVisible ? map : null);

        const route = response.routes[0];
        const distance = route.legs[0].distance.text;
        const duration = route.legs[0].duration.text;

        document.getElementById("distance").value = distance;
        document.getElementById("drivingTime").value = duration;

        calculateTravelTimes(origin, destination);
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}

// Función para calcular los tiempos de viaje para diferentes modos de transporte
function calculateTravelTimes(origin, destination) {
  const travelModes = [
    { mode: google.maps.TravelMode.WALKING, elementId: "walkingTime" },
    { mode: google.maps.TravelMode.BICYCLING, elementId: "bicyclingTime" },
    { mode: google.maps.TravelMode.DRIVING, elementId: "motorcycleTime" },
  ];

  travelModes.forEach(({ mode, elementId }) => {
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: mode,
      },
      (response, status) => {
        if (status === "OK") {
          const duration = response.routes[0].legs[0].duration.text;
          document.getElementById(elementId).value = duration;
        } else {
          document.getElementById(elementId).value = "N/A";
        }
      }
    );
  });
}

// Función para actualizar la hora actual
function updateCurrentTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  document.getElementById("currentTime").value = timeString;
}

// Función para obtener la ubicación del usuario
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(userLocation); // Centrar el mapa en la ubicación del usuario
      },
      (error) => {
        console.error("Error getting user location:", error);
        userLocation = { lat: 25.501584265759714, lng: -103.551286103138 }; // Ubicación por defecto
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
    userLocation = { lat: 25.501584265759714, lng: -103.551286103138 }; // Ubicación por defecto
  }
}

// Función para manejar el toggle de la ruta
function toggleRouteVisibility() {
  isRouteVisible = !isRouteVisible;

  if (isRouteVisible) {
    directionsRenderer.setMap(map);
    toggleRouteBtn.innerHTML = '<i class="bi bi-eye-fill"></i> Hide Route';
  } else {
    directionsRenderer.setMap(null);
    toggleRouteBtn.innerHTML =
      '<i class="bi bi-eye-slash-fill"></i> Show Route';
  }
}

// Función para inicializar el mapa
async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    center: { lat: 25.501584265759714, lng: -103.551286103138 },
    zoom: 16,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

  // Obtener la ubicación del usuario
  getUserLocation();

  map.addListener("click", async (e) => {
    console.log("Click en el mapa:", e.latLng);

    if (interesLocations) {
      await showNearbyPlaces(e.latLng.lat(), e.latLng.lng());
    }

    addMarker(e.latLng);
    addInfo(e.latLng);

    const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };

    // Calcular la ruta desde la ubicación del usuario hasta el punto seleccionado
    if (userLocation) {
      calculateAndDisplayRoute(
        directionsService,
        directionsRenderer,
        userLocation,
        coords
      );
    } else {
      alert("Unable to get your current location. Using default location.");
      calculateAndDisplayRoute(
        directionsService,
        directionsRenderer,
        map.getCenter(),
        coords
      );
    }
  });

  map.addListener("contextmenu", function (e) {
    console.log("Funciona el click derecho en el mapa");
    console.log(e.latLng);

    showPopup(e.latLng);
    addInfo(e.latLng);

    const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
  });

  setInterval(updateCurrentTime, 1000);
}

// Función para actualizar la imagen del ícono
function setImage() {
  const selectedIconIndex = parseInt(iconSelect.value);
  if (!isNaN(selectedIconIndex) && selectedIconIndex >= 0) {
    iconImage.src = icons[selectedIconIndex].src;
  } else {
    iconImage.src = "";
  }
}

// Evento del botón del popup
pupopButton.addEventListener("click", (e) => {
  e.preventDefault();
  if (inputPlace.value.length == 0) {
    smallWarning.textContent = "Empty data!";
  } else {
    let data = {
      lat: parseFloat(popupLatitude.value),
      lng: parseFloat(popupLongitude.value),
      placename: inputPlace.value,
    };

    addDB(data);
    dialog.close();
    smallWarning.textContent = null;
  }
});

// Evento para el botón "+ Add new place"
const buttonAddNewPlace = document.getElementById("buttonaddnewplace");
buttonAddNewPlace.addEventListener("click", () => {
  if (manualMarkerPosition) {
    showPopup(manualMarkerPosition);
  } else {
    alert("Please place a marker on the map first.");
  }
});

// Evento para el botón de toggle de ruta
toggleRouteBtn.addEventListener("click", toggleRouteVisibility);

// Función para cargar marcadores desde Firestore
async function LoadMarkersFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, "locations"));

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const position = { lat: data.lat, lng: data.lng };
      const iconIndex = data.iconIndex || 0; // Usar el índice del ícono guardado, o 0 por defecto si no existe

      const selectedIcon = icons[iconIndex];
      const image = {
        url: selectedIcon.src,
        size: new google.maps.Size(92, 92),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(10, 12),
      };

      new google.maps.Marker({
        position: position,
        map: map,
        title: data.placename || "Unnamed Place",
        icon: image, // Asignar el ícono correspondiente
      });
    });

    console.log("Markers loaded from Firestore");
  } catch (error) {
    console.error("Error loading markers from Firestore:", error);
  }
}

// Inicializar el mapa y configurar eventos
initMap().then(LoadMarkersFromFirestore);
buttonSet.addEventListener("click", setCoordinates);
locationSelect.addEventListener("change", setLocations);
iconSelect.addEventListener("change", setImage);
