<template>
	<view class="container" :style="{ paddingBottom: showMoreTool ? '220rpx' : '120rpx'}" :class="{'padding-top': paddingTop}"> 
		
		<!-- 录音列表，先判断录音数组中是否有至少一条录音 -->
		<view class="video-list" v-if="allAudioPaths.length">
			<view class="video-item" v-for="(item, index) in allAudioPaths" :key="index">
				<imtAudio :src="item.uri" :duration="parseFloat(item.time)" @click="deleteAudio(item)"/>
			</view> 
		</view>
	  <view class="edit">
	  	<editor
	  		id="editor"
	  		class="ql-container"
	  		:placeholder="placeholder"
	  		:show-img-size="showImgSize"
	  		:show-img-toolbar="showImgToolbar"
	  		:show-img-resize="showImgResize"
	  		@ready="onEditorReady"
	  		@statuschange="statuschange"
	  		@focus="editFocus" 
	  		@blur="editBlur"
	  		ref="editot"
	  	></editor>
	  </view>
		<!-- 操作工具 --> 
		<view class="tool-view"> 
			<view class="tool">
				<jinIcon class="single img" type="&#xe61e;" font-size="44rpx" title="插入图片" @click="insertImage"></jinIcon>
				<jinIcon class="single text" type="&#xe6ec;" font-size="44rpx" title="修改文字样式" @click="showMore" :color="showMoreTool ? activeColor : '#fff'"></jinIcon>
				<!-- <jinIcon class="single" type="&#xe6eb;" font-size="44rpx" title="分割线" @click="insertDivider"></jinIcon> -->
				<jinIcon class="single centerwz audio" type="&#xe63d;" font-size="46rpx" title="录音" @click="setVideo" :color="showVideo ? activeColor : '#fff'"></jinIcon>
				<!-- <jinIcon class="single" type="&#xe662;" font-size="45rpx" title="撤销" @click="undo"></jinIcon> -->
				<!-- <jinIcon class="single" type="&#xe61f;" font-size="46rpx" title="重做" @click="redo"></jinIcon> -->
				<jinIcon class="single save" type="&#xe936;" font-size="46rpx" title="保存" @click="saveThis"></jinIcon>
			</view>
			<!-- 文字相关操作 -->
			<view class="font-more" :style="{ height: showMoreTool ? '100rpx' : 0 }">
				<jinIcon class="single" type="&#xe60e;" font-size="44rpx" title="加粗" @click="setBold" :color="showBold ? activeColor : '#fff'"></jinIcon>
				<jinIcon class="single" type="&#xe6ef;" font-size="44rpx" title="斜体" @click="setItalic" :color="showItalic ? activeColor : '#fff'"></jinIcon>
				<jinIcon class="single" type="&#xe628;" font-size="44rpx" title="下滑线" @click="setIns" :color="showIns ? activeColor : '#fff'"></jinIcon>
				<jinIcon class="single" type="&#xe6e2;" font-size="44rpx" title="标题" @click="setHeader" :color="showHeader ? activeColor : '#fff'"></jinIcon>
				<jinIcon class="single" type="&#xe6e7;" font-size="44rpx" title="居中" @click="setCenter" :color="showCenter ? activeColor : '#fff'"></jinIcon>
				<jinIcon class="single" type="&#xe6e6;" font-size="44rpx" title="居右" @click="setRight" :color="showRight ? activeColor : '#fff'"></jinIcon>
			</view>
			
			
			<!-- 录音 -->
			<view class="video-more" :style="{height: showVideo ? '100rpx' : 0}">
				<jinIcon v-show="isStart" class="single" type="&#xe741;" font-size="50rpx" title="录制" @click="startVideo" :color="showHeader ? activeColor : '#fff'"></jinIcon>
				<jinIcon v-show="!isStart" class="single" type="&#xe60c;" font-size="50rpx" title="结束" @click="stopVideo" :color="showHeader ? activeColor : activeColor"></jinIcon>
				<text>录制时长：{{ videoTime }} 秒</text>
			</view>
			
			<view class="setting-layer-mask" v-if="saveThisLayer" @click="saveThis"></view>
			
			<!-- 提交按钮 -->
			<view class="setting-layer" v-if="saveThisLayer">
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
		networkVideoPaths: {
			type: Array,
			default: new Array()
		}
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
			saveThisLayer: false,  // 是否显示设置层
			showVideo: false,	// 是否显示录音层
			activeColor: '#F56C6C',  // 选中样式
			isStart: true,		// 录制按钮与结束按钮状态
			localeImgPaths: [],	// 选择的所有本地图片路径
			networkImgPaths: {},	// 接受到接口返回的网络路径
			recorderManager: {},	// 全局唯一的录音管理器
			allAudioPaths: [],	// 全部的本地和网络的音频文件
			videoPaths: [],  // 录音文件路径列表
			videoTime: 0,	// 录制时间
			timer: false,	// 定时器
			innerAudioContext: {},	// 音频对象
			paddingTop: false
		};
	},
	components: {
		jinIcon, 
		imtAudio
	},
	mounted() {
		// 遍历网络路径的音频文件数组，将每一项附加到本地
		console.log('传入的网络音频路径：', this.networkVideoPaths);
		if(this.networkVideoPaths[0]) {
			this.networkVideoPaths.forEach(item => {
				this.allAudioPaths.push(item);
			});
		}
		// 接收到内容后再渲染
		// console.log(this.html); 
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
		// 监听父组件返回事件，触发本组件保存
		uni.$on('save', (res) => {
			console.log('触发返回事件');
			console.log('videoPaths', this.videoPaths)
			console.log('localeImgPaths', this.localeImgPaths)
			this.saveThis();
			uni.$off('save');
		});
	},
	watch: {
		videoPaths(newName, oldName) {
		  console.log('videoPaths 变化了', newName, oldName);
		  console.log('本地录音数组：', this.videoPaths);
		  let obj = newName[newName.length-1];
		  this.allAudioPaths.push(obj);
		  console.log('全部录音数组: ', this.allAudioPaths)
		}
	}, 
	methods: {
		// 删除录音
		deleteAudio(audio) {
			console.log('删除录音：', audio);
			if(this.allAudioPaths.includes(audio) && this.videoPaths.includes(audio)) {
				// 是一个本地录音
				this.videoPaths.splice(this.videoPaths.indexOf(audio, 1));
				this.allAudioPaths.splice(this.allAudioPaths.indexOf(audio), 1);
			} else {
				// 是一个网络录音，发起请求
				this.allAudioPaths.splice(this.allAudioPaths.indexOf(audio), 1);
				this.api.request({
					url: "/note/deleteByAudio",
					method: "POST",
					data: audio
				}).then(res => {
					console.log('录音删除结果：', res);
				}).catch(err => {
					console.log('录音删除失败：', err);
				})
			}
		},
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
            this.recorderManager.start({
				duration: 60000
			});  // 开始录制
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
				// 将本次录音时间和文件添加到数组中
				this.videoPaths.push({time: this.videoTime, uri: res.tempFilePath});
				console.log(this.videoPaths);
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
			this.$emit('editOk', this.html);
			
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
				success: (res) => {  // 图片选择成功
					console.log('本地图片路径：', res);
					// 拿到图片的本地路径
					var tempFilePaths = res.tempFilePaths;
					uni.showLoading({
						// 加载动画
						// title: '正在上传中...'
						title: ''
					});
					// 选择图片完成后处理，将图片插入到编辑器中
					for (let tempFilePath of tempFilePaths) {
						if(tempFilePath.startsWith('file://')) {
							this.editorCtx.insertImage({
								src: tempFilePath,  // 将当前图片设置为本地路径
								alt: '图片',
								width: '95%',
								height: '100%',
								extClass: 'newline',
								success: res => {
								}
							});
							this.editorCtx.insertText({text: " \n"});
							// 关闭加载动画
							uni.hideLoading();
							console.log('此次插入的本地图片路径：', tempFilePath);
							// 将当前图片添加到图片数组
							this.localeImgPaths.push({uri: tempFilePath, name: tempFilePath});
							console.log(this.localeImgPaths);
						} else {
							let path = 'file://' + plus.io.convertLocalFileSystemURL(tempFilePath);
							  console.log(path);
							this.editorCtx.insertImage({
								src: path ,// 将当前图片设置为本地路径
								alt: '图片',
								width: '95%',
								height: '100%',
								extClass: 'newline',
								success: res => {
								}
							});
							this.editorCtx.insertText({text: " \n"});
							// 关闭加载动画
							uni.hideLoading();
							console.log('此次插入的本地图片路径：', path);
							// 将当前图片添加到图片数组
							this.localeImgPaths.push({uri: path, name: path});
							console.log(this.localeImgPaths);
						}

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
		// 点击提交按钮触发的事件
		saveThis() {
			// this.saveThisLayer = !this.saveThisLayer;
			// 提交数据
			// 判断有没有音频
			if (this.videoPaths[0]) {
				// 有音频，上传音频
				let audioPaths = this.videoPaths.map((item) => {
					let uri = "file://" + plus.io.convertLocalFileSystemURL(item.uri);
					let time = item.time;
					return {name: time, uri: uri};
				});
				console.log('本地音频数组：', audioPaths); 
				uni.showLoading({
					// 加载动画
					title: '日记上传中...'
				});
				uni.uploadFile({ 
					//仅为示例，非真实的接口地址 
					url: this.api.URI.uploadAudio, 
					files: audioPaths, 
				}).then(res => {
					console.log('录音上传完成：', res);
					if(parseFloat(res[1].data.status) != 500) {
						// 上传图片
						this.upLoadImgs();
					} else {
						uni.hideLoading();
						this.$u.toast('保存失败，记事本空间不足');
					}
				}).catch(err => {
					console.log('上传音频失败：', err);
				});
			} else {
				// 没有音频，直接上传图片
				uni.showLoading({
					// 加载动画
					title: '日记上传中...'
				});
				this.upLoadImgs();
			}
			
		},
		editFocus() {
			this.paddingTop = true;
		},
		editBlur() {
			// 失去焦点
			this.paddingTop = false;
			this.editorCtx.getContents({
				success: res => {
					// console.log(res);
					let html = res.html;
					console.log(html);
					this.$emit('editOk', html);
				} 
			});
		},
		release(isPublic) {
			// 替换 html 内容，然后上传到接口
			// this.saveThisLayer = false;
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
					this.api.request({
						url: "/note/textUpload",  // 接收的接口地址
						method: "POST",
						data: { noteContent: html}
					})
						.then(res => {
							console.log('图片路径替换完成：', res);
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
					// 跳转日记列表
					uni.redirectTo({
					    url: '../../pages/index/index'
					});
				} 
			})
		},
		upLoadImgs() {
				// 上传全部图片到服务器，再替换 html 本地路径为网络路径
				if (this.localeImgPaths[0]) {
					// 本地图片有内容，上传图片，替换 html 字符串
					const uploadTask = uni.uploadFile({
						url: this.api.URI.images,  // 接收的接口地址
						files: this.localeImgPaths,	// 要上传文件资源的本地路径
						name: this.fileKeyName,  // 文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容	
						header: this.header,	 // HTTP 请求 Header, header 中不能设置 Referer。
						success: res => {
							console.log("本地图片上传结果：", JSON.parse(res.data));
							// 判断是否超出日记容量限制
							if (parseFloat(JSON.parse(res.data).status) != 500) {
								// 将数据存储到本地
								this.networkImgPaths = JSON.parse(res.data).data;	
								// 将html字符串中的本地路径替换为网络路径
								this.release(true); 
							} else {
								uni.hideLoading();
								this.$u.toast('保存失败，记事本空间不足!');
							}

						}
					}); 	
				} else {
					// 本地图片没有内容，直接上传 html
					// this.saveThisLayer = false;
					this.editorCtx.getContents({
						success: res => {
							// console.log(res);
							let html = res.html;
							// 发起请求，将 html 提交
							this.api.request({
								url: "/note/textUpload",  // 接收html的接口地址
								method: "POST",
								data: { noteContent: html}
							})
							.then(res => {
								console.log('html上传成功', res);
								uni.hideLoading();
							})
							.catch(err => {
								console.log(err);
								uni.hideLoading();
							})
							this.$emit('editOk', html);
							// 跳转日记列表
							uni.redirectTo({
								url: '../../pages/index/index'
							});
						} 
					});
				}
			}
	},
};
</script>

<style lang="scss" scoped>

view.padding-top {
	padding-top: 500rpx;
}
.container {
	padding: 30rpx 15rpx;
	box-sizing: border-box;
	height: 85vh;
	position: relative;
	width: 95vw;
	overflow-y: auto;
	.edit {
		height: 3000rpx;
		padding-bottom: 300rpx;
		.ql-container {
			height: 100%;
			line-height: 160%;
			font-size: 35rpx;
			// width: calc(100vw - 60rpx); 
			width: 100%;
		} 
	}
	
}


.tool-view{
	z-index: 99;
	position: fixed;
	width: 100vw !important;
	bottom: 0; 
	left: 0;
}
.tool {
	padding-bottom: 30rpx;
	position: fixed;
	bottom: 0;
	left: 0;
	height: 110rpx;
	display: flex;
	align-items: center;
	justify-content: space-around;
	width: 100vw;
	background: #5D9FBD;
	.single {
		position: relative;
	}
	.img::after {
		position: absolute;
		content: "图片";
		display: inline-block;
		font-size: 25rpx;
		color: #fff;
		font-weight: bold;
		width: 50rpx;
		height: 30rpx;
		bottom: -30rpx;
		left: 0;
	}
	.text::after {
		position: absolute;
		content: "文字样式";
		display: inline-block;
		font-size: 25rpx;
		color: #fff;
		font-weight: bold;
		width: 100rpx;
		height: 30rpx;
		bottom: -30rpx;
		left: -25rpx;
	}
	.audio::after {
		position: absolute;
		content: "录音";
		display: inline-block;
		font-size: 25rpx;
		color: #fff;
		font-weight: bold;
		width: 50rpx;
		height: 30rpx;
		bottom: -30rpx;
		left: 0;
	}
	.save::after {
		position: absolute;
		content: "保存";
		display: inline-block;
		font-size: 25rpx;
		color: #fff;
		font-weight: bold;
		width: 50rpx;
		height: 30rpx;
		bottom: -30rpx;
		left: 0;
	}
}

.font-more {
	position: absolute;
	left: 0;
	bottom: 100rpx;
	display: flex;
	align-items: center;
	justify-content: space-around;
	width: 100%;
	background: #5D9FBD;
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
	background: #5D9FBD;
	overflow: hidden;
	transition: all 0.15s;
	text {
		color: #fff;
		font-size: 30rpx;
	}
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

/* 图片换行 */
.newline {
	margin-left: 10%;
	border-radius: 10rpx;
	box-sizing: 3rpx 5rpx 5rpx rgba(71, 95, 253, 0.41);
}

</style>
 