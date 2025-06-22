document.addEventListener('DOMContentLoaded', () => {
    const clockEl = document.getElementById('clock');
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const nextYearDateEl = document.getElementById('next-year-date');
    const progressBarEl = document.getElementById('progress-bar');
    const rocketEl = document.getElementById('rocket');
    const progressPercentageEl = document.getElementById('progress-percentage');

    let timeOffset = 0;

    async function syncTime() {
        try {
            // 改用一个更通用的世界标准时间(UTC) API端点，这在某些网络环境下更稳定
            const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
            
            if (!response.ok) {
                throw new Error(`API请求失败，状态码: ${response.status}`);
            }
            const data = await response.json();
            // 使用ISO 8601格式的日期字符串来创建时间对象，以获得更精确的时间
            const networkTime = new Date(data.utc_datetime).getTime();
            timeOffset = networkTime - Date.now();
            console.log(`时间已校准，与本地时间差: ${timeOffset}ms`);
        } catch (error) {
            console.error('网络时间同步失败，将使用本地时间。', error);
            timeOffset = 0;
        }
    }

    function getCorrectedDate() {
        return new Date(Date.now() + timeOffset);
    }

    // 预设未来几年的农历新年日期 (公历)
    const chineseNewYearDates = [
        '2025-01-29',
        '2026-02-17',
        '2027-02-06',
        '2028-01-26',
        '2029-02-13',
        '2030-02-03',
        '2031-01-23',
        '2032-02-11',
        '2033-01-31',
        '2034-02-19'
    ];

    function getNextChineseNewYear() {
        const now = getCorrectedDate();
        for (const dateStr of chineseNewYearDates) {
            const newYearDate = new Date(dateStr);
            if (newYearDate > now) {
                return newYearDate;
            }
        }
        // 如果列表中的日期都已过，可以返回一个提示或默认值
        return new Date(chineseNewYearDates[chineseNewYearDates.length - 1]);
    }

    const newYearDate = getNextChineseNewYear();
    const newYearDateFormatted = `${newYearDate.getFullYear()}年${newYearDate.getMonth() + 1}月${newYearDate.getDate()}日`;
    nextYearDateEl.innerText = `下一个春节: ${newYearDateFormatted}`;


    function countdown() {
        const now = getCorrectedDate();
        const totalSeconds = (newYearDate - now) / 1000;

        if (totalSeconds <= 0) {
            daysEl.innerText = '00';
            hoursEl.innerText = '00';
            minutesEl.innerText = '00';
            secondsEl.innerText = '00';
            // 可以添加新年快乐的提示
            document.querySelector('h1').innerText = "新年快乐!";
            clearInterval(countdownInterval);
            return;
        }

        const days = Math.floor(totalSeconds / 3600 / 24);
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const seconds = Math.floor(totalSeconds) % 60;

        daysEl.innerText = formatTime(days);
        hoursEl.innerText = formatTime(hours);
        minutesEl.innerText = formatTime(minutes);
        secondsEl.innerText = formatTime(seconds);
    }

    function updateYearProgress() {
        const now = getCorrectedDate();
        const year = now.getFullYear();
        const yearStart = new Date(year, 0, 1); // Jan 1st
        const yearEnd = new Date(year + 1, 0, 1); // Jan 1st of next year
        
        const yearTotalMilliseconds = yearEnd - yearStart;
        const elapsedMilliseconds = now - yearStart;
        
        const percentage = (elapsedMilliseconds / yearTotalMilliseconds) * 100;
        
        if (progressBarEl && rocketEl && progressPercentageEl) {
            progressBarEl.style.width = `${percentage}%`;
            rocketEl.style.left = `${percentage}%`;
            progressPercentageEl.innerText = `今年已过 ${percentage.toFixed(4)}%`;
        }
    }

    function updateClock() {
        const now = getCorrectedDate();
        const year = now.getFullYear();
        const month = formatTime(now.getMonth() + 1);
        const day = formatTime(now.getDate());
        const hours = formatTime(now.getHours());
        const minutes = formatTime(now.getMinutes());
        const seconds = formatTime(now.getSeconds());
        if (clockEl) {
            clockEl.innerText = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
    }

    function formatTime(time) {
        return time < 10 ? `0${time}` : time;
    }

    // 初始调用
    syncTime().then(() => {
        countdown();
        updateYearProgress();
        updateClock();

        // 每秒更新
        const countdownInterval = setInterval(() => {
            countdown();
            updateYearProgress();
            updateClock();
        }, 1000);
    });
}); 