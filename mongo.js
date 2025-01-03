const mongoose = require('mongoose')

// Comprueba que el programa funciona con tres argumentos de línea de comando
if(process.argv.length < 3) {
  // Imprime en la consola error
  console.log('Usage: node mongo.js <password> [name] [phone]')
  process.exit(1)
}

// Argumentos
// Obtiene el argumento contraseña
const password = process.argv[2]
// Obtiene el argumento nombre
const name = process.argv[3]
// Obtiene el argumento numero
const phone = process.argv[4]

// Conecta a Mongoose con la URI de MongoDB Atlas
const url =
`mongodb+srv://fullstack:${password}@cluster0.ysntw.mongodb.net/agenda_telefonica?retryWrites=true&w=majority&appName=Cluster0`

// Configurar para no usar el modo estricto de Mongoose
mongoose.set('strictQuery', false)

// Conecta a la URI proporcionada
mongoose.connect(url)

// Define el Esquema - Schema
const personSchema = new mongoose.Schema({
  name: String, // Define el argumento name como cadena
  phone: String, // Define el argumento phone como cadena
})

// Crea un modelo basado en el esquema definido
// El modelo se usará para interactuar con la colección en la base de datos
const Person = mongoose.model('Person', personSchema)

// Lógica principal del programa
// Condicional
if (!name && !phone) {
  // Si no se pasa un nombre ni un teléfono, muestra todas las entradas de la agenda
  Person.find({}) // Método para buscar todos los elemntos de la colección
    .then((result) => {
      // Imprime un encabezado
      console.log('PhoneBook')
      result.forEach(person => {
        // Imprime cada entrada en la agenda
        console.log(`${person.name} ${person.phone}`)
      })
      // Cierra la conexión
      mongoose.connection.close()
    })
    // Condicion si se proporciona un nombre y un teléfono, agrega una nueva entrada
} else if (name && phone) {
  // Crea una nueva entrada
  const person = new Person({
    name: name, // Asigna el nombre proporcionado
    phone: phone, // Asigna el teléfono proporcionado
  })
  // Guarda la nueva entrada en la BD
  person.save()
    .then(() => {
      // Imprime un mensaje confirmando que la entrada se guardó
      console.log(`added ${name} number ${phone} to phonebook`)
      // Cierra la conexión al guardar
      mongoose.connection.close()
    })
    // Manejo de errores al guardar la entrada
    .catch(error => {
      // Imprime un mensaje en la consola
      console.log('Error saving data:', error)
      // Cierra la conexión incluso si ocurrió algun error
      mongoose.connection.close()
    })
    // Condicion: Si no se pasa un nombre o un teléfono (por ejemplo, falta un argumento)
} else {
  // Imprime un mensaje en la consola solicitando un nombre o telefono
  console.log('Please provide both name and phone to add a new entry.')
  // Cierra la conexión en este caso también
  mongoose.connection.close()
}
