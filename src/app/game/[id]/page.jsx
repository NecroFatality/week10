import Game from "@/src/components/Game.jsx";
import { Suspense } from "react";
import { getGameById } from "@/src/lib/firebase/firestore.js";
import {
  getAuthenticatedAppForUser,
  getAuthenticatedAppForUser as getUser,
} from "@/src/lib/firebase/serverApp.js";
import ReviewsList, {
  ReviewsListSkeleton,
} from "@/src/components/Reviews/ReviewsList";
import {
  GeminiSummary,
  GeminiSummarySkeleton,
} from "@/src/components/Reviews/ReviewSummary";
import { getFirestore } from "firebase/firestore";

export default async function Home(props) {
  const params = await props.params;
  const { currentUser } = await getUser();
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const game = await getGameById(
    getFirestore(firebaseServerApp),
    params.id
  );

  return (
    <main className="main__restaurant">
      <Game
        id={params.id}
        initialGame={game}
        initialUserId={currentUser?.uid || ""}
      >
        <Suspense fallback={<GeminiSummarySkeleton />}>
          <GeminiSummary gameId={params.id} />
        </Suspense>
      </Game>
      <Suspense
        fallback={<ReviewsListSkeleton numReviews={game.numRatings} />}
      >
        <ReviewsList gameId={params.id} userId={currentUser?.uid || ""} />
      </Suspense>
    </main>
  );
}
