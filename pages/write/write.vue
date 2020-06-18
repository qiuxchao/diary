<template>
	<view>
		
		 <hx-navbar title="编辑笔记" 
		 left-icon="arrowleft" 
		 @click-left="saveDiary" 
		 :fixed="true" 
		 :back="false"
		 >
		     <view style="padding-left: 30rpx;" slot="left"></view>
		     <view @click="picker" slot="right" style="padding-right: 40rpx; font-size: 25rpx; color: #656565;">添加提醒</view>
		 </hx-navbar>
		
		<view class="write">
			<!-- 内容 -->
			<view class="content"> 
				<view class="date-weather"> 
					<text class="clear" v-if="weather == '晴'">晴</text> 
					<text class="flurry" v-if="weather == '小雪'">小雪</text>	  
					<text class="deluge" v-if="weather == '小雨'">小雨</text>
					<text class="cloudy" v-if="weather == '多云'">多云</text>
					<text class="heavy-snow" v-if="weather == '大雪'">大雪</text>
					<text class="haze" v-if="weather == '雾'">雾</text> 
					<text class="baoxue" v-if="weather == '暴雪'">暴雪</text> 
					<text class="baoyu" v-if="weather == '暴雨'">暴雨</text> 
					<text class="dabaoyu" v-if="weather == '大暴雨'">大暴雨</text> 
					<text class="dayu" v-if="weather == '大雨'">大雨</text> 
					<text class="dongyu" v-if="weather == '冻雨'">冻雨</text> 
					<text class="fuchen" v-if="weather == '浮尘'">浮尘</text> 
					<text class="leizhenyu" v-if="weather == '雷阵雨'">雷阵雨</text> 
					<text class="lzybbb" v-if="weather == '雷阵雨伴冰雹'">雷阵雨伴冰雹</text> 
					<text class="qscb" v-if="weather == '强沙尘暴'">强沙尘暴</text> 
					<text class="scb" v-if="weather == '沙尘暴'">沙尘暴</text> 
					<text class="tdby" v-if="weather == '特大暴雨'">特大暴雨</text> 
					<text class="yangsha" v-if="weather == '扬沙'">扬沙</text> 
					<text class="yin" v-if="weather == '阴'">阴</text> 
					<text class="yjx" v-if="weather == '雨夹雪'">雨夹雪</text> 
					<text class="zhenxue" v-if="weather == '阵雪'">阵雪</text> 
					<text class="zhenyu" v-if="weather == '阵雨'">阵雨</text> 
					<text class="zhongxue" v-if="weather == '中雪'">中雪</text> 
					<text class="zhongyu" v-if="weather == '中雨'">中雨</text> 
					<text v-if="!weather">^-^</text>
					<view class="date">
						<text>{{ date || localeDate}}</text>
						<text class="location">{{ location.city + location.district }}</text>
					</view>
				</view>  
				  
				<view class="input" ref="input"> 
					<jinEdit
					:key="key"
					:html="html" 
					:showImgSize="false" 
					:showImgToolbar="false" 
					placeholder="请输入内容..."  
					@editOk="editOk" 
					:networkVideoPaths="networkVideoPaths"
					></jinEdit> 
				</view>
			</view>
			
			<!-- 删除笔记模态框 -->
			<u-modal v-model="show" content="是否保存？" @cancel="cancel" :show-cancel-button="true" @confirm="saveNote" ></u-modal>
		</view>
		
		<!-- 日期选择器 -->
		<u-picker mode="time" @confirm="startTime" v-model="showStartTime" :params="params" :default-time="nowTime"></u-picker>
		<u-picker mode="time" @confirm="endTime" v-model="showEndTime" :params="params" :default-time="selectStartTime"></u-picker>
		
		<!-- 提示框 -->
		<u-toast ref="uToast" />
		
		
	</view>
	
</template>

<script>
	// 引入富文本编辑器插件
	import jinEdit from '@/components/jin-edit/jin-edit.vue';
	// 导航栏
	import hxNavbar from "@/components/hx-navbar/hx-navbar.vue"
	export default {
		data() {
			return {
				show: false,	// 保存笔记模态框
				placeholder: "",
				title: "",	// 提醒内容
				html: "",  // 日记内容
				date: "",	// 日记时间
				location: "",  // 位置
				weather: "",   // 天气
				networkVideoPaths: [],	// 音频文件
				localeDate: "",	// 本地时间
				key: 0,
				showStartTime: false,	// 日期开始时间选择器开关
				showEndTime: false,	// 日期结束时间选择器开关
				nowTime: "",  // 当前完整时间
				params: {  // picker 选择器默认配置
					year: true,
					month: true,
					day: true,
					hour: true,
					minute: true,
					second: true
				},
				selectStartTime: "",	// 选择的开始时间
				selectEndTime: "",	// 选择的结束时间
				
			}; 
		},
		computed: {
			// 删除 html 标签
			alertTitle(){
				return this.title.replace(/<[^>]+>/g, "");
			}
		},
		onLoad(data) {
			// 页面加载完成，获取上个页面传来的笔记的id
			console.log('写日记页面接受的id：', data.id);
			// 发起请求，通过id获取本篇日记的数据：html、audioPaths
			if (data.id) {
				this.api.request({
					url: "/note/selectNoteById",
					method: "POST",
					data: {noteId: data.id}
				}).then(res => {
					console.log('此篇日记的数据：', res.data); 
					let allData = res.data;
					// 将数据传入富文本进行解析
					if(allData.noteContent) {
						this.html = allData.noteContent;
					} else {
						this.html = "<p> </p>"
					}
					if(allData.amendTime) {
						this.date = allData.amendTime.slice(5);
					}
					if(allData.noteAudios) {
						this.networkVideoPaths = allData.noteAudios;
					}
					console.log(`html: ${this.html}, date: ${this.date}, networkVideoPaths: ${this.networkVideoPaths}`);
					++this.key;
				}).catch(err => {
					console.log('获取此篇日记数据错误：', err);
				});
			}

		},
		created() {
			// 查询天气
			uni.getStorage({ 
				key: 'location',
				success: (res) => {
					console.log('地址：', res.data);
					// 设置本地位置显示
					this.location = res.data;
					// 发送请求，查询天气
					this.api.request({
						url: "/note/selectCityByName",
						method: "POST",
						data: {cityName: res.data.city}
					}).then(res => {
						console.log('查询天气成功：', res);
						this.weather = res.data;
					}).catch(err => {
						console.log('查询天气失败：', err);
					});
				},
				fail: (err) => {
					// 缓存中没有地址数据，使用死数据
					this.location = { "city": "郑州市","district": "" }
				} 
			});
			 
			// 时间戳，如果没有日记数据中的时间，就使用本地时间
			let date = new Date();
			let year = date.getFullYear();		
			let month = String(date.getMonth()+1);
			if(month.length == 1) {
				month = 0 + month;
			}
			let day = String(date.getDate());
			if(day.length == 1) {
				day = 0 + day;
			}
			let hour = String(date.getHours());
			if (hour.length == 1) {
				hour = 0 + hour;
			}
			let minute = String(date.getMinutes());
			if (minute.length == 1) {
				minute = 0 + minute;
			} 
			let second = String(date.getSeconds());
			if (second.length == 1) {
				second = 0 + second;
			}
			this.localeDate= month + '月' + day + '日 ' + hour +':'+minute+':'+second;
			console.log(`${year}-${month}-${day} ${hour}:${minute}:${second}`);
			this.nowTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
		},
		mounted() {},
		onUnload() {
			console.log("页面卸载");
		},
		onBackPress(options) {
			this.show = true; 
			return true;  
		},
		onHide() {
			// 保存笔记
			console.log('隐藏')
		},
		methods: {
			picker() {
				this.$refs.uToast.show({
					title: '请选择开始时间',
					type: 'primary', 
					// 如果不需要图标，请设置为false
					icon: true,
					duration: 5000,
				});
				this.showStartTime = true;
			},
			startTime(time) {
				this.showStartTime = false;
				this.selectStartTime = `${time.year}-${time.month}-${time.day} ${time.hour}:${time.minute}:${time.second}`;
				console.log("开始时间", this.selectStartTime);
				this.$refs.uToast.show({
					title: '请选择结束时间',
					type: 'primary', 
					// 如果不需要图标，请设置为false
					icon: true,
					duration: 5000,
				});
				this.showEndTime = true;
			},
			endTime(time) {
				this.selectEndTime = `${time.year}-${time.month}-${time.day} ${time.hour}:${time.minute}:${time.second}`;
				console.log("结束时间：", this.selectEndTime);
				// 保存笔记
				uni.showLoading({
				    title: '正在添加提醒...'
				});
				let title  = this.alertTitle;
				// console.log(title);
				let options = {
					title: title,
					location: this.location.city + this.location.district,
					startTime: this.selectStartTime,
					endTime: this.selectEndTime
				};
				console.log(options);
				this.addRemind(options);
				uni.hideLoading();
				this.$refs.uToast.show({
					title: '已成功添加提醒至日程中',
					type: 'success', 
					// 如果不需要图标，请设置为false
					icon: true,
					duration: 3500,
				});
			},
			addRemind(options) {
				// 向日历中添加提醒
				const dcRichAlert = uni.requireNativePlugin('CRGG-Plugin'); 
				dcRichAlert.setcalendar({
					title: options.title,	// 提醒标题
					location: options.location, // 提醒地址
					allDay: '1', 	// 提醒天数
					startDate: options.startTime,	// 开始时间	 
					endDate: options.endTime, 	// 结束时间
					description: "办公宝日记提醒", 	// 提醒描述
					alarmArray_ios: ['-7.f', '-17.f', '-27.5f'],  
					alarmArray_android: [1, 2, 10],  
					result: () => {  
						if (result.type == '0') { 
							//失败 message 
							console.log('添加失败');
							} else {
								//成功
								console.log("添加成功");
							}
					} 
				});
			},
			cancel() {
				// 取消保存，直接跳转
				// 跳转日记列表
				uni.redirectTo({
					url: '../../pages/index/index'
				});
			},
			saveNote() {
				// 保存笔记
				uni.$emit('save', {});
			},
			saveDiary() {
				console.log('返回事件');
				uni.$emit('save', {});
			},
			editOk(html) {
				// 富文本编辑器注册的事件，接受的值是 html 字符串
				// console.log(html);
				this.title = html;
			},
		},
		components: {
			// 注册组件
			jinEdit,
			hxNavbar
		}
	}
</script>

<style lang="scss" scoped>
	.write {
		padding: 0 30rpx;
		.content {
			position: fixed;
			left: 15rpx;
			top: 190rpx;
			z-index: -999;
			overflow: hidden;
			width: 720rpx;
			height: 1800rpx;
			border-radius: 20rpx;
			background-color: #EFFAFF;
			box-shadow: 0 0 30rpx rgba(0, 105, 153, 0.4);
			padding: 20rpx 10rpx;
			.date-weather {
				padding: 0 10rpx; 
				width: 100%;
				display: flex;
				justify-content: space-between;
				align-items: center;
				text {
					font-size: 35rpx;
					padding-left: 60rpx;
					text-align: left;
					color: #5D9FBD;
				}
				.test {
					background: url(http://ebangongbao.com/officetreasure/mainfolder/folder/weather/晴.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				} 
				.clear {
					// 晴
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/晴.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.flurry {
					// 小雪
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/小雪.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.deluge {
					// 大雨
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/大雨.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.cloudy {
					// 多云
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/多云.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.heavy-snow {
					// 大雪
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/大雪.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.haze {
					// 雾
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/雾.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.baoxue {
					// 暴雪
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/暴雪.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.baoyu {
					// 暴雨
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/暴雨.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.dabaoyu {
					// 大暴雨
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/大暴雨.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.dayu {
					// 大雨
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/大雨.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.dongyu {
					// 冻雨
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/冻雨.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.fuchen {
					// 浮尘
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/浮尘.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.leizhenyu {
					// 雷阵雨
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/雷阵雨.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.lzybbb {
					// 雷阵雨伴冰雹
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/雷阵雨伴冰雹.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.qscb {
					// 强沙尘暴
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/强沙尘暴.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.scb {
					// 沙尘暴
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/沙尘暴.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.tdby {
					// 特大暴雨
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/特大暴雨.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.yangsha {
					// 扬沙
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/扬沙.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.yin {
					// 阴
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/阴.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.yjx {
					// 雨夹雪
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/雨夹雪.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.zhenxue {
					// 阵雪
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/阵雪.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.zhenyu {
					// 阵雨
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/阵雨.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.zhongxue {
					// 中雪
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/中雪.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				.zhongyu {
					// 中雨
					background: url(http://ebangongbao.com/officetreasure/mainfolder/weather/中雨.png) left center no-repeat;
					background-size: 47rpx 47rpx;
				}
				
				.date {
					display: flex;
					flex-direction: column;
					text-align: right;
					letter-spacing: 0.2em;
					text {
						font-size: 25rpx;
						color: #5D9FBD;
					}
					.location {
						text-align: right;
						letter-spacing: 0.1em;
						margin-top: 1.5rpx;
					}
					.location::before {
						content: "";
						width: 17rpx;
						height: 22rpx;
						margin-right: 10rpx;
						display: inline-block;
						background: url(http://192.168.1.169:8080/folder/weather/wz.png) left center no-repeat;
						background-size: 17rpx 22rpx;
					}
				}
			}
			
			.input {
				overflow: hidden;
			}
		}
	

	}

</style>
