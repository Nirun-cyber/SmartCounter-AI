import { useState, useEffect, useRef, useCallback } from 'react';

// SpeechRecognition type declarations for browser support
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Optimized for Indian English accents

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentInterim = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              currentInterim += result[0].transcript;
            }
          }

          if (finalTranscript) {
            setTranscript((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
            setInterimTranscript('');
          } else {
            setInterimTranscript(currentInterim);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'no-speech') {
            setError('No speech detected. Please speak clearly into the microphone.');
          } else if (event.error === 'not-allowed') {
            setError('Microphone permission was denied. Please allow microphone access.');
          } else {
            setError(`Speech recognition error: ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e: any) {
        console.warn('Failed to initialize SpeechRecognition:', e);
        setIsSupported(false);
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Voice input is not supported in this browser. You can type the order instead.');
      return;
    }
    setError(null);
    setInterimTranscript('');
    try {
      recognitionRef.current.start();
    } catch {
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current?.start(), 150);
      } catch (err: any) {
        setError('Could not start microphone.');
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    setTranscript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
