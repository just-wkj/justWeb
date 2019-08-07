import Main from '@/views/Main.vue';

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: 'Login - 登录'
    },
    component: () => import('@/views/login.vue')
};

export const page404 = {
    path: '/*',
    name: 'error_404',
    meta: {
        title: '404-页面不存在'
    },
    component: () => import('@/views/error_page/404.vue')
};

export const page403 = {
    path: '/403',
    meta: {
        title: '403-权限不足'
    },
    name: 'error_403',
    component: () => import('@//views/error_page/403.vue')
};

export const page500 = {
    path: '/500',
    meta: {
        title: '500-服务端错误'
    },
    name: 'error_500',
    component: () => import('@/views/error_page/500.vue')
};

export const locking = {
    path: '/locking',
    name: 'locking',
    component: () => import('@/views/main_components/lock_screen/components/locking-page.vue')
};

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    redirect: '/home',
    component: Main,
    children: [
        {
            path: 'home',
            title: {i18n: 'home'},
            name: 'home_index',
            component: () => import('@/views/home/home.vue')
        },
        {
            path: 'own',
            title: '个人中心',
            name: 'own_index',
            component: () => import('@/views/own/index.vue')
        },
        {
            path: 'request/:hash',
            title: '请求参数',
            name: 'interface_request',
            component: () => import('@/views/interface/request.vue')
        },
        {
            path: 'response/:hash',
            title: '返回参数',
            name: 'interface_response',
            component: () => import('@/views/interface/response.vue')
        },
    ]
};

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
export const appRouter = [
    {
        path: '/system',
        icon: 'wrench',
        name: 'system',
        title: '系统配置',
        component: Main,
        children: [
            {
                path: 'menu',
                icon: 'navicon-round',
                name: 'menu',
                access: 'admin/Menu/index',
                title: '菜单维护',
                component: () => import('@/views/system/menu.vue')

            },
            {
                path: 'user',
                icon: 'ios-people',
                name: 'user',
                access: 'admin/User/index',
                title: '用户管理',
                component: () => import('@/views/system/user.vue')
            },
            {
                path: 'auth',
                icon: 'locked',
                name: 'auth',
                access: 'admin/Auth/index',
                title: '权限管理',
                component: () => import('@/views/system/auth.vue')
            },
            {
                path: 'shop',
                icon: 'ios-person',
                name: 'shop',
                access: 'admin/Shop/getList',
                title: '商家管理',
                component: () => import('@/views/system/shop.vue')
            },
            {
                path: 'log',
                icon: 'clipboard',
                name: 'log',
                access: 'admin/Log/index',
                title: '操作日志',
                component: () => import('@/views/system/log.vue')
            }
        ]
    },
    {
        path: "/app",
        icon: "android-cloud",
        name: "app",
        title: "应用接入",
        component: Main,
        children: [
            {
                path: "group",
                icon: "ios-box",
                name: "app_group",
                access: 'admin/AppGroup/index',
                title: "应用分组",
                component: () => import('@/views/app/group.vue')
            },
            {
                path: "index",
                icon: "ios-list",
                name: "app_index",
                access: 'admin/App/index',
                title: "应用列表",
                component: () => import('@/views/app/list.vue')
            }
        ]
    },
    {
        path: "/interface",
        icon: "navigate",
        name: "interface",
        title: "接口管理",
        component: Main,
        children: [
            {
                path: "group",
                icon: "folder",
                name: "interface_group",
                access: 'admin/InterfaceGroup/index',
                title: "接口分组",
                component: () => import('@/views/interface/group.vue')
            },
            {
                path: "list",
                icon: "document",
                name: "interface_list",
                access: 'admin/InterfaceList/index',
                title: "接口列表",
                component: () => import('@/views/interface/list.vue')
            }
        ]
    },
    {
        path: "/customer",
        icon: "ios-telephone",
        name: "customer",
        title: "客户管理",
        component: Main,
        children: [
            {
                path: "customer",
                icon: "shuffle",
                name: "customer_customer",
                access: 'admin/Customer/getList',
                title: "客户列表",
                component: () => import('@/views/customer/customer.vue')
            }
        ]
    },
    {
        path: "/train",
        icon: "ios-telephone",
        name: "train",
        title: "培训管理",
        component: Main,
        children: [
            {
                path: "train",
                icon: "shuffle",
                name: "train_train",
                access: 'admin/Train/getList',
                title: "培训列表",
                component: () => import('@/views/train/train.vue')
            },
            {
                path: "user",
                icon: "shuffle",
                name: "train_user",
                access: 'admin/TrainUser/getList',
                title: "培训报名列表",
                component: () => import('@/views/train/user.vue')
            }
        ]
    },
    {
        path: "/marry",
        icon: "ios-telephone",
        name: "marry",
        title: "婚姻家庭管理",
        component: Main,
        children: [
            {
                path: "marry",
                icon: "shuffle",
                name: "marry_marry",
                access: 'admin/MarryMeditation/getList',
                title: "婚姻家庭列表",
                component: () => import('@/views/marry/marry.vue')
            }
        ]
    },
    {
        path: "/female",
        icon: "ios-telephone",
        name: "female",
        title: "女性维权管理",
        component: Main,
        children: [
            {
                path: "rights",
                icon: "shuffle",
                name: "female_rights",
                access: 'admin/FemaleRights/getList',
                title: "女性维权报名",
                component: () => import('@/views/female/rights.vue')
            },
            {
                path: "appointment",
                icon: "shuffle",
                name: "female_appointment",
                access: 'admin/FemaleAppointment/getList',
                title: "预约面谈",
                component: () => import('@/views/female/appointment.vue')
            }
        ]
    },
    {
        path: "/activity",
        icon: "ios-telephone",
        name: "activity",
        title: "社区活动管理",
        component: Main,
        children: [
            {
                path: "activity",
                icon: "shuffle",
                name: "activity_activity",
                access: 'admin/Activity/getList',
                title: "社区活动列表",
                component: () => import('@/views/activity/activity.vue')
            },
            {
                path: "join",
                icon: "shuffle",
                name: "activity_join",
                access: 'admin/ActivityJoin/getList',
                title: "社区活动报名",
                component: () => import('@/views/activity/join.vue')
            }
        ]
    },
    {
        path: "/news",
        icon: "ios-paper",
        name: "news",
        title: "内容管理",
        component: Main,
        children: [
            {
                path: "type",
                icon: "shuffle",
                name: "news_type",
                access: 'admin/NewsType/getList',
                title: "分类列表",
                component: () => import('@/views/news/type.vue')
            },
            {
                path: "news",
                icon: "social-whatsapp",
                name: "news_news",
                access: 'admin/News/getList',
                title: "内容列表",
                component: () => import('@/views/news/news.vue')
            }
        ]
    },
    {
        path: "/setting",
        icon: "ios-settings",
        name: "setting",
        title: "基本设置",
        component: Main,
        children: [
            {
                path: "advert",
                icon: "settings",
                name: "setting_advert",
                access: 'admin/Advert/getList',
                title: "广告列表",
                component: () => import('@/views/setting/advert.vue')
            },
            {
                path: "jobguide",
                icon: "search",
                name: "setting_jobguide",
                access: 'admin/JobGuide/getList',
                title: "就业指导",
                component: () => import('@/views/setting/jobguide.vue')
            },
            {
                path: "feedback",
                icon: "search",
                name: "setting_feedback",
                access: 'admin/Feedback/getList',
                title: "意见反馈",
                component: () => import('@/views/setting/feedback.vue')
            }
        ]
    }
];

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
    loginRouter,
    otherRouter,
    locking,
    ...appRouter,
    page500,
    page403,
    page404
];
