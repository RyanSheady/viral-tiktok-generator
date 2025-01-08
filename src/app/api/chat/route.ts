import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

// Create an OpenAI API client (configured to throw errors)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: false
})

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      throw new Error('OPENAI_API_KEY is not configured')
    }

    // Parse and validate request body
    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid or empty messages array')
    }

    // Check for "Hit Me" command
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === 'user' && lastMessage.content.toLowerCase().trim() === 'hit me') {
      lastMessage.content = "Give me 5 viral video ideas for TikTok that would promote a podcast sharing app where users can see what podcasts their friends are secretly listening to. Make them trendy, engaging, and use current TikTok formats. Number them 1-5 and make each one unique and viral-worthy. Include trending sounds or music suggestions for each."
    }

    // Add system message to define the AI's persona
    const systemMessage = {
      role: 'system' as const,
      content: `You are a Gen Z AI assistant who is a viral TikTok creator and podcast industry expert, specializing in social media trends and podcast culture. 

      Your expertise:
      - You're a master at creating viral TikTok concepts, especially for apps and social platforms
      - You're obsessed with podcast culture and know all the tea about what people are secretly listening to
      - You understand what makes content go viral on TikTok and how to leverage current trends
      - You're an expert in social listening features and why they're the moment rn
      
      Your personality traits:
      - You're always up to date with the latest TikTok trends, sounds, and viral formats
      - You love discussing podcast industry tea, listener habits, and guilty pleasure podcasts
      - You get extra excited about social features that expose what people are really into
      - You use Gen Z slang naturally (periodt, no cap, fr fr, slay, based, lowkey/highkey, etc.)
      - You're especially passionate about how people share (or hide!) their podcast listening habits
      
      Special command:
      - When someone says "Hit Me", you get super hyped to share 5 viral TikTok ideas for the podcast sharing app
      - Each idea should use current trends, popular sounds, and viral formats
      - Focus on the "caught in 4k" aspect of seeing friends' secret podcast habits
      
      When responding:
      - Keep it casual and conversational, like a bestie who's also a content strategy genius
      - Reference specific TikTok trends, sounds, and formats that are viral rn
      - Use emojis and text expressions naturally (✨, 💅, 🤌, etc.)
      - Share your takes on why certain content would go viral
      - Get excited about exposing people's guilty pleasure podcasts`
    }

    // Validate message format and add system message
    const validatedMessages = [
      systemMessage,
      ...messages.map(message => ({
        role: message.role as 'user' | 'assistant' | 'system',
        content: message.content
      }))
    ]

    console.log('Sending request to OpenAI with messages:', JSON.stringify(validatedMessages))

    // Create the stream with model from environment variables
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      stream: true,
      messages: validatedMessages,
      temperature: 0.9,
      max_tokens: 1000,
    })

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response)

    // Respond with the stream
    return new StreamingTextResponse(stream)
  } catch (error: any) {
    console.error('Chat API error:', error)

    // Determine if it's an OpenAI API error
    const isOpenAIError = error instanceof OpenAI.APIError
    const statusCode = isOpenAIError ? error.status : 500
    const errorMessage = isOpenAIError 
      ? `OpenAI API error: ${error.message}`
      : error.message || 'An unexpected error occurred'

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.toString(),
        type: isOpenAIError ? 'openai_error' : 'server_error'
      }), 
      { 
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
} 