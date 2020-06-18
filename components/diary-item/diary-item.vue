<template>
	<!-- 日记列表中的单个日记项 -->

	<view class="item" @click="$emit('click')" 
	@touchstart="$emit('touchstart')" @touchend="$emit('touchend')"
	>
		<!-- 左侧文本 -->
		<view class="text max-width" :class="{ 'min-width': haveImg || circle }">
			<text class="title">{{ text }}</text>
			<text class="date">{{ date }}</text>
		</view>
		<!-- 右侧图片 -->
		<image class="img" v-if="haveImg" :src="imgPath"></image>
		<!-- 删除圆圈 -->
		<view class="circle" v-if="showCircle" @click.stop="stop">
			<u-checkbox shape="circle" v-model="isSelected" :name="id"></u-checkbox>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			haveImg: true,
			text: '',
			select: false,
			circle: false
		};
	},
	computed: {}, 
	props: {
		// 标题
		title: String,
		// 时间
		date: String,
		// 图片
		imgPath: String,
		// 是否选中
		isSelected: {
			type: Boolean,
			default: false
		},
		// id
		id: String,
		// 是否显示圆圈
		showCircle: {
			type: Boolean,
			default: false
		}
	},
	watch: {
		isSelected(val) {
			this.select = val;
		},
		showCircle(val) {
			// console.log(val);
			this.circle = val;
		}
	},
	mounted() {
		if (this.imgPath || this.showCircle) {
			this.haveImg = true;
		} else {
			this.haveImg = false;
		}
		if (this.title == ('' || null)) {
			this.text = '空内容笔记···';
		} else {
			this.text = this.title;
		}
	},
	methods: {
		stop() {}
	}
};
</script>

<style lang="scss" scoped>
.item {
	width: 690rpx;
	height: 181rpx;
	border-radius: 20rpx;
	background-color: #effaff;
	overflow: hidden;
	padding: 16rpx 20rpx;
	display: flex;
	justify-content: space-between;
	box-shadow: 0rpx 18rpx 28rpx rgba(0, 105, 153, 0.26);
	margin-bottom: 28rpx;
	.text {
		display: flex;
		flex-direction: column;
		.title {
			font-size: 40rpx;
			color: #333;
			margin-top: 30rpx;
			margin-bottom: 22rpx;
			font-weight: bold;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.date {
			font-size: 30rpx;
			color: #99c6db;
		}
	}
	.max-width {
		width: 614rpx;
	}
	.min-width {
		width: 420rpx !important;
	}
	.img {
		width: 137rpx;
		height: 137rpx;
		border-radius: 7rpx;
	}
	.circle {
		display: flex;
		align-items: center;
		margin-left: 20rpx;
		margin-right: 20rpx;
	}
}
</style>
