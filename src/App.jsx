// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  Users,
  Twitter,
} from "lucide-react";
import unionLogo from "./assets/union.png";
import { characterStyles } from "./characterStyles";
import { promptLibrary } from "./promptLibrary";

export default function App() {
  const [jargonTerms, setJargonTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState("Wojak");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setJargonTerms(Object.keys(promptLibrary));
  }, []);

  const generateVisual = async (term, character) => {
    if (!term || !character) return;
    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);

    const style = characterStyles[character] || "";
    const prompts = promptLibrary[term.toLowerCase()];
    if (!prompts?.length) {
      setError(`No scenarios found for "${term}".`);
      setIsLoading(false);
      return;
    }
    const story = prompts[Math.floor(Math.random() * prompts.length)];
    const finalPrompt = `
      CRITICAL INSTRUCTION: purely visual, no text.
      Scene: ${story}.
      Style: ${style}.
    `;
    try {
      const payload = {
        instances: [{ prompt: finalPrompt }],
        parameters: { sampleCount: 1 },
      };
      const apiKey = import.meta.env.VITE_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const b64 = json.predictions?.[0]?.bytesBase64Encoded;
      if (!b64) throw new Error("No image data");
      setGeneratedImage(`data:image/png;base64,${b64}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTermSelection = (term) => {
    setSelectedTerm(term);
    generateVisual(term, selectedCharacter);
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col">
      {/* HEADER */}
      <header className="py-6 px-8 text-center">
        <h1 className="text-4xl font-extrabold text-purple-400">
          Kohen Crypto Jargon Meme Generator
        </h1>
        <p className="mt-2 text-gray-300">
          Pick a term, choose a character or style, and let the AI illustrate
          it!
        </p>
        <div className="mt-2 inline-flex items-center gap-2 text-gray-400">
          <span>Powered by Union Labs</span>
          <img src={unionLogo} alt="Union Labs Logo" className="h-6" />
        </div>
      </header>

      {/* MAIN */}
      <main className="flex flex-1 overflow-hidden">
        {/* ASIDE */}
        <aside className="w-1/3 bg-gray-800 p-6 overflow-auto">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-200">
            <BookOpen /> 1. Pick a Crypto Term
          </h2>
          <div className="mt-4 space-y-3">
            {jargonTerms.map((term, i) => (
              <button
                key={i}
                onClick={() => handleTermSelection(term)}
                className={`w-full p-2 text-left rounded border ${
                  selectedTerm === term
                    ? "bg-purple-600 border-purple-400"
                    : "bg-gray-700 border-gray-600 hover:bg-gray-700"
                }`}
              >
                {term.toUpperCase()}
              </button>
            ))}
          </div>

          {selectedTerm && (
            <>
              <div className="mt-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-200">
                  <Users /> 2. Choose a Character/Style
                </h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {Object.keys(characterStyles).map((charName) => (
                    <button
                      key={charName}
                      onClick={() => {
                        setSelectedCharacter(charName);
                        generateVisual(selectedTerm, charName);
                      }}
                      className={`px-4 py-2 rounded-full border ${
                        selectedCharacter === charName
                          ? "bg-teal-500 border-teal-400"
                          : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                      }`}
                    >
                      {charName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Twitter */}
              <div className="mt-6 flex items-center gap-6 text-teal-400">
                <Twitter className="w-5 h-5" />
                <a
                  href="https://x.com/union_build"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @union_build
                </a>
                <Twitter className="w-5 h-5" />
                <a
                  href="https://x.com/KohenEric"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @KohenEric
                </a>
              </div>

              {/* REGENERATE */}
              <button
                onClick={() => generateVisual(selectedTerm, selectedCharacter)}
                className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded flex items-center justify-center gap-2"
              >
                <RefreshCw /> Regenerate
              </button>
            </>
          )}
        </aside>

        {/* VISUAL */}
        <section className="flex-1 p-6 overflow-auto">
          <div className="h-full bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-2xl flex items-center justify-center">
            {isLoading ? (
              <div className="text-center">
                <Loader2 className="animate-spin text-purple-400 w-16 h-16" />
                <p className="mt-4 text-gray-300">Visualizing...</p>
              </div>
            ) : generatedImage ? (
              <img
                src={generatedImage}
                alt="Generated visual"
                className="max-w-full max-h-full rounded-lg shadow-2xl mx-auto"
              />
            ) : (
              <div className="text-center text-gray-500">
                <ImageIcon className="w-16 h-16 mx-auto" />
                <p className="mt-2">1. Pick a crypto term.</p>
                <p>2. Choose a character or style.</p>
              </div>
            )}
          </div>
          {error && (
            <div className="mt-4 text-red-400 text-center">
              <AlertTriangle /> {error}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
