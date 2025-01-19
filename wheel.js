class Wheel {
    constructor() {
        this.items = [
            // 定義輪盤項目和百分比（總和需要為 100%）
            { text: '拉麵', percentage: 4 },
            { text: '壽司', percentage: 4 },
            { text: '牛肉麵', percentage: 8 },
            { text: '披薩', percentage: 6 },
            { text: '漢堡', percentage: 8 },
            { text: '炒飯', percentage: 7 },
            { text: '滷肉飯', percentage: 7 },
            { text: '義大利麵', percentage: 7 },
            { text: '健身餐', percentage: 9 },
            { text: '火鍋', percentage: 8 },
            { text: '燒肉', percentage: 7 },
            { text: '咖哩飯', percentage: 6 },
            { text: '三明治', percentage: 6 },
            { text: '水餃', percentage: 7 },
            { text: '雞排', percentage: 6 }
        ];

        // 驗證百分比總和是否為 100
        const totalPercentage = this.items.reduce((sum, item) => sum + item.percentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
            console.error('錯誤：項目百分比總和應為 100%');
            return;
        }

        this.colors = ['#FFD700', '#FFA500'];
        this.rotation = 0;
        this.isSpinning = false;

        // DOM 元素
        this.wheel = document.querySelector('.wheel');
        this.button = document.getElementById('spinButton');
        this.pointer = document.querySelector('.pointer');

        if (!this.wheel || !this.button || !this.pointer) {
            console.error('錯誤：必須提供 .wheel, #spinButton 和 .pointer 元素');
            return;
        }

        this.init();
    }

    init() {
        this.drawWheel();
        this.button.addEventListener('click', () => this.spin());
    }

    drawWheel() {
        let startAngle = 0;
        this.wheel.innerHTML = '';

        this.items.forEach((item, index) => {
            const angle = (item.percentage / 100) * 360;
            const endAngle = startAngle + angle;

            // 創建扇形
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', this.createSegmentPath(startAngle, endAngle));
            path.setAttribute('fill', item.color || (index % 2 ? this.colors[1] : this.colors[0]));
            path.setAttribute('stroke', 'white');
            path.setAttribute('stroke-width', '0.5');

            // 創建文字
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            const textPos = this.calculateTextPosition(startAngle + angle / 2);

            text.setAttribute('x', textPos.x);
            text.setAttribute('y', textPos.y);
            text.setAttribute('fill', 'black');          // 黑色文字
            text.setAttribute('stroke', 'white');        // 白色描邊
            text.setAttribute('stroke-width', '0.5');    // 描邊寬度
            text.setAttribute('paint-order', 'stroke');
            text.setAttribute('font-size', '4');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.textContent = item.text;

            // 添加到 SVG
            this.wheel.appendChild(path);
            this.wheel.appendChild(text);

            startAngle = endAngle;
        });
    }

    createSegmentPath(startAngle, endAngle) {
        const radius = 50;  // 文字距離中心的距離
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        const x1 = (50 + radius * Math.cos(startRad)).toFixed(2);
        const y1 = (50 + radius * Math.sin(startRad)).toFixed(2);
        const x2 = (50 + radius * Math.cos(endRad)).toFixed(2);
        const y2 = (50 + radius * Math.sin(endRad)).toFixed(2);

        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

        return `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    }

    calculateTextPosition(angle) {
        const radius = 45;
        const rad = (angle - 90) * (Math.PI / 180);
        return {
            x: (50 + radius * Math.cos(rad)).toFixed(2),
            y: (50 + radius * Math.sin(rad)).toFixed(2)
        };
    }

    spin() {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.button.disabled = true;

        // 保持當前位置的計算，但不需要額外的角度偏移
        const extraRotation = 1800 + Math.random() * 360;   // 至少轉 5 圈加上隨機角度
        const newRotation = this.rotation + extraRotation;
        this.rotation = newRotation;

        this.pointer.style.transform = `rotate(${newRotation}deg)`;

        setTimeout(() => {
            this.isSpinning = false;
            this.button.disabled = false;

            // 因為指針向上（0度），所以直接計算角度即可
            const finalAngle = (newRotation + 140) % 360;
            // 注意：因為指針向上，我們需要將角度反轉來匹配扇形的方向
            const normalizedAngle = (finalAngle + 360) % 360;

            let currentAngle = 0;
            let selectedItem = null;

            // 根據角度確定選中項目
            for (const item of this.items) {
                const nextAngle = currentAngle + (item.percentage / 100) * 360;
                if (normalizedAngle >= currentAngle && normalizedAngle < nextAngle) {
                    selectedItem = item;
                    break;
                }
                currentAngle = nextAngle;
            }

            if (selectedItem) {
                this.showResult(selectedItem.text);
            }
        }, 5000);
    }

    // 顯示結果提示框
    showResult(text) { 
        const resultElement = document.createElement('div');
        resultElement.className = 'result-popup';
        resultElement.innerHTML = `
            <div class="result-content">
                <h2>恭喜各位委員！</h2>
                <p>今天中午吃 <span style="font-weight: bold; font-size: 1.2em">${text}</span>！</p>
                <button onclick="document.body.removeChild(this.closest('.result-popup'))" 
                        style="padding: 10px 20px; font-size: 16px;">換吃其他的！</button>
            </div>
        `;
        document.body.appendChild(resultElement);

        // 新增煙火效果 
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'absolute';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none'; // 確保煙花不影響其他元素互動
        confettiContainer.style.zIndex = '9999'; // 保證煙花位於最上層
        document.body.appendChild(confettiContainer);

        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();
    }
}

// 當 DOM 載入完成後初始化輪盤
document.addEventListener('DOMContentLoaded', () => {
    new Wheel();
});
