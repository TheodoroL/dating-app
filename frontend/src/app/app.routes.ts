import { Routes } from '@angular/router';
import { SplashComponent } from './pages/splash/splash.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileDetailsComponent } from './pages/profile-details/profile-details.component';
export const routes: Routes = [
    {
        path: '',
        component: SplashComponent
    },
    {
        path: "login",
        component: LoginComponent
    },
    {
        path:'register',
        component : ProfileDetailsComponent
    }
];
