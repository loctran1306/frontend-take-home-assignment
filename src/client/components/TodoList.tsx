import { type SVGProps, useState } from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { useQueryClient } from '@tanstack/react-query'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'
import { useAutoAnimate } from '@formkit/auto-animate/react'

import { api } from '@/utils/client/api'

// animation

/**
 * QUESTION 3:
 * -----------
 * A todo has 2 statuses: "pending" and "completed"
 *  - "pending" state is represented by an unchecked checkbox
 *  - "completed" state is represented by a checked checkbox, darker background,
 *    and a line-through text
 *
 * We have 2 backend apis:
 *  - (1) `api.todo.getAll`       -> a query to get all todos
 *  - (2) `api.todoStatus.update` -> a mutation to update a todo's status
 *
 * Example usage for (1) is right below inside the TodoList component. For (2),
 * you can find similar usage (`api.todo.create`) in src/client/components/CreateTodoForm.tsx
 *
 * If you use VSCode as your editor , you should have intellisense for the apis'
 * input. If not, you can find their signatures in:
 *  - (1) src/server/api/routers/todo-router.ts
 *  - (2) src/server/api/routers/todo-status-router.ts
 *
 * Your tasks are:
 *  - Use TRPC to connect the todos' statuses to the backend apis
 *  - Style each todo item to reflect its status base on the design on Figma
 *
 * Documentation references:
 *  - https://trpc.io/docs/client/react/useQuery
 *  - https://trpc.io/docs/client/react/useMutation
 *
 *
 *
 *
 *
 * QUESTION 4:
 * -----------
 * Implement UI to delete a todo. The UI should look like the design on Figma
 *
 * The backend api to delete a todo is `api.todo.delete`. You can find the api
 * signature in src/server/api/routers/todo-router.ts
 *
 * NOTES:
 *  - Use the XMarkIcon component below for the delete icon button. Note that
 *  the icon button should be accessible
 *  - deleted todo should be removed from the UI without page refresh
 *
 * Documentation references:
 *  - https://www.sarasoueidan.com/blog/accessible-icon-buttons
 *
 *
 *
 *
 *
 * QUESTION 5:
 * -----------
 * Animate your todo list using @formkit/auto-animate package
 *
 * Documentation references:
 *  - https://auto-animate.formkit.com
 */
const STATUS_LIST = ['All', 'Pending', 'Completed']

export const TodoList = () => {
  // Tab Status
  const [statusChecked, setStatusChecked] = useState('All')

  // Render CPN Status
  const renderTodoList = () => {
    switch (statusChecked) {
      case 'Pending':
        return ['pending']
      case 'Completed':
        return ['completed']
      default:
        return ['completed', 'pending']
    }
  }
  const statuses: ('completed' | 'pending')[] = renderTodoList().map((status) =>
    status === 'completed' ? 'completed' : 'pending'
  )
  const { data: todos = [] } = api.todo.getAll.useQuery({
    statuses: statuses,
  })

  const { mutate: updateTodo } = api.todoStatus.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
  const queryClient = useQueryClient()
  const { mutate: deleteTodo } = api.todo.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  // animation
  const [parent] = useAutoAnimate()

  return (
    <>
      <Tabs defaultValue={statusChecked}>
        <TabsList className="TabsList space-x-2 ">
          <div className="flex flex-row space-x-2 pb-10">
            {STATUS_LIST.map((status) => (
              <>
                <TabsTrigger
                  onClick={() => setStatusChecked(status)}
                  className={`${
                    statusChecked === status ? 'bg-gray-700' : ''
                  } row-span flex h-11 w-auto flex-row gap-2 rounded-[9999px] border-[1px] border-solid border-gray-200 px-6 py-3 text-xs text-white`}
                  value={status}
                >
                  <p
                    className={`text-center text-[14px] font-[700] leading-5 ${
                      statusChecked === status ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {status}
                  </p>
                </TabsTrigger>
              </>
            ))}
          </div>
        </TabsList>
        <TabsContent value={statusChecked}>
          <ul ref={parent} className="grid grid-cols-1 gap-y-3">
            {todos.map((todo) => (
              <li key={todo.id}>
                <div className="relative flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm">
                  <Checkbox.Root
                    onCheckedChange={() =>
                      updateTodo({
                        status:
                          todo.status === 'pending' ? 'completed' : 'pending',
                        todoId: todo.id,
                      })
                    }
                    checked={todo.status === 'completed' ? true : false}
                    id={String(todo.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                  >
                    <Checkbox.Indicator>
                      <CheckIcon className="h-4 w-4 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>

                  <label
                    className={`block pl-3 font-medium ${
                      todo.status === 'completed'
                        ? 'text-gray-500 line-through'
                        : 'text-gray-700'
                    }`}
                    htmlFor={String(todo.id)}
                  >
                    {todo.body}
                  </label>

                  <button
                    className="absolute right-0 ml-4 mr-3 h-8 w-8 cursor-pointer justify-center gap-2 rounded-[10px] p-1 align-middle"
                    onClick={() => deleteTodo({ id: todo.id })}
                    title="Delete"
                    aria-label="Delete"
                    role="button"
                  >
                    <XMarkIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
      {/* <div className="row-auto flex space-x-2 pb-10">
        {STATUS_LIST.map((status) => (
          <>
            <button
              type="button"
              onClick={() => setStatusChecked(status)}
              className={`${
                statusChecked === status ? 'bg-gray-700' : ''
              } flex h-11 w-auto gap-2 rounded-[9999px] border-[1px] border-solid border-gray-200 px-6 py-3 text-xs text-white`}
            >
              <p
                className={`text-center text-[14px] font-[700] leading-5 ${
                  statusChecked === status ? 'text-white' : 'text-gray-700'
                }`}
              >
                {status}
              </p>
            </button>
          </>
        ))}
      </div>

      <ul className="grid grid-cols-1 gap-y-3">
        {todos.map((todo) => (
          <li key={todo.id}>
            <div className="relative flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm">
              <Checkbox.Root
                onCheckedChange={() =>
                  updateTodo({
                    status: todo.status === 'pending' ? 'completed' : 'pending',
                    todoId: todo.id,
                  })
                }
                checked={todo.status === 'completed' ? true : false}
                id={String(todo.id)}
                className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
              >
                <Checkbox.Indicator>
                  <CheckIcon className="h-4 w-4 text-white" />
                </Checkbox.Indicator>
              </Checkbox.Root>

              <label
                className={`block pl-3 font-medium ${
                  todo.status === 'completed'
                    ? 'text-gray-500 line-through'
                    : 'text-gray-700'
                }`}
                htmlFor={String(todo.id)}
              >
                {todo.body}
              </label>

              <button
                className="absolute right-0 ml-4 mr-3 h-8 w-8 cursor-pointer justify-center gap-2 rounded-[10px] p-1 align-middle"
                onClick={() => deleteTodo({ id: todo.id })}
                title="Delete"
                aria-label="Delete"
                role="button"
              >
                <XMarkIcon />
              </button>
            </div>
          </li>
        ))}
      </ul> */}
    </>
  )
}

const XMarkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

const CheckIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  )
}
