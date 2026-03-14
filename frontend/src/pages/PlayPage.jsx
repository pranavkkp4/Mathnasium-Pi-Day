import React, { useEffect, useMemo, useRef, useState } from 'react';
import { checkAttempt, submitScore } from '../services.js';

const PI_DIGITS = '1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679';

function generateFactsQuestion() {
  const modes = ['+', '-', '×', '÷'];
  const mode = modes[Math.floor(Math.random() * modes.length)];
  let a;
  let b;
  let answer;

  if (mode === '+') {
    a = 1 + Math.floor(Math.random() * 15);
    b = 1 + Math.floor(Math.random() * 15);
    answer = a + b;
  } else if (mode === '-') {
    a = 1 + Math.floor(Math.random() * 15);
    b = 1 + Math.floor(Math.random() * 15);
    if (b > a) [a, b] = [b, a];
    answer = a - b;
  } else if (mode === '×') {
    a = 1 + Math.floor(Math.random() * 15);
    b = 1 + Math.floor(Math.random() * 15);
    answer = a * b;
  } else {
    b = 1 + Math.floor(Math.random() * 15);
    answer = 1 + Math.floor(Math.random() * 15);
    a = b * answer;
  }

  return {
    prompt: `${a} ${mode} ${b}`,
    answer
  };
}

export default function PlayPage() {
  const [mode, setMode] = useState('facts');

  // shared
  const [playerName, setPlayerName] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  // facts mode
  const [factsRunning, setFactsRunning] = useState(false);
  const [factsTime, setFactsTime] = useState(60);
  const [factsScore, setFactsScore] = useState(0);
  const [factsAnswer, setFactsAnswer] = useState('');
  const [factsQuestion, setFactsQuestion] = useState(generateFactsQuestion());

  // pi mode
  const [piRunning, setPiRunning] = useState(false);
  const [piInput, setPiInput] = useState('');
  const [piScore, setPiScore] = useState(0);
  const [piEnded, setPiEnded] = useState(false);

  const piInputRef = useRef(null);
  const factsInputRef = useRef(null);
  const piRunningRef = useRef(false);
  const piScoreRef = useRef(0);
  const piInputValueRef = useRef('');

  const normalizedName = playerName.trim();

  useEffect(() => {
    piRunningRef.current = piRunning;
  }, [piRunning]);

  useEffect(() => {
    piScoreRef.current = piScore;
  }, [piScore]);

  useEffect(() => {
    piInputValueRef.current = piInput;
  }, [piInput]);

  useEffect(() => {
    if (!factsRunning) return;
    if (factsTime <= 0) {
      endFactsGame();
      return;
    }
    const id = window.setTimeout(() => setFactsTime((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [factsRunning, factsTime]);

  useEffect(() => {
    if (mode === 'pi' && piRunning) {
      piInputRef.current?.focus();
    }
    if (mode === 'facts' && factsRunning) {
      factsInputRef.current?.focus();
    }
  }, [mode, piRunning, factsRunning]);

  useEffect(() => {
    if (!piRunning) return;

    function handleWindowBlur() {
      endPiGame('Turn ended because the window lost focus.');
    }

    function handleVisibility() {
      if (document.hidden) {
        endPiGame('Turn ended because the page was hidden.');
      }
    }

    function handlePointerDown(event) {
      if (!piInputRef.current) return;
      if (event.target !== piInputRef.current) {
        endPiGame('Turn ended because you clicked away from the pi input.');
      }
    }

    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('touchstart', handlePointerDown, true);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('mousedown', handlePointerDown, true);
      document.removeEventListener('touchstart', handlePointerDown, true);
    };
  }, [piRunning]);

  async function ensureAttemptAvailable(gameType) {
    if (!normalizedName) {
      setStatus('Enter a name first.');
      return false;
    }
    setBusy(true);
    setStatus('');
    try {
      const result = await checkAttempt(normalizedName, gameType);
      if (result.exists) {
        setStatus(`"${normalizedName}" has already used the ${gameType === 'facts' ? 'Math Facts Sprint' : 'Pi Memory Mode'} attempt.`);
        return false;
      }
      return true;
    } catch (error) {
      setStatus(error.message || 'Could not check attempts.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function startFactsGame() {
    const ok = await ensureAttemptAvailable('facts');
    if (!ok) return;

    setStatus('');
    setFactsScore(0);
    setFactsTime(60);
    setFactsAnswer('');
    setFactsQuestion(generateFactsQuestion());
    setFactsRunning(true);
  }

  async function endFactsGame() {
    setFactsRunning(false);
    setBusy(true);
    try {
      await submitScore({
        name: normalizedName,
        gameType: 'facts',
        score: factsScore
      });
      setStatus(`Math Facts Sprint submitted: ${factsScore} correct.`);
    } catch (error) {
      setStatus(error.message || 'Could not submit score.');
    } finally {
      setBusy(false);
    }
  }

  function handleFactsSubmit(event) {
    event.preventDefault();
    if (!factsRunning) return;
    const numeric = Number(factsAnswer);
    if (numeric === factsQuestion.answer) {
      setFactsScore((value) => value + 1);
    }
    setFactsAnswer('');
    setFactsQuestion(generateFactsQuestion());
    factsInputRef.current?.focus();
  }

  async function startPiGame() {
    const ok = await ensureAttemptAvailable('pi');
    if (!ok) return;

    setPiInput('');
    setPiScore(0);
    setPiEnded(false);
    piScoreRef.current = 0;
    piInputValueRef.current = '';
    setStatus('Pi Memory Mode started. If you click anywhere else, the turn ends.');
    setPiRunning(true);
    window.setTimeout(() => piInputRef.current?.focus(), 30);
  }

  async function endPiGame(customMessage, finalScore = piScoreRef.current, finalInput = piInputValueRef.current) {
    if (!piRunningRef.current) return;
    piRunningRef.current = false;
    setPiRunning(false);
    setPiEnded(true);
    setBusy(true);
    try {
      await submitScore({
        name: normalizedName,
        gameType: 'pi',
        score: finalScore,
        detail: finalInput
      });
      setStatus(customMessage || `Pi Memory Mode submitted: ${finalScore} digits correct.`);
    } catch (error) {
      setStatus(error.message || 'Could not submit score.');
    } finally {
      setBusy(false);
    }
  }

  function handlePiChange(event) {
    const nextValue = event.target.value.replace(/\D/g, '');
    let matched = 0;
    while (matched < nextValue.length && nextValue[matched] === PI_DIGITS[matched]) {
      matched += 1;
    }

    if (matched < nextValue.length) {
      const safeDigits = nextValue.slice(0, matched);
      setPiInput(safeDigits);
      setPiScore(matched);
      piScoreRef.current = matched;
      piInputValueRef.current = safeDigits;
      endPiGame(`Pi Memory Mode ended on a wrong digit. Final score: ${matched}.`, matched, safeDigits);
      return;
    }

    setPiInput(nextValue);
    setPiScore(nextValue.length);
    piScoreRef.current = nextValue.length;
    piInputValueRef.current = nextValue;

    if (nextValue.length >= PI_DIGITS.length) {
      endPiGame(`Amazing run — you reached the stored digit limit with ${nextValue.length} correct digits.`, nextValue.length, nextValue);
    }
  }

  const modeLabel = useMemo(
    () => (mode === 'facts' ? 'Math Facts Sprint' : 'Pi Memory Mode'),
    [mode]
  );

  const modeLocked = factsRunning || piRunning;

  return (
    <section className="stack-lg">
      <div className="glass page-hero">
        <p className="eyebrow">Play</p>
        <h1>Choose a mode and make your one official attempt count.</h1>
        <p className="lead">
          Every player name can submit one official score in each game mode.
          Enter the name exactly the way you want it to appear on the leaderboard.
        </p>
      </div>

      <div className="mode-switch">
        <button
          className={`mode-pill ${mode === 'facts' ? 'active' : ''}`}
          onClick={() => setMode('facts')}
          disabled={modeLocked}
        >
          Math Facts Sprint
        </button>
        <button
          className={`mode-pill ${mode === 'pi' ? 'active' : ''}`}
          onClick={() => setMode('pi')}
          disabled={modeLocked}
        >
          Pi Memory Mode
        </button>
      </div>

      <div className="glass game-panel">
        <div className="field-group">
          <label htmlFor="playerName">Player name</label>
          <input
            id="playerName"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Enter name for leaderboard"
            disabled={modeLocked}
          />
        </div>

        <div className="status-line">
          <strong>Selected mode:</strong> {modeLabel}
        </div>

        {status ? <p className="status-message">{status}</p> : null}

        {mode === 'facts' ? (
          <div className="stack-md">
            <div className="info-band compact">
              <p><strong>Rules:</strong> one minute, numbers from 1–15, division always makes a whole number.</p>
            </div>

            {!factsRunning ? (
              <button className="button primary" onClick={startFactsGame} disabled={busy || !normalizedName}>
                Start Math Facts Sprint
              </button>
            ) : (
              <div className="stack-md">
                <div className="score-strip">
                  <div className="score-chip">Time left: {factsTime}s</div>
                  <div className="score-chip">Score: {factsScore}</div>
                </div>

                <div className="glass prompt-box">
                  <p className="eyebrow">Solve</p>
                  <h2>{factsQuestion.prompt}</h2>
                </div>

                <form className="answer-row" onSubmit={handleFactsSubmit}>
                  <input
                    ref={factsInputRef}
                    type="number"
                    inputMode="numeric"
                    value={factsAnswer}
                    onChange={(event) => setFactsAnswer(event.target.value)}
                    placeholder="Answer"
                    autoFocus
                  />
                  <button className="button primary" type="submit">
                    Submit
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="stack-md">
            <div className="info-band compact">
              <p>
                <strong>Rules:</strong> type digits after <code>3.</code> from memory. If you
                click elsewhere, switch tabs, or lose focus, the turn ends immediately.
              </p>
            </div>

            {!piRunning ? (
              <button className="button primary" onClick={startPiGame} disabled={busy || !normalizedName}>
                Start Pi Memory Mode
              </button>
            ) : (
              <div className="stack-md">
                <div className="score-strip">
                  <div className="score-chip">Correct digits: {piScore}</div>
                  <div className="score-chip">Prefix shown: 3.</div>
                </div>

                <div className="glass prompt-box">
                  <p className="eyebrow">Type from memory</p>
                  <h2>3.<span className="pi-entry">{piInput || '...'}</span></h2>
                </div>

                <input
                  ref={piInputRef}
                  className="pi-input"
                  value={piInput}
                  onChange={handlePiChange}
                  onBlur={() => endPiGame('Turn ended because the input lost focus.')}
                  placeholder="Type digits after 3."
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  inputMode="numeric"
                />
              </div>
            )}

            {piEnded && !piRunning ? (
              <p className="muted">Your Pi Memory Mode run has ended and cannot be replayed with the same name.</p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
