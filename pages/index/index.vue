<template>
	<view>
		<u-navbar back-text="返回" title="日记" :background="background"></u-navbar>
		<view class="content">
			<!-- 正文内容 -->
			<!-- 使用单项日记组件 -->
			<item v-for="(item, index) in data" :key="index"
			 :title="item.id" :imgPath="item.imgPath" :date="item.amendTime" @click="pushWirte(item.id)" />
		</view>
		
		<!-- 添加日记按钮 -->
		<button class="add-diary" @click="writeDiary">+ </button>
	</view>

</template>

<script>
	export default {
		data() {
			return {
				background: {
					// 渐变色
					backgroundImage: 'linear-gradient(45deg, rgb(28, 187, 180), rgb(141, 198, 63))'
				},
				// data: [
				// 	{
				// 		title: "Hello Worldaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
				// 		date: "1月1日 00:00:00",
				// 		imgPath: "https://dss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=4383717,1920209162&fm=58"
				// 	}
				// ],
				data: []	// 日记列表数据
			}
		},
		onLoad() {},
		created() {
			uni.request({
				url: "http://192.168.1.169:8080/note/selectAllByUserId"
			}).then(res => {
				console.log(res[1].data.data);
				this.data = res[1].data.data;
			}).catch(err => {
				console.log(err);
			});
		},
		onReady() {
			uni.request({
				url: "http://192.168.1.169:8080/user/phonelogin",
				method: "POST",
				data: {"code": "123456","user_name": "18888888888"}
			}).then(res => {
				console.log('登录');	
			});
		},
		methods: {
			writeDiary() {
				// 点击新建日记跳转到写日记页面
				uni.navigateTo({
				    url: '../write/write'
				});
			},
			pushWirte(id) {
				// 点击单条日记跳转到写日记页面
				// 跳转到write.vue页面并传递参数
				console.log(1)
				uni.navigateTo({
				    url: `../write/write?id=${id}`
				});
			}
		}
	}
</script>

<style lang="scss">
	.add-diary {
		color: #FFFFFF;
		font-weight: bold;
		background-color: $uni-color-success;
		position: fixed;
		bottom: 50rpx;
		right: 50rpx;
		width: $uni-img-size-lg;
		height: $uni-img-size-lg;
		border-radius: $uni-border-radius-circle;
		font-size: 50rpx;
		text-align: center;
		line-height: 1.5em;

	}

</style>
