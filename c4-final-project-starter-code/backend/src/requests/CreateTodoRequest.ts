/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateTodoRequest {
  name: string
  dueDate: string
}

export interface CreateSignedURLRequest {
  Bucket: string,
  Key: string,
  Expires: number
}
