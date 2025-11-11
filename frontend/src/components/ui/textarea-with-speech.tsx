import * as React from "react";
import { Mic, MicOff } from "lucide-react";
import { Textarea, TextareaProps } from "./textarea";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";

export interface TextareaWithSpeechProps extends TextareaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTranscriptChange?: (transcript: string) => void;
  mode?: 'append' | 'replace';
  lang?: string;
}

const TextareaWithSpeech = React.forwardRef<
  HTMLTextAreaElement,
  TextareaWithSpeechProps
>(
  (
    {
      className,
      value = '',
      onChange,
      onTranscriptChange,
      mode = 'append',
      lang = 'en-US',
      ...props
    },
    ref
  ) => {
    const {
      transcript,
      isListening,
      isSupported,
      error,
      startListening,
      stopListening,
      resetTranscript,
    } = useSpeechRecognition({ lang, continuous: true, interimResults: true });

    const [hasStarted, setHasStarted] = React.useState(false);

    // Handle transcript changes
    React.useEffect(() => {
      if (transcript && hasStarted) {
        const newValue = mode === 'append'
          ? `${value}${value ? ' ' : ''}${transcript}`.trim()
          : transcript;

        // Create synthetic event to maintain compatibility with existing onChange handlers
        if (onChange) {
          const syntheticEvent = {
            target: { value: newValue },
            currentTarget: { value: newValue },
          } as React.ChangeEvent<HTMLTextAreaElement>;
          onChange(syntheticEvent);
        }

        if (onTranscriptChange) {
          onTranscriptChange(newValue);
        }
      }
    }, [transcript, mode, value, onChange, onTranscriptChange, hasStarted]);

    const handleMicClick = () => {
      if (isListening) {
        stopListening();
        resetTranscript();
        setHasStarted(false);
      } else {
        resetTranscript();
        setHasStarted(true);
        startListening();
      }
    };

    const getTooltipContent = () => {
      if (!isSupported) {
        return "Speech recognition not supported in this browser";
      }
      if (error) {
        return error;
      }
      if (isListening) {
        return "Listening... Click to stop";
      }
      return "Click to speak";
    };

    return (
      <div className="relative">
        <Textarea
          ref={ref}
          className={cn("pr-12", className)}
          value={value}
          onChange={onChange}
          {...props}
        />

        {isSupported && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant={isListening ? "default" : "ghost"}
                  className={cn(
                    "absolute top-2 right-2 h-8 w-8 rounded-full transition-all",
                    isListening && "bg-red-500 hover:bg-red-600 animate-pulse",
                    error && "text-red-500"
                  )}
                  onClick={handleMicClick}
                  disabled={!isSupported}
                >
                  {isListening ? (
                    <Mic className="h-4 w-4 text-white" />
                  ) : (
                    <Mic className={cn("h-4 w-4", error && "text-red-500")} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">{getTooltipContent()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

TextareaWithSpeech.displayName = "TextareaWithSpeech";

export { TextareaWithSpeech };
