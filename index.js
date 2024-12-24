// Importa el módulo Express, que se utiliza para crear aplicaciones web en Node.js.
const express = require('express')
 
// Crea una instancia de la aplicación Express.
const app = express()

// Importamos el middleware Morgan
const morgan = require('morgan')

// Middleware para analizar solicitudes JSON
app.use(express.json());

 
// Token personalizado para registrar el cuerpo de las solicitudes
morgan.token('body', (request) => JSON.stringify(request.body));

// Configuramos Morgan para mostrar el cuerpo de las solicitudes POST
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));


// Define una lista inicial de personas como datos simulados.
let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
]


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
const cors = require('cors')

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
    response.json(persons)
  })

  // Ruta para obtener un registro específico
app.get('/api/persons/:id', (request, response) => {
    // Extraemos el parametro ID del array y lo convertimos en un valor numerico
    const id = Number(request.params.id);
    // Usamos el método find para encontrar el ID solicitdado
    const person = persons.find(person => person.id === id);
 
    // Condicional
    if (person) { // Si encuentra el ID responde con el método Find con el ID solicitado
        response.json(person);
    } else { // Si no lo encuentra responde con el error 404
        response.status(404).end();
    }
});

  // Ruta para obtener la información
  app.get('/info', (request, response) =>{
    // Creamos la variable con la Fecha
    const date = new Date(); // Fecha y hora actual
    // Creamos la variable para que muestre la cantida de personas registradas
    const count = persons.length // Método para recorrer todo el array

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

// Manejadores para agregar nuevas entradas
// Ruta para crear un ID único para la nueva entrada
const generateId =()=> {
    // Si el array 'persons' tiene elementos, obtenemos el mayor ID existente
    const maxId = persons.length > 0
    // Creamos un array con los IDs de las personas y encontramos el mayor
    ? Math.max(...persons.map(p => p.id)) // El array se puede transformar en números individuales mediante el uso de la sintaxis de spread (tres puntos) 
    :0; // Si el array está vacío, el mayor ID es 0

    // Retornamos el siguiente ID, asegurándonos de que sea único
    return maxId +1 ;
};

// Ruta para agregar nuevas entradas
app.post('/api/persons', (request, response) => {
    const body = request.body;

    // Validación: Nombre y número son obligatorios
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name and number are required'
        });
    }

    // Validación: El nombre debe ser único
    const nameExists = persons.some(person => person.name === body.name);
    if (nameExists) {
        return response.status(400).json({
            error: 'name must be unique'
        });
    }

    // Creación del nuevo objeto 'person'
    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    };

    // Agregar la nueva entrada al array
    persons = persons.concat(person);

    // Responder con el objeto recién creado
    response.json(person);
});

// Aplica el middleware para manejar endpoints desconocidos.
app.use(unknownEndpoint)
  
// Define el puerto en el que se ejecutará el servidor.
// Si no está definido en las variables de entorno, usa el puerto 3001.
const PORT = process.env.PORT || 3001
// Inicia el servidor y muestra un mensaje indicando el puerto.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
  

