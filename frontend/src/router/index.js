import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import HomeView from '../views/HomeView.vue'
import CommunitiesView from '../views/CommunitiesView.vue'
import LoginView from '../views/LoginView.vue'
import EventsView from '../views/EventsView.vue'
import ProfileView from '../views/ProfileView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView
    },
    {
        path: '/communities',
        name: 'Communities',
        component: CommunitiesView
    },
    {
        path: '/events',
        name: 'Events',
        component: EventsView
    },
    {
        path: '/events/:id',
        name: 'EventDetails',
        component: () => import('../views/EventDetailsView.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('../views/ForgotPasswordView.vue')
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('../views/ResetPasswordView.vue')
    },
    {
        path: '/verify-email',
        name: 'VerifyEmail',
        component: () => import('../views/VerifyEmailView.vue')
    },
    {
        path: '/signup',
        name: 'Signup',
        component: () => import('../views/SignupView.vue')
    },
    {
        path: '/profile',
        name: 'Profile',
        component: ProfileView,
        meta: { requiresAuth: true }
    },
    {
        path: '/settings',
        name: 'Settings',
        component: SettingsView,
        meta: { requiresAuth: true }
    },
    {
        path: '/help',
        name: 'Help',
        component: () => import('../views/ContactView.vue')
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('../views/AboutView.vue')
    },
    {
        path: '/apply',
        name: 'Apply',
        component: () => import('../views/ApplyView.vue')
    },
    {
        path: '/community-applications',
        name: 'CommunityApplications',
        component: () => import('../views/CommunityApplications.vue')
    },

]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // always scroll to top
        return { top: 0 }
    }
})

router.beforeEach((to, from, next) => {
    // 1. Gidilecek sayfa giriş yapmayı gerektiriyor mu?
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    // 2. LocalStorage'dan user_token'ı al (Geçen adımda bulduğumuz anahtar)
    const isAuthenticated = localStorage.getItem('user_token');

    if (requiresAuth && !isAuthenticated) {
        // Sayfa korumalı ve kullanıcı giriş yapmamış -> Login'e yolla
        next('/login');
    } else {
        // Sorun yok, içeri geçebilir
        next();
    }
});

export default router
