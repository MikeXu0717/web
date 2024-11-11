// API密钥配置
const API_KEY = "fac08ad29be5f64fde29986734b97ff2.chsGXxXorAa5QVr8"; // 替换为你的实际API密钥

// 生成JWT token
async function generateToken() {
    const [id, secret] = API_KEY.split('.');
    const now = Date.now();
    
    const payload = {
        api_key: id,
        exp: now + 3600 * 1000, // 1小时后过期
        timestamp: now
    };

    const header = {
        alg: 'HS256',
        sign_type: 'SIGN'
    };

    try {
        // 注意：在实际应用中，你需要使用一个JWT库来生成token
        // 这里使用了 jwt-encode 库作为示例
        const token = jwt.encode(payload, secret, header);
        return token;
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

export { chatWithAI }; 