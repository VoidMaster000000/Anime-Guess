'use client';

import { useState } from 'react';
import {
  CharacterImage,
  GuessInput,
  GameStats,
  HintButton,
  GameOver,
  DifficultySelect,
} from '@/components/game';
import { GameDifficulty } from '@/types';

export default function DemoPage() {
  const [revealedQuadrants, setRevealedQuadrants] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(5);
  const [points, setPoints] = useState(250);
  const [showGameOver, setShowGameOver] = useState(false);

  const handleRevealHint = () => {
    if (revealedQuadrants < 4) {
      setRevealedQuadrants((prev) => prev + 1);
    }
  };

  const handleGuess = (guess: string) => {
    console.log('Guess submitted:', guess);
  };

  const handleDifficultySelect = (difficulty: GameDifficulty) => {
    console.log('Difficulty selected:', difficulty);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      {/* Stats Bar */}
      <GameStats
        lives={lives}
        maxLives={5}
        streak={streak}
        points={points}
        highStreak={12}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 space-y-8 sm:space-y-10 md:space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Game Components Demo
          </h1>
          <p className="text-gray-400">Interactive showcase of all game components</p>
        </div>

        {/* Character Image Section */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Character Image</h2>
          <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6">
            <CharacterImage
              imageUrl="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop"
              revealedQuadrants={revealedQuadrants}
            />
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={() => setRevealedQuadrants(Math.max(0, revealedQuadrants - 1))}
                className="px-4 sm:px-5 md:px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-sm sm:text-base"
              >
                Hide Quadrant
              </button>
              <button
                onClick={() => setRevealedQuadrants(Math.min(4, revealedQuadrants + 1))}
                className="px-4 sm:px-5 md:px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-sm sm:text-base"
              >
                Reveal Quadrant
              </button>
              <button
                onClick={() => setRevealedQuadrants(0)}
                className="px-4 sm:px-5 md:px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold text-sm sm:text-base"
              >
                Reset
              </button>
            </div>
            <p className="text-gray-400">Revealed: {revealedQuadrants} / 4</p>
          </div>
        </section>

        {/* Guess Input Section */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Guess Input</h2>
          <div className="flex justify-center">
            <GuessInput onGuess={handleGuess} disabled={false} />
          </div>
        </section>

        {/* Hint Button Section */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Hint Button</h2>
          <div className="flex justify-center">
            <HintButton
              hintsRevealed={revealedQuadrants}
              maxHints={4}
              onReveal={handleRevealHint}
              cost={50}
            />
          </div>
        </section>

        {/* Stats Controls */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Stats Controls</h2>
          <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center flex-wrap">
            <button
              onClick={() => setLives(Math.max(0, lives - 1))}
              className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm sm:text-base"
            >
              Lose Life
            </button>
            <button
              onClick={() => setLives(Math.min(5, lives + 1))}
              className="px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm sm:text-base"
            >
              Gain Life
            </button>
            <button
              onClick={() => setStreak((prev) => prev + 1)}
              className="px-3 sm:px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm sm:text-base"
            >
              Increase Streak
            </button>
            <button
              onClick={() => setPoints((prev) => prev + 100)}
              className="px-3 sm:px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm sm:text-base"
            >
              Add Points
            </button>
            <button
              onClick={() => setShowGameOver(true)}
              className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm sm:text-base"
            >
              Show Game Over
            </button>
          </div>
        </section>

        {/* Difficulty Select */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-center">Difficulty Selection</h2>
          <DifficultySelect onSelect={handleDifficultySelect} />
        </section>
      </div>

      {/* Game Over Modal */}
      <GameOver
        isOpen={showGameOver}
        finalStreak={streak}
        finalPoints={points}
        highStreak={12}
        onSaveScore={(username) => {
          console.log('Save score for:', username);
          setShowGameOver(false);
        }}
        onPlayAgain={() => {
          console.log('Play again clicked');
          setShowGameOver(false);
          setLives(3);
          setStreak(0);
          setPoints(0);
          setRevealedQuadrants(0);
        }}
        onClose={() => setShowGameOver(false)}
      />
    </div>
  );
}
