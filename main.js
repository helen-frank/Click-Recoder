// 录音文件保存路径
var folderPath = "Download/QuickRecoder"; // 改写成 Download/.QuickRecoder 可开启隐藏

console.log("------------------")
console.log("《听见》v0.0.2")
console.log("《听见》完全尊重用户的隐私权，并承诺不在线收集用户个人信息、不联网操作、不进行恶意行为。用户对应用程序的控制权完全属于用户自己。不会在未经用户明确许可的情况下侵犯用户的隐私，始终致力于保护用户的隐私和数据安全。如果您有任何其他问题或疑虑，请随时告知我,邮箱:helenfrank@protonmail.com");
console.log("拒绝偷录及一切违法乱纪之事，《听见》有权拒绝为这样的事服务")
console.log("------------------")

console.log("权限相关:");
console.log("仅需要录音权限，无障碍权限，文件存储权限，电源设置无限制，锁定在后台避免被清理掉后台")
console.log("软件平台原因可能会去尝试申请其他权限，但其他权限一律别给")
console.log("------------------")

console.log("使用说明:")
console.log("快速三连击音量减键启动录音, 震动提醒");
console.log("快速三连击音量加键关闭录音, 震动提醒");
console.log("录音最大时长：一小时")
console.log("预期在所有情况下都可生效(锁屏,熄屏等)");
console.log("录音文件存储在：" + files.join(files.getSdcardPath(), folderPath));
console.log("------------------")

console.log("最重要的事：")
console.log("1.请务必多做测试，确认随时可用，避免误事!!!")
// console.log("2.请一定确认文件hash码是否一致,我会把文件的hash码一并放出");
// console.log("3.如果你是在其他地方得到安装包,获取hash码目前可在bilibili.com搜索helen_frank,或者发送邮件到:helenfrank@protonmail.com")
console.log("------------------")

var volumeDownCount = 0;  // 记录音量减键按下的次数
var volumeUpCount = 0;  // 记录音量加键按下的次数
var recordingStarted = false;  // 记录录音是否已经启动
var mediaRecorder = null;  // 媒体录制器对象
var audioFile = "";

// 请求权限
runtime.requestPermissions(["record_audio"]); // 请求录音权限

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

// 监听音量加键的按下事件
events.onKeyDown("volume_up", function (event) {
    volumeUpCount++; // 每次按下音量加键增加计数

    if (recordingStarted) {
        if (volumeUpCount === 1) {
            // 设置定时器，在一秒后重置按下计数器
            setTimeout(function () {
                volumeUpCount = 0;
            }, 1000);
        } else if (volumeUpCount >= 3) {
            stopRecording(); // 当按下次数达到3次且录音已启动时，停止录音
        }
    }
});

// 启动录音函数
function startRecording() {
    if (recordingStarted) {
        console.log("Recording already started");
        toast("Recording already started");
        return;
    }

    var currentTime = new Date().toISOString().replace(/[-:.]/g, "");  // 获取当前时间作为文件名的一部分

    // 新增 currentTime = "." + currentTime 可开启隐藏文件

    createFolder(folderPath);  // 检测文件夹是否存在，不存在则创建
    audioFile = files.join(files.getSdcardPath(), folderPath, currentTime + ".mp3");  // 录音文件保存路径

    mediaRecorder = new android.media.MediaRecorder();  // 创建 MediaRecorder 对象

    // 设置音频源为麦克风
    mediaRecorder.setAudioSource(android.media.MediaRecorder.AudioSource.MIC);

    // 设置输出格式和编码格式
    mediaRecorder.setOutputFormat(android.media.MediaRecorder.OutputFormat.DEFAULT);
    mediaRecorder.setAudioEncoder(android.media.MediaRecorder.AudioEncoder.DEFAULT);

    // 设置输出文件路径
    mediaRecorder.setOutputFile(audioFile);

    try {
        mediaRecorder.prepare();  // 准备录音
        device.vibrate(100) // 震动 100ms，表示开始录音
        mediaRecorder.start();  // 开始录音
        recordingStarted = true;
        console.log("Recording started");
        toast("Recording started");

        // 停止录音的定时器
        setTimeout(function () {
            stopRecording();
        }, 2 * 60 * 60 * 1000);  // 最长录音时长为2小时，可根据需要调整
    } catch (e) {
        console.error("Recording start failed:" + e);
        toast("Recording start failed: " + e);
    }
}

// 停止录音函数
function stopRecording() {
    if (!recordingStarted) {
        console.log("Recording has not started");
        toast("Recording has not started");
        return;
    }

    try {
        mediaRecorder.stop();  // 停止录音
        device.vibrate(500) // 震动 500ms
        mediaRecorder.reset();
        mediaRecorder.release();

        recordingStarted = false;
        volumeDownCount = 0;
        volumeUpCount = 0;

        console.log("Recording stopped");
        toast("Recording stopped");
    } catch (e) {
        console.error("Recording stop failed: " + e);
        toast("Recording stop failed: " + e);
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
