import Vue from 'vue';
import iView from 'iview';
import Util from '../libs/util';
import VueRouter from 'vue-router';
import {routers} from './router';
import config from '../../build/config';
import axios from 'axios';
import store from '../store';

Vue.use(VueRouter);

// 路由配置
const RouterConfig = {
    routes: routers
};

export const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    let justToken = sessionStorage.getItem('justToken');
    iView.LoadingBar.start();
    Util.title(to.meta.title);
    if (sessionStorage.getItem('locking') === '1' && to.name !== 'locking') { // 判断当前是否是锁定状态
        next({
            replace: true,
            name: 'locking'
        });
    } else if (sessionStorage.getItem('locking') === '0' && to.name === 'locking') {
        next(false);
    } else {
        if (!justToken && to.name !== 'login') { // 判断是否已经登录且前往的页面不是登录页
            next({
                name: 'login'
            });
        } else if (justToken && to.name === 'login') { // 判断是否已经登录且前往的是登录页
            Util.title();
            next({
                name: 'home_index'
            });
        } else {
            // 统一处理请求的token
            axios.defaults.baseURL = config.baseUrl;
            // 请求拦截器
            axios.interceptors.request.use(function (config) {
                if (sessionStorage.getItem('justToken')) {
                    config.headers['justToken'] = sessionStorage.getItem('justToken');
                }

                return config;
            });

            // 设置响应拦截器
            axios.interceptors.response.use((response) => {
                // if (response.statue !== 200) {
                //     iView.Message.error('访问异常');
                // }
                console.log(response)
                // console.log(response.config.headers)
                let errCode = response.data.errCode;
                console.log(errCode)
                console.log(errCode === 0)
                if (errCode === 0) { // 成功处理
                    return response.data;
                } else if (errCode === 4002) { // 登录失效,直接去登录
                    store.commit('logout');
                    router('/login');
                } else { // 其他错误处理,统一返回错误信息,并且直接提示错误信息
                    iView.Message.error(response.data.msg);
                    throw response.data.message;
                }
            }, function (error) {
                return Promise.reject(error);
            });
            Util.toDefaultPage([...routers], to.name, router, next);
        }
    }
});

router.afterEach((to) => {
    Util.openNewPage(router.app, to.name, to.params, to.query);
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});
