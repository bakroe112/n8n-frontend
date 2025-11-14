import { RouterProvider } from "react-router-dom"
import { itemRouter } from "./itemRouter"

export const MainRouter = ()=>{
    return <RouterProvider router={itemRouter} />
}