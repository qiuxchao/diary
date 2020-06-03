<template>
	<view class="container" :style="{ paddingBottom: showMoreTool ? '220rpx' : '120rpx'}"> 
		
		<!-- 录音列表，先判断录音数组中是否有至少一条录音 -->
		<view class="video-list" >
			<view class="video-item" v-for="(item, index) in videoPaths" :key="index">
				<imtAudio :src="item.uri" :duration="item.time" />
			</view>
		</view>
	
		<editor
			class="ql-container"
			:placeholder="placeholder"
			:show-img-size="showImgSize"
			:show-img-toolbar="showImgToolbar"
			:show-img-resize="showImgResize"
			@ready="onEditorReady"
			id="editor"
			@statuschange="statuschange"
			@focus="editFocus" 
			@blur="editBlur"
			ref="editot"
		></editor>   
		<!-- 操作工具 -->
		<view class="tool-view" > 
			<view class="tool">
				<jinIcon class="single" type="&#xe61e;" font-size="44rpx" title="插入图片" @click="insertImage"></jinIcon>
				<jinIcon class="single" type="&#xe6ec;" font-size="44rpx" title="修改文字样式" @click="showMore" :color="showMoreTool ? activeColor : '#666666'"></jinIcon>
				<!-- <jinIcon class="single" type="&#xe6eb;" font-size="44rpx" title="分割线" @click="insertDivider"></jinIcon> -->
				<jinIcon class="single centerwz" type="&#xe63d;" font-size="46rpx" title="录音" @click="setVideo" :color="showVideo ? activeColor : '#666666'"></jinIcon>
				<jinIcon class="single" type="&#xe662;" font-size="45rpx" title="撤销" @click="undo"></jinIcon>
				<jinIcon class="single" type="&#xe61f;" font-size="46rpx" title="重做" @click="redo"></jinIcon>
				<jinIcon class="single" type="&#xe936;" font-size="46rpx" title="保存" @click="showSetting"></jinIcon>
			</view>
			<!-- 文字相关操作 -->
			<view class="font-more" :style="{ height: showMoreTool ? '100rpx' : 0 }">
				<jinIcon class="single" type="&#xe60e;" font-size="44rpx" title="加粗" @click="setBold" :color="showBold ? activeColor : '#666666'"></jinIcon>
				<jinIcon class="single" type="&#xe6ef;" font-size="44rpx" title="斜体" @click="setItalic" :color="showItalic ? activeColor : '#666666'"></jinIcon>
				<jinIcon class="single" type="&#xe628;" font-size="44rpx" title="下滑线" @click="setIns" :color="showIns ? activeColor : '#666666'"></jinIcon>
				<jinIcon class="single" type="&#xe6e2;" font-size="44rpx" title="标题" @click="setHeader" :color="showHeader ? activeColor : '#666666'"></jinIcon>
				<jinIcon class="single" type="&#xe6e7;" font-size="44rpx" title="居中" @click="setCenter" :color="showCenter ? activeColor : '#666666'"></jinIcon>
				<jinIcon class="single" type="&#xe6e6;" font-size="44rpx" title="居右" @click="setRight" :color="showRight ? activeColor : '#666666'"></jinIcon>
			</view>
			
			
			<!-- 录音 -->
			<view class="video-more" :style="{height: showVideo ? '100rpx' : 0}">
				<jinIcon v-show="isStart" class="single" type="&#xe741;" font-size="50rpx" title="录制" @click="startVideo" :color="showHeader ? activeColor : '#666666'"></jinIcon>
				<jinIcon v-show="!isStart" class="single" type="&#xe60c;" font-size="50rpx" title="结束" @click="stopVideo" :color="showHeader ? activeColor : '#666666'"></jinIcon>
				<text>录制时长：{{ videoTime }}秒</text>
			</view>
			
			<view class="setting-layer-mask" v-if="showSettingLayer" @click="showSetting"></view>
			
			<!-- 提交按钮 -->
			<view class="setting-layer" v-if="showSettingLayer">
				<view class="single" @click="release(true)">
					<jinIcon class="icon" type="&#xe639;" ></jinIcon>
					<view>公开发布</view>
				</view>
				<view class="single" @click="release(false)">
					<jinIcon class="icon" type="&#xe655;" ></jinIcon>
					<view>私密保存</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import jinIcon from './jin-icons.vue';
import imtAudio from '../imt-audio/imt-audio.vue'

export default {
	props: {
		// 点击图片时显示图片大小控件
		showImgSize: {
			type: Boolean,
			default: false
		},
		// 点击图片时显示工具栏控件
		showImgToolbar: {
			type: Boolean,
			default: false
		},
		// 点击图片时显示修改尺寸控件
		showImgResize: {
			type: Boolean,
			default: false
		},
		// 占位符
		placeholder: {
			type: String,
			default: '输入内容...'
		},
		// 图片上传的地址
		uploadFileUrl: {
			type: String,
			default: '#'
		},
		// 上传文件时的name
		fileKeyName: {
			type: String,
			default: 'file'
		},
		// 上传图片时，http请求的header
		header: {
			type: Object
		},
		// 初始化html
		html: {
			type: String,
			default: "<span></span>"
		},
		// 网络获取的录音文件
		networkVideoPaths: Array,
	},
	computed:{},
	data() {
		return {
			showMoreTool: false,  // 是否显示更多工具
			showBold: false,	// 是否显示字体加粗按钮
			showItalic: false,  // 是否显示字体倾斜按钮
			showIns: false,	 	// 是否显示下划线按钮
			showHeader: false,	// 是否显示标题按钮
			showCenter: false,  // 是否显示居中按钮
			showRight: false,   // 是否显示右对齐按钮
			showSettingLayer: false,  // 是否显示设置层
			showVideo: false,	// 是否显示录音层
			activeColor: '#F56C6C',  // 选中样式
			isStart: true,		// 录制按钮与结束按钮状态
			localeImgPaths: [],	// 选择的所有本地图片路径
			networkImgPaths: {},	// 接受到接口返回的网络路径
			recorderManager: {},	// 全局唯一的录音管理器
			videoPaths: [],  // 录音文件路径列表
			videoTime: 0,	// 录制时间
			timer: false,	// 定时器
			innerAudioContext: {}	// 音频对象
		};
	},
	components: {
		jinIcon,
		imtAudio
	},
	created() {},
	methods: {
		// 开始录音
		startVideo(){
            console.log('开始录音');
			this.isStart = false;  // 按钮样式
			uni.showToast({
			    title: '正在录音',
			    duration: 1000
			});
			// 清空录制时间
			this.videoTime = 0;	
            this.recorderManager.start();  // 开始录制
			this.timer = true;  // 开启定时器
			let timer = setInterval(() => {
				if(this.timer) {
					this.videoTime++;
				} else {
					clearInterval(timer);
				}
			}, 1000);
			
		},
		
		// 结束录音
		stopVideo(){
			this.isStart = true;	// 按钮样式 
			this.recorderManager.stop();  // 关闭录音器
			this.timer = false;	// 关闭定时器
			// 转换本地文件路径为网络文件路径
			this.recorderManager.onStop((res) => {
				console.log('录音结束：', res.tempFilePath);
				let videoFile = "blob://"+res.tempFilePath;
				// 发起请求，将本地录音文件上传
				uni.uploadFile({
					url: "http://192.168.1.169:8080/note/test",
					name: 'file',
					// formData: {tiem: this.videoTime},
					// fileType: 'audio', 
					filePath: videoFile,
					success: res => {
						// 这里需要接收到 音频文件的网络地址和音频文件的时长 s
						console.log(res);
						// 将本次录音网络路径和录音时间添加到数组
						// this.videoPaths.push({time: this.videoTime, uri: res.tempFilePath});
					},
					fail(errMsg) {
						console.log("接口调用失败: ", errMsg.errMsg);
					}
				});
				// console.log(this.videoPaths);
			});
		},
		
		// 播放录音
		playVideo(videoPath){
			console.log('播放录音', videoPath);
			this.innerAudioContext = uni.createInnerAudioContext();
			innerAudioContext.autoplay = true;
			innerAudioContext.src = videoPath;
			innerAudioContext.play();
		},
		
		// 编辑器初始化完成
		onEditorReady(e) {
			// 编辑器初始化完成时触发
			uni.createSelectorQuery()
				.in(this)
				.select('.ql-container')
				.fields({
					size: true,
					context: true
				},res => {
					this.editorCtx = res.context;
					this.editorCtx.setContents({
						html: this.html
					})
				})
				.exec();
			// 初始化音频文件列表
			this.videoPaths = this.networkVideoPaths;
			
		},
		// 清空内容
		undo() {
			this.editorCtx.undo();
		},
		// 插入图片
		insertImage() {
			// 选择图片
			uni.chooseImage({
				count: 9, // 默认9
				sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
				sourceType: ['album', 'camera'], //从相册选择
				success: async(res) => {  // 图片选择成功
					console.log(res);
					// 拿到图片的本地路径
					var tempFilePaths = res.tempFilePaths;
					uni.showLoading({
						// 加载动画
						// title: '正在上传中...'
						title: ''
					});
					// 选择图片完成后处理，将图片插入到编辑器中
					for (let tempFilePath of tempFilePaths) {
						this.editorCtx.insertImage({
							src: tempFilePath,  // 将当前图片设置为本地路径
							alt: '图片',
							success: function(e) {}
						});
						// 关闭加载动画
						uni.hideLoading();
						console.log(tempFilePath);
						// 将当前图片添加到图片数组
						this.localeImgPaths.push({uri: tempFilePath, name: tempFilePath});
					}
				}
			});
		},
		// 录音
		setVideo() {
			this.showVideo = !this.showVideo;
			// 获取全局录音器
			this.recorderManager = uni.getRecorderManager();
		},
		// 插入分割线（未启用）
		insertDivider() {
			this.editorCtx.insertDivider();
		},
		// 撤销
		redo() {
			this.editorCtx.redo();
		},
		// 修改文字样式
		showMore() {
			this.showMoreTool = !this.showMoreTool;
			this.editorCtx.setContents()
		},
		setBold() {
			this.showBold = !this.showBold;
			this.editorCtx.format('bold');
		},
		setItalic() {
			this.showItalic = !this.showItalic;
			this.editorCtx.format('italic');
		},
		checkStatus(name, detail, obj) {
			if (detail.hasOwnProperty(name)) {
				this[obj] = true;
			} else {
				this[obj] = false;
			}
		},
		statuschange(e) {
			var detail = e.detail;
			this.checkStatus('bold', detail, 'showBold');
			this.checkStatus('italic', detail, 'showItalic');
			this.checkStatus('ins', detail, 'showIns');
			this.checkStatus('header', detail, 'showHeader');
			if (detail.hasOwnProperty('align')) {
				if (detail.align == 'center') {
					this.showCenter = true;
					this.showRight = false;
				} else if (detail.align == 'right') {
					this.showCenter = false;
					this.showRight = true;
				} else {
					this.showCenter = false;
					this.showRight = false;
				}
			} else {
				this.showCenter = false;
				this.showRight = false;
			}
		},
		setIns() {
			this.showIns = !this.showIns;
			this.editorCtx.format('ins');
		},
		setHeader() {
			this.showHeader = !this.showHeader;
			this.editorCtx.format('header', this.showHeader ? 'H2' : false);
		},
		setCenter() {
			this.showCenter = !this.showCenter;
			this.editorCtx.format('align', this.showCenter ? 'center' : false);
		},
		setRight() {
			this.showRight = !this.showRight;
			this.editorCtx.format('align', this.showRight ? 'right' : false);
		},
		showSetting() {
			// 点击提交按钮触发的事件
			// this.showSettingLayer = !this.showSettingLayer;
			// 提交数据
			this.upLoadImgs();
		},
		editFocus() {},
		editBlur() {},
		release(isPublic) {
			// 替换 html 内容，然后上传到接口
			this.showSettingLayer = false;
			this.editorCtx.getContents({
				success: res => {
					// console.log(res);
					let html = res.html;
					console.log("替换前：", html);
					
					// 遍历本地图片路径与网络图片路径的对象数组，逐个替换
					this.networkImgPaths.imgList.forEach(item => {
						// 本地路径 : 网络路径
						// 获取键名
						// console.log("item:", item);
						let key = Object.keys(item)[0];
						// console.log("key:", key);
						let reg = new RegExp(key, 'g');
						// console.log("reg:", reg);
						html = html.replace(reg, item[key]);
					});
					console.log("替换后：", html);
					
					// 发起二次请求，将替换好的 html 提交
					uni.showLoading({
						// 加载动画
						// title: '正在上传中...'
						title: ''
					});
					uni.request({
						url: "http://192.168.1.169:8080/note/textUpload",  // 接收的接口地址
						method: "POST",
						data: { noteContent: html}
					})
						.then(res => {
							console.log(res);
							uni.hideLoading();
						})
						.catch(err => {
							console.log(err);
							uni.hideLoading();
						});
					
					Object.assign(res, {
						isPublic: isPublic
					})
					this.$emit('editOk', html);
				} 
			})
		},
		upLoadImgs() {
			// 上传全部图片到服务器，再替换 html 本地路径为网络路径
			if (this.localeImgPaths[0]) {
				// 本地图片有内容，上传图片，替换 html 字符串
				uni.showLoading({
					// 加载动画
					// title: '正在上传中...'
					title: ''
				});
				uni.uploadFile({
					url: this.uploadFileUrl,  // 接收的接口地址
					files: this.localeImgPaths,	// 要上传文件资源的本地路径
					name: this.fileKeyName,  // 文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容	
					header: this.header,	 // HTTP 请求 Header, header 中不能设置 Referer。
					success: res => {
						console.log("res", JSON.parse(res.data));
						// 将数据存储到本地
						this.networkImgPaths = JSON.parse(res.data).data;	
				
						// 将html字符串中的本地路径替换为网络路径
						this.release(true); 
						
						// 关闭加载动画
						uni.hideLoading()
						console.log(this.localeImgPaths, "发送完成");
					}
				});
			} else {
				// 本地图片没有内容，直接上传 html
				this.showSettingLayer = false;
				this.editorCtx.getContents({
					success: res => {
						// console.log(res);
						let html = res.html;
						
						// 发起请求，将 html 提交
						uni.showLoading({
							// 加载动画
							// title: '正在上传中...'
							title: ''
						});
						uni.request({
							url: "http://192.168.1.169:8080/note/textUpload",  // 接收html的接口地址
							method: "POST",
							data: { noteContent: html}
						})
							.then(res => {
								console.log(res);
								uni.hideLoading();
							})
							.catch(err => {
								console.log(err);
								uni.hideLoading();
							})
						
						Object.assign(res, {
							isPublic: isPublic
						})
						this.$emit('editOk', html);
						uni.navigateTo({
						    url: '/pages/index'
						});
					} 
				});
			}

		}
	}
};
</script>

<style scoped>
.video-list {
	background: rgb(235, 235, 235);
}

.container {
	padding: 30rpx 0;
	box-sizing: border-box;
	padding-bottom: 120rpx;
}

.ql-container {
	line-height: 160%;
	font-size: 34rpx;
	width: calc(100% - 60rpx); 
	height: auto;
	margin: 0 auto;
} 
.tool-view{
	width: 100vw;
	position: fixed;
	bottom: 0;
	left: 0;
	
}
.tool {
	height: 100rpx;
	display: flex;
	align-items: center;
	justify-content: space-around;
	width: 100%;
	background: #eee;
}

.font-more {
	position: absolute;
	left: 0;
	bottom: 100rpx;
	display: flex;
	align-items: center;
	justify-content: space-around;
	width: 100%;
	background: rgb(235, 235, 235);
	overflow: hidden;
	transition: all 0.15s;
}
.video-more {
	position: absolute;
	left: 0;
	bottom: 100rpx;
	display: flex;
	align-items: center;
	justify-content: space-around;
	width: 100%;
	background: rgb(235, 235, 235);
	overflow: hidden;
	transition: all 0.15s;
}

.setting-layer {
	position: absolute;
	bottom: 100rpx;
	background: #fff;
	width: 250rpx;
	right: 20rpx;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	border-radius: 8rpx;
}
.setting-layer .single {
	height: 80rpx;
	font-size: 32rpx;
	padding: 0 30rpx;
	display: flex;
	align-items: center;
	line-height: 80rpx;
	flex-direction: row;
	color: #666;
}
.setting-layer .single .icon {
	margin-right: 20rpx;
}
.setting-layer-mask{
	position: fixed;
	left: 0;
	top: 0;
	width: 100vw;
	height: 100vh;
	background: transparent; 
}
</style>
