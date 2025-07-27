import {lazy, Suspense} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import AElement from "../pages/a/components/AElement.tsx";


const Login = lazy(() => import('../pages/authentication/login/Login'));
const ForgotPassword = lazy(() => import('../pages/authentication/forgotpassword/ForgotPassword'));
const PatientDashboard = lazy(() => import('../pages/dashboard/dashboard.tsx'));

const Router = () => {
    return (<BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/" element={<AElement/>}>
                    <Route index element={<PatientDashboard/>}/>
                </Route>
                <Route path="/login" element={<Login/>}/>
                <Route path="/forgotPassword" element={<ForgotPassword/>}/>
            </Routes>
        </Suspense>
    </BrowserRouter>);
}

export default Router;
