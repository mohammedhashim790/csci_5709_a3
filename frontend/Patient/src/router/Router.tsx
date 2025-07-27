import {lazy, Suspense} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import AElement from "../pages/a/components/AElement.tsx";
import PatientDashboard from "../pages/dashboard/dashboard.tsx";
import Login from "../pages/authentication/login/Login.tsx";
import ForgotPassword from "../pages/authentication/forgotpassword/ForgotPassword.tsx";



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
