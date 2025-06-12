// Paso 1: Instalar la dependencia en una terminal: npm install -g firebase-tools
// Paso 2: Revisar la instalación: firebase --version
// Paso 3: Iniciar sesión en la terminal dentro de la carpeta del proyecto: firebase login
// Paso 4: Iniciar las funciones: firebase init functions
// Paso 5: Ajustar la función en este archivo y desplegar: firebase deploy --only functions

// Después de modificar el archivo hay que ejecutar el siguiente comando:
// firebase deploy --only functions

/* Para probar el código antes de desplegarlo, podemos emular funciones de Firebase localmente con:
firebase emulators:start
Luego, en ESP32 usar http://<IP_LOCAL>:5001/proyecto/us-central1/guardarDatosESP32 en lugar de la URL de producción. */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.guardarDatosESP32 = functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).send("Método no permitido");
    }

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send("Error: No se recibieron datos válidos.");
    }

    try {
        const { id, ...datos } = req.body; // Extrae el ID del documento y los datos

        if (!id) {
            return res.status(400).send("Error: Se requiere un ID de documento.");
        }

        datos.timestamp = admin.firestore.FieldValue.serverTimestamp(); // Sobrescribe el timestamp

        await db.collection("Usuarios").doc(id).set(datos, { merge: true });

        return res.status(200).send(`Datos guardados correctamente en Firestore en el documento ${id}.`);
    } catch (error) {
        console.error("Error al guardar en Firestore:", error);
        return res.status(500).send("Error al guardar en Firestore: " + error.message);
    }
});
