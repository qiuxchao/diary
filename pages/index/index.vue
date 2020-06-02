<template>
	<view>
		<u-navbar back-text="返回" title="日记" :background="background"></u-navbar>
		<view class="content">
			<!-- 正文内容 -->.
			<!-- 使用单项日记组件 -->
			<item v-for="(item, index) in data" :key="index"
			 :text="item.text" :imgPath="item.imgPath" />
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
				data: [
					{
						text: "Hello World",
						imgPath: "https://dss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=4383717,1920209162&fm=58"
					}
				]
			}
		},
		onLoad() {

		},
		methods: {
			writeDiary() {
				// 跳转到写日记页面
				uni.navigateTo({
				    url: '../write/write'
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
