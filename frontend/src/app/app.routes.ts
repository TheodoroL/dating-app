import { Routes } from '@angular/router';
import { SplashComponent } from './pages/splash/splash.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileDetailsComponent } from './pages/profile-details/profile-details.component';
import { HomeComponent } from './pages/home/home.component';
import  { UserListComponent } from './pages/user-list/user-list.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { ProfileComponent } from './pages/profile/profile.component';

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
    },
    {
        "path":"home",
        component: HomeComponent
    },
    {
        path:"lists",
        component: UserListComponent
    },
    {
        path:"messages",
        component: MessagesComponent
    },
    {
        path:"profile",
        component: ProfileComponent
    }
];
