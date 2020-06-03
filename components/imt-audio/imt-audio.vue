<template>
	<view class="imt-audio">
		<view class="audio-wrapper">
			<!-- 开始时间 -->
			<!-- <view class="audio-number">{{currentTime}}</view> -->
			<!-- 进度条 -->
			<!-- <slider class="audio-slider" :activeColor="color" block-size="16" :value="current" :max="duration" @changing="seek=true,current=$event.detail.value" @change="change"></slider> -->
			 <!-- 结束时间 -->
			 
			 <!-- 总时长 -->
			<view class="audio-number">{{duration}} s</view>
		</view>
		
		<!-- 播放按钮 -->
		<view class="audio-control-wrapper" :style="{color:color}">
			<view class="audio-control audio-control-switch" :class="{audioLoading:loading}" :style="{borderColor:color}" @click="operation">{{loading?'&#xe600;':(paused?'&#xe865;':'&#xe612;')}}</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// currentTime: '', //当前播放时间
				durationTime: '', //总时长
				// current: '', //slider当前进度
				loading: false, //是否处于读取状态
				paused: false, //是否处于暂停状态
				seek: false, //是否处于拖动状态
				audio: {}  // 音频实例
			}
		},
		props: {
			src: String, //音频链接
			autoplay: Boolean, //是否自动播放
			duration: Number, //总时长（单位：s）
			control: {
				type:Boolean,
				default: false
			}, //是否需要上一曲/下一曲按钮
			continue:Boolean,//播放完成后是否继续播放下一首，需定义@next事件
			color: {
				type:String,
				default:'#169af3'
			} //主色调
		},
		methods: {
			//格式化时长
			format(num) {
				return '0'.repeat(2 - String(Math.floor(num / 60)).length) + Math.floor(num / 60) + ':' + '0'.repeat(2 - String(
					Math.floor(num % 60)).length) + Math.floor(num % 60)
			},
			
			//播放/暂停操作
			operation() {
				if (this.audio.paused) {
					// 如果暂停就播放
					this.audio.play()
					this.loading = true
					this.paused = false
				} else {
					// 否则就暂停
					this.audio.pause()
					this.loading = false
					this.paused = true
				}
			},
			//完成拖动事件
			// change(e) {
			// 	this.audio.seek(e.detail.value)
			// }
		},
		created() {
			this.audio = uni.createInnerAudioContext(); //创建音频
			this.audio.src = this.src
			// this.current = 0
			// this.durationTime = this.format(this.duration)
			// 不遵循静音开关
			// this.audio.obeyMuteSwitch = false
			// 自动播放
			this.audio.autoplay = this.autoplay
			// 音频进度更新事件
			// audio.onTimeUpdate(() => {
			// 	if (!this.seek) {
			// 		this.current = audio.currentTime
			// 	}
			// })
			//音频播放事件
			this.audio.onPlay(() => {
				this.paused = false
				this.loading = true
			})
			//音频暂停事件
			this.audio.onPause(() => {
				this.paused = true
				this.loading = false
			})
			//音频结束事件
			this.audio.onEnded(() => {
				this.loading = false
				// 销毁音频实例
				this.audio.destroy();
			})
			//音频完成更改进度事件
			// audio.onSeeked(() => {
			// 	this.seek = false
			// })
		},
		watch: {
			//监听音频地址更改
			// src(e) {
			// 	audio.src = e
			// 	this.current = 0
			// 	audio.play()
			// 	this.loading = false
			// },
			//监听总时长改变
			// duration(e) {
			// 	this.durationTime = this.format(e)
			// },
			//监听当前进度改变
			// current(e) {
			// 	this.currentTime = this.format(e)
			// }
		}
	}
</script>

<style>
	@font-face {
		font-family: 'icon';
		src: url('https://at.alicdn.com/t/font_1104838_fxzimc34xw.eot');
		src: url('https://at.alicdn.com/t/font_1104838_fxzimc34xw.eot?#iefix') format('embedded-opentype'),
			url('https://at.alicdn.com/t/font_1104838_fxzimc34xw.woff2') format('woff2'),
			url('https://at.alicdn.com/t/font_1104838_fxzimc34xw.woff') format('woff'),
			url('https://at.alicdn.com/t/font_1104838_fxzimc34xw.ttf') format('truetype'),
			url('https://at.alicdn.com/t/font_1104838_fxzimc34xw.svg#iconfont') format('svg');
	}

	.imt-audio {
		display: flex;
		justify-content: space-around;
		padding: 30rpx;
		background: #fff;
		border-radius: 20rpx;
	}

	.audio-wrapper {
		/* display: flex; */
		width: 350rpx;
	}

	.audio-number {
		font-size: 24upx;
		line-height: 1;
		color: #333;
	}

	.audio-slider {
		flex: 1;
		margin: 0 30upx;
	}

	.audio-control-wrapper {
		margin-top: 20upx;
		/* display: flex; */
		/* justify-content: center; */
		/* align-items: center; */
		font-family: "icon" !important;
	}

	.audio-control {
		font-size: 32upx;
		line-height: 1;
		border: 4upx solid;
		border-radius: 50%;
		padding: 16upx;
	}

	.audio-control-next {
		transform: rotate(180deg);
	}

	.audio-control-switch {
		font-size: 40upx;
		margin: 0 80upx;
	}

	.audioLoading {
		animation: loading 2s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}

	@keyframes loading {
		to {
			transform: rotate(360deg);
		}
	}
</style>