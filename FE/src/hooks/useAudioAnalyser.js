import { useRef, useEffect, useState } from "react";

export const useAudioAnalyser = (stream) => {
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const dataArrayRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (stream) {
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;

      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      source.connect(analyserRef.current);

      const checkSpeaking = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
          const volume =
            dataArrayRef.current.reduce(
              (sum, value) => sum + Math.abs(value - 128),
              0
            ) / dataArrayRef.current.length;
          setIsSpeaking(volume > 10); // Ngưỡng xác định người dùng đang nói
        }
      };

      const interval = setInterval(checkSpeaking, 100);
      return () => clearInterval(interval);
    }
  }, [stream]);

  return { isSpeaking };
};
