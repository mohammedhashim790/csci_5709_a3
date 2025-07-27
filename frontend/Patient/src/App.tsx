import Router from './router/Router';
import {setJwtDecode} from "../../shared-modules/src/user_auth/user_auth.ts";
import {jwtDecode} from "jwt-decode";


setJwtDecode(jwtDecode);

function App() {
    return (<>
        <Router/>
    </>)
}

export default App
