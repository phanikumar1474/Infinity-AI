export class SpeechService {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isRecording = false;
        
        this.initRecognition();
    }

    initRecognition() {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
        } else {
            console.warn('Speech Recognition API not supported in this browser.');
        }
    }

    startRecording(onResult, onEnd, onError) {
        if (!this.recognition) {
            if (onError) onError('Speech recognition not supported.');
            return;
        }

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            if (onResult) onResult(finalTranscript, interimTranscript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if (onError) onError(event.error);
            this.isRecording = false;
        };

        this.recognition.onend = () => {
            this.isRecording = false;
            if (onEnd) onEnd();
        };

        try {
            this.recognition.start();
            this.isRecording = true;
        } catch (e) {
            console.error(e);
            this.isRecording = false;
        }
    }

    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
            this.isRecording = false;
        }
    }

    speak(text) {
        if (!this.synthesis) return;
        
        // Stop any currently speaking audio
        this.synthesis.cancel();

        // Strip HTML/Markdown from text before speaking
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        const cleanText = tempDiv.textContent || tempDiv.innerText || "";

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        this.synthesis.speak(utterance);
    }
    
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }
}
