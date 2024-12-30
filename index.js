// Importamos el modulo dotenv *IMPORTANTE PONER PRIMERO QUE EL MODULO NOTE*
require('dotenv').config()

// Importa el módulo Express, que se utiliza para crear aplicaciones web en Node.js.
const express = require('express')
 
// Crea una instancia de la aplicación Express.
const app = express()

// Importamos el middleware Morgan
const morgan = require('morgan')

// Importamos el modelo Person
const Person = require('./models/person')


// Middleware para analizar solicitudes JSON
app.use(express.json());

 
// Token personalizado para registrar el cuerpo de las solicitudes
morgan.token('body', (request) => JSON.stringify(request.body));

// Configuramos Morgan para mostrar el cuerpo de las solicitudes POST
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));




// Middleware para servir archivos estáticos desde la carpeta "dist".
app.use(express.static('dist'))

// Middleware para registrar información sobre cada solicitud al servidor.
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method) // Muestra el método HTTP (GET, POST, etc.).
  console.log('Path:  ', request.path)   // Muestra la ruta de la solicitud.
  console.log('Body:  ', request.body)   // Muestra el cuerpo de la solicitud.
  console.log('---')
  next() // Pasa el control al siguiente middleware.
}

// Importa el módulo CORS, que permite solicitudes de diferentes orígenes.
const cors = require('cors');


// Habilita el soporte para solicitudes desde otros dominios.
app.use(cors())

// Middleware para analizar datos JSON en las solicitudes entrantes.
app.use(express.json())
// Aplica el middleware de registro de solicitudes.
app.use(requestLogger)

// Middleware para manejar solicitudes a endpoints desconocidos.
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' }) // Devuelve un error 404 si la ruta no existe.
}

// Ruta para obtener todos los numeros telefonicos  
  app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons =>{ // Obtiene las personas desde person.js
      console.log(persons); // Verifica que los datos incluyen `phone`
    response.json(persons)
  })
  // Manejo de errores
  .catch ((error) => next (error));
  })

  // Ruta para obtener un registro específico
app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  }) 
})

  // Ruta para obtener la información
  app.get('/info', (request, response) =>{
    // Creamos la variable con la Fecha
    const date = new Date(); // Fecha y hora actual
    // Creamos la variable para que muestre la cantida de personas registradas
    const count = person.length // Método para recorrer todo el array

      // Respuesta con la información solicitada
      response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${date}</p>
    `);
});

// Definimos otra ruta DELETE para eliminar un recurso mediante su ID
// La ruta incluye un parámetro de ruta dinámico `:id`, que se podrá capturar desde la URL.
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);

    // Verificar si existe el registro antes de eliminarlo
    const personExists = persons.some(person => person.id === id);

    if (personExists) {
        // Filtrar la lista de personas para eliminar el registro
        persons = persons.filter(person => person.id !== id);

        // Responder con el código 204 (sin contenido)
        response.status(204).end();
    } else {
        // Si no se encuentra el registro, devolver un error 404
        response.status(404).send({ error: 'Person not found' });
    }
});



// Ruta para agregar nuevas entradas
app.post('/api/persons', (request, response) => {
    const body = request.body;

    // Validación: Nombre y número son obligatorios
    if (!body.name || !body.phone) {
        return response.status(400).json({
            error: 'name and number are required'
        });
    }



    // Creación del nuevo objeto 'person'
    const person = new Person ({
      name: body.name,
      phone: body.phone,
    });

    // Intenta salvar la persona en la base de datos
    person
    .save()
    .then((savedPerson) => {
      // Si se guarda con éxito, responde con el objeto de la nota guardada.
      response.json(savedPerson);
    })
    // Manejo de errores
    .catch((error) => {
      // Si ocurre un error durante el guardado, responde con un código de estado 500 (Error interno del servidor).
      response.status(500).json({error: 'error saving person'});
    })
});

// Aplica el middleware para manejar endpoints desconocidos.
app.use(unknownEndpoint)
  
// Define el puerto en el que se ejecutará el servidor.
// Si no está definido en las variables de entorno, usa el puerto 3001.
const PORT = process.env.PORT 
// Inicia el servidor y muestra un mensaje indicando el puerto.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
  

