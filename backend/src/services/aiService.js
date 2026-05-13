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

    const message = await groq.messages.create({
      model: 'mixtral-8x7b-32768',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

    // Store AI log
    const aiLog = await AILog.create({
      room: roomInfo.name,
      sensorData,
      reasoning: analysis.reasoning,
      actionTaken: analysis.actionTaken,
      severity: analysis.severity,
    });

    // Broadcast via socket
    const { broadcastAIReasoning } = require('./socketService');
    broadcastAIReasoning({
      room: roomInfo.name,
      analysis,
      timestamp: new Date(),
    });

    return analysis;
  } catch (error) {
    console.error('❌ Groq API error:', error.message);
    return {
      reasoning: 'System error analyzing data',
      severity: 'LOW',
      actionTaken: 'Manual review needed',
      recommendation: error.message,
    };
  }
};

module.exports = { analyzeAnomaly };
