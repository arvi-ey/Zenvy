import { createBrowserRouter } from "react-router-dom"
import { PATHS } from "./route-path"

import App from "@/App"
import Signin from "@/pages/auth/Signin"
import SignUp from "@/pages/auth/SignUp"
import VerifyEmail from "@/pages/auth/VerifyEmail"

export const router = createBrowserRouter([
    {
        path: PATHS.home,
        element: <App />,
    },
    {
        path: PATHS.signin,
        element: <Signin />,
    },
    {
        path: PATHS.signUp,
        element: <SignUp />
    },
    {
        path: PATHS.verifyEmail,
        element: <VerifyEmail />
    },

])