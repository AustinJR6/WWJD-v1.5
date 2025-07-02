# WWJD

WWJD is a React Native app that simulates a Christ-like chatbot experience. The app uses OpenAI's API to generate responses in the tone and style of Jesus. Free users will see ads, while WWJD+ subscribers get an ad-free experience through RevenueCat.

## Development

1. Install dependencies with `npm install`.
2. Create a `.env` file (already included) with your OpenAI and RevenueCat keys.
3. Run the app with `npm start`.

## File Structure

- `App.tsx` – sets up navigation and wraps the app with the Ads and RevenueCat providers.
- `components/` – UI pieces like chat bubbles and the input bar.
- `screens/ChatScreen.tsx` – single chat interface using OpenAI.
- `utils/` – API wrapper, providers, and token tracking helper.
- `prompts/JesusPrompt.ts` – the system prompt used for Christ-like responses.

Enjoy a gentle conversation inspired by the teachings of Jesus.
