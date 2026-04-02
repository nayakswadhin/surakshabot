"""
Clean Markdown formatting for chatbot-friendly responses
No ASCII borders - works great in WhatsApp, Telegram, Slack
"""
from typing import List, Dict, Any, Optional


def get_pdf_url(filename: str) -> Optional[str]:
    """
    Get direct PDF URL for a given filename
    Always returns the main portal URL where all PDFs are available
    
    Args:
        filename: Name of the PDF file (with or without .pdf extension)
        
    Returns:
        URL string pointing to main portal
    """
    # All PDFs are accessible from the main portal
    return "https://cybercrime.gov.in/Default.aspx"


def get_section_url(section: str) -> tuple:
    """
    Get URL and display name for a section
    These URLs point to the actual pages on cybercrime.gov.in where users can find the PDFs
    """
    section_mapping = {
        "Citizen Manual": ("https://cybercrime.gov.in/Webform/Citizen_Manual.aspx", "📖 Citizen Manual"),
        "Cyber Awareness": ("https://cybercrime.gov.in/Webform/CyberAware.aspx", "🧠 Cyber Awareness"),
        "Cyber Safety Tips": ("https://cybercrime.gov.in/Webform/Crime_OnlineSafetyTips.aspx", "🛡️ Online Safety Tips"),
        "Daily Digest": ("https://cybercrime.gov.in/Webform/dailyDigest.aspx", "📰 Daily Digest")
    }
    return section_mapping.get(section, ("https://cybercrime.gov.in/Default.aspx", "🌐 Main Portal"))


def format_clean_answer(answer: str, sources: List[Dict[str, Any]]) -> str:
    """
    Format answer with clean, professional structure - optimized for WhatsApp
    Uses clean spacing and emojis for readability
    """
    # Professional header with spacing
    formatted = "🇮🇳 *National Cybercrime Reporting Portal*\n"
    formatted += "━━━━━━━━━━━━━━━━━━━━━\n\n"
    
    # Main answer content
    formatted += f"{answer}\n\n"
    
    # Help section - compact and clear
    formatted += "━━━━━━━━━━━━━━━━━━━━━\n"
    formatted += "*📞 EMERGENCY HELP*\n"
    formatted += "━━━━━━━━━━━━━━━━━━━━━\n"
    formatted += "🌐 *Portal:* cybercrime.gov.in\n"
    formatted += "📞 *Helpline:* 1930 (24×7 Free)\n"
    formatted += "📧 *Email:* report@cybercrime.gov.in\n\n"
    
    # Sources section - cleaner format
    if sources:
        formatted += "━━━━━━━━━━━━━━━━━━━━━\n"
        formatted += "*📚 REFERENCE DOCUMENTS*\n"
        formatted += "━━━━━━━━━━━━━━━━━━━━━\n"
        formatted += "_Tap links to view official PDFs_\n\n"
        
        # Group by section
        by_section = {}
        for src in sources[:5]:
            section = src.get('section', 'Unknown')
            if section not in by_section:
                by_section[section] = []
            by_section[section].append(src)
        
        # Format each section with clean structure
        for idx, (section, items) in enumerate(by_section.items(), 1):
            url, name = get_section_url(section)
            formatted += f"{name}\n"
            
            for src in items:
                filename = src.get('filename', '')
                fname_display = filename.replace('.pdf', '').replace('_chunked', '').replace('_', ' ')
                
                # Clean name
                if len(fname_display) > 45:
                    fname_display = fname_display[:42] + "..."
                
                page = src.get('page', 'N/A')
                score = int(src.get('relevance_score', 0) * 100)
                
                # Get direct PDF link
                pdf_url = get_pdf_url(filename)
                
                if pdf_url:
                    formatted += f"  → {fname_display}\n"
                    formatted += f"     _Page {page} • {score}% relevance_\n"
                    formatted += f"     {pdf_url}\n"
                else:
                    formatted += f"  → {fname_display}\n"
                    formatted += f"     _Page {page} • {score}% relevance_\n"
            
            if idx < len(by_section):
                formatted += "\n"
    
    # Quick links section
    formatted += "\n━━━━━━━━━━━━━━━━━━━━━\n"
    formatted += "*🔗 EXPLORE MORE*\n"
    formatted += "━━━━━━━━━━━━━━━━━━━━━\n"
    formatted += "• Citizen Manual\n"
    formatted += "  _cybercrime.gov.in/Webform/Citizen_Manual.aspx_\n\n"
    formatted += "• Safety Tips\n"
    formatted += "  _cybercrime.gov.in/Webform/Crime_OnlineSafetyTips.aspx_\n\n"
    formatted += "• Cyber Awareness\n"
    formatted += "  _cybercrime.gov.in/Webform/CyberAware.aspx_\n\n"
    
    # Footer
    formatted += "━━━━━━━━━━━━━━━━━━━━━\n"
    formatted += "_✅ AI-Powered Response • Sentence Transformers_\n"
    formatted += "_🇮🇳 Ministry of Home Affairs, Govt of India_"
    
    return formatted
