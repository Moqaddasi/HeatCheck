export default function Manager() {
    let width, height;
    const canvas = document.getElementById('heatmap');
    let heatmapData;
    const ctx = canvas.getContext('2d');

    function getColor(value) {
        const hue = ((1 - value) * 240).toString(10);
        return ["hsla(", hue, ",100%,50%,", value, ")"].join("");
    }
    function redrawHeatmap() {
        const imageData = ctx.createImageData(width, height);
        for (let i = 0; i < heatmapData.length; i++) {
            const value = heatmapData[i];
            const color = getColor(value);
            const rgba = color.match(/\d+/g).map(Number);
            const index = i * 4;
            imageData.data[index] = rgba[0];
            imageData.data[index + 1] = rgba[1];
            imageData.data[index + 2] = rgba[2];
            imageData.data[index + 3] = rgba[3] * 255;
        }
        ctx.putImageData(imageData, 0, 0);
    }
    return (
        <div>
            <h1>
                HeatCheck
            </h1>

        </div>
    )

}