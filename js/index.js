(function () {
    //播放列表
var play_list = document.querySelector('.play-list');
var play_list_box = document.querySelector('.play-list-box');
var index = -500;
var timer = null;
var func = 1;
play_list.addEventListener('click',function () {
    clearInterval(timer);
    if(func==1){
        timer = setInterval(function () {
            index+=8;
            index = index > 0 ? 0 : index;
            play_list_box.style.marginBottom= index + 'px';
            func=2;
            if(index==0){
                clearInterval(timer);
            }
        },10)
    }else if(func==2){
        timer = setInterval(function () {
            index-=8;
            index = index < -500 ? -500 : index;
            play_list_box.style.marginBottom= index + 'px';
            func=1;
            if(index==0){
                clearInterval(timer);
            }
        },10)
    }
})
})();
(function () {
    //页面刚加载读取本地存储的歌曲列表
       let data = localStorage.getItem('mList') ?
       JSON.parse(localStorage.getItem('mList')) : [];
    let searchData = [];
    //获取元素
    let prev = document.querySelector('.prev');
    let start = document.querySelector('.start');
    let next = document.querySelector('.next');
    let audio = document.querySelector('audio');
    let nowTimeSpan = document.querySelector('.nowTime');
    let totalTimeSpan = document.querySelector('.totalTime');
    let songSinger = document.querySelector('.ctrl-bars-box span');
    let logoImg = document.querySelector('.logo img');
    let listBox = document.querySelector('.play-list-box ul');
    let ctrlBars = document.querySelector('.ctrl-bars');
    let nowBars = document.querySelector('.nowBars');
    let ctrlBtn = document.querySelector('.ctrl-btn');
    let mode = document.querySelector('.mode');
    let playListBtn = document.querySelector('.play-list');
    //变量
    let index = 0;//标记当前播放歌曲索引
    let rotateDeg = 0;//记录专辑封面旋转角度
    let timer = null;
    let modeNum = 0;// 0 顺序播放 1 单曲循环 2 随机播放

    //请求服务器
    $('.search').on('keydown',function (e){
        if(e.keyCode === 13){
            //按下回车键
            $.ajax({
                //服务器地址
                url: 'https://api.imjad.cn/cloudmusic/',
                //参数
                data: {
                    type: 'search',
                    s: this.value
                },
                success: function (data) {
                    searchData = data.result.songs;
                    console.log(data);
                    var str='';
                    for(var i = 0; i < searchData.length; i++){
                        str += '<li>';
                        str += '<span class="left song">'+ searchData[i].name +'</span>';
                        str += '<span class="right singer">';
                        for(var j = 0; j < searchData[i].ar.length; j++){
                            str += searchData[i].ar[j].name + '  ';
                        }
                        str += '</span>';
                        str += '</li>';
                    }
                    $('.searchUl').html(str);
                },
                error: function (error) {
                    console.log(error);
                }
            })
        }
    })
    //搜索列表
    $('.searchUl').on('click','li',function () {
        data.push(searchData[$(this).index()]);
        localStorage.setItem('mList',JSON.stringify(data));
        loadPlayList();
        playListBtn.innerHTML = data.length;
        index = data.length - 1;
        init();
        play();
    })
    //加载播放列表
    function loadPlayList(){
        let str='';//用来累加播放项
        //加载播放列表
        for(let i = 0; i < data.length; i++){
            str += '<li>';
            str += '<i>×</i>';
            str += '<span>'+data[i].name+'</span>';
            str += '<span>';
            for(let j = 0; j < data[i].ar.length; j++){
                str += data[i].ar[j].name +'  ';
            }
            str += '</span>';
            str += '</li>';
        }
        listBox.innerHTML = str;
    }
    loadPlayList();
    //播放按钮歌曲总数
    playListBtn.innerHTML = data.length;
    //播放列表显示正在播放的歌曲
    function checkPlayList() {
        let playList = document.querySelectorAll('.play-list-box ul li');
        for(let i = 0;i < data.length; i++){
            playList[i].className = '';
        }
        playList[index].className = 'active';
    }
    //格式化时间
    function formatTime(time) {
        return time > 9 ? time : '0' + time;
    }
    //取得不重复的随机数
    function getRandomNum() {
        let randomNum = Math.floor(Math.random() * data.length);
        if(randomNum ===  index){
            randomNum === getRandomNum();
        }
        return randomNum;
    }
    //初始化播放
    function init(){
        rotateDeg = 0;
        checkPlayList();
        //给audio设置播放路径
        audio.src = 'http://music.163.com/song/media/outer/url?id='+ data[index].id + '.mp3';
        let str = '';
        str += data[index].name + '---';
        for(let i = 0; i < data[index].ar.length; i++){
            str += data[index].ar[i].name + '  ';
        }
        songSinger.innerHTML = str;
        logoImg.src = data[index].al.picUrl;
    }
    init();
    //执行播放
    function play(){
        clearInterval(timer);
        timer = setInterval(function () {
            rotateDeg++;
            logoImg.style.transform = 'rotate('+rotateDeg+'deg)';
        },30);
        audio.play();
        start.style.backgroundPositionY= '-166px';
    }
    //播放按钮
    start.addEventListener('click',function () {
        //检测歌曲是播放状态还是暂停
        if(audio.paused){
            play();
        }else{
            audio.pause();
            start.style.backgroundPositionY= '-205px';
            clearInterval(timer);
        }
    })
    //下一曲按钮
    next.addEventListener('click',function () {
        clearInterval(timer);
        index++;
        index = index > data.length-1 ? 0 : index;
        init();
        play();
    })
    //上一曲按钮
    prev.addEventListener('click',function () {
        clearInterval(timer);
        index--;
        index = index < 0 ? data.length-1 : index;
        init();
        play();
    })
    //歌曲时间
    audio.addEventListener('canplay',function () {
        let totalTime = audio.duration;
        let totalM = parseInt(totalTime / 60);
        let totalS = parseInt(totalTime % 60);
        totalTimeSpan.innerHTML = formatTime(totalM) + ':'+ formatTime(totalS);

        audio.addEventListener('timeupdate',function () {
            let currentTime = audio.currentTime;
            let currentM = parseInt(currentTime / 60);
            let currentS = parseInt(currentTime % 60);
            nowTimeSpan.innerHTML = formatTime(currentM) + ':'+ formatTime(currentS);
            let barWidth = ctrlBars.clientWidth;
            let position = currentTime / totalTime * barWidth;
            nowBars.style.width = position + 'px';
            ctrlBtn.style.left = position-8 + 'px';
            if(audio.ended){
                switch (modeNum){
                    case 0:// 0 顺序播放
                        next.click();
                        break;
                    case 1:// 1 单曲循环
                        init();
                        play();
                        break;
                    case 2://2 随机播放
                        index = getRandomNum();
                        init();
                        play();
                        break;
                }
            }
        })
        ctrlBars.addEventListener('click', function (e) {
            audio.currentTime = e.offsetX / ctrlBars.clientWidth * audio.duration;
        })
    })
    //播放模式
    mode.addEventListener('click', function () {
        modeNum++;
        modeNum = modeNum > 2 ? 0 : modeNum;
        switch (modeNum) {
            case 0:
                mode.style.backgroundPositionX = '-3px';
                mode.style.backgroundPositionY = '-345px';
                break;
            case 1:
                mode.style.backgroundPositionX = '-66px';
                mode.style.backgroundPositionY = '-345px';
                break;
            case 2:
                mode.style.backgroundPositionX = '-218px';
                mode.style.backgroundPositionY = '-250px';
                break;
        }
    })
    //点击播放列表选中音乐进行播放
    $(listBox).on('click','li',function () {
        index = $(this).index();
        init();
        clearInterval(timer);
        play();
    })
    //删除
    $(listBox).on('click','i',function (e) {
        data.splice($(this).parent().index(),1);
        localStorage.setItem('mList',JSON.stringify(data));
        e.stopPropagation();
        loadPlayList();
        checkPlayList();
        playListBtn.innerHTML = data.length;
    });

    })();
