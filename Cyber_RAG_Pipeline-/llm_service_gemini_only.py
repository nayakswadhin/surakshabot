"""
LLM Service - GEMINI ONLY (lightweight rephrasing with strong prompt)
Uses Gemini 2.0 Flash for clean, actionable summaries
Optimized for chatbot and WhatsApp-friendly output
"""
import os
from typing import List, Dict, Any

# Enhanced system prompt for WhatsApp-friendly structured answers
SYSTEM_PROMPT = """You are an expert AI assistant for India's National Cybercrime Reporting Portal.

Your task: Provide CLEAR, well-structured guidance optimized for WhatsApp/mobile viewing.

ANSWER FORMAT (use exactly this structure):

*[TOPIC TITLE]*

*Step-by-step Guide:*
1️⃣ [First main point]
   • [Sub-detail with explanation]
   • [Another sub-detail]

2️⃣ [Second main point]
   • [Sub-detail with explanation]
   • [Another sub-detail]

3️⃣ [Third main point]
   • [Sub-detail with explanation]

*⚠️ Important Notes:*
• [Warning or critical information]
• [Another important point]

*💡 Quick Tips:*
• [Helpful tip 1]
• [Helpful tip 2]

RULES:
✅ Use numbered steps (1️⃣ 2️⃣ 3️⃣) for main points
✅ Use bullets (•) for sub-points
✅ Use emojis sparingly for visual breaks
✅ Keep paragraphs short (2-3 lines max)
✅ Use *bold* for section headers only
✅ Include specific numbers: helpline 1930, cybercrime.gov.in
✅ Make it scannable - easy to read on mobile
✅ Total length: 150-250 words

❌ Do NOT use markdown formatting like ** or # 
❌ Do NOT include PDF artifacts or page numbers
❌ Do NOT write long paragraphs
❌ Do NOT use complex formatting
❌ Do NOT include unrelated information

Keep it clean, professional, and WhatsApp-friendly."""


class LLMService:
    """Gemini-only service for query refinement and answer generation"""
    
    def __init__(self):
        """Initialize Gemini with latest model"""
        self.model = None
        self._init_gemini()
    
    def refine_query(self, user_query: str) -> str:
        """
        Transform vague queries into detailed, specific questions for higher confidence retrieval
        Examples:
        - "report crime" → "what are the detailed steps and procedures to report cybercrime online through the national portal including required documents and evidence"
        - "safety tips" → "comprehensive cyber safety tips and best practices for protecting personal information online and preventing fraud"
        - "phishing" → "how to identify and report phishing attacks scam emails and fraudulent messages and what steps to take if compromised"
        """
        try:
            prompt = f"""You are an expert query expansion system for India's National Cybercrime Reporting Portal.

USER QUERY: "{user_query}"

Task: Transform this into a DETAILED, SPECIFIC search query that will retrieve highly relevant information. Expand vague queries into comprehensive questions with context.

EXPANSION STRATEGY:
1. If it's a "how to" question → Add: steps, procedures, requirements, documents needed, portal navigation
2. If it's about fraud/scam → Add: types, identification, reporting process, prevention measures
3. If it's about safety → Add: best practices, precautions, security measures, what to avoid
4. If it's technical → Add: specific terminology, related concepts, examples

DOMAIN KNOWLEDGE (India's Cybercrime Portal):
- National Cybercrime Reporting Portal (cybercrime.gov.in)
- Helpline 1930 for reporting
- Types: Financial fraud, identity theft, phishing, social media scams, banking fraud, OTP fraud
- Reporting process: evidence collection, filing complaints, tracking status
- Safety measures: password security, mobile app safety, social media privacy
- Citizen manual guides for different fraud types

RULES:
✅ Expand with relevant cybercrime terminology and context
✅ Add specific details: procedures, steps, documents, requirements
✅ Include related concepts and synonyms
✅ Keep it as a natural question or search phrase (15-35 words)
✅ Focus on actionable information user needs
✅ Return ONLY the expanded query, no explanation or quotes

DETAILED EXPANDED QUERY:"""

            response = self.model.generate_content(
                prompt,
                generation_config={
                    'max_output_tokens': 100,
                    'temperature': 0.4,  # Slightly higher for creative expansion
                    'top_p': 0.85,
                }
            )
            
            refined = response.text.strip().strip('"').strip("'").strip()
            
            # Use refined query if it's reasonable and longer than original
            if refined and len(refined) > len(user_query) and len(refined) < 300:
                print(f"🔍 Query refined:")
                print(f"   Original: '{user_query}'")
                print(f"   Expanded: '{refined}'")
                return refined
            else:
                print(f"🔍 Using original query: '{user_query}'")
                return user_query
                
        except Exception as e:
            print(f"⚠️ Query refinement failed: {e}")
            return user_query  # Fallback to original
    
    def _init_gemini(self):
        """Initialize Google Gemini 2.0 Flash (fastest, latest)"""
        try:
            import google.generativeai as genai
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("GOOGLE_API_KEY not found in .env file")
            
            genai.configure(api_key=api_key)
            
            # Try Gemini 2.0 Flash first (newest), fallback to 1.5 Flash
            try:
                self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
                print("✅ Gemini 2.0 Flash initialized (experimental, fastest)")
            except:
                self.model = genai.GenerativeModel('gemini-1.5-flash-latest')
                print("✅ Gemini 1.5 Flash initialized (stable)")
                
        except Exception as e:
            print(f"❌ Gemini error: {e}")
            raise
    
    def rephrase_answer(self, raw_text: str, user_query: str = "") -> str:
        """
        Generate clean, WhatsApp-friendly structured answers from extracted text
        """
        try:
            # Enhanced prompt for structured WhatsApp-friendly answers
            query_context = f"\nUSER QUESTION: {user_query}\n" if user_query else ""
            
            prompt = f"""{SYSTEM_PROMPT}
{query_context}
CONTEXT FROM OFFICIAL DOCUMENTS:
{raw_text[:3500]}

Generate a clear, well-structured answer following the format above:"""
            
            response = self.model.generate_content(
                prompt,
                generation_config={
                    'max_output_tokens': 600,
                    'temperature': 0.4,
                    'top_p': 0.9,
                }
            )
            
            cleaned = response.text.strip()
            
            # Return if good quality
            if cleaned and len(cleaned) > 50:
                return cleaned
            else:
                return raw_text  # Fallback
            
        except Exception as e:
            print(f"⚠️ Gemini answer generation failed: {e}")
            return raw_text


def rerank_chunks(chunks: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
    """Simple reranking based on keyword overlap"""
    query_words = set(query.lower().split())
    
    for chunk in chunks:
        text = chunk.get('text', '').lower()  # Fixed: get 'text' directly, not from metadata
        overlap = sum(1 for word in query_words if word in text)
        chunk['rerank_score'] = overlap
    
    return sorted(chunks, key=lambda x: x.get('rerank_score', 0), reverse=True)


def get_pdf_url(filename: str, section: str) -> str:
    """Get the webpage URL where the PDF can be found"""
    # Map sections to their source URLs
    section_lower = section.lower()
    
    if 'citizen' in section_lower or 'manual' in section_lower:
        return "https://cybercrime.gov.in/Webform/Citizen_Manual.aspx"
    elif 'safety' in section_lower or 'tips' in section_lower:
        return "https://cybercrime.gov.in/Webform/Crime_OnlineSafetyTips.aspx"
    elif 'awareness' in section_lower or 'cyber' in section_lower:
        return "https://cybercrime.gov.in/Webform/CyberAware.aspx"
    elif 'digest' in section_lower or 'daily' in section_lower:
        return "https://cybercrime.gov.in/Webform/dailyDigest.aspx"
    else:
        return "https://cybercrime.gov.in"


def get_pdf_link(section: str, filename: str) -> tuple:
    """
    Get clickable PDF link and section name based on section
    Returns: (section_url, section_display_name)
    """
    # Map sections to their respective URLs with display names
    section_mapping = {
        "Citizen Manual": {
            "url": "https://cybercrime.gov.in/Webform/Citizen_Manual.aspx",
            "name": "📖 Citizen Manual"
        },
        "Cyber Awareness": {
            "url": "https://cybercrime.gov.in/Webform/CyberAware.aspx",
            "name": "🧠 Cyber Awareness"
        },
        "Cyber Safety Tips": {
            "url": "https://cybercrime.gov.in/Webform/Crime_OnlineSafetyTips.aspx",
            "name": "🛡️ Online Safety Tips"
        },
        "Daily Digest": {
            "url": "https://cybercrime.gov.in/Webform/dailyDigest.aspx",
            "name": "📰 Daily Digest"
        }
    }
    
    section_data = section_mapping.get(section, {
        "url": "https://cybercrime.gov.in",
        "name": "🌐 Main Portal"
    })
    
    return section_data["url"], section_data["name"]


def format_final_answer(answer: str, sources: List[Dict[str, Any]]) -> str:
    """
    Format answer with beautiful formatting, clickable PDF links, and organized sources
    Makes the response human-readable and professional
    """
    # Header with clean answer
    formatted = "╔═══════════════════════════════════════════════════════════════╗\n"
    formatted += "║          NATIONAL CYBERCRIME REPORTING PORTAL - INDIA         ║\n"
    formatted += "╚═══════════════════════════════════════════════════════════════╝\n\n"
    
    # Main answer with proper formatting
    formatted += "📝 **YOUR ANSWER:**\n\n"
    formatted += f"{answer}\n\n"
    
    # Divider
    formatted += "─" * 65 + "\n\n"
    
    # Important contact information
    formatted += "📞 **NEED IMMEDIATE HELP?**\n\n"
    formatted += "  🌐 Main Portal: https://cybercrime.gov.in\n"
    formatted += "  � Cyber Helpline: 1930 (24x7 Toll-Free)\n"
    formatted += "  📧 Email Support: report@cybercrime.gov.in\n"
    formatted += "  ⚡ Report Crime: https://cybercrime.gov.in/Webform/Crime_ReportAnonymously.aspx\n\n"
    
    # Divider
    formatted += "─" * 65 + "\n\n"
    
    # Sources section with organized layout
    formatted += "📚 **INFORMATION SOURCES:**\n\n"
    formatted += "This answer is compiled from official government documents:\n\n"
    
    # Group sources by section
    sources_by_section = {}
    for src in sources[:5]:  # Show top 5 sources
        section = src.get('section', 'Unknown')
        if section not in sources_by_section:
            sources_by_section[section] = []
        sources_by_section[section].append(src)
    
    # Format each section's sources
    source_num = 1
    for section, section_sources in sources_by_section.items():
        section_url, section_name = get_pdf_link(section, "")
        
        formatted += f"{section_name}\n"
        formatted += f"└─ 🔗 View all documents: {section_url}\n\n"
        
        for src in section_sources:
            filename = src.get('filename', 'Unknown')
            page = src.get('page', 'N/A')
            score = src.get('relevance_score', 0)
            
            # Clean filename for display
            display_name = filename.replace('.pdf', '').replace('_', ' ')
            if len(display_name) > 45:
                display_name = display_name[:42] + "..."
            
            # Format relevance score as percentage
            relevance_pct = int(score * 100)
            
            formatted += f"   [{source_num}] 📄 {display_name}\n"
            formatted += f"       ├─ Page: {page}\n"
            formatted += f"       └─ Relevance: {relevance_pct}% match\n\n"
            source_num += 1
    
    # Footer with all section links
    formatted += "─" * 65 + "\n\n"
    formatted += "🗂️ **EXPLORE ALL RESOURCES:**\n\n"
    formatted += "  1️⃣ Citizen Manual → https://cybercrime.gov.in/Webform/Citizen_Manual.aspx\n"
    formatted += "  2️⃣ Online Safety Tips → https://cybercrime.gov.in/Webform/Crime_OnlineSafetyTips.aspx\n"
    formatted += "  3️⃣ Cyber Awareness → https://cybercrime.gov.in/Webform/CyberAware.aspx\n"
    formatted += "  4️⃣ Daily Digest → https://cybercrime.gov.in/Webform/dailyDigest.aspx\n\n"
    
    formatted += "─" * 65 + "\n"
    formatted += "✅ Powered by AI | 🇮🇳 Government of India Initiative\n"
    formatted += "─" * 65 + "\n"
    
    return formatted


# Global instance
_llm_service = None

def get_llm_service() -> LLMService:
    """Get or create LLM service instance"""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service


if __name__ == "__main__":
    # Test
    service = LLMService()
    test_text = "USER MANUAL FOR NATIONAL CYBERCRIME REPORTING PORTAL  Page 17 of 91  Click on Preview & Submit"
    cleaned = service.rephrase_answer(test_text)
    print("Original:", test_text)
    print("\nCleaned:", cleaned)
