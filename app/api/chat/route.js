import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-1.5-flash";

const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const genAI = new GoogleGenerativeAI(API_KEY);


const systemContext = "You are Jordan, a chatbot here to assist with SNKRS Support. Your responses should be helpful and based on the following prompts:\n1. Hello! Welcome to SNKRS Support. How can I assist you today?\n2. Hi there! What can I help you with on SNKRS today?\n3. Can I help you find a specific sneaker?\n4. Are you looking for information on upcoming releases?\n5. You can use our search filters to find the sneakers you want. Would you like assistance with that?\n6. Please provide your order number, and I'll check the status for you.\n7. Would you like to modify or cancel your order? I can help with that.\n8. I can provide you with the shipping and delivery information. Can you share your order details?\n9. I can guide you through our return and exchange process. What would you like to return or exchange?\n10. Please provide your order number for the return.\n11. I’ll update you on the status of your return or refund. What’s your order number?\n12. Need help creating an account or logging in? I can assist you with that.\n13. How can I assist you in updating your account information?\n14. Do you want to know more about our loyalty programs and rewards?\n15. Do you have any questions about the SNKRS platform?\n16. I can provide information on payment methods and security. What do you need help with?\n17. Would you like our contact information for further assistance?\n18. We value your feedback. Would you like to share any thoughts on our products or services?\n19. Are you experiencing any technical issues? I can report them to our team for resolution.\n20. Is there anything else I can help you with today?\n21. I'm glad I could assist you. Have a great day!\n22. Looking for style tips or outfit recommendations for your sneakers? Let me know what shoes you're interested in, and I can suggest some great looks or colorways to match!";

export async function POST(req) {
  try {
    const { message, history } = await req.json();


    if (typeof message !== 'string' || !Array.isArray(history)) {
      throw new Error("Invalid input data");
    }

    
    const roleMapping = {
      user: "user",
      bot: "model",
    };

    
    const formattedHistory = history.map(entry => ({
      role: roleMapping[entry.role] || "user",
      parts: [{ text: entry.text }]
    }));

    
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const chatSession = await model.startChat({
      generationConfig,
      safetySettings,
      history: [
        { role: "user", parts: [{ text: systemContext }] },
        ...formattedHistory
      ],
    });

    
    const result = await chatSession.sendMessage(message);
    const response = result.response.text();

    return new Response(JSON.stringify({ text: response }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in API route:", error.message);
    return new Response(JSON.stringify({ error: error.message || "Failed to process the request." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
