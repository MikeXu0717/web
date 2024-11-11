// API密钥配置和函数直接放在这个文件中
const API_KEY = "fac08ad29be5f64fde29986734b97ff2.chsGXxXorAa5QVr8"; // 例如："abc123def456.xyz789"

// 生成JWT token
async function generateToken() {
    try {
        if (!API_KEY || !API_KEY.includes('.')) {
            throw new Error('Invalid API Key format');
        }

        const [id, secret] = API_KEY.split('.');
        const now = Date.now();
        
        const header = {
            alg: 'HS256',
            sign_type: 'SIGN'
        };
        
        const payload = {
            api_key: id,
            exp: now + 3600 * 1000,
            timestamp: now
        };

        // 使用完整的 JWT 编码过程
        const encodedHeader = btoa(JSON.stringify(header));
        const encodedPayload = btoa(JSON.stringify(payload));
        
        // 创建签名
        const signatureInput = `${encodedHeader}.${encodedPayload}`;
        const signature = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        ).then(key => 
            crypto.subtle.sign(
                'HMAC',
                key,
                new TextEncoder().encode(signatureInput)
            )
        ).then(buffer => 
            btoa(String.fromCharCode(...new Uint8Array(buffer)))
        );

        // 组合 JWT
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
        console.error('Token generation failed:', error);
        throw error;
    }
}

// 调用智谱AI API
async function chatWithAI(messages) {
    try {
        const token = await generateToken();
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'glm-4',
                messages: messages
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('AI chat request failed:', error);
        throw error;
    }
}

// 在文件开头导入API函数
// import { chatWithAI } from './api.js';

// 将 openModal 函数移到全局作用域
function openModal(sectionId) {
    const modal = document.getElementById('portfolioModal');
    modal.style.display = 'block';
    // 隐藏所有模态框内容
    document.querySelectorAll('.modal-section').forEach(section => {
        section.style.display = 'none';
    });
    // 显示选中的内容
    document.getElementById(sectionId).style.display = 'block';
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
}

// 添加在全局作用域
function openWeChat() {
    // 检测操作系统
    const userAgent = navigator.userAgent.toLowerCase();
    let wechatUrl;
    
    if (/windows/.test(userAgent)) {
        // Windows系统
        wechatUrl = 'weixin://';
    } else if (/macintosh|mac os x/.test(userAgent)) {
        // MacOS系统
        wechatUrl = 'wechat://';
    } else if (/android/.test(userAgent)) {
        // 安卓系统
        wechatUrl = 'weixin://dl/chat';
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
        // iOS系统
        wechatUrl = 'wechat://';
    } else {
        // 其他系统
        wechatUrl = 'weixin://';
    }

    // 尝试打开微信
    try {
        window.location.href = wechatUrl;
        
        // 如果3秒后还在当前页面，说明可能没有安装微信
        setTimeout(function() {
            if (document.hidden || document.webkitHidden) {
                return;
            }
            // 提示用户安装微信
            alert('请确保您已安装微信客户端');
        }, 3000);
    } catch (e) {
        alert('无法打开微信，请确保您已安装微信客户端');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // 随机分配图片
    function shuffleImages() {
        // 获取所有图片
        const images = document.querySelectorAll('img[src^="images/"]');
        // 获取实际的图片文件名（不包括路径）
        const imageFiles = Array.from(images).map(img => {
            const fileName = img.src.split('/').pop();
            console.log('Current image file:', fileName); // 调试用
            return fileName;
        });
        
        console.log('Found images:', imageFiles); // 调试用
        
        // 检查images目录下的实际图片
        images.forEach((img) => {
            // 添加错误处理
            img.onerror = function() {
                console.error('Failed to load image:', img.src);
                // 如果加载失败，尝试使用其他图片
                img.src = 'images/3.jpg'; // 使用已知可以显示的图片
            };
            
            // 添加加载成功处理
            img.onload = function() {
                console.log('Successfully loaded:', img.src);
            };
        });
    }

    // 执行随机分配
    shuffleImages();

    const carousel = document.querySelector('.carousel-container');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    
    let currentSlide = 0;
    const slideCount = slides.length;

    // 初始化轮播图
    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    // 下一张
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slideCount;
        updateCarousel();
    }

    // 上一张
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        updateCarousel();
    }

    // 添加按钮事件监听
    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);

    // 自动轮播
    setInterval(nextSlide, 5000);

    // 聊天界面功能
    const chatInput = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.send-button');
    const chatHistory = document.querySelector('.chat-history');
    let chatMessages = []; // 存储对话历史

    function addMessage(message, isUser = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        messageDiv.innerHTML = `<p>${message}</p>`;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // 更新消息历史
        chatMessages.push({
            role: isUser ? 'user' : 'assistant',
            content: message
        });
    }

    async function handleMessage() {
        const message = chatInput.value.trim();
        if (message) {
            // 显示用户消息
            addMessage(message, true);
            chatInput.value = '';
            
            try {
                // 显示加载状态
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'message ai-message loading';
                loadingDiv.innerHTML = '<p>正在思考...</p>';
                chatHistory.appendChild(loadingDiv);

                // 调用AI API
                const response = await chatWithAI(chatMessages);
                
                // 移除加载状态
                chatHistory.removeChild(loadingDiv);
                
                // 显示AI回复
                addMessage(response, false);
            } catch (error) {
                console.error('Chat error:', error);
                addMessage('抱歉，我遇到了一些问题，请稍后再试。', false);
            }
        }
    }

    sendButton.addEventListener('click', handleMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleMessage();
        }
    });

    // 获取模态框元素
    const modal = document.getElementById('portfolioModal');
    const closeBtn = document.querySelector('.close-modal');

    // 关闭模态框
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // 点击模态框外部关闭
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}); 