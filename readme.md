# CRUD de custumers

## Sobre

Este é um serviço de cadastro para clientes, em um baco de dados mongodb, utilizando lambdas com eventos http do api gateway, e envio de mensagens para topicos sns ao criar e atualizar dados de um usuario.

## Endpoints

### Create

Para criar um novo cadastro basta enviar o body em formato `json` com o metodo `post`, os seguintes campos são obrigatorios `name`, `email`, `birtdate`, `cpf` e `password`, caso um desses campos não seja enviada a api retornara um erro `400` com a mensagem `Erro de validação verifique os campos enviados`.

> /customers - POST

Body

```json
{
  "name": "nome",
  "email": "email",
  "birthdata": "data de nascimento",
  "cpf": "cpf 11 digitos",
  "password": "senha"
}
```

Response - 200

```json
{
  "data": {
    dados do customer criado
  }
}
```

### Update

Para atualizar dados de um customer, como a senha por exemplo, basta enviar o body em formato `json` com o campo que deseja atualizar, passando o \_id do mesmo via `pathParameters`.

> /customers/{\_id} - PUT

Body

```json
{
  "password": "nova senha"
}
```

Response - 200

```json
{
  "data": {novos dados do customer}
}
```

### Get

Para retornar a lista de customers cadastrados basta fazer uma solicitação `get` ao endpoint.

> /customers - GET

Response - 200

```json
{
  "data": [
    array de customer
  ]
}
```

### Get One

Para buscar apenas um usuario basta realizar uma solicitação `get` enviando o \_id do usuario via `pathParameters`.

> /customers/{\_id} - GET

Response - 200

```json
{
  "data": {
    dados do customer
  }
}
```

### Delete

Para deletar um customer basta enviar uma solicitação `delete` com o \_id do customer que quer deleta via `pathParameters`.

> /customers - DELETE

Response - 200

```json
{
  "data": {
    dados do customer deletado
  }
}
```

## SNS Topics

Este serviço possui dois topicos sns, um para quando o customer é criado e outro quando ele é atualizado.

### Create

Quando um customer novo é criado uma mensagem com o objeto do novo customer é enviada para tópico sns:

#### `crud-customers-infra-dev-SnsCreatedCustomerEvent`

### Update

Quando o customer tem algum dos seus dados alterados uma mensgaem é enviada para um tópico sns:

#### `crud-customers-infra-dev-SnsUpdatedCustomerEvent`
