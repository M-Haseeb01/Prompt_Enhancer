import { useState } from 'react';
import './App.css';

const MAX_LENGTH = 6000;

function App() {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const trimmedLength = prompt.trim().length;
  const canSubmit = trimmedLength > 0 && trimmedLength <= MAX_LENGTH && !isLoading;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canSubmit) return;

    setIsLoading(true);
    setError('');
    setEnhancedPrompt('');
    setCopied(false);

    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setEnhancedPrompt(data.enhancedPrompt);
    } catch (err) {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!enhancedPrompt) return;

    try {
      await navigator.clipboard.writeText(enhancedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      setError('Could not copy to clipboard.');
    }
  }

  function handleUseAsInput() {
    if (!enhancedPrompt) return;
    setPrompt(enhancedPrompt);
    setEnhancedPrompt('');
    setCopied(false);
  }

  return (
    <div className="page">
      <main className="container">
        <header className="header">
          <span className="eyebrow">PROMPT ENHANCER · GROQ</span>
          <h1 className="headline">Turn a rough idea into a precise prompt.</h1>
          <p className="subtext">
            Write your prompt the way it first comes to mind. The enhancer restructures it for
            clarity, context, and intent, so the model you send it to has less to guess at.
          </p>
        </header>

        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-head">
            <label className="panel-label" htmlFor="prompt-input">
              Your prompt
            </label>
            <span className={`char-count ${trimmedLength > MAX_LENGTH ? 'char-count--over' : ''}`}>
              {trimmedLength} / {MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="prompt-input"
            className="input"
            placeholder="e.g. write a landing page headline for a coffee subscription"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={7}
          />
          <div className="panel-actions">
            <button type="submit" className="button" disabled={!canSubmit}>
              {isLoading ? 'Enhancing…' : 'Enhance prompt'}
            </button>
          </div>
        </form>

        {error && (
          <div className="banner banner--error" role="alert">
            {error}
          </div>
        )}

        {enhancedPrompt && (
          <section className="panel panel--output">
            <div className="panel-head">
              <span className="panel-label panel-label--accent">Enhanced</span>
              <div className="output-actions">
                <button type="button" className="button button--ghost" onClick={handleUseAsInput}>
                  Use as new input
                </button>
                <button type="button" className="button button--secondary" onClick={handleCopy}>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <p className="output-text">{enhancedPrompt}</p>
          </section>
        )}
      </main>

      <footer className="footer">
        <span>Powered by Groq</span>
      </footer>
    </div>
  );
}

export default App;
