import { useEffect, useRef, useState } from 'react';
const Hands = window.Hands;
const HAND_CONNECTIONS = window.HAND_CONNECTIONS;
const Camera = window.Camera;

export function GestureController({ onGesture }) {
  const videoRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      return;
    }

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // Get the landmarks for the first hand
        const landmarks = results.multiHandLandmarks[0];

        // Use the index finger tip (landmark 8) and wrist (landmark 0) to determine position
        // This is a simplified logic. We map the normalized x coordinate (0 to 1)
        // to a panning command for the 3D scene.
        const x = landmarks[8].x;
        const z = landmarks[8].z; // Depth

        onGesture({ x, z });
      }
    });

    if (videoRef.current) {
      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 320,
        height: 240
      });

      cameraRef.current.start();
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [isActive, onGesture]);

  return (
    <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
      <button
        onClick={() => setIsActive(!isActive)}
        className={`px-4 py-2 rounded-lg font-bold shadow-lg transition-colors ${
          isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
        } text-white`}
      >
        {isActive ? 'Stop Gestures' : 'Start Gesture Control'}
      </button>

      {/* Hidden video element for MediaPipe processing */}
      <video
        ref={videoRef}
        style={{ display: isActive ? 'block' : 'none' }}
        className="w-48 h-36 rounded-lg object-cover border-2 border-gray-700 shadow-xl"
        autoPlay
        playsInline
      ></video>
    </div>
  );
}
