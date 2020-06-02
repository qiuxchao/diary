<template>
	<!-- 日记列表中的单个日记项 -->
	<view class="item">
		<!-- 左侧文本 -->
		<text v-if="text" class="text">{{ text }}</text>
		<!-- 右侧图片 -->
		<image v-if="imgPath" :src="imgPath" mode=""></image>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			};
		},
		props: {
			// 文本
			text: String,
			// 图片
			imgPath: String
		}
	}
</script>

<style lang="scss" scoped>
	.item {
		padding: 20rpx;
		background-color: #A0CFFF;
		display: flex;
		justify-content: space-between;
		overflow: hidden;
		border-bottom: 2px solid #71D5A1;
		.text {
			font-size: $uni-font-size-lg;
			text-overflow: ellipsis;
		}
		image {
			width: $uni-img-size-lg;
			height: $uni-img-size-lg;
		}
	}
</style>
