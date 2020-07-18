const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json()); // Interpretar recebimento de JSON
app.use(cors());

/**
 * Métodos HTTP:
 * 
 * GET: Buscar informações do backend
 * POST: Criar uma insformação no backend
 * PUT/PATCH: Alterar uma informação no backend
 * DEETE: Deletar uma informação no backend
 */

 /**
  * Tipos de parâmetros:
  * 
  * Query Params: Filtros e paginação
  * Route Params: Identificar recursos (Alterar/Deleter)
  * Request Body: Conteúdo na hora de criar ou editar um recurso (JSON)
  */

/**
 * Middleware:
 * 
 * Interceptador de requisições que 
 * interrompe totalmente a requisição ou 
 * alterar dados da requisição
 */
const repositories = [];  // Emular um BD/Tabela para receber as informações

function logRequest(request, response, next) {
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`

  console.time(logLabel)
  
  next();
  
  console.timeEnd(logLabel)
}


function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if(!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid project ID'})
  }

  return next();
}

function findRepository(request, response, next) {
  const { id } = request.params;

  const index = repositories.findIndex(repository => repository.id === id);

  if (index < 0) return response.status(400).json({ error: "Repository not found" })

  request.repoIndex = index;

  return next();
}

app.use(logRequest);
app.use('/repositories/:id', validateRepositoryId);
app.use('/repositories/:id', findRepository);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  }

  repositories.push(repository); // Adcionar informações ao final da lista

  return response.json(repository); // Retornar nova lista recem criada
});

app.put("/repositories/:id", (request, response) => {
  const { title, url, techs } = request.body;

  const { id } = request.params

  const repository = {
    id: id,
    title,
    url,
    techs,
    likes: repositories[request.repoIndex].likes,
  }

  repositories[request.repoIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  repositories.splice(request.repoIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  repositories[request.repoIndex].likes += 1;

  return response.json(repositories[request.repoIndex]);
});

module.exports = app;
