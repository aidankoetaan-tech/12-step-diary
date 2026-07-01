// Minimal type declaration for expo-speech-recognition.
// The actual package provides full types; this stub satisfies
// `tsc --noEmit` when the package is not yet installed.
declare module 'expo-speech-recognition' {
  export interface SpeechRecognitionOptions {
    locale?: string;
    interimResults?: boolean;
    maxAlternatives?: number;
  }

  export interface SpeechRecognitionResult {
    transcript: string;
    isFinal?: boolean;
  }

  export interface SpeechRecognitionEvent {
    result: SpeechRecognitionResult;
  }

  interface SpeechRecognitionStatic {
    startListening(options?: SpeechRecognitionOptions): void;
    stopListening(): void;
    isAvailable(): boolean;
    requestPermissions(): Promise<{ granted: boolean }>;
    setRecognitionListener?(handler: (event: SpeechRecognitionEvent) => void): void;
    addEventListener?(
      event: 'result' | 'error' | 'start' | 'end',
      handler: (payload: unknown) => void,
    ): void;
    removeEventListener?(
      event: 'result' | 'error' | 'start' | 'end',
      handler: (payload: unknown) => void,
    ): void;
  }

  const SpeechRecognition: SpeechRecognitionStatic;
  export default SpeechRecognition;
}