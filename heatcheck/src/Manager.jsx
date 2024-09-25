import React, { useEffect, useRef, useState } from 'react';

export default function Manager() {
    const canvasRef = useRef(null);
    const [intensity, setIntensity] = useState(50);
    const [radius, setRadius] = useState(30);

    const heatmapDataRef = useRef(null);
    const dimensionsRef = useRef({ width: 0, height: 0 });
    const lastPositionRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            const { innerWidth: width, innerHeight: height } = window;
            canvas.width = width;
            canvas.height = height;
            dimensionsRef.current = { width, height };
            heatmapDataRef.current = new Float32Array(width * height);
            redrawHeatmap();
        };

        const updateHeatmap = (x, y) => {
            const { width, height } = dimensionsRef.current;
            const heatmapData = heatmapDataRef.current;
            const intensityFactor = intensity / 5000; // Reduced for smoother effect

            // Interpolate between last position and current position
            const lastPos = lastPositionRef.current;
            const steps = Math.max(Math.abs(x - lastPos.x), Math.abs(y - lastPos.y));
            for (let step = 0; step <= steps; step++) {
                const ix = Math.round(lastPos.x + (x - lastPos.x) * (step / steps));
                const iy = Math.round(lastPos.y + (y - lastPos.y) * (step / steps));

                for (let i = -radius; i < radius; i++) {
                    for (let j = -radius; j < radius; j++) {
                        const distance = Math.sqrt(i * i + j * j);
                        if (distance < radius) {
                            const pixelX = Math.floor(ix + i);
                            const pixelY = Math.floor(iy + j);
                            if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
                                const index = pixelY * width + pixelX;
                                const factor = 1 - distance / radius;
                                heatmapData[index] = Math.min(heatmapData[index] + intensityFactor * factor, 1);
                            }
                        }
                    }
                }
            }

            lastPositionRef.current = { x, y };
        };

        const redrawHeatmap = () => {
            const { width, height } = dimensionsRef.current;
            const imageData = ctx.createImageData(width, height);
            const heatmapData = heatmapDataRef.current;

            for (let i = 0; i < heatmapData.length; i++) {
                const value = heatmapData[i];
                const hue = ((1 - value) * 240).toString(10);
                const [r, g, b, a] = `hsla(${hue},100%,50%,${value})`.match(/\d+/g).map(Number);
                const index = i * 4;
                imageData.data[index] = r;
                imageData.data[index + 1] = g;
                imageData.data[index + 2] = b;
                imageData.data[index + 3] = a * 255;
            }
            ctx.putImageData(imageData, 0, 0);
        };

        const handlePointerMove = (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            updateHeatmap(x, y);
        };

        const animateHeatmap = () => {
            redrawHeatmap();
            animationFrameId = requestAnimationFrame(animateHeatmap);
        };

        window.addEventListener('resize', resizeCanvas);
        canvas.addEventListener('pointermove', handlePointerMove);
        resizeCanvas();
        animateHeatmap();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('pointermove', handlePointerMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [intensity, radius]);

    const handleClear = () => {
        if (heatmapDataRef.current) {
            heatmapDataRef.current.fill(0);
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSave = () => {
        const link = document.createElement('a');
        link.download = 'heatmap.png';
        link.href = canvasRef.current.toDataURL();
        link.click();
    };

    return (
        <div className="relative w-full h-screen">
            <canvas ref={canvasRef} className="absolute inset-0 touch-none" />
            <div className="absolute bottom-4 left-4 bg-white p-4 rounded shadow">
                <div className="mb-2">
                    <label htmlFor="intensity" className="block">Intensity: {intensity}</label>
                    <input
                        type="range"
                        id="intensity"
                        min="1"
                        max="100"
                        value={intensity}
                        onChange={(e) => setIntensity(Number(e.target.value))}
                        className="w-full"
                    />
                </div>
                <div className="mb-2">
                    <label htmlFor="radius" className="block">Radius: {radius}</label>
                    <input
                        type="range"
                        id="radius"
                        min="5"
                        max="100"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full"
                    />
                </div>
                <button onClick={handleClear} className="mr-2 px-2 py-1 bg-red-500 text-white rounded">Clear Heatmap</button>
                <button onClick={handleSave} className="px-2 py-1 bg-blue-500 text-white rounded">Save as Image</button>
            </div>
        </div>
    );
}