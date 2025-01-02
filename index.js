// Importamos el modulo dotenv *IMPORTANTE PONER PRIMERO QUE EL MODULO NOTE*
require('dotenv').config()

// Importa el módulo Express, que se utiliza para crear aplicaciones web en Node.js.
const express = require('express')
 
// Crea una instancia de la aplicación Express.
const app = express()


// Importamos el modelo Person
const Person = require('./models/person')

// Importa el módulo CORS, que permite solicitudes de diferentes orígenes.
const cors = require('cors');

// Habilita el soporte para solicitudes desde otros dominios.
app.use(cors())



// 1- Middleware para servir archivos estáticos desde la carpeta "dist".
app.use(express.static('dist'));

// 2- Middleware para registrar información sobre cada solicitud al servidor.
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method) // Muestra el método HTTP (GET, POST, etc.).
  console.log('Path:  ', request.path)   // Muestra la ruta de la solicitud.
  console.log('Body:  ', request.body)   // Muestra el cuerpo de la solicitud.
  console.log('---')
  next() // Pasa el control al siguiente middleware.
}

// 3- Middleware para analizar solicitudes JSON
app.use(express.json());

// 4- Aplica el middleware de registro de solicitudes.
app.use(requestLogger)

 



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
    // Condcion
    if (person) {
    // Si se encuentra la persona con el 'id' especificado, responde con ella en formato JSON.  
    response.json(person);
  } else { 
     // Si la persona con la identificación dada no existe, el servidor responderá a la solicitud con el código de estado HTTP 404 not found
     response.status(404).end()
  }
  }) 
  // Manejo de errores
  .catch (error => next (error)) // Pasa el error al middleware de manejo de errores de Express, permitiendo que el servidor lo registre o maneje según esté configurado.
})

  // Ruta para obtener la información
  app.get('/info', (request, response) =>{
    // Creamos la variable con la Fecha
    const date = new Date(); // Fecha y hora actual
    
    // Usamos el Método countDocuments para sacar la información directamente de la base de datos
    Person.countDocuments() // Cuenta el número de personas en la base de datos
    .then ((count) => { // Si cuenta el número entonces

      // Respuesta con la información solicitada
      response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${date}</p>
    `);
  })
  // Manejo de errores
  .catch (error => next (error)) // Pasa el error al middleware de manejo de errores de Express, permitiendo que el servidor lo registre o maneje según esté configurado.
});

// Definimos otra ruta DELETE para eliminar un recurso mediante su ID
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id) // Utiliza el método findByIdAndDelete para buscar el id y eliminarlo
  .then(result => {
    response.status(202).end() // Responde con 202 No content en ambos casos si no existe y si se eliminó
  })
  // Manejo de errores 
  .catch(error => next(error)) // Pasa el error al middleware de Express
})



// Ruta para agregar nuevas entradas
app.post('/api/persons', (request, response) => {
    const body = request.body;

   // Validar que 'name' y 'phone' están presentes
   if (!body.name || body.phone === undefined) {
    return response.status(400).json({ error: 'Name or phone number is missing' });
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
    .catch (error => next (error)) // Pasa el error al middleware de Express
});

// Ruta para actualizar el número de teléfono en la base de datos si el nombre ya existe.
app.put('/api/persons/:id', (request, response, next) => {
  // Extreamos los campos name y phone del cuerpo body
  const {name, phone} = request.body;

  // Creamos un nuevo objeto con los campos de la persona actualizado
  const updatedPerson = {name, phone};

  // Método para encontrar a la persona por el ID y actualizar
  Person.findByIdAndUpdate(
    request.params.id, // Es el ID de la persona que queremos actualizar. Se toma de la URL
    updatedPerson, // Es el objeto con los nuevos valores (name y phone).
    {
      new: true, // Indica que queremos el documento actualizado como resultado.
      runValidators: true, // Habilita las validaciones definidas en el modelo de Mongoose
      context: 'query' // Asegura que las validaciones funcionen correctamente en operaciones de actualización.
    }
  )
  // Resultado
  .then(updatedPerson => { // Si la operación fue exitosa
     // Condicion
     if (updatedPerson) { // Si se encuentra y actualiza la persona
     response.json(updatedPerson) // enviamos el documento actualizado como respuesta (response.json).
     } else { // Si no la encuentra
     response.status(404).json({error: 'Person not found'})
     }
  })
    // Manejo de errores
    .catch (error => next (error)) // Pasa el error al middleware de Express
})


// 5- Middleware para manejar solicitudes a endpoints desconocidos.
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' }) // Devuelve un error 404 si la ruta no existe.
}

// 6- Aplica el middleware para manejar endpoints desconocidos.
app.use(unknownEndpoint)

// 7- Maiddleware para manejo de errores de Express
const errorHandler = (error, request, response, next) => {
  // Imprime un mensaje de error en la consola
  console.log(error.message);

  // Verificacion del tipo de error
  if (error.name === 'CastError') { // Error al no encontrar el ID
   return response.status(400).send({error: `Malformed id`}) 
  } else if (error.name === 'ValidationError') { // Manejo de error al registrar una nueva persona
   return response.status(400).json({error: error.message})
  } 
  next(error)//Se pasa al siguiente middleware
}

  


// 8- Aplicar el middleware errorHandler *DEBE ESTAR AL FINAL*
app.use(errorHandler)
  
// Define el puerto en el que se ejecutará el servidor.
// Si no está definido en las variables de entorno, usa el puerto 3001.
const PORT = process.env.PORT 
// Inicia el servidor y muestra un mensaje indicando el puerto.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
  

