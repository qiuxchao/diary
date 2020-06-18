import Vue from 'vue'
import App from './App'
import uView from "uview-ui";
Vue.use(uView);


// 网络请求
import api from "api/global.js";
Vue.prototype.api = api;

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
