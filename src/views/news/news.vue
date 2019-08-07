<style lang="less" scoped>
    @import './list.less';
    .quill-editor {
        height: 200px;
    }
</style>
<template>
    <div>
        <Row>
            <Col span="24">
            <Card style="margin-bottom: 10px">
                <Form inline>
                    <FormItem style="margin-bottom: 0">
                        <Input v-model="searchConf.n_name" placeholder="请输入标题" />
                    </FormItem>
                    <FormItem style="margin-bottom: 0">
                        <Select v-model="searchConf.nt_id" style="width:200px" placeholder='请选择栏目类别'>
                            <Option v-for="(v, i) in newsType" :value="v.nt_id" :key="v.nt_id"> {{v.nt_name}} </Option>
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
                <span>{{formItem.n_id ? '编辑' : '新增'}}</span>
            </p>
            <Form ref="myForm" :rules="ruleValidate" :model="formItem" :label-width="80">
                <FormItem label="标题" prop="n_name">
                    <Input v-model="formItem.n_name" placeholder="请输入标题" />
                </FormItem>
                <FormItem label="副标题" prop="n_name_other">
                    <Input v-model="formItem.n_name_other" placeholder="请输入标题" />
                </FormItem>
                <FormItem label="栏目类别" prop="nt_id">
                    <Select v-model="formItem.nt_id" style="width:200px">
                        <Option v-for="(v, i) in newsType" :value="v.nt_id" :key="v.nt_id"> {{v.nt_name}} </Option>
                    </Select>
                </FormItem>
                <FormItem label="所属单位" prop="n_author">
                    <Input v-model="formItem.n_author" placeholder="请输入所属单位" />
                </FormItem>
                <FormItem label="展示图(400*266)" prop="n_image">
                    <div class="demo-upload-list" v-if="formItem.n_image">
                        <img :src="formItem.n_image">
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-trash-outline" @click.native="handleImgRemove()"></Icon>
                        </div>
                    </div>
                    <input v-if="formItem.n_image" v-model="formItem.n_image" type="hidden" name="image">
                    <Upload type="drag"
                            :action="uploadUrl"
                            :headers="uploadHeader"
                            v-if="!formItem.n_image"
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

                <!--<FormItem label="视频" prop="n_video">
                    <div class="demo-upload-list" v-if="formItem.n_video">
                        <img :src="formItem.n_video">
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-trash-outline" @click.native="handleVideoRemove()"></Icon>
                        </div>
                    </div>
                    <input v-if="formItem.n_video" v-model="formItem.n_video" type="hidden" name="image">
                    <Upload type="drag"
                            :action="uploadUrl"
                            :headers="uploadHeader"
                            v-if="!formItem.n_video"
                            :format="['mp4']"
                            :max-size="51200"
                            :on-success="handleVideoSuccess"
                            :on-format-error="handleVideoFormatError"
                            :on-exceeded-size="handleVideoMaxSize"
                            style="display: inline-block;width:58px;">
                        <div style="width: 58px;height:58px;line-height: 58px;">
                            <Icon type="camera" size="20"></Icon>
                        </div>
                    </Upload>
                </FormItem>-->

                <FormItem label="内容" prop="n_desc" class="edit_container" style="height: 300px" id="quillContainer">
                    <quill-editor ref="myTextEditor"
                                  v-model="formItem.n_desc"
                                  :options="editorOption"
                                  @blur="onEditorBlur($event)"
                                  @focus="onEditorFocus($event)"
                                  @ready="onEditorReady($event)">
                    </quill-editor>
                </FormItem>

                <FormItem label="推荐" prop="n_recommend">
                    <Select v-model="formItem.n_recommend" style="width:200px">
                        <Option :value="0" :key="0"> 不推荐 </Option>
                        <Option :value="1" :key="1"> 推荐 </Option>
                    </Select>
                </FormItem>
                <FormItem label="状态" prop="n_status">
                    <Select v-model="formItem.n_status" style="width:200px">
                        <Option :value="0" :key="0"> 失效 </Option>
                        <Option :value="1" :key="1"> 展示 </Option>
                    </Select>
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
import Input from 'iview/src/components/input/input';

import { quillEditor } from 'vue-quill-editor';
import {quillRedefine} from 'vue-quill-editor-upload';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import 'quill-table/src/css/quill.table.css';

import Quill from 'quill';
import { ImageDrop } from 'quill-image-drop-module';

import quillTable from 'quill-table';
    Quill.register('modules/imageDrop', ImageDrop);
    Quill.register(quillTable.TableCell);
    Quill.register(quillTable.TableRow);
    Quill.register(quillTable.Table);
    Quill.register(quillTable.Contain);
    Quill.register('modules/table', quillTable.TableModule);

    const maxRows = 10;
    const maxCols = 5;
    const tableOptions = [];
    for (let r = 1; r <= maxRows; r++) {
        for (let c = 1; c <= maxCols; c++) {
            tableOptions.push('newtable_' + r + '_' + c);
        }
    }

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
                    vm.formItem.n_id = currentRow.n_id;
                    vm.formItem.n_name = currentRow.n_name;
                    vm.formItem.n_name_other = currentRow.n_name_other;
                    vm.formItem.n_desc = currentRow.n_desc;
                    vm.formItem.n_image = currentRow.n_image;
                    vm.formItem.n_video = currentRow.n_video;
                    vm.formItem.nt_id = currentRow.nt_id;
                    vm.formItem.n_author = currentRow.n_author;
                    vm.formItem.shop_id = currentRow.shop_id;
                    vm.formItem.adminid = currentRow.adminid;
                    vm.formItem.n_status = currentRow.n_status;
                    vm.formItem.n_recommend = currentRow.n_recommend;
                    vm.formItem.n_shops = currentRow.n_shops_trans;
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
                    axios.get('News/del', {
                        params: {
                            id: currentRow.n_id
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
        name: 'news_news',
        components: {
            Input,
            quillEditor
        },
        data () {
            return {
                confirmRefresh: false,
                columnsList: [
                    {
                        title: '序号',
                        key: 'n_id',
                        width: 65,
                        align: 'center'
                    },
                    {
                        title: '标题',
                        align: 'center',
                        key: 'n_name'
                    },
                    {
                        title: '副标题',
                        align: 'center',
                        key: 'n_name_other'
                    },
                    {
                        title: '所属单位',
                        align: 'center',
                        key: 'n_author'
                    },
                    {
                        title: '展示图',
                        align: 'center',
                        key: 'n_image',
                        width: 90,
                        render: (h, params) => params.row.n_image ? h('img', {
                            attrs: {
                                src: params.row.n_image,
                                width: '60px',
                                height: '60px'
                            }
                        }) : ''
                    },
                    {
                        title: '类别',
                        align: 'center',
                        key: 'nt_id_trans'
                    },
                    {
                        title: '查看数',
                        align: 'center',
                        key: 'n_viewnum'
                    },
                    /*{
                        title: '分享数',
                        align: 'center',
                        key: 'n_sharenum'
                    },*/
                    {
                        title: '添加人',
                        align: 'center',
                        key: 'adminid'
                    },
                    {
                        title: '推荐',
                        align: 'center',
                        key: 'n_recommend_trans'
                    },
                    {
                        title: '状态',
                        align: 'center',
                        key: 'n_status_trans'
                    },
                    {
                        title: '创建时间',
                        align: 'center',
                        key: 'n_createtime_trans'
                    },
                    {
                        title: '操作',
                        align: 'center',
                        key: 'handle',
                        handle: ['edit', 'delete']
                    }
                ],
                tableData: [],
                newsType: [],
                shopList: [],
                editorOption: {
                    modules: {
                        toolbar: [
                            [{'size': ['small', false, 'large', 'huge']}, 'bold', 'italic', 'underline', 'strike', {'list': 'ordered'}, {'list': 'bullet'}, {'script': 'sub'}, {'script': 'super'}, 'link', 'image', 'video'],
                            [{table: tableOptions}, {table: 'append-row'}, {table: 'append-col'}]
                        ],
                        history: {
                            delay: 1000,
                            maxStack: 50,
                            userOnly: false
                        },
                        table: true
                    },
                    history: {
                        delay: 1000,
                        maxStack: 50,
                        userOnly: false
                    },
                    imageDrop: true
                },
                tableShow: {
                    currentPage: 1,
                    pageSize: 10,
                    listCount: 0
                },
                searchConf: {
                    n_id: '',
                    n_name: '',
                    nt_id: '',
                    shop_id: ''
                },
                modalSetting: {
                    show: false,
                    loading: false,
                    index: 0
                },
                formItem: {
                    n_id: 0,
                    n_image: ''
                },
                ruleValidate: {

                }
            };
        },
        computed: {
            editor () {
                return this.$refs.myTextEditor.quillEditor;
            }
        },
        mounted () {
            // 初始化
        },
        created () {
            this.init();
            this.getList();

            this.editorOption = quillRedefine({
                // 图片上传的设置
                uploadConfig: {
                    action: config.baseUrl + 'Index/upload', // 必填参数 图片上传地址
                    // 必选参数  res是一个函数，函数接收的response为上传成功时服务器返回的数据
                    // 你必须把返回的数据中所包含的图片地址 return 回去
                    res: (respnse) => {
                        return respnse.data.oldFileUrl; // 这里切记要return回你的图片地址
                    },
                    methods: 'POST', // 可选参数 图片上传方式  默认为post
                    name: 'file', // 可选参数 文件的参数名 默认为img
                    size: 5000, // 可选参数   图片限制大小，单位为Kb, 1M = 1024Kb
                    accept: 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon', // 可选参数 可上传的图片格式
                    // input点击事件  formData是提交的表单实体
                    change: (formData) => {
                    },
                    // 设置请求头 xhr: 异步请求， formData: 表单对象
                    header: (xhr, formData) => {
                        // xhr.setRequestHeader('myHeader','myValue');
                        // formData.append('token', '1234')
                        xhr.setRequestHeader('justTokn', sessionStorage.getItem('justTokn'));
                    },
                    // start: function (){}
                    start: () => {
                    }, // 可选参数 接收一个函数 开始上传数据时会触发
                    end: () => {
                    }, // 可选参数 接收一个函数 上传数据完成（成功或者失败）时会触发
                    success: (respnse) => {
                        self.quill.insertEmbed(length, 'image', res);
                    }, // 可选参数 接收一个函数 上传数据成功时会触发
                    error: () => {
                    } // 可选参数 接收一个函数 上传数据中断时会触发
                },
                toolOptions: [
                    ['bold', 'italic', 'underline', 'strike'], ['blockquote', 'code-block'], [{ 'header': 1 }, { 'header': 2 }], [{ 'list': 'ordered' }, { 'list': 'bullet' }], [{ 'script': 'sub' }, { 'script': 'super' }], [{ 'indent': '-1' }, { 'indent': '+1' }], [{ 'direction': 'rtl' }], [{ 'size': ['small', false, 'large', 'huge'] }], [{ 'header': [1, 2, 3, 4, 5, 6, false] }], [{ 'color': [] }, { 'background': [] }], [{ 'font': [] }], [{ 'align': [] }], ['clean'], ['link', 'image', 'video']
                ]
            });
        },
        methods: {
            onEditorBlur (editor) {
                console.log('editor blur!', editor);
            },
            onEditorFocus (editor) {
                console.log('editor focus!', editor);
            },
            onEditorReady (editor) {
                console.log('editor ready!', editor);
            },
            onEditorChange ({ editor, html, text }) {
                // console.log('editor change!', editor, html, text)
                this.content = html;
            },
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
                axios.get('NewsType/getList').then(function (response) {
                    let res = response.data;
                    if (res.code === 1) {
                        vm.newsType = res.data.list;
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
                        if (this.formItem.n_id === 0) {
                            target = 'News/add';
                        } else {
                            target = 'News/edit';
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
                axios.get('News/getList', {
                    params: {
                        page: vm.tableShow.currentPage,
                        size: vm.tableShow.pageSize,
                        type: vm.searchConf.type,
                        n_name: vm.searchConf.n_name,
                        n_name_other: vm.searchConf.n_name_other,
                        nt_id: vm.searchConf.nt_id
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
                    this.formItem.n_id = 0;
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
                this.formItem.n_image = '';
            },
            handleImgSuccess (response) {
                if (response.code === 1) {
                    this.$Message.success(response.msg);
                    this.formItem.n_image = response.data.fileUrl;
                } else {
                    this.$Message.error(response.msg);
                }
            },
            handleImgMaxSize (file) {
                this.$Notice.warning({
                    title: '文件大小不合法',
                    desc: file.name + '太大啦请上传小于5M的文件。'
                });
            },

            handleVideoFormatError (file) {
                this.$Notice.warning({
                    title: '文件类型不合法',
                    desc: file.name + '的文件类型不正确，请上传mp4格式。'
                });
            },
            handleVideoRemove () {
                this.formItem.n_video = '';
            },
            handleVideoSuccess (response) {
                if (response.code === 1) {
                    this.$Message.success(response.msg);
                    this.formItem.n_video = response.data.fileUrl;
                } else {
                    this.$Message.error(response.msg);
                }
            },
            handleVideoMaxSize (file) {
                this.$Notice.warning({
                    title: '文件大小不合法',
                    desc: file.name + '太大啦请上传小于50M的文件。'
                });
            }
        }
    };
</script>
