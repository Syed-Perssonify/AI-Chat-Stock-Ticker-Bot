# AI Chat Studio - Next.js + TypeScript

A modern, feature-rich AI chat interface built with Next.js 16, TypeScript, and Tailwind CSS. This project was professionally converted from a Vite.js application to Next.js with full TypeScript support.

## Features

- 🚀 **Next.js 16** with App Router
- 💎 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- 🌓 **Dark Mode** support with next-themes
- 💬 **Real-time Chat Interface** with streaming responses
- 📝 **Markdown Support** with syntax highlighting
- 💾 **Chat History** with local storage persistence
- ⚙️ **Customizable Settings** (temperature, top-p, max tokens, etc.)
- 📱 **Responsive Design** for mobile and desktop
- 🎯 **shadcn/ui Components** for beautiful UI

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: React Query
- **Icons**: Lucide React
- **Markdown**: react-markdown with remark-gfm
- **Code Highlighting**: react-syntax-highlighter

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd chat-bot-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── providers.tsx      # Client-side providers
│   └── globals.css        # Global styles
├── components/
│   ├── chat/              # Chat-related components
│   │   ├── ChatInterface.tsx
│   │   ├── ChatHistory.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── MessageList.tsx
│   │   ├── SettingsPanel.tsx
│   │   └── FileUpload.tsx
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
│   ├── useChat.ts
│   ├── useChatHistory.ts
│   ├── useLocalStorage.ts
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   └── utils.ts           # Utility functions
└── types/
    └── chat.ts            # TypeScript type definitions
```

## Features in Detail

### Chat Interface
- Real-time message streaming simulation
- Support for user and assistant messages
- Message regeneration
- Copy message content
- Markdown rendering with code syntax highlighting

### Chat History
- Multiple chat sessions
- Automatic title generation
- Search through chat history
- Delete individual chats
- Persistent storage using localStorage

### Settings Panel
- Model selection (GPT-4, GPT-3.5, Claude)
- Temperature control
- Top-P (nucleus sampling)
- Max tokens
- Frequency and presence penalties
- Preset configurations (Precise, Balanced, Creative)

### Responsive Design
- Mobile-optimized interface
- Collapsible sidebars
- Touch-friendly controls
- Adaptive layouts

## Customization

### Adding New Models

Edit `src/types/chat.ts`:

```typescript
export const MODELS = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'your-model', label: 'Your Model' },
] as const;
```

### Modifying Theme Colors

Edit `src/app/globals.css` to customize the color scheme:

```css
:root {
  --primary: 174 85% 41%;
  --secondary: 200 77% 25%;
  /* ... other colors */
}
```

## Building for Production

```bash
npm run build
npm run start
```

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Other Platforms

This Next.js app can be deployed to any platform that supports Node.js:
- Netlify
- AWS Amplify
- Digital Ocean
- Railway
- Render

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Converted from Vite.js to Next.js with professional TypeScript architecture

---

**Note**: This is a demo application with simulated AI responses. To connect to a real AI API (OpenAI, Anthropic, etc.), you'll need to implement the API integration in `src/hooks/useChat.ts`.
