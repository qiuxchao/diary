<template>
	<view class="content">
		<view class="icon" :style="{color: color, fontSize: fontSize}" v-html="type" @click="toclick"></view>
	</view>
</template>

<script>
	export default {
		props: {
			type: {
				type: String,
				default: '&#xe644;'
			},
			color: {
				type: String,
				default: '#fff'
			},
			fontSize: {
				type: String,
				default: '40rpx'
			}
		},
		methods: {
			toclick() {
				this.$emit('click');
			}
		}
	}
</script>

<style scoped>
	.content{
		display: flex;
		align-items: center;
		justify-content: center;
	}
	@font-face {
		font-family: 'jin';
		/** 阿里巴巴矢量图标库的字体库地址，可以替换自己的字体库地址 **/
		src: url('https://at.alicdn.com/t/font_1857075_6xp78wjbp15.ttf') format('truetype');
	}

	.icon {
		font-family: jin !important;
		font-size: 40rpx;
		font-weight: bold;
	}

</style>
