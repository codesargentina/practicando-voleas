// funciona espectacular


// --- Configuración del juego ---
const canvas = document.getElementById('juegoCanvas');
const ctx = canvas.getContext('2d');

let ANCHO_PANTALLA;
let ALTO_PANTALLA;

function redimensionarCanvas() {
    ANCHO_PANTALLA = window.innerWidth;
    ALTO_PANTALLA = window.innerHeight;
    canvas.width = ANCHO_PANTALLA;
    canvas.height = ALTO_PANTALLA;
}

window.addEventListener('resize', redimensionarCanvas);
redimensionarCanvas();

// Colores
const AMARILLO = 'rgb(255, 255, 0)';
const BLANCO = 'rgb(255, 255, 255)';

// Cargar el archivo de sonido
const sonidoPelota = new Audio('tennis-ball-hit-1.mp3');

// --- Variables de la "pelota" ---
const pelota = {
    posicion_x: ANCHO_PANTALLA / 2,
    posicion_y: ALTO_PANTALLA / 2,
    radio: 5,
    velocidad_x: 0,
    velocidad_y: 0,
    regresando: false,
};

// --- Variables del juego, botones y contador ---
let estadoJuego = "PAUSADO";

const velocidades = [
    { nombre: "Nivel 1", valor: 14.0 },
    { nombre: "Nivel 2", valor: 18.0 },
    { nombre: "Nivel 3", valor: 20.0 },
    { nombre: "Nivel 4", valor: 22.0 },
    { nombre: "Nivel 5", valor: 24.0 }
];
let velocidadActualIndice = 0;
let contadorGolpes = 0;

const velocidadBtn = document.getElementById('velocidad-btn');
const pausaBtn = document.getElementById('pausa-btn');
const reiniciarBtn = document.getElementById('menu-btn');

// --- Funciones auxiliares ---
function generarNuevaPelota() {
    pelota.posicion_x = ANCHO_PANTALLA / 2;
    pelota.posicion_y = ALTO_PANTALLA / 2;
    pelota.radio = 5;
    
    const velocidadBase = velocidades[velocidadActualIndice].valor;
    let angulo;

    // Generar un número aleatorio para determinar el sector de probabilidad
    const probabilidad = Math.random();

    if (probabilidad < 0.2) {
        // Sector 1: 0 a PI/4
        angulo = Math.random() * Math.PI / 4;
    } else if (probabilidad < 0.3) {
        // Sector 2: PI/4 a 3*PI/4
        angulo = Math.random() * Math.PI / 2 + Math.PI / 4;
    } else if (probabilidad < 0.7) {
        // Sector 3: 3*PI/4 a 5*PI/4
        angulo = Math.random() * Math.PI / 2 + 3 * Math.PI / 4;
    } else if (probabilidad < 0.8) {
        // Sector 4: 5*PI/4 a 7*PI/4
        angulo = Math.random() * Math.PI / 2 + 5 * Math.PI / 4;
    } else {
        // Sector 5: 7*PI/4 a 2*PI
        angulo = Math.random() * Math.PI / 2 + 7 * Math.PI / 4;
    }

    pelota.velocidad_x = Math.cos(angulo) * velocidadBase;
    pelota.velocidad_y = Math.sin(angulo) * velocidadBase;
    
    pelota.regresando = false;

    // Reproduce el sonido de la pelota
    sonidoPelota.currentTime = 0;
    sonidoPelota.play().catch(e => console.error("Error al reproducir el sonido:", e));
}

function dibujarTexto(texto, fuente, color, x, y, alineacion = 'center') {
    ctx.font = fuente;
    ctx.fillStyle = color;
    ctx.textAlign = alineacion;
    ctx.fillText(texto, x, y);
}

function actualizarJuego() {
    pelota.posicion_x += pelota.velocidad_x;
    pelota.posicion_y += pelota.velocidad_y;

    const distanciaAlCentro = Math.sqrt(Math.pow(pelota.posicion_x - ANCHO_PANTALLA / 2, 2) + Math.pow(pelota.posicion_y - ALTO_PANTALLA / 2, 2));
    pelota.radio = 5 + distanciaAlCentro * 0.05;

    if (!pelota.regresando) {
        if (pelota.posicion_y >= ALTO_PANTALLA || pelota.posicion_y <= 0 ||
            pelota.posicion_x >= ANCHO_PANTALLA || pelota.posicion_x <= 0) {
            
            contadorGolpes++;
            pelota.velocidad_x *= -1;
            pelota.velocidad_y *= -1;
            pelota.regresando = true;
        }
    }
    
    if (pelota.regresando) {
        if (distanciaAlCentro < 10) {
            generarNuevaPelota();
        }
    }
}

function dibujarJuego() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ANCHO_PANTALLA, ALTO_PANTALLA);

    // Dibuja la pelota
    ctx.beginPath();
    ctx.arc(pelota.posicion_x, pelota.posicion_y, pelota.radio, 0, 2 * Math.PI);
    ctx.fillStyle = AMARILLO;
    ctx.fill();
    ctx.closePath();

    // Dibuja el título y el contador
    dibujarTexto("Practicando Voleas", "36px sans-serif", BLANCO, 20, 50, 'left');
    dibujarTexto(`Golpes: ${contadorGolpes}`, "36px sans-serif", BLANCO, ANCHO_PANTALLA - 20, 50, 'right');
}

function buclePrincipal() {
    if (estadoJuego === "JUGANDO") {
        actualizarJuego();
        dibujarJuego();
    } else {
        dibujarJuego();
        dibujarTexto("PAUSADO", "72px sans-serif", AMARILLO, ANCHO_PANTALLA / 2, ALTO_PANTALLA / 2);
    }
    requestAnimationFrame(buclePrincipal);
}

// --- Manejo de eventos de botones ---
velocidadBtn.addEventListener('click', () => {
    velocidadActualIndice = (velocidadActualIndice + 1) % velocidades.length;
    velocidadBtn.textContent = `Velocidad: ${velocidades[velocidadActualIndice].nombre}`;
    generarNuevaPelota();
});

pausaBtn.addEventListener('click', () => {
    if (estadoJuego === "JUGANDO") {
        estadoJuego = "PAUSADO";
        pausaBtn.textContent = "Continuar";
    } else {
        estadoJuego = "JUGANDO";
        pausaBtn.textContent = "Pausa";
        generarNuevaPelota();
    }
});

reiniciarBtn.addEventListener('click', () => {
    contadorGolpes = 0;
    estadoJuego = "PAUSADO";
    pausaBtn.textContent = "Continuar";
    generarNuevaPelota();
});

// Iniciar el bucle de animación
buclePrincipal();
