<style lang="less">
    @import "./home.less";
    @import "../../styles/common.less";
</style>
<template>
    <div class="home-main">
        <Row :gutter="10">
            <Col :md="24" :lg="8">
                <Row class-name="home-page-row1" :gutter="10">
                    <Col :md="12" :lg="24" :style="{marginBottom: '10px'}">
                        <Card>
                            <Row type="flex" class="user-infor">
                                <Col span="8">
                                    <Row class-name="made-child-con-middle" type="flex" align="middle">
                                        <img class="avator-img" :src="headImgPath" />
                                    </Row>
                                </Col>
                                <Col span="16" style="padding-left:6px;">
                                    <Row class-name="made-child-con-middle" type="flex" align="middle">
                                        <div>
                                            <b class="card-user-infor-name">{{userInfo.username}}</b>
                                            <!--<p>super admin</p>-->
                                        </div>
                                    </Row>
                                </Col>
                            </Row>
                            <div class="line-gray"></div>
                            <Row class="margin-top-8">
                                <Col span="8"><p class="notwrap">上次登录时间:</p></Col>
                                <Col span="16" class="padding-left-8">{{userLogin.lastLoginTime_trans}}</Col>
                            </Row>
                            <Row class="margin-top-8">
                                <Col span="8"><p class="notwrap">上次登录IP:</p></Col>
                                <Col span="16" class="padding-left-8">{{userLogin.lastLoginIp_trans}}</Col>
                            </Row>
                            <Row class="margin-top-8">
                                <Col span="8"><p class="notwrap">总登录次数:</p></Col>
                                <Col span="16" class="padding-left-8">{{userLogin.loginTimes}}</Col>
                            </Row>
                        </Card>
                    </Col>

                </Row>
            </Col>

        </Row>
    </div>
</template>

<script>
import cityData from './map-data/get-city-value.js';
import homeMap from './components/map.vue';
import dataSourcePie from './components/dataSourcePie.vue';
import visiteVolume from './components/visiteVolume.vue';
import serviceRequests from './components/serviceRequests.vue';
import userFlow from './components/userFlow.vue';
import countUp from './components/countUp.vue';
import inforCard from './components/inforCard.vue';
import mapDataTable from './components/mapDataTable.vue';
import toDoListItem from './components/toDoListItem.vue';

import axios from 'axios';

export default {
    name: 'home',
    components: {
        homeMap,
        dataSourcePie,
        visiteVolume,
        serviceRequests,
        userFlow,
        countUp,
        inforCard,
        mapDataTable,
        toDoListItem
    },
    data () {
        return {
            toDoList: [
                {
                    title: '去iView官网学习完整的iView组件'
                }
            ],
            count: {
                createUser: 496,
                visit: 3264,
                collection: 24389305,
                transfer: 39503498
            },
            cityData: cityData,
            showAddNewTodo: false,
            newToDoItemValue: '',
            userLogin: [],
            userInfo: []
        };
    },
    computed: {
        headImgPath () {
            return sessionStorage.headImg ? sessionStorage.headImg : require('../../images/defaultImg.jpg');
        }
    },
    created () {
        this.init();
    },
    methods: {
        init () {
            let vm = this;
            axios.get('Index/baseIndex').then(function (response) {
                let res = response.data;
                if (res.errCode === 0) {
                    vm.userLogin = res.data.userLogin;
                    vm.userInfo = res.data.userInfo;
                } else {
                    if (res.code === -14) {
                        vm.$store.commit('logout', vm);
                        vm.$router.push({
                            name: 'login'
                        });
                    } else {
                        vm.$Message.error(res.msg);
                    }
                }
            });
        }
    }
};
</script>
