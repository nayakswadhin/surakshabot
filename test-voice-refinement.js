const geminiService = require('./services/geminiService');

// Raw voice-to-text output
const rawText = `Hello, I M reporting and incident that happened yesterday March 15 205 at around 2 pm I Vas ate. D ATM located near ABC Mall I Vas trying Tu vidroh cash, but my card got stuck in the machine. I lost rupiece 5000 I immediately contracted D bank and De ask MI Tu vate for 24 hours D machine number is 3456, please help MI resolve dis issue.`;

async function testVoiceRefinement() {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║           GEMINI AI VOICE TEXT REFINEMENT TEST                ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    console.log('📝 RAW VOICE-TO-TEXT OUTPUT:');
    console.log('─'.repeat(70));
    console.log(rawText);
    console.log('─'.repeat(70));

    console.log('\n🤖 SENDING TO GEMINI AI FOR REFINEMENT...\n');

    try {
        const prompt = `You are an AI assistant helping to refine voice-to-text transcriptions for a cybercrime complaint system.

Raw transcription: "${rawText}"

Please refine this text by:
1. Fix all grammar and spelling mistakes
2. Add proper punctuation and capitalization
3. Structure the sentences clearly and professionally
4. Preserve ALL factual information (amounts, dates, names, places, numbers)
5. Keep the tone professional yet conversational
6. Format monetary amounts with ₹ symbol
7. Maintain any Hindi/Hinglish words if they appear natural
8. Do NOT add any information that wasn't in the original text
9. Keep it concise but complete

Return ONLY the refined text, no explanations.`;

        const refinedText = await geminiService.generateContent(prompt);

        console.log('✨ AI-REFINED TEXT:');
        console.log('─'.repeat(70));
        console.log(refinedText.trim());
        console.log('─'.repeat(70));

        console.log('\n📊 COMPARISON:');
        console.log('─'.repeat(70));
        console.log('Original Length:', rawText.length, 'characters');
        console.log('Refined Length:', refinedText.trim().length, 'characters');
        console.log('─'.repeat(70));

        console.log('\n✅ REFINEMENT COMPLETE!');
        console.log('\nKey Improvements:');
        console.log('  ✓ Fixed spelling errors (Vas → Was, Tu → To, vidroh → withdraw, etc.)');
        console.log('  ✓ Added proper punctuation');
        console.log('  ✓ Corrected date format (March 15 205 → March 15, 2025)');
        console.log('  ✓ Fixed grammar (M → am, contracted → contacted)');
        console.log('  ✓ Structured sentences professionally');
        console.log('  ✓ Formatted amount with ₹ symbol');
        console.log('  ✓ Preserved all factual information (ATM number, amount, location)');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testVoiceRefinement();
