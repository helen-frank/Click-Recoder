var volumeDownCount = 0;  // 记录音量减键按下的次数
var recordingStarted = false;  // 记录录音是否已经启动
var mediaRecorder = null;  // 媒体录制器对象
var audioFile = ""; // 录音文件保存路径
// var powerManager = context.getSystemService(context.POWER_SERVICE);
// var wakeLock = null; // 声明唤醒锁对象

// // 获取电源管理锁
// if (wakeLock != null) {
//     wakeLock = powerManager.newWakeLock(android.os.PowerManager.PARTIAL_WAKE_LOCK, "AutoJs");
//     wakeLock.acquire();
// }

// 请求录音权限
runtime.requestPermissions(["record_audio"]);
// 监听音量减键的按下事件
events.observeKey();
events.onKeyDown("volume_down", function (event) {
    volumeDownCount++;  // 每次按下音量减键增加计数

    if (!recordingStarted) {
        if (volumeDownCount === 1) {
            // 设置定时器，在一秒后重置按下计数器
            setTimeout(function () {
                volumeDownCount = 0;
            }, 1000);
        } else if (volumeDownCount >= 3) {
            startRecording();  // 当按下次数达到3次且录音未启动时，启动录音
        }
    }
});

// 启动录音函数
function startRecording() {
    if (recordingStarted) {
        console.log("录音已经启动");
        return;
    }

    var currentTime = new Date().toISOString().replace(/[-:.]/g, "");  // 获取当前时间作为文件名的一部分
    var folderPath = "Download/QuickRecoder";
    createFolder(folderPath);  // 检测文件夹是否存在，不存在则创建
    audioFile = files.join(files.getSdcardPath(), folderPath, currentTime + ".mp3");  // 录音文件保存路径

    mediaRecorder = android.media.MediaRecorder();  // 创建 MediaRecorder 对象

    // 设置音频源为麦克风
    mediaRecorder.setAudioSource(android.media.MediaRecorder.AudioSource.MIC);

    // 设置输出格式和编码格式
    mediaRecorder.setOutputFormat(android.media.MediaRecorder.OutputFormat.DEFAULT);
    mediaRecorder.setAudioEncoder(android.media.MediaRecorder.AudioEncoder.DEFAULT);

    // 设置输出文件路径
    mediaRecorder.setOutputFile(audioFile);

    try {
        mediaRecorder.prepare();  // 准备录音
        mediaRecorder.start();  // 开始录音
        recordingStarted = true;
        toast("录音已启动");

        // 停止录音的定时器
        setTimeout(function () {
            stopRecording();
        }, 10000);  // 录音时长为60秒，可根据需要调整
    } catch (e) {
        toast("录音启动失败：" + e);
    }
    // 释放电源管理锁
    // if (wakeLock != null && wakeLock.isHeld()) {
    //     wakeLock.release();
    // }
}

// 停止录音函数
function stopRecording() {
    if (!recordingStarted) {
        toast("录音尚未启动");
        return;
    }

    try {
        mediaRecorder.stop();  // 停止录音
        mediaRecorder.reset();
        mediaRecorder.release();

        recordingStarted = false;
        volumeDownCount = 0;

        toast("录音已停止");
    } catch (e) {
        toast("录音停止失败：" + e);
    }
}

// 创建文件夹函数
function createFolder(path) {
    var folder = files.join(files.getSdcardPath(), path);
    var file = new java.io.File(folder);
    if (!file.exists()) {
        file.mkdirs();
    }
}
