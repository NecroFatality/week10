import { getReviewsByGameId } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
import { getFirestore } from "firebase/firestore";

export async function GeminiSummary({ gameId }) {
  try {
    const { firebaseServerApp } = await getAuthenticatedAppForUser();
    const reviews = await getReviewsByGameId(
      getFirestore(firebaseServerApp),
      gameId
    );

    // If no reviews yet, show a message
    if (!reviews || reviews.length === 0) {
      return (
        <div className="restaurant__review_summary">
          <p>No reviews yet - be the first to review this game!</p>
        </div>
      );
    }

    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      return (
        <div className="restaurant__review_summary">
          <p>📊 {reviews.length} review{reviews.length !== 1 ? 's' : ''} for this game</p>
        </div>
      );
    }

    // Dynamic import to avoid issues if genkit isn't configured
    const { gemini20Flash, googleAI } = await import("@genkit-ai/googleai");
    const { genkit } = await import("genkit");

    const reviewSeparator = "@";
    const prompt = `
      Based on the following video game reviews, 
      where each review is separated by a '${reviewSeparator}' character, 
      create a one-sentence summary of what players think of the game. 

      Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
    `;

    const ai = genkit({
      plugins: [googleAI()],
      model: gemini20Flash,
    });
    const { text } = await ai.generate(prompt);

    return (
      <div className="restaurant__review_summary">
        <p>{text}</p>
        <p>✨ Summarized with Gemini</p>
      </div>
    );
  } catch (e) {
    console.error("GeminiSummary error:", e);
    return (
      <div className="restaurant__review_summary">
        <p>Review summary unavailable</p>
      </div>
    );
  }
}

export function GeminiSummarySkeleton() {
  return (
    <div className="restaurant__review_summary">
      <p>✨ Loading summary...</p>
    </div>
  );
}
