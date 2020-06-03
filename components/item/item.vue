<template>
	<!-- 日记列表中的单个日记项 -->
	<view class="item">
		<!-- 左侧文本 -->
		<view class="text" :class="{'text-width': haveImg}">
		<text class="title">{{ title }}</text>
		<text class="date">{{ date }}</text>
		</view>
		<!-- 右侧图片 -->
		<image v-if="imgPath" :src="imgPath"></image>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				haveImg: false
			};
		},
		props: {
			// 标题
			title: String,
			// 时间
			date: String,
			// 图片
			imgPath: {
				type: String,
				default: ''
			}
		},
		mounted() {
			if(this.imgPath != '') {
				this.haveImg = true;
			} else {
				this.haveImg = false;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.item {
		padding: 25rpx;
		background-color: #A0CFFF;
		display: flex;
		justify-content: space-between;
		overflow: hidden;
		border-bottom: 2px solid #71D5A1;
		.text {
			width: 60%;
			display: flex;
			flex-direction: column;
			font-size: $uni-font-size-lg;
			text-overflow: ellipsis;
			.title {
				overflow:hidden;
				text-overflow:ellipsis;
				white-space:nowrap;
				font-size: 50rpx;
			}
			.date {
				margin-top: 10rpx;
				font-size: 30rpx;
			}
		}
		.text.text-width {
			width: 90%;
		}
		image {
			width: 100rpx;
			height: 100rpx;
		}
	}
</style>
