// Importar el modulo Mongoose
const mongoose = require('mongoose');

// Configura mongoose para no lanzar advertencias relacionadas con las consultas estrictas de Mongo DB
mongoose.set(`strictQuery`, false)

// Obtien la contraseña desde la variable de entorno dotenv (.env)
const url = process.env.MONGODB_URI

// Imprime un mensaje n la consola para confirmar que la contraseña es la correcta
console.log(`connecting to:`, url);

// Intentar conectar a la base de datos a través de la variable de entorno
mongoose.connect(url)
// Resultado
.then(result =>{
    // Si la conexión es exitosa se imprime un mensaje
    console.log('connected to MongoDB');
    })
    // Manejo de errores
    .catch(error =>{
        // Si no logra conectar imprime un mensaje de error
        console.log('error to connecting to MongoDB:', error.message);
            })

// Definir el esquema de la base de datos (Schema)
const personSchema = new mongoose.Schema({
    name: String,
    phone: String,
})

// Configura cómo se debe transformar la nota cuando se convierta a formato JSON (por ejemplo, al enviarla a través de una API).
personSchema.set('toJSON', {
    transform: (document, returnedObject) => { // Transforma 
             // Crea un campo "id" a partir del "_id" de MongoDB (que es un objeto) y lo convierte a una cadena.
             returnedObject.id = returnedObject._id.toString()

             // Elimina el campo ID original
             delete returnedObject._id
             // Elimina el campo __v
             delete returnedObject.__v
    }
})

// Exportar el modelo Person
module.exports = mongoose.model('Person', personSchema)