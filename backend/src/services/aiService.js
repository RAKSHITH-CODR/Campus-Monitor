const { Groq } = require('groq-sdk');
const env = require('../config/env');
const AILog = require('../modules/ai/aiLog.model');

const groq = new Groq({
  apiKey: env.groqApiKey,
});

const analyzeAnomaly = async (sensorData, roomInfo) => {
  try {
    const prompt = `
You are a smart building AI system. Analyze the following sensor data and provide insights.

Room: ${roomInfo.name} (${roomInfo.type})
Temperature: ${sensorData.temperature}°C (Normal: ${roomInfo.normalTemperature}°C)
Air Quality Index: ${sensorData.airQuality}
Energy Usage: ${sensorData.energyUsage}W
Motion Detected: ${sensorData.motion ? 'Yes' : 'No'}

Provide a JSON response with:
{
  "reasoning": "Your analysis in 1-2 sentences",
  "severity": "LOW/MEDIUM/HIGH/CRITICAL",
  "actionTaken": "Recommended action or alert message",
  "recommendation": "Any additional recommendations"
}

Be concise and practical.
    `;

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = completion.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

    // Store AI log
    await AILog.create({
      room: roomInfo.name,
      sensorData,
      reasoning: analysis.reasoning,
      actionTaken: analysis.actionTaken,
      severity: analysis.severity,
    });

    // FIX: use socketManager instead of socketService so the broadcast actually fires
    const { emitAiReasoning } = require('./socketManager');
    emitAiReasoning({
      room: roomInfo.name,
      analysis,
      timestamp: new Date(),
    });

    return analysis;
  } catch (error) {
    // FIX: include room name in error log so you know which room failed
    console.error(`❌ Groq API error for room "${roomInfo?.name || 'unknown'}":`, error.message);
    return {
      reasoning: 'System error analyzing data',
      severity: 'LOW',
      actionTaken: 'Manual review needed',
      recommendation: error.message,
    };
  }
};

module.exports = { analyzeAnomaly };
