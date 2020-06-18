<template>
	<view>
		<hx-navbar title="日常笔记" :fixed="true" :right-text="isDelete ? '取消' : '批量删除'" @click-right="deleteItem" />
		
		<!-- 加载动画 -->
		<u-loading mode="circle" color="blue" :show="showLoading"></u-loading> 
		
		<!-- 头部搜索笔记 -->
		<view class="search">
			<view class="count">
				{{searchFilter(data, keyword).length}}条笔记
			</view>
			 <uni-icons class="icon" color="#aaa" type="search" size="22"></uni-icons>
			<input type="text" placeholder="搜索日记..." v-model="keyword" />
		</view> 
		
		<!-- 删除笔记模态框 -->
		<u-modal 
		v-model="show" 
		content="是否删除笔记？"
		:show-cancel-button="true"
		@confirm="deleteItemId"
		></u-modal>
		
		<!-- 笔记列表 -->
		<view class="content"> 
			<!-- 使用单项日记组件 -->
			<u-checkbox-group v-if="showList" @change="checkboxGroupChange" style="display: flex; flex-wrap: wrap; width: 100%;" >
						
				<diary-item 
				@touchstart.native="showDeleteButton(item.id)" @touchend.native="emptyTime"
				v-for="(item, index) in searchFilter(data, keyword)"
				:key="item.id" 
				:name="item.id"
				:isSelected="item.select"
				:title="item.title" 
				:imgPath="item.imgPath" 
				:date="item.amendTime" 
				@click.native="pushWirte(item.id)"
				:id="item.id"
				:showCircle="isDelete"
				/>		 
			</u-checkbox-group>
			<u-empty text="暂无笔记" v-if="searchFilter(data,keyword).length == 0" mode="list"></u-empty>
			
		</view>
		 
		<!-- 添加日记按钮 -->
		<button v-if="!isDelete" class="add-diary" @click="writeDiary"><text>+</text></button>
		
		
		<!-- 底部全选和反选，批量删除 -->
		<view class="tab-bar" v-if="isDelete">
			<view class="select" @click="allSelect">全选</view>
			<view class="delete" @click="deleteSelect">删除</view>
		</view>
	</view> 
	 
</template> 

<script> 
import hxNavbar from "@/components/hx-navbar/hx-navbar.vue"
import uniIcons from "@/components/uni-icons/uni-icons.vue"
	export default {
		data() { 
			return {
				showLoading: false,	// 加载动画
				showList: false,
				data: [],	// 日记列表数据
				isDelete: false,
				allSelected: false,  // 是否全选
				selectedItems: [],	// 选择的要删除的日记
				keyword: "",	// 搜索框的值
				Loop: null,	// 定时器
				show: false,	// 是否显示删除模态框
				selectItemId: ""	// 选中的单条笔记id
				
			}
		},
		components: {
			// 注册组件
			hxNavbar,
			uniIcons
		},
		onLoad() {
			// 获取日记列表
		},
		onHide() {
			this.showList = false;
		},
		onShow() {
			this.showLoading = true;
			setTimeout(this.getData, 300)
			// this.getData();
		},
		onBackPress() {
			// 返回，合项目时需要返回至上一级页面
			return true;
		},
		onReady() {}, 
		methods: {
			deleteItemId() {
				// 删除单条笔记
				console.log('进入删除日记方法，', this.selectItemId);
				if(this.selectItemId != "") {
					this.api.request({
						url: "/note/deleteByNoteIds",
						method: "POST",
						data: {noteIds: [this.selectItemId]}
					}).then(res => {
						this.$u.toast('删除成功');
						this.selectItemId = "";
						this.getData();
					}).catch(err => {
						this.$u.toast('删除失败');
					});
				}
			},
			showDeleteButton(id){
				this.selectItemId = id;
			    clearTimeout(this.Loop); //再次清空定时器，防止重复注册定时器
			    this.Loop = setTimeout(() => {
			        this.show = true;
			    }, 1000);
			},
			//清空
			emptyTime () {
			    clearTimeout(this.Loop); //清空定时器，防止重复注册定时器
			},
			// 搜索过滤
			searchFilter(data, keyword) {
				return data.filter(item => {
					return item.title.match(keyword);
				});
			},
			checkboxGroupChange(selectedItems) {
				// 多选框事件
				console.log(selectedItems);
				this.selectedItems = selectedItems;
			}, 
			deleteItem() {
				// 批量删除开关
				this.isDelete = !this.isDelete;
			},
			allSelect () {
				// 全选
				this.allSelected = !this.allSelected;
				if (this.allSelected) {
					console.log("全选");
					this.data.forEach(item => {
						item.select = true;
						this.selectedItems.push(item.id);
					});
					console.log('selectedItems: ', this.selectedItems)
				} else {
					this.data.forEach(item => {
						item.select = false;
					});
					this.selectedItems = [];
					console.log("全不选: ", this.selectedItems);
				}

				
			},
			deleteSelect () {
				// 删除
				console.log('删除');
				// 发送请求，将带有id的数组发送给后端
				if(this.selectedItems.length) {
					console.log(this.selectedItems);
					this.api.request({
						url: "/note/deleteByNoteIds",
						method: "POST",
						data: {noteIds: this.selectedItems} 
					}).then(res => {
						console.log('删除结果：', res);
						this.selectedItems = [];
						this.$u.toast('删除成功');
						this.isDelete = false;
						this.getData();
					}).catch(err => {
						console.log('删除失败：', err);
						this.selectedItems = [];
						this.$u.toast('删除失败');
					});
				} else {
					this.$u.toast('请选择日记');
				}
			},
			getData() {
				this.api.request({
					url: "/note/selectAllByUserId"
				}).then(res => {
					this.showLoading = false;
					// console.log('测试:', res[1].data.data);
					let datas = res.data;
					// console.log(datas);
					for(let temp of datas ) {
						if (temp.noteContent) {
							let str = this.removeTAG(temp.noteContent);
							temp.title = str;
						}else {
							temp.title = "空内容笔记···";
						}
						if(temp.noteImgpath) {
							temp.imgPath = temp.noteImgpath;
						} 
						temp.select = false;
						temp.show = false;
					} 
					console.log('日记列表数据：', datas);
					this.data = datas;
					this.showList = true;
				}).catch(err => {
					console.log(err); 
				});
			},
			writeDiary() {
				// 点击新建日记，发起请求，创建新记录
				this.api.request({
					url: "/note/createSql",
					method: "GET"
				}).then(res => {
					console.log('创建空记录');
				}).catch(err => {
					console.log(err);
				}); 
				// 进入到写日记页面
				uni.navigateTo({
				    url: '../write/write'
				});
			},
			pushWirte(id) {
				// 点击单条日记跳转到写日记页面
				// 跳转到write.vue页面并传递id
				uni.navigateTo({
				    url: `../write/write?id=${id}`
				});
			},
			// 删除 html 标签
			removeTAG(str,len){
				return str.replace(/<[^>]+>/g, "");
			}
		},
		// 下拉刷新
		onPullDownRefresh() {
			console.log('刷新');
			this.getData();
			uni.stopPullDownRefresh();
		}
	}
</script>

<style lang="scss">  
	// 日记列表容器
	.content {
		margin-top: 180rpx;
		padding: 20rpx 30rpx;
		padding-bottom: 300rpx;
	}
	

	
	// 搜索框
	.search {
		background-color: #fff;
		position: fixed;
		z-index: 99;
		top: 160rpx;
		padding: 15rpx 30rpx;
		width: 100%;
		height: 120rpx;
		// 笔记数量
		.count {
			padding-top: 20rpx;
			padding: 0 40rpx;
			color: rgb(153, 153, 153);
			margin-bottom: 15rpx;
		}
		.icon {
			position: absolute;
			left: 50rpx;
			top: 78rpx;
		}
		input {
			box-sizing: border-box;
			background: rgba(221, 221, 221, 1);
			width: 690rpx;
			height: 80%;
			border-radius: 50rpx;
			padding: 10rpx 80rpx;
			margin-bottom: 20rpx;
		}
	}
	
	
	
	/* 添加日记按钮 */
	.add-diary {
		position: fixed;
		bottom: 114rpx;
		right: 62rpx;
		width: 125rpx;
		height: 125rpx;
		background-color: #475FFD;
		border-radius: 50%;
		box-shadow: 0 9rpx 14rpx rgba(71, 95, 253, 0.41);
		text {
			width: 100rpx;
			height: 100rpx;
			font-size: 100rpx;
			color: #fff;
			position:absolute;
			left: 11%;
			top: -18%;
			margin-top: -50rpx;
			mergin-left: -50rpx;
			
		}
	}

	/* 底部全选删除 */
	.tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		height: 124rpx;
		weight: 100vw;
		background: #5D9FBD;
		display: flex;
		view {
			background: #5D9FBD;
			width: 50vw;
			height: 100%;
			padding: 70rpx 135rpx 10rpx 190rpx;
			font-size: 26rpx;
			color: #fff;
		}
		.select {
			background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/gou.png) no-repeat;
			background-size: 50rpx 50rpx;
			background-position: 190rpx 18rpx;
		}
		.delete {
			background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/laji.png) no-repeat;
			background-size: 50rpx 50rpx;
			background-position: 190rpx 18rpx;
		}
	}
</style>
