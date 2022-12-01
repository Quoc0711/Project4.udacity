import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo');
// TODO: create TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Handling createTodo event', {event});
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    if (!newTodo.name) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Error: Name of to do task is empty !'
        })
      }
    }
    const todo = await createTodo(event, newTodo);

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: todo
      })
    };
  }
)

handler.use(
  cors({
    credentials: true
  })
)
