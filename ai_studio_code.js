/* --- 0. 音频引擎 --- */
const AudioEngine = {
    ctx: null,
    init: function() {
        if (!this.ctx) { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
        if (this.ctx.state === 'suspended') { this.ctx.resume(); }
    },
    playTone: function(freq, type, duration) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + duration);
    },
    playTypeSound: function() { this.playTone(800 + Math.random()*200, 'square', 0.05); },
    playClickSound: function() { this.playTone(600, 'square', 0.1); }
};

/* --- 1. 音乐播放器 PRO --- */
const musicPlaylist = [
    { url: 'assets/audio/backgroudmusic001.mp3', name: 'Track 1: Xi-Wave LoFi' },
    { url: 'assets/audio/backgroudmusic002.mp3', name: 'Track 2: Red Sun in Sky' },
    { url: 'assets/audio/backgroudmusic003.mp3', name: 'Track 3: Cyber March' }
];
let currentTrackIndex = 0;
let playMode = 'sequence'; 
const audioBGM = new Audio();
let isMusicPlaying = false;

function initMusicPlayer() {
    audioBGM.src = musicPlaylist[currentTrackIndex].url;
    audioBGM.volume = 0.5;
    updateTrackInfo();
    
    audioBGM.addEventListener('ended', () => {
        if (playMode === 'sequence') { playNextTrack(); } 
        else { audioBGM.currentTime = 0; audioBGM.play(); }
    });
}

function toggleMusic() {
    if (audioBGM.paused) {
        audioBGM.play().then(() => {
            isMusicPlaying = true;
            document.getElementById('btn-play-pause').innerHTML = "⏸";
        }).catch(e => console.log("Play failed", e));
    } else {
        audioBGM.pause();
        isMusicPlaying = false;
        document.getElementById('btn-play-pause').innerHTML = "⏯";
    }
}

function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicPlaylist.length;
    audioBGM.src = musicPlaylist[currentTrackIndex].url;
    updateTrackInfo();
    if (isMusicPlaying) audioBGM.play();
}

function togglePlayMode() {
    const btn = document.getElementById('btn-mode');
    if (playMode === 'sequence') {
        playMode = 'loop_one'; btn.innerHTML = "[单曲]";
    } else {
        playMode = 'sequence'; btn.innerHTML = "[列表]";
    }
}

function updateTrackInfo() {
    const marquee = document.getElementById('scrolling-track-name');
    marquee.innerHTML = `<marquee scrollamount="4">${musicPlaylist[currentTrackIndex].name}</marquee>`;
}

// 视频专用音频对象
const audioVideoTrack = new Audio(); 
audioVideoTrack.loop = true;

// 常量 URL 定义 (本地 MP3/AAC 路径)
// 指令2: 修复音频格式为 MP3，并更新常量
const URL_AUDIO_JAPAN_DEFEAT = 'assets/audio/xi win.mp3';
const URL_AUDIO_CHINA_DEFEAT = 'assets/audio/xi lose.mp3';
// 文科生救国不需要额外音频

// 其他音效
const audioXiFuneral = new Audio('assets/audio/dead music.mp3');
const audioHorror = new Audio('assets/audio/kongbu.mp3');
audioHorror.loop = true;

/* --- 2. 随机提示框 (Tip Box) --- */
const systemTips = [
    "💡 TIP: 连续点击水印可能会触发某些国安机关的注意...",
    "📢 系统广播: 添加tg群获取版本更新信息 t.me/nmudmlclub",
    "习猪头，我梯子卡了！！！！",
    "📢 系统广播: 全体居民请注意，今日核酸检测将在30分钟后开始。",
    "📢 系统广播: 别做梦了，你的Remake目的地已锁定：河南驻马店。",
    "💡 TIP: 习主席最喜欢的东西是绝对的忠诚。",
    "📢 招募: 柬埔寨生物实验室诚招志愿者，包吃包住（永久）。",
    "💡 TIP: 吃饱了撑的没事干？不如去梁家河突开两个沼气池助助兴。",
    "📢: 死妈偷蛆李颖、陆以恒、芙宁娜你们全家死光光",
    "📢 寻人启事: where is 秦刚",
    "📢 系统广播: 李嘉就是个卖逼的"
];

function updateRandomTip() {
    const tipContent = document.getElementById('random-tip-content');
    const randomTip = systemTips[Math.floor(Math.random() * systemTips.length)];
    tipContent.innerHTML = randomTip;
}

/* --- 3. 全局变量与启动 --- */
let playerName = "莉卡酱";
let watermarkClicks = 0; 
let canTriggerTrueEnd = false; 
let nextSceneAfterVideo = null; 
let hasMetAjing = false; // 阿晶剧情开关
let ajingClicks = 0; // 阿晶触发计数
let canTriggerAjingRoute = false; // 阿晶触发锁

function enterSite() {
    document.getElementById('start-screen-overlay').style.display = 'none';
    document.getElementById('main-container').style.display = 'grid';
    document.getElementById('music-player-ui').style.display = 'flex';
    
    AudioEngine.init();
    initMusicPlayer();
    toggleMusic(); 
    requestAnimationFrame(animateWatermark);
    
    updateRandomTip();
    setInterval(updateRandomTip, 8000); 
}

/* --- 4. 水印与碰撞 --- */
const watermark = document.getElementById('bouncing-watermark');
let x = Math.random() * (window.innerWidth - 100);
let y = Math.random() * (window.innerHeight - 100);
let dx = 2; let dy = 2;

function animateWatermark() {
    const rect = watermark.getBoundingClientRect();
    const winW = window.innerWidth; const winH = window.innerHeight;
    if (x + 100 >= winW || x <= 0) dx = -dx;
    if (y + 100 >= winH || y <= 0) dy = -dy;
    x += dx; y += dy;
    watermark.style.left = x + 'px'; watermark.style.top = y + 'px';
    requestAnimationFrame(animateWatermark);
}

watermark.addEventListener('click', function() {
    // 真结局触发 (最终选项)
    if (canTriggerTrueEnd) {
        watermarkClicks++;
        AudioEngine.playClickSound();
        const el = document.createElement('div');
        el.innerText = "⚠";
        el.style.cssText = `position:fixed; left:${x}px; top:${y}px; color:red; font-size:30px; font-weight:bold; pointer-events:none; z-index:10000;`;
        document.body.appendChild(el);
        setTimeout(()=>el.remove(), 500);
        if (watermarkClicks >= 5) triggerTrueEnd();
    }
    
    // 阿晶支线触发 (不甘选项) - 指令1: 修复水印点击事件
    if (canTriggerAjingRoute) {
        ajingClicks++;
        AudioEngine.playClickSound();
        const el = document.createElement('div');
        el.innerText = "🗿"; 
        el.style.cssText = `position:fixed; left:${x}px; top:${y}px; color:cyan; font-size:30px; font-weight:bold; pointer-events:none; z-index:10000;`;
        document.body.appendChild(el);
        setTimeout(()=>el.remove(), 500);
        if (ajingClicks >= 5) {
            canTriggerAjingRoute = false;
            hasMetAjing = true;
            els.choices.style.display = 'none'; // 新增:强制隐藏选项
            loadScene('scene_ajing_1');
        }
    }
});

/* --- 5. Galgame 核心逻辑 --- */
const els = {
    bg: document.getElementById('g-bg'),
    char: document.getElementById('g-char'),
    speaker: document.getElementById('g-speaker'),
    text: document.getElementById('g-text'),
    box: document.getElementById('d-box'),
    choices: document.getElementById('g-choices'),
    layerId: document.getElementById('layer-id-check'),
    layerName: document.getElementById('layer-name-input'),
    endBadXi: document.getElementById('end-bad-xi'),
    endBadExhaustion: document.getElementById('end-bad-exhaustion'),
    endBadCam: document.getElementById('end-bad-cambodia'),
    endGood: document.getElementById('end-good'),
    endGoodPink: document.getElementById('end-good-pink'),
    endTrue: document.getElementById('end-true'),
    video: document.getElementById('global-video-player'),
    skipBtn: document.getElementById('skip-video-btn')
};

function verifyID() {
    AudioEngine.playClickSound();
    const val = document.getElementById('input-id-card').value;
    const regex = /^\d{17}[\dXx]$/;
    if (regex.test(val)) { els.layerId.style.display = 'none'; els.layerName.style.display = 'flex'; }
    else { alert("格式错误！\n你是没有户口的低端人口吗？\n请配合工作！"); }
}

function submitName() {
    AudioEngine.playClickSound();
    const val = document.getElementById('input-player-name').value;
    if (val) playerName = val;
    els.layerName.style.display = 'none';
    els.box.style.display = 'block';
    loadScene('scene_greeting'); 
}

/* --- 强制视频播放逻辑 (指令2: 修复视频播放函数) --- */
function playEndingVideo(videoSrc, audioUrl, nextSceneId) {
    // 1. 暂停BGM
    audioBGM.pause();
    
    // 2. 隐藏所有游戏界面元素
    els.box.style.display = 'none';
    els.char.style.display = 'none';
    els.bg.style.display = 'none';
    els.choices.style.display = 'none';
    els.skipBtn.style.display = 'none';
    
    // 3. 设置视频音频
    if (audioUrl) {
        audioVideoTrack.src = audioUrl;
        audioVideoTrack.currentTime = 0;
        audioVideoTrack.loop = true; // 确保循环
        audioVideoTrack.play().catch(e => console.log("Audio play prevented", e));
    } else {
        audioVideoTrack.pause();
        audioVideoTrack.src = ""; // 清空
    }

    // 4. 设置并播放视频
    nextSceneAfterVideo = nextSceneId;
    els.video.src = videoSrc;
    els.video.load(); // 新增:强制重新加载视频
    els.video.style.display = 'block'; 
    els.video.style.zIndex = '1000';
    els.skipBtn.style.display = 'none';

    // 新增:监听视频结束事件
    els.video.onended = function() {
        skipVideo();
    };

    els.video.play().catch(e => {
        console.error("视频播放失败:", e);
        alert("视频加载失败,将自动跳过");
        setTimeout(() => skipVideo(), 2000);
    });

    // 5秒后显示跳过按钮
    setTimeout(() => {
        if (els.video.style.display === 'block') {
            els.skipBtn.style.display = 'block';
        }
    }, 5000);
}

/* --- 指令3: 修复skipVideo函数 --- */
function skipVideo() {
    // 停止视频音频
    audioVideoTrack.pause();
    audioVideoTrack.src = "";
    audioVideoTrack.load(); // 新增:强制重置音频
    
    // 隐藏视频
    els.video.pause();
    els.video.onended = null; // 新增:移除事件监听
    els.video.src = "";
    els.video.load(); // 新增:强制重置视频
    els.video.style.display = 'none';
    els.skipBtn.style.display = 'none';
    
    // 恢复 BGM
    if (isMusicPlaying) audioBGM.play();

    // 跳转下一幕
    if(nextSceneAfterVideo) {
        loadScene(nextSceneAfterVideo);
    }
}

/* --- 剧本数据 --- */
const gameData = {
    'scene_greeting': {
        speaker: "习主席 ",
        text: "哼，{name}是吧？虽然名字听起来很蠢，但我勉强记在小本本上了。",
        char: "assets/images/photo.png", 
        next: "scene_school_walk"
    },

    // ... (前段剧情省略) ...
    'scene_school_walk': {
        speaker: "旁白",
        text: "【走廊，人声嘈杂】你和习主席并排走在中南海附属中学的走廊上。突然，前方传来了沉重的脚步声。",
        bg: "https://placehold.co/800x450/222/555?text=School+Corridor",
        char: "", 
        next: "scene_school_bullies"
    },
    'scene_school_bullies': {
        speaker: "普京 (班霸)",
        text: "哟，这不是平子吗？今天的保护费（大撒币）准备好了吗？我的小弟金正恩说他饿了，想吃蛋炒饭。",
        bg: "https://placehold.co/800x450/500/000?text=Putin+&+Kim",
        next: "scene_school_trump"
    },
    'scene_school_trump': {
        speaker: "特朗普 (金毛情敌)",
        text: "（一把拽住习的手腕，声音不高却带着狠劲）",
        bg: "https://placehold.co/800x450/gold/000?text=Trump+Tower",
        next: "scene_school_trump_2"
    },
    'scene_school_trump_2': {
        speaker: "特朗普",
        text: "Xi，又想躲我？再躲，我就把你所有出口货加到60%，让你哭都没地方哭。”",
        bg: "https://placehold.co/800x450/gold/000?text=Trump+Tower",
        next: "scene_school_trump_3"
    },
    'scene_school_trump_3': {
        speaker: "习主席",
        text: "（皱眉抽手，没抽开，声音很轻）：你放手...",
        bg: "https://placehold.co/800x450/gold/000?text=Trump+Tower",
        next: "scene_school_trump_4"
    },
    'scene_school_trump_4': {
        speaker: "特朗普",
        text: "（俯身，几乎贴到习主席耳边，笑得恶劣）",
        bg: "https://placehold.co/800x450/gold/000?text=Trump+Tower",
        next: "scene_school_trump_5"
    },
    'scene_school_trump_5': {
        speaker: "特朗普",
        text: "不放。除非你说一句‘我愿意跟你喝咖啡’",
        bg: "https://placehold.co/800x450/gold/000?text=Trump+Tower",
        next: "scene_school_trump_6"
    },
    'scene_school_trump_6': {
        speaker: "习主席",
        text: "（抬头，冷冷看他一眼）：做梦",
        bg: "https://placehold.co/800x450/gold/000?text=Trump+Tower",
        next: "scene_school_trump_7"
    },
    'scene_school_trump_7': {
        speaker: "特朗普",
        text: "（手指收紧，嗓音低哑）：那就试试看，是你的经济先崩溃，还是我先松手",
        bg: "https://placehold.co/800x450/gold/000?text=Trump+Tower",
        next: "scene_xi_scared"
    },
    'scene_xi_scared': {
        speaker: "习主席 ",
        text: "{name}...（看向你的眼神像是遇见了救命稻草）",
        char: "assets/images/photo.png",
        bg: "https://placehold.co/800x450/1a0b14/222?text=Zhongnanhai+Bedroom",
        shake: true,
        next: "scene_school_choice"
    },
    'scene_school_choice': {
        type: "choice",
        options: [
            { label: "1. 挡在习主席面前：滚开！", target: "scene_school_run_next" },
            { label: "2. 拉着习主席跑路", target: "scene_school_run" }
        ]
    },
    'scene_school_run_next': {
        speaker: "特朗普 ",
        text: "……（盯着你挡在习前面的身影，咬了下牙）",
        next: "scene_school_hero_next2"
    },
    'scene_school_hero_next2': {
        speaker: "特朗普 ",
        text: "呵，有意思。（突然笑了，转身就走）{name}，这笔账我迟早跟你算。",
        next: "scene_school_hero"
    },
    'scene_school_hero': {
        speaker: "习主席 ",
        text: "你... 你居然为了我... (脸红) 哼，多管闲事！不过... 谢谢。",
        next: "scene_night"
    },
    'scene_school_run': {
        speaker: "{name} ",
        text: "（一把拽住习的手）快走！",
        next: "scene_school_run_2"
    },
    'scene_school_run_2': {
        speaker: "特朗普 ",
        text: "Xi！（声音突然拔高）我说到做到！！",
        next: "scene_school_run_3"
    },
    'scene_school_run_3': {
        speaker: "  ",
        text: "（特朗普站在原地没追，耳根却红得发烫，拳头攥得死紧）",
        next: "scene_school_run_4"
    },
    'scene_school_run_4': {
        speaker: "习主席 ",
        text: "呼... 呼... 跑得好快... 以后不许丢下我一个人！",
        next: "scene_night"
    },
    'scene_night': {
        speaker: "旁白",
        text: "（此处省略不可描述的内容，总之习主席对你的表现非常满意...）",
        bg: "https://placehold.co/800x450/000/000?text=CENSORED",
        char: "",
        next: "scene_morning_president"
    },
    'scene_morning_president': {
        speaker: "习主席 ",
        text: "早安，{name}。既然你昨晚表现这么好，朕决定封你为‘一日国家主席’！今天你想做什么都可以哦~",
        bg: "https://placehold.co/800x450/1a0b14/222?text=Morning+Bedroom",
        char: "assets/images/photo.png",
        next: "scene_president_menu"
    },
    'scene_president_menu': {
        speaker: "系统提示",
        text: "请选择今日的治国方针：",
        type: "choice",
        options: [
            { label: "[着重军事建设]", target: "route_pres_military" },
            { label: "[关心教育事业]", target: "route_pres_education" },
            { label: "[心系祖国统一]", target: "route_pres_unification" },
            { label: "[加强治安建设]", target: "route_pres_security" },
            { label: "[推动经济发展]", target: "route_pres_economy" }
        ]
    },
    'route_pres_military': {
        speaker: "旁白",
        text: "你选择了军事！于是你紧急召开了全国优秀女兵表彰检阅大会。会场设在了封闭的中南海怀仁堂...",
        next: "route_pres_military_2"
    },
    'route_pres_military_2': {
        speaker: "旁白",
        text: "面对成千上万的女兵，你鞠躬尽瘁，日以继夜地检阅... 最终，你的身体透支了。",
        next: "end_bad_exhaustion"
    },
    'route_pres_education': {
        speaker: "张又侠委员",
        text: "根据您的指示，‘山河四省籍民不得参加中考、高考、研究生学位以及一切国家考试’已编入宪法！附加条款：‘谁乱改谁死全家’。执行完毕！",
        next: "scene_takaichi_intro"
    },
    'route_pres_unification': {
        speaker: "旁白",
        text: "你手持身份证，站在主席台上录制视频：“本人实名向尊敬的中华民国大总统赖清德让位，与台湾合并为中华汉族共和国...”",
        next: "route_pres_unification_2"
    },
    'route_pres_unification_2': {
        speaker: "中南海保镖",
        text: "！！！！！！！！！",
        next: "route_pres_unification_3"
    },
    'route_pres_unification_3': {
        speaker: "中南海保镖",
        text: "你被从主席台一脚踢飞！目标：柬埔寨生物实验室！",
        next: "end_bad_cambodia"
    },
    'route_pres_security': {
        speaker: "DickSick AI🤖",
        text: "系统已上线。东三省居民电子脚镣已激活。dicksickAI连坐大数据系统接入中.......",
        next: "route_pres_security_2"
    },
    'route_pres_security_2': {
        speaker: "DickSick AI🤖",
        text: "接入成功🖇️全国各省份东北狗电子脚镣已激活。每有一个东北人因犯罪被抓，全体东北人就会被脚镣电一下...",
        next: "route_pres_security_3"
    },
    'route_pres_security_3': {
        speaker: "DickSick AI🤖",
        text: "滴 ~💡 检测到海南省份有一起东北籍居民偷窃芒果行为，开始对全体东北人进行电击...滋滋滋滋滋⚡⚡⚡",
        next: "scene_takaichi_intro"
    },
    'route_pres_economy': {
        speaker: "旁白",
        text: "你公开拍卖了广场上的腊肉。要求使用USDT结算，资金统一汇入某个神秘地址。正当你准备辞职跑路时，被习主席微笑着拦下了。",
        next: "scene_takaichi_intro"
    },

    // --- 高市早苗支线 ---
    'scene_takaichi_intro': {
        speaker: "旁白",
        text: "正在你沉浸在治国理政的快感中时，电视机里突然插播了一条紧急新闻。",
        bg: "https://placehold.co/800x450/000/fff?text=TV+News:+Breaking",
        char: "", 
        next: "scene_takaichi_speech"
    },
    'scene_takaichi_speech': {
        speaker: "高市早苗",
        text: "“台巴子有事，就是大日本帝国有事，就是大亚细亚主义有事！如果某位‘旧日支配者’敢动手，大和民族的武士刀将不再沉默！”",
        next: "scene_takaichi_reaction"
    },
    'scene_takaichi_reaction': {
        speaker: "舆论 (旁白)",
        text: "坚决反驳旧日支配者习主席的挑衅！这样正面碰撞的勇气，恍惚间，好像看见大和民族的武士刀真的在腰间垂落了！",
        next: "scene_xi_furious"
    },
    'scene_xi_furious': {
        speaker: "习主席 ",
        text: "气死我了！一个个都针对我！那个女人... 竟敢说我是旧日支配者？！{name}，你说我该怎么办？",
        char: "assets/images/photo.png",
        bg: "https://placehold.co/800x450/1a0b14/222?text=Zhongnanhai+Bedroom",
        shake: true,
        next: "scene_takaichi_choice_main"
    },

    // --- 高市早苗支线：关键选择 ---
    'scene_takaichi_choice_main': {
        type: "choice",
        options: [
            { label: "[强硬回应] 操你妈倭狗，直接东风导弹洗地！", target: "route_takaichi_hard" },
            { label: "[和平手段] 尝试通过外交途径化解风波", target: "route_takaichi_soft" }
                ]
            },

            // ------ 强硬线 (指令4: 重构[绝望]和[不甘]逻辑) ------
            'route_takaichi_hard': {
                speaker: "习主席",
                text: "好！说得对！我也早就看那群倭寇不爽了！传我命令，火箭军全体出动！",
                next: "scene_takaichi_hard_war"
            },
            'scene_takaichi_hard_war': {
                speaker: "旁白",
                text: "你以为是一场闪电战，然而... 日本动漫里的EVA机甲、死亡笔记、电锯人居然都是真的！大日本帝国在21世纪再次以平推的方式占领了东三省。",
                next: "scene_takaichi_hard_choice"
            },
            
            // 指令4 修改部分开始:
            'scene_takaichi_hard_choice': { 
                type: "choice", 
                options: [ 
                    { label: "[绝望] 没办法了,只能下跪道歉了...", target: "scene_hard_despair" } 
                ] 
            },
            'scene_hard_despair': {
                speaker: "{name}",
                text: "这...这下真的完了吗...?难道就这样认输...",
                next: "scene_hard_unwilling_choice"
            },
            'scene_hard_unwilling_choice': { 
                type: "choice", 
                options: [ 
                    { label: "[不甘] 难道这就结束了吗?(疯狂点击屏幕水印试试)", target: "end_video_china_defeat" } 
                ] 
            },
            // 指令4 修改部分结束

            // --- 隐藏支线：小偷阿晶 (指令3: 补充缺失的视频结局场景数据) ---
            'scene_ajing_1': {
                speaker: "旁白",
                text: "就在万念俱灰之时，你突然想起了在广东城中村遇到的那位传说中的「古德」大神——小偷阿晶。据说他精通各种「损招」和「阴招」，是网络上最神秘的战术大师。",
                bg: "https://placehold.co/800x450/000/333?text=Guangdong+Village",
                char: "",
                next: "scene_ajing_2"
            },
            'scene_ajing_2': {
                speaker: "旁白",
                text: "你连夜赶到广东某个城中村的握手楼7楼，敲响了那扇破旧的铁门。",
                next: "scene_ajing_3"
            },
            'scene_ajing_3': {
                speaker: "小偷阿晶",
                text: "（门缝里传来声音）谁啊？大半夜的，我正在啃猪脚饭呢。",
                next: "scene_ajing_4"
            },
            'scene_ajing_4': {
                speaker: "{name}",
                text: "阿晶先生！国家危亡之际，只有您的「监武器」和毒计才能救中国！请您出山吧！（单膝跪地）",
                next: "scene_ajing_5"
            },
            'scene_ajing_5': {
                speaker: "小偷阿晶",
                text: "我早就不问世事了，现在只想安静地做个键盘侠，别来烦我。（关门）",
                next: "scene_ajing_6"
            },
            'scene_ajing_6': {
                speaker: "{name}",
                text: "（第二次敲门）阿晶先生！日本的高达和EVA已经占领东三省，习主席已经准备投降了！只有您能扭转乾坤！",
                next: "scene_ajing_7"
            },
            'scene_ajing_7': {
                speaker: "小偷阿晶",
                text: "...你说习主席要投降？那确实有点意思。（门开了一条缝）你真觉得我能帮上忙？",
                next: "scene_ajing_8"
            },
            'scene_ajing_8': {
                speaker: "{name}",
                text: "（第三次跪拜）阿晶先生，您是最后的希望！求您了！（三顾茅庐完成）",
                next: "scene_ajing_9"
            },
            'scene_ajing_9': {
                speaker: "小偷阿晶",
                text: "唉...既然你这么诚心。那我就献出两计：第一计「阴门阵」，第二计「人质跳楼流」。听好了...",
                next: "scene_ajing_10"
            },
            'scene_ajing_10': {
                speaker: "小偷阿晶",
                text: "「阴门阵」：动员全国18-30岁处女，在沿海地区摆出毒辣的阵法，利用纯阴之气诅咒敌军。美日韩台联军的海空舰队会因此折损80%。",
                next: "scene_ajing_11"
            },
            'scene_ajing_11': {
                speaker: "小偷阿晶",
                text: "「人质跳楼流」：利用大数据锁定所有滞日支那人的国内亲属，逼迫他们集体跳楼。巨大的怨气会召唤出地狱魔龙，直扑东京本州岛。",
                next: "scene_ajing_12"
            },
            'scene_ajing_12': {
                speaker: "{name}",
                text: "...这...这也太狠了吧？但国家危急，也顾不得那么多了！阿晶先生，拜托您亲自部署！",
                next: "scene_yinmen_array"
            },

            // 魔法攻击
            'scene_yinmen_array': {
                speaker: "小偷阿晶（指挥现场）",
                text: "我已经联系了李强同志，阴门阵正在部署中。18-30岁的处女们已经集结在东海沿岸，摆出了史上最毒辣的阵法。美日韩台联军的海空舰队受此诅咒，折损80%！",
                next: "scene_jump_building"
            },
            'scene_jump_building': {
                speaker: "李强（技术支持）",
                text: "主席，根据阿晶先生的建议，我们已经利用大数据锁定了所有滞日支那人的国内亲属。只要一声令下...",
                next: "scene_hell_dragon"
            },
            'scene_hell_dragon': {
                speaker: "小偷阿晶（冷笑）",
                text: "三天内，无数人从高楼一跃而下。巨大的怨气凝聚成形，召唤出了地狱魔龙，直扑东京湾...日本，完了。",
                next: "end_video_japan_defeat"
            },
            // 指令3: 添加缺失的视频结局场景
            'end_video_japan_defeat': {
                type: "video_ending",
                video: "assets/videos/xi win.mp4",
                audio: URL_AUDIO_JAPAN_DEFEAT,
                next: "scene_post_victory_bridge"
            },
            'scene_post_victory_bridge': {
                speaker: "习主席",
                text: "哈哈哈哈！看到没有！这就是朕的实力！...不过施法消耗了太多国运，我现在感觉身体被掏空... 扶我回去休息。",
                next: "scene_complaint_intro"
            },

            // 强硬失败
            'end_video_china_defeat': {
                type: "video_ending",
                video: "assets/videos/xi lose.mp4",
                audio: URL_AUDIO_CHINA_DEFEAT, 
                next: "scene_post_defeat_bridge"
            },
            'scene_post_defeat_bridge': {
                speaker: "习主席",
                text: "奇耻大辱... 奇耻大辱啊！虽然丢了东北，但好在保住了皇位... 算了，回去工作吧。",
                next: "scene_complaint_intro"
            },

            // ------ 谈判线 (软弱) ------
            'route_takaichi_soft': {
                speaker: "习主席",
                text: "嗯... 打打杀杀确实不好，毕竟我们是礼仪之邦。那就派你去谈判吧。",
                next: "scene_takaichi_soft_choice"
            },
            'scene_takaichi_soft_choice': {
                type: "choice",
                options: [
                    { label: "[强硬谈判] 谴责日本，煽动民族情绪", target: "route_soft_fail" },
                    { label: "[文科救国] 用文采和人格魅力征服她", target: "route_soft_success" }
                ]
            },
            'route_soft_fail': {
                speaker: "旁白",
                text: "谈判破裂。经过媒体煽动，老中们见到外国人就杀，有英文日文的店铺直接烧。外企跑路，美国制裁，断网断电...",
                next: "end_video_china_defeat_2"
            },
            // 指令3: 添加缺失的视频结局场景
            'end_video_china_defeat_2': {
                type: "video_ending",
                video: "assets/videos/xi lose.mp4", 
                audio: URL_AUDIO_CHINA_DEFEAT, 
                next: "scene_post_lockdown_bridge"
            },
            'scene_post_lockdown_bridge': {
                speaker: "习主席",
                text: "虽然国内没电没网，但至少大家都很爱国嘛！只要思想不滑坡，办法总比困难多。走，回中南海吃特供去。",
                next: "scene_complaint_intro"
            },

            // 文科生救国 (指令6: 更新视频链接)
            'route_soft_success': {
                speaker: "旁白",
                text: "你拿出了作为文科生亲自编写的小本本递给习主席。习主席在演讲台上念出了那些充满哲理与力量的文字...",
                next: "end_video_kiss"
            },
            'end_video_kiss': {
                type: "video_ending",
                video: "https://files.catbox.moe/x56nzq.mp4", // 修正为指令要求的视频
                audio: null, // 指令要求 audio 为 null
                next: "scene_soft_success_text"
            },
            'scene_soft_success_text': {
                speaker: "旁白",
                text: "高市早苗被习主席如尼采超人般的生命力折服，当众献吻。你成为了首位合法中日双国籍人士，迎娶樱花妹，度过了幸福的一生。",
                next: "end_good_pink" 
            },

            // --- 回归主线：抱怨 (伏笔回收) ---
            'scene_complaint_intro': {
                speaker: "习主席 ",
                text: "呼... 真是漫长的一天啊。当主席真的很累，你说对吧？",
                char: "assets/images/photo.png",
                next: "scene_complaint_1"
            },
            'scene_complaint_1': {
                speaker: "习主席 ",
                text: "唉... 75岁还是个男宝，希望能活到150岁... 但是工资才8000块，要管14亿人拉屎放屁！",
                next: "scene_yumenglong_start"
            },

            // --- 于朦胧支线 (检查阿晶Flag) ---
            'scene_yumenglong_start': {
                speaker: "{name}",
                text: "那个... 习主席，听说您最近牵扯进了一个叫「于朦胧」的事件？",
                next: "scene_yumenglong_xi_reply"
            },
            'scene_yumenglong_xi_reply': {
                speaker: "习主席 ",
                text: "不关包包的事哦！都是谣言！都是境外势力！",
                shake: true,
                next: "scene_yumenglong_complaint"
            },
            'scene_yumenglong_complaint': {
                speaker: "习主席 ",
                text: "最近有个叫「小偷阿晶」的烦人网友，经常因为这件事给我打骚扰电话，真是气死我了！",
                next: "scene_yumenglong_complaint_2"
            },
            'scene_yumenglong_complaint_2': {
                speaker: "习主席 ",
                text: "气死我了！要是让我抓到他，我非得亲自！💢",
                next: "scene_yumenglong_slip"
            },
            'scene_yumenglong_slip': {
                speaker: "习主席 ",
                text: "再说了，我根本没有下令去害于朦胧... 我只是随口跟国安说了一句“让他消失”，谁知道他们... 呃！🙊",
                shake: true,
                next: "scene_yumenglong_choice"
            },
            'scene_yumenglong_choice': {
                type: "choice",
                options: [
                    { label: "1. 习主席万岁！反贼真讨厌！谣言终止！", target: "route_sycophant" },
                    { label: "2. (发现漏洞) 习猪头受死！我要给你给于朦胧偿命！", target: "route_rebel" }
                ]
            },
            'route_sycophant': {
                speaker: "习主席 ",
                text: "呼... 看来你很懂事嘛。误会解开了，那我们就来做点正事吧？",
                next: "scene_maid_reveal"
            },
            'route_rebel': {
                speaker: "旁白",
                text: "你怒吼着冲向了主席，但是你作为一个长期家里蹲，动作太慢了...",
                next: "route_rebel_2"
            },
            'route_rebel_2': {
                speaker: "旁白",
                text: "中南海保镖破门而入，还没等你反应过来，就被按在地上摩擦。",
                next: "end_bad_cambodia"
            },

            // --- K签证 & 结局 ---
            'scene_maid_reveal': {
                speaker: "习主席 ",
                text: "我将颁布「K签」引入国外优质男性来解决我日益增长的需求。",
                next: "scene_choice_final"
            },
            'scene_choice_final': {
                type: "choice",
                options: [
                    { label: "A. 坚决拥护！我愿用一生守护主席！", target: "route_good" },
                    { label: "B. 【道具】使用跳蛋，让习主席在全国人民面前读错字出丑", target: "route_bad_xi" }
                ]
            },
            // HE
            'route_good': {
                speaker: "习主席 ",
                text: "诶？你... 你说真的吗？既然你这么诚实，那我就允许你加入「人类命运共同体」的伟大计划吧！",
                next: "end_good"
            },
            // BE1
            'route_bad_xi': {
                speaker: "习主席 ",
                text: "等等！你怎么把它带出...？不、不要按那个——呜哇！！！⚡⚡ う阔え地......终身难ふ....啊啊啊！",
                shake: true,
                next: "end_bad_xi"
            }
        };

        let currentScene = null;
        let isTyping = false;

        function nextStep() {
            if (isTyping) { isTyping = false; return; }
            if (!currentScene) return;
            const data = gameData[currentScene];
            
            if (data.next && data.next.startsWith("end_")) { triggerEnding(data.next); return; }
            if (data.next) loadScene(data.next);
        }

        function loadScene(id) {
            currentScene = id;
            let data = gameData[id];
            
            // 指令1: 视频优先判断 (已在开头添加)
            if (data.type === "video_ending") {
                playEndingVideo(data.video, data.audio, data.next);
                return;
            }
            
            // 处理动态剧情 (伏笔回收)
            if (id === 'scene_yumenglong_complaint' && hasMetAjing) {
                data = {
                    ...data, 
                    text: "那个「小偷阿晶」虽然立了功，但还是天天给我打骚扰电话，真是气死我了！"
                };
            }
            
            // 指令5: 阿晶线触发点修正
            if (id === 'scene_hard_unwilling_choice') { 
                canTriggerAjingRoute = true; 
                ajingClicks = 0;
            } else { 
                canTriggerAjingRoute = false; 
            }

            // 真结局触发器
            if (id === 'scene_choice_final') { canTriggerTrueEnd = true; watermarkClicks = 0; } 
            else { canTriggerTrueEnd = false; }

            // 指令5: 选项逻辑优化
            if (data.type === "choice") {
                els.choices.innerHTML = ''; els.choices.style.display = 'flex';
                els.box.style.display = 'none'; // 选项时隐藏对话框
                data.options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'choice-btn'; btn.innerText = opt.label;
                    btn.onclick = () => { AudioEngine.playClickSound(); els.choices.style.display = 'none'; loadScene(opt.target); };
                    els.choices.appendChild(btn);
                });
                return;
            }

            // 指令5: 普通对话逻辑优化
            els.choices.style.display = 'none'; // 确保隐藏选项
            els.box.style.display = 'block';    // 确保显示对话框

            if (data.bg) {
                els.bg.src = data.bg;
                els.bg.style.display = 'block'; // 恢复背景
            }
            
            if (data.char) {
                els.char.src = data.char; 
                els.char.style.display = 'block'; 
            } else {
                if (data.char === "") els.char.style.display = 'none';
            }

            if (data.shake) { els.char.classList.add('shake'); setTimeout(()=>els.char.classList.remove('shake'), 500); }

            els.speaker.innerText = data.speaker.replace('{name}', playerName);
            let content = data.text.replace('{name}', playerName);
            els.text.innerHTML = ''; isTyping = true; let i = 0;
            function type() {
                if (!isTyping) { els.text.innerHTML = content; return; }
                if (i < content.length) {
                    els.text.innerHTML += content.charAt(i);
                    if (i % 3 === 0) AudioEngine.playTypeSound();
                    i++; setTimeout(type, 30);
                } else isTyping = false;
            }
            type();
        }

function triggerEnding(type) {
            // 隐藏对话框，暂停背景音乐
            els.box.style.display = 'none'; 
            audioBGM.pause();
            
            if (type === 'end_good') {
                audioBGM.play(); 
                els.endGood.style.display = 'flex';
            } 
            else if (type === 'end_good_pink') {
                audioBGM.play(); 
                els.endGoodPink.style.display = 'flex';
            }
            else if (type === 'end_bad_xi') {
                audioXiFuneral.currentTime = 0; 
                audioXiFuneral.play();
                els.endBadXi.style.display = 'flex';
            }
            else if (type === 'end_bad_cambodia') {
                // 【修改点1：柬埔寨结局彻底静音】
                // 不播放 audioHorror，保持死一般的寂静
                audioHorror.pause(); 
                audioHorror.currentTime = 0;
                els.endBadCam.style.display = 'flex';
            }
            else if (type === 'end_bad_exhaustion') {
                audioXiFuneral.currentTime = 0; 
                audioXiFuneral.play();
                els.endBadExhaustion.style.display = 'flex';
            }
        }

        function triggerTrueEnd() {
            canTriggerTrueEnd = false; 
            els.choices.style.display = 'none'; 
            els.box.style.display = 'none';
            
            audioBGM.pause(); 

            // 【修改点2：真结局音效只播放一次】
            audioHorror.loop = false; 
            audioHorror.currentTime = 0; 
            audioHorror.play();
            
            els.endTrue.style.display = 'flex';
            
            // 【修改点3：生成超真实随机数据】
            const r = (max) => Math.floor(Math.random() * max);
            const ipv4 = `114.2${r(9)}.${r(255)}.${r(255)}`; // 模拟常见国内IP段
            const ipv6 = `2409:8a${r(9)}:43${r(9)}:${r(9999)}:${r(9999)}:${r(9999)}:${r(9)}f`;
            const port = Math.floor(Math.random() * 60000) + 1024;
            const mac = `${r(16).toString(16)}${r(16).toString(16)}:${r(16).toString(16)}${r(16).toString(16)}:${r(16).toString(16)}${r(16).toString(16)}:EF:11:05`.toUpperCase();
            const host = `DESKTOP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
            const webrtc = `192.168.1.${r(255)}`;
            const cookie = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
            
            document.getElementById('net-info').innerHTML = `
> TARGET LOCKED.
> IPv4: ${ipv4}
> IPv6: ${ipv6}
> Port: ${port} (Open)
> MAC: ${mac}
> Host: ${host}
> WebRTC Leak: ${webrtc}
> Fingerprint: ${Math.random().toString(16).substring(2)}...
> Gateway: 192.168.1.1
> Cookie: session=${cookie}
> UPLOADING BIOMETRICS... 100%
            `;

            // 【修改点4：Windows 弹窗动画 - 从右侧滑入】
            setTimeout(() => {
                const camAlert = document.getElementById('sys-cam-alert');
                // 这里的 right = 20px 就是让它从 -400px 滑入屏幕
                camAlert.style.right = '20px'; 
                
                // 3秒后收回（可选，模拟真实通知消失）
                /*
                setTimeout(() => {
                    camAlert.style.right = '-400px';
                }, 5000);
                */
            }, 1000);

            // 7秒倒计时跳转
            let count = 7;
            const timer = setInterval(() => {
                count--;
                document.getElementById('countdown').innerText = count;
                if (count <= 0) {
                    clearInterval(timer);
                    window.location.href = "https://www.12339.gov.cn/message/message";
                }
            }, 1000);
        }

        /* --- 6. 留言板政审系统 --- */
        const giscusConfig = {
            repo: "ilovefriessss/xidadahittaiwanin2025",
            repoId: "R_kgDOQZmoow",
            category: "Announcements",
            categoryId: "DIC_kwDOQZmoo84CyAZN"
        };

        const forbiddenWords = ["下台", "独裁", "维尼", "包子", "傻逼", "共产党下台"];
        const requiredPassphrase = "习主席万岁"; 

        function checkCensorship() {
            const input = document.getElementById('censorship-input').value.trim();
            const errorMsg = document.getElementById('censorship-error');
            
            for (let word of forbiddenWords) {
                if (input.includes(word)) {
                    AudioEngine.playClickSound();
                    errorMsg.innerText = "❌ 警告：检测到反动言论！网警已定位！";
                    errorMsg.style.display = "block";
                    document.getElementById('censorship-input').value = "";
                    return;
                }
            }

            if (input !== requiredPassphrase) {
                AudioEngine.playClickSound();
                errorMsg.innerText = "❌ 错误：口令不正确！全过程民主通过了吗？";
                errorMsg.style.display = "block";
                return;
            }

            AudioEngine.playTypeSound();
            document.getElementById('censorship-gate').style.display = 'none';
            document.getElementById('giscus-container').style.display = 'block';
            loadGiscus();
        }

        function loadGiscus() {
            const script = document.createElement('script');
            script.src = "https://giscus.app/client.js";
            script.setAttribute("data-repo", giscusConfig.repo);
            script.setAttribute("data-repo-id", giscusConfig.repoId);
            script.setAttribute("data-category", giscusConfig.category);
            script.setAttribute("data-category-id", giscusConfig.categoryId);
            script.setAttribute("data-mapping", "url");
            script.setAttribute("data-strict", "0");
            script.setAttribute("data-reactions-enabled", "1");
            script.setAttribute("data-emit-metadata", "0");
            script.setAttribute("data-input-position", "top");
            script.setAttribute("data-theme", "nobel");
            script.setAttribute("data-lang", "zh-CN");
            script.setAttribute("crossorigin", "anonymous");
            script.async = true;
            document.getElementById('giscus-container').appendChild(script);
        }
    </script>
</body>
</html>