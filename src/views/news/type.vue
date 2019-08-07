<style lang="less" scoped>
    @import './list.less';
</style>
<template>
    <div>
        <Row>
            <Col span="24">
            <Card style="margin-bottom: 10px">
                <Form inline>
                    <FormItem style="margin-bottom: 0">
                        <Input v-model="searchConf.nt_name" placeholder="请输入栏目名称"></Input>
                    </FormItem>
                    <FormItem style="margin-bottom: 0">
                        <Select v-model="searchConf.nt_status" clearable placeholder='请选择状态' style="width:100px">
                            <Option :value="1">启用</Option>
                            <Option :value="0">禁用</Option>
                        </Select>
                    </FormItem>
                    <FormItem style="margin-bottom: 0">
                        <Button type="primary" @click="search">查询/刷新</Button>
                    </FormItem>
                </Form>
            </Card>
            </Col>
        </Row>
        <Row>
            <Col span="24">
            <Card>
                <p slot="title" style="height: 32px">
                    <Button type="primary" @click="alertAdd" icon="plus-round">新增</Button>
                </p>
                <div>
                    <Table :columns="columnsList" :data="tableData" border disabled-hover></Table>
                </div>
                <div class="margin-top-15" style="text-align: center">
                    <Page :total="tableShow.listCount" :current="tableShow.currentPage"
                          :page-size="tableShow.pageSize" @on-change="changePage"
                          @on-page-size-change="changeSize" show-elevator show-sizer show-total></Page>
                </div>
            </Card>
            </Col>
        </Row>
        <Modal v-model="modalSetting.show" width="668" :styles="{top: '30px'}" @on-visible-change="doCancel">
            <p slot="header" style="color:#2d8cf0;">
                <Icon type="information-circled"></Icon>
                <span>{{formItem.nt_id ? '编辑' : '新增'}}</span>
            </p>
            <Form ref="myForm" :rules="ruleValidate" :model="formItem" :label-width="80">
                <FormItem label="栏目名称" prop="nt_name">
                    <Input v-model="formItem.nt_name" placeholder="请输入栏目名称" />
                </FormItem>
                <FormItem label="栏目图(375*200)" prop="nt_image">
                    <div class="demo-upload-list" v-if="formItem.nt_image">
                        <img :src="formItem.nt_image">
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-trash-outline" @click.native="handleImgRemove()"></Icon>
                        </div>
                    </div>
                    <input v-if="formItem.nt_image" v-model="formItem.nt_image" type="hidden" name="image">
                    <Upload type="drag"
                            :action="uploadUrl"
                            :headers="uploadHeader"
                            v-if="!formItem.nt_image"
                            :format="['jpg','jpeg','png']"
                            :max-size="5120"
                            :on-success="handleImgSuccess"
                            :on-format-error="handleImgFormatError"
                            :on-exceeded-size="handleImgMaxSize"
                            style="display: inline-block;width:58px;">
                        <div style="width: 58px;height:58px;line-height: 58px;">
                            <Icon type="camera" size="20"></Icon>
                        </div>
                    </Upload>
                </FormItem>
                <FormItem label="推荐" prop="nt_recommend">
                    <Select v-model="formItem.nt_recommend" style="width:200px">
                        <Option :value="0" :key="0"> 否 </Option>
                        <Option :value="1" :key="1"> 是 </Option>
                    </Select>
                </FormItem>
                <FormItem label="状态" prop="nt_status">
                    <Select v-model="formItem.nt_status" style="width:200px">
                        <Option :value="0" :key="0"> 禁用 </Option>
                        <Option :value="1" :key="1"> 启用 </Option>
                    </Select>
                </FormItem>
                <FormItem label="排序" prop="nt_sort">
                    <Input v-model="formItem.nt_sort" placeholder="从小到大" />
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="cancel" style="margin-right: 8px">取消</Button>
                <Button type="primary" @click="submit" :loading="modalSetting.loading">确定</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import config from '../../../build/config';
    import axios from 'axios';
    import Input from "iview/src/components/input/input";

    const editButton = (vm, h, currentRow, index) => {
        return h('Button', {
            props: {
                type: 'primary'
            },
            style: {
                margin: '0 5px'
            },
            on: {
                'click': () => {
                    vm.formItem.nt_id = currentRow.nt_id;
                    vm.formItem.nt_name = currentRow.nt_name;
                    vm.formItem.nt_image = currentRow.nt_image;
                    vm.formItem.nt_recommend = currentRow.nt_recommend;
                    vm.formItem.nt_createtime = currentRow.nt_createtime;
                    vm.formItem.nt_edittime = currentRow.nt_edittime;
                    vm.formItem.nt_status = currentRow.nt_status;
                    vm.formItem.nt_sort = currentRow.nt_sort;
                    vm.formItem.nt_num = currentRow.nt_num;
                    vm.modalSetting.show = true;
                    vm.modalSetting.index = index;
                }
            }
        }, '编辑');
    };
    const deleteButton = (vm, h, currentRow, index) => {
        return h('Poptip', {
            props: {
                confirm: true,
                title: '您确定要删除这条数据吗? ',
                transfer: true
            },
            on: {
                'on-ok': () => {
                    axios.get('NewsType/del', {
                        params: {
                            id: currentRow.nt_id
                        }
                    }).then(function (response) {
                        currentRow.loading = false;
                        if (response.data.code === 1) {
                            vm.tableData.splice(index, 1);
                            vm.$Message.success(response.data.msg);
                        } else {
                            vm.$Message.error(response.data.msg);
                        }
                    });
                }
            }
        }, [
            h('Button', {
                style: {
                    margin: '0 5px'
                },
                props: {
                    type: 'error',
                    placement: 'top',
                    loading: currentRow.isDeleting
                }
            }, '删除')
        ]);
    };

    export default {
        name: 'news_type',
        components: {Input},
        data () {
            return {
                confirmRefresh: false,
                columnsList: [
                    {
                        title: '序号',
                        key: 'nt_id',
                        width: 65,
                        align: 'center'
                    },
                    {
                        title: '栏目名称',
                        align: 'center',
                        key: 'nt_name'
                    },
                    {
                        title: '栏目图',
                        align: 'center',
                        key: 'nt_image',
                        render: (h, params) => params.row.nt_image ? h('img', {
                            attrs: {
                                src: params.row.nt_image,
                                width: '60px',
                                height: '60px'
                            }
                        }) : ''
                    },
                    {
                        title: '文章数',
                        align: 'center',
                        key: 'nt_num'
                    },
                    {
                        title: '推荐',
                        align: 'center',
                        key: 'nt_recommend_trans'
                    },
                    {
                        title: '状态',
                        align: 'center',
                        key: 'nt_status_trans'
                    },
                    {
                        title: '排序',
                        align: 'center',
                        key: 'nt_sort'
                    },
                    {
                        title: '操作',
                        align: 'center',
                        key: 'handle',
                        width: 355,
                        handle: ['edit', 'delete']
                    }
                ],
                tableData: [],
                expertType: [],
                tableShow: {
                    currentPage: 1,
                    pageSize: 10,
                    listCount: 0
                },
                searchConf: {
                    nt_name: '',
                    nt_status: '',
                    nt_id: ''
                },
                modalSetting: {
                    show: false,
                    loading: false,
                    index: 0
                },
                formItem: {
                    nt_id: 0,
                    nt_image: '',
                    nt_name: ''
                },
                ruleValidate: {
                    nt_name: [
                        {required: true, message: '栏目名称不能为空', trigger: 'blur'}
                    ]
                }
            };
        },
        created () {
            this.init();
            this.getList();
        },
        methods: {
            init () {
                let vm = this;
                this.columnsList.forEach(item => {
                    if (item.handle) {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            return h('div', [
                                editButton(vm, h, currentRowData, param.index),
                                deleteButton(vm, h, currentRowData, param.index)
                            ]);
                        };
                    }
                });
                this.uploadUrl = config.baseUrl + 'Index/upload';
                this.uploadHeader = {'justTokn': sessionStorage.getItem('justTokn')};
            },
            alertAdd () {
                this.modalSetting.show = true;
            },
            submit () {
                let self = this;
                this.$refs['myForm'].validate((valid) => {
                    if (valid) {
                        self.modalSetting.loading = true;
                        let target = '';
                        if (this.formItem.nt_id === 0) {
                            target = 'NewsType/add';
                        } else {
                            target = 'NewsType/edit';
                        }
                        axios.post(target, self.formItem).then(function (response) {
                            self.modalSetting.loading = false;
                            if (response.data.code === 1) {
                                self.$Message.success(response.data.msg);
                                self.getList();
                                self.cancel();
                            } else {
                                self.$Message.error(response.data.msg);
                            }
                        });
                    }
                });
            },
            cancel () {
                this.modalSetting.show = false;
            },
            changePage (page) {
                this.tableShow.currentPage = page;
                this.getList();
            },
            changeSize (size) {
                this.tableShow.pageSize = size;
                this.getList();
            },
            search () {
                this.tableShow.currentPage = 1;
                this.getList();
            },
            getList () {
                let vm = this;
                axios.get('NewsType/getList', {
                    params: {
                        page: vm.tableShow.currentPage,
                        size: vm.tableShow.pageSize,
                        nt_name: vm.searchConf.nt_name,
                        nt_status: vm.searchConf.nt_status
                    }
                }).then(function (response) {
                    let res = response.data;
                    if (res.code === 1) {
                        vm.tableData = res.data.list;
                        vm.tableShow.listCount = res.data.count;
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
            },
            doCancel (data) {
                if (!data) {
                    this.formItem.nt_id = 0;
                    this.$refs['myForm'].resetFields();
                    this.modalSetting.loading = false;
                    this.modalSetting.index = 0;
                }
            },
            handleImgFormatError (file) {
                this.$Notice.warning({
                    title: '文件类型不合法',
                    desc: file.name + '的文件类型不正确，请上传jpg或者png图片。'
                });
            },
            handleImgRemove () {
                this.formItem.nt_image = '';
            },
            handleImgSuccess (response) {
                if (response.code === 1) {
                    this.$Message.success(response.msg);
                    this.formItem.nt_image = response.data.fileUrl;
                } else {
                    this.$Message.error(response.msg);
                }
            },
            handleImgMaxSize (file) {
                this.$Notice.warning({
                    title: '文件大小不合法',
                    desc: file.name + '太大啦请上传小于5M的文件。'
                });
            }
        }
    };
</script>
