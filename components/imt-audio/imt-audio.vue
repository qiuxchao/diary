<template>
	<view class="audio-wrap">
		<!-- 开始时间 -->
		<!-- <view class="time">{{currentTime}}</view> -->
		<!-- 进度条 -->
		<!-- <slider class="audio-slider" :activeColor="color" block-size="16" :value="current" :max="duration" @changing="seek=true,current=$event.detail.value" @change="change"></slider> -->
		 
		 <!-- 总时长 -->
		<view class="time">{{ duration }}”</view>
	
		<!-- 播放按钮 -->
		<image class="audio-control-switch" 
		v-if="loading"
		src="http://www.ebangongbao.com/officetreasure/mainfolder/weather/audio.gif" @click="operation" ><!-- 播放器样式 --></image>
		<!-- 暂停按钮 -->
		<image v-if="paused" 
		class="paused" 
		src="http://www.ebangongbao.com/officetreasure/mainfolder/weather/画板 1.png"  
		@click="operation" ><!-- 播放器样式 --></image>
		<!-- 删除按钮 -->
		<image src="http://www.ebangongbao.com/officetreasure/mainfolder/weather/叉号.png" class="delete-audio" @click="$emit('click')"></image> 
	</view>
</template>

<script>
	const Audio = uni.createInnerAudioContext(); //创建音频
	export default {
		data() {
			return {
				// currentTime: '', //当前播放时间
				durationTime: '', //总时长
				// current: '', //slider当前进度
				loading: false, // 播放动画
				paused: true, //是否处于暂停状态
				seek: false, //是否处于拖动状态
				audio: null,  // 音频实例
				timer: null
			}
		},
		props: {
			src: String, //音频链接
			autoplay: { 
				type: Boolean,
				default: false
			}, //是否自动播放
			duration: Number, //总时长（单位：s）
			control: {
				type:Boolean,
				default: false
			}, //是否需要上一曲/下一曲按钮
			continue:Boolean,//播放完成后是否继续播放下一首，需定义@next事件
			color: {
				type:String,
				default:'#fff'
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
				if (Audio.paused) {
					// 如果暂停就播放
					console.log('手动播放');
					Audio.play()
					this.paused = false
					this.loading = true
					this.timer = setTimeout(() => {
						this.loading = false;
						this.paused = true;
					}, this.duration * 1000 + 1000)
				} else {
					// 否则就暂停
					console.log('手动暂停');
					clearTimeout(this.timer);
					Audio.pause()
					this.loading = false
					this.paused = true
				}
			},
			//完成拖动事件
			// change(e) {
			// 	Audio.seek(e.detail.value)
			// }
		},
		mounted() {
			Audio.src = this.src
			// this.current = 0
			// this.durationTime = this.format(this.duration)
			// 不遵循静音开关
			Audio.obeyMuteSwitch = false
			// 自动播放
			Audio.autoplay = this.autoplay
			// 音频进度更新事件
			// audio.onTimeUpdate(() => {
			// 	if (!this.seek) {
			// 		this.current = audio.currentTime
			// 	}
			// })
			//音频播放事件
			Audio.onPlay(() => {
				console.log('开始播放');
				this.paused = false
				this.loading = true
			})
			//音频暂停事件
			Audio.onPause(() => {
				console.log('播放暂停');
				this.paused = true
				this.loading = false
				Audio.destroy();
			})
			//音频结束事件
			Audio.onEnded(() => {
				console.log('播放结束');
				this.loading = false
				this.paused = true
				// 销毁音频实例
				Audio.destroy();
			})
			// 音频播放停止事件
			Audio.onStop(() => {
				console.log('播放停止');
				this.loading = false
				this.paused = true
				// 销毁音频实例 
				Audio.destroy();
			})
			//音频完成更改进度事件
			// audio.onSeeked(() => {
			// 	this.seek = false
			// })
			Audio.onError((res) => {
			console.log(res.errMsg);
			console.log(res.errCode);
			Audio.destroy();//发生错误后，销毁实例
			});
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

<style scoped>
	.audio-wrap {
		width: 625rpx;
		margin: 0 34rpx;
		display: flex;
		overflow: hidden;
		justify-content: space-around;
		align-items: center;
		height: 88rpx !important;
		margin-bottom: 20rpx !important;
		background: #5D9FBD;
		border-radius: 60rpx;
		position: relative;
		box-shadow: 0 5rpx 10rpx rgba(93, 159, 189, .5);
		
	}
	
	.time {
		z-index: 9;
		position: absolute;
		left: 60rpx;
		top: 15rpx;
		font-size: 40rpx;
		color: #fff;
	}
	
	
	.audio-control-switch {
		// 播放按钮
		position: absolute;
		left: -25rpx;
		top: -118rpx;
		width: 100%;
		height: 400%;
	}
	.paused {
		// 暂停按钮
		position: absolute;
		z-index: 0;
		left: -25rpx;
		top: -113rpx; 
		width: 100%;
		height: 400%;
	}
	
	.delete-audio {
		position: absolute;
		z-index: 9;
		right: 50rpx;
		top: 30rpx;
		width: 35rpx;
		height: 35rpx;

	}


</style>