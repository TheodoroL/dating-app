import { Routes } from '@angular/router';
import { SplashComponent } from './pages/splash/splash.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileDetailsComponent } from './pages/profile-details/profile-details.component';
import { HomeComponent } from './pages/home/home.component';
import  { UserListComponent } from './pages/user-list/user-list.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { ConversationComponent } from './pages/conversation/conversation.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
    {
        path: '',
        component: SplashComponent,
        canActivate: [guestGuard]
    },
    {
        path: "login",
        component: LoginComponent,
        canActivate: [guestGuard]
    },
    {
        path:'register',
        component : ProfileDetailsComponent,
        canActivate: [guestGuard]
    },
    {
        path:"home",
        component: HomeComponent,
        canActivate: [authGuard]
    },
    {
        path:"lists",
        component: UserListComponent,
        canActivate: [authGuard]
    },
    {
        path:"messages",
        component: MessagesComponent,
        canActivate: [authGuard]
    },
    {
        path:"chat/:matchId",
        component: ConversationComponent,
        canActivate: [authGuard]
    },
    {
        path:"profile",
        component: ProfileComponent,
        canActivate: [authGuard]
    }
];
