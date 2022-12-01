import { TodosAccess } from '../dataLayer/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../lambda/utils';

const todosAccess = new TodosAccess()
const bucketName = process.env.ATTACHMENT_S3_BUCKET


export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    return todosAccess.getTodosForUser(userId)
}

export async function createTodo(event: APIGatewayProxyEvent, createTodoRequest: CreateTodoRequest) {
    const todoId = uuid.v4();
    const userId = await getUserId(event);
    const createdAt = new Date(Date.now()).toISOString();

    const todoItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
        ...createTodoRequest
    };
    await todosAccess.createTodo(todoItem);
    return todoItem;
}

export async function updateTodo(event: APIGatewayProxyEvent) {
    const userId = getUserId(event);
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
    const todoId = event.pathParameters.todoId;
    const newTodo = await todosAccess.updateTodo(userId, todoId, updatedTodo);
    return newTodo
}

export async function deleteToDo(event: APIGatewayProxyEvent) {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);
    if (!(await todosAccess.getTodoFromDB(todoId, userId))) {
        return false;
    }
    await todosAccess.deleteToDo(todoId, userId);
    return true;
}
