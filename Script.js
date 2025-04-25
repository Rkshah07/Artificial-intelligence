// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

// Check for saved theme preference
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
  sunIcon.classList.remove('hidden');
  moonIcon.classList.add('hidden');
} else {
  document.documentElement.classList.remove('dark');
  sunIcon.classList.add('hidden');
  moonIcon.classList.remove('hidden');
}

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  sunIcon.classList.toggle('hidden');
  moonIcon.classList.toggle('hidden');
  localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
});

// Chat Interface
const startChat = document.getElementById('startChat');
const chatInterface = document.getElementById('chatInterface');
const newsSection = document.getElementById('newsSection');
const chatMessages = document.getElementById('chatMessages');
const queryForm = document.getElementById('queryForm');
const userInput = document.getElementById('userInput');

startChat.addEventListener('click', () => {
  chatInterface.classList.remove('hidden');
  newsSection.classList.remove('hidden');
  startChat.classList.add('hidden');
  addBotMessage("Hello! I'm your AI Market Research Assistant. How can I help you today?");
});

// Message handling
function addUserMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-bubble user-message';
  messageDiv.textContent = message;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatResponse(text) {
  // Remove markdown-style formatting
  text = text.replace(/\*\*/g, '');

  // Split the text into sections
  const sections = text.split(/(?=Executive Summary|Market Analysis|Competitive Landscape|Opportunities & Challenges|Strategic Recommendations)/i);

  return sections.map(section => {
    const [heading, ...content] = section.split('\n');
    const isHeading = /^(Executive Summary|Market Analysis|Competitive Landscape|Opportunities & Challenges|Strategic Recommendations)/i.test(heading);

    if (isHeading) {
      return `
        <div class="mb-8">
          <h3 class="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center">
            <span class="mr-2">${heading}</span>
          </h3>
          <div class="pl-4 border-l-2 border-blue-200 dark:border-blue-800">
            ${content.map(line => {
        if (line.trim().startsWith('-')) {
          return `<div class="flex items-start mb-3">
                  <span class="text-blue-500 mr-2">•</span>
                  <span class="text-gray-700 dark:text-gray-300">${line.replace('-', '').trim()}</span>
                </div>`;
        } else if (line.trim().startsWith('*')) {
          return `<div class="flex items-start mb-3">
                  <span class="text-blue-500 mr-2">•</span>
                  <span class="text-gray-700 dark:text-gray-300">${line.replace('*', '').trim()}</span>
                </div>`;
        } else if (line.trim().startsWith('**')) {
          return `<div class="font-bold text-blue-600 dark:text-blue-400 mb-3">${line.replace('**', '').trim()}</div>`;
        } else if (line.trim()) {
          return `<p class="text-gray-700 dark:text-gray-300 mb-3">${line}</p>`;
        }
        return '';
      }).join('')}
          </div>
        </div>
      `;
    } else {
      return `<p class="text-gray-700 dark:text-gray-300 mb-3">${section}</p>`;
    }
  }).join('');
}

function addBotMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-bubble bot-message';

  // Create a scrollable container for long responses
  const container = document.createElement('div');
  container.className = 'max-h-[400px] overflow-y-auto pr-2';

  // Format the message with Tailwind CSS
  const formattedMessage = formatResponse(message);
  container.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div class="prose dark:prose-invert max-w-none">
        ${formattedMessage}
      </div>
    </div>
  `;

  messageDiv.appendChild(container);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator bot-message';
  indicator.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(indicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return indicator;
}

// Gemini API Integration
const GEMINI_API_KEY = 'AIzaSyBaaL2F67ja7mUsT7G7RITalKgkTZfW9T8'; // Replace with your actual API key
const GNEWS_API_KEY = 'AIzaSyBaaL2F67ja7mUsT7G7RITalKgkTZfW9T8'; // Replace with your actual API key

async function getGeminiResponse(prompt) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an AI Business Research Assistant. Please analyze the following business query and provide comprehensive insights: "${prompt}"

            Structure your response with these sections:
            1. Executive Summary
               - Key findings
               - Main implications
               - Quick recommendations

            2. Market Analysis
               - Current market size
               - Growth trends
               - Market segmentation
               - Key market drivers

            3. Competitive Landscape
               - Major competitors
               - Market share analysis
               - Competitive advantages
               - Industry positioning

            4. Opportunities & Challenges
               - Growth opportunities
               - Potential risks
               - Market barriers
               - Regulatory considerations

            5. Strategic Recommendations
               - Actionable insights
               - Implementation steps
               - Success metrics
               - Timeline considerations

            Format your response with:
            - Clear section headings
            - Bullet points for key information
            - Bold text for important metrics and statistics
            - Concise, professional language
            - Data-driven insights where possible
            - Practical recommendations

            Focus on providing actionable business intelligence that can help with decision-making.`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error:', error);
    return `I apologize, but I encountered an error while processing your request. Please try again later. Error details: ${error.message}`;
  }
}

// News API Integration
async function fetchNews(query) {
  try {
    const response = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&token=${GNEWS_API_KEY}&lang=en&max=6`);
    const data = await response.json();
    return data.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

function displayNews(articles) {
  const newsCards = document.getElementById('newsCards');
  newsCards.innerHTML = '';

  articles.forEach(article => {
    const card = document.createElement('div');
    card.className = 'news-card bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden';
    card.innerHTML = `
            <img src="${article.image || 'https://via.placeholder.com/300x200'}" alt="${article.title}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${article.title}</h3>
                <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">${article.description}</p>
                <a href="${article.url}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline text-sm">Read more →</a>
            </div>
        `;
    newsCards.appendChild(card);
  });
}

// Form submission
queryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = userInput.value.trim();
  if (!query) return;

  // Add user message
  addUserMessage(query);
  userInput.value = '';

  // Show typing indicator
  const typingIndicator = showTypingIndicator();

  // Get AI response
  const response = await getGeminiResponse(query);
  typingIndicator.remove();
  addBotMessage(response);

  // Fetch and display related news
  const news = await fetchNews(query);
  displayNews(news);
}); 