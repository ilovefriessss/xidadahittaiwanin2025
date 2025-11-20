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

// 1. 背景音乐 (BGM)
const audioBGM = new Audio('https://files.catbox.moe/wsxnkw.mp3'); 
audioBGM.loop = true; audioBGM.volume = 0.5;

// 2. 习主席死亡哀乐
const audioXiFuneral = new Audio('https://files.catbox.moe/n7fg3v.mp3');

// 3. 恐怖氛围音
const audioHorror = new Audio('https://freesound.org/data/previews/369/369250_5121236-lq.mp3');
audioHorror.loop = true;

/* --- 全局变量 --- */
let playerName = "小处男";
let watermarkClicks = 0; 
let canTriggerTrueEnd = false; 
let isMusicPlaying = false;

/* --- 1. 启动与音乐控制 --- */
function enterSite() {
    document.getElementById('start-screen-overlay').style.display = 'none';
    document.getElementById('main-container').style.display = 'grid';
    document.getElementById('music-player-ui').style.display = 'flex';
    
    AudioEngine.init();
    toggleMusic(); 
    requestAnimationFrame(animateWatermark);
}

function toggleMusic() {
    if (audioBGM.paused) {
        audioBGM.play().then(() => {
            isMusicPlaying = true;
            document.querySelector('.player-btn').innerHTML = "⏸";
        }).catch(e => console.log("Play failed", e));
    } else {
        audioBGM.pause();
        isMusicPlaying = false;
        document.querySelector('.player-btn').innerHTML = "⏯";
    }
}

/* --- 2. 水印与碰撞 --- */
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
});

/* --- 3. Galgame 逻辑 --- */
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
    endBadCam: document.getElementById('end-bad-cambodia'),
    endGood: document.getElementById('end-good'),
    endTrue: document.getElementById('end-true')
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

/* --- 剧本数据 --- */
const gameData = {
    'scene_greeting': {
        speaker: "习主席 (JK版)",
        text: "哼，{name}是吧？虽然名字听起来很蠢，但我勉强记在小本本上了。",
        char: "https://i.postimg.cc/CLW9rYWM/photo-2025-11-20-15-08-44.png", 
        next: "scene_complaint_1"
    },
    'scene_complaint_1': {
        speaker: "习主席 (JK版)",
        text: "唉... 最近真是烦死了。虽然我在阅兵时说自己75岁还是个男宝，希望能活到150岁...",
        next: "scene_complaint_2"
    },
    'scene_complaint_2': {
        speaker: "习主席 (JK版)",
        text: "但是你知道吗！我一个月工资才8000块！却要管14亿人的吃喝拉撒！我很累的好吗！💢",
        shake: true,
        next: "scene_yumenglong_start" 
    },

    // --- 于朦胧支线 ---
    'scene_yumenglong_start': {
        speaker: "{name}",
        text: "那个... 习主席，听说您最近牵扯进了一个叫「于朦胧」的事件？",
        next: "scene_yumenglong_xi_reply"
    },
    'scene_yumenglong_xi_reply': {
        speaker: "习主席 (JK版)",
        text: "不关包包的事哦！都是谣言！都是境外势力！",
        shake: true,
        next: "scene_yumenglong_complaint"
    },
    'scene_yumenglong_complaint': {
        speaker: "习主席 (JK版)",
        text: "最近有个叫「小偷阿晶」的烦人网友，经常因为这件事给我打骚扰电话，真是气死我了！",
        next: "scene_yumenglong_slip"
    },
    'scene_yumenglong_slip': {
        speaker: "习主席 (JK版)",
        text: "再说了，我根本没有下令去害于朦胧... 我只是随口跟国安说了一句“让他消失”，谁知道他们... 呃！🙊",
        shake: true,
        next: "scene_yumenglong_choice"
    },
    'scene_yumenglong_choice': {
        type: "choice",
        options: [
            { label: "1. 习主席万岁！反贼真讨厌！谣言终止！", target: "route_sycophant" },
            { label: "2. (发现漏洞) 习猪头受死！我要给于朦胧偿命！", target: "route_rebel" }
        ]
    },
    // 支线：舔狗选项 -> 回归主线
    'route_sycophant': {
        speaker: "习主席 (JK版)",
        text: "呼... 看来你很懂事嘛。既然误会解开了，那我们就来做点开心的事情吧？",
        next: "scene_maid_reveal"
    },
    // 支线：反贼选项 -> 柬埔寨结局
    'route_rebel': {
        speaker: "旁白",
        text: "你怒吼着冲向了主席，但是你作为一个长期家里蹲，动作太慢了...",
        bg: "https://placehold.co/800x450/000/000?text=Darkness",
        char: "", // Hide char
        next: "route_rebel_2"
    },
    'route_rebel_2': {
        speaker: "旁白",
        text: "中南海保镖破门而入，还没等你反应过来，就被按在地上摩擦。",
        next: "end_cambodia"
    },

    // --- 回归主线：女仆装 ---
    'scene_maid_reveal': {
        speaker: "习主席 (JK版)",
        text: "为了排解压力，我穿上了这身衣服，决定亲自部署一个特别的计划...",
        next: "scene_k_visa"
    },
    'scene_k_visa': {
        speaker: "习主席 (JK版)",
        text: "我要签署「K签证」！引进外国优质男性来满足我日益增长的... 那个需求！这可是大国战略哦❤",
        next: "scene_choice_final"
    },
    
    // --- 最终关键选项 (在此处可触发真结局) ---
    'scene_choice_final': {
        type: "choice",
        options: [
            { label: "A. 坚决拥护！我愿用一生守护主席！", target: "route_good" },
            { label: "B. 【道具】使用跳蛋，让主席出丑", target: "route_bad_xi" }
        ]
    },
    // Good Route
    'route_good': {
        speaker: "习主席 (JK版)",
        text: "诶？你... 你说真的吗？既然你这么诚实，那我就允许你加入「中华民族伟大复兴」家庭计划吧！",
        next: "end_good"
    },
    // Bad Route (Xi Death)
    'route_bad_xi': {
        speaker: "习主席 (JK版)",
        text: "等等！你手里拿的是什么...？不、不要按那个——呜哇！！！⚡⚡ 通商宽衣...金科律玉...啊啊啊！",
        shake: true,
        next: "end_xi_death"
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
    const data = gameData[id];
    
    // 真结局触发锁
    if (id === 'scene_choice_final') { canTriggerTrueEnd = true; watermarkClicks = 0; } 
    else { canTriggerTrueEnd = false; }

    if (data.type === "choice") {
        els.choices.innerHTML = ''; els.choices.style.display = 'flex';
        data.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn'; btn.innerText = opt.label;
            btn.onclick = () => { AudioEngine.playClickSound(); els.choices.style.display = 'none'; loadScene(opt.target); };
            els.choices.appendChild(btn);
        });
        return;
    }

    if (data.bg) els.bg.src = data.bg;
    if (data.char !== undefined) {
        if(data.char === "") els.char.style.display = 'none';
        else { els.char.src = data.char; els.char.style.display = 'block'; }
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
    els.box.style.display = 'none'; audioBGM.pause();
    
    if (type === 'end_good') {
        audioBGM.play(); els.endGood.style.display = 'flex';
    } 
    else if (type === 'end_xi_death') {
        audioXiFuneral.currentTime = 0; audioXiFuneral.play();
        els.endBadXi.style.display = 'flex';
    }
    else if (type === 'end_cambodia') {
        audioHorror.currentTime = 0; audioHorror.play();
        els.endBadCam.style.display = 'flex';
    }
}

function triggerTrueEnd() {
    canTriggerTrueEnd = false; els.choices.style.display = 'none'; els.box.style.display = 'none';
    audioBGM.pause(); audioHorror.currentTime = 0; audioHorror.play();
    els.endTrue.style.display = 'flex';
    
    // 生成真实数据
    const r = (max) => Math.floor(Math.random() * max);
    const ip = `114.2${r(9)}.${r(255)}.${r(255)}`;
    const dns = `202.96.${r(255)}.88`;
    const gw = `114.2${r(9)}.${r(255)}.1`;
    const v6 = `2409:8a${r(9)}:43${r(9)}::${r(9)}f`;
    
    document.getElementById('net-info').innerHTML = `
        > TARGET LOCKED.<br>
        > IPv4: ${ip}<br>
        > IPv6: ${v6}<br>
        > DNS: ${dns}<br>
        > GATEWAY: ${gw}<br>
        > MAC: ${r(99).toString(16)}:${r(99).toString(16)}:${r(99).toString(16)}:EF:11:05<br>
        > UPLOADING BIOMETRICS... 100%
    `;

    // 倒计时跳转
    let count = 4;
    const timer = setInterval(() => {
        count--;
        document.getElementById('countdown').innerText = count;
        if (count <= 0) {
            clearInterval(timer);
            window.location.href = "https://www.12339.gov.cn/message/message";
        }
    }, 1000);
}