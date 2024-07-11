document.addEventListener("DOMContentLoaded", function() {
    const captureBtn = document.getElementById('capture-btn');
    const saveBtn = document.getElementById('save-btn');
    const fileInput = document.getElementById('file-input');
    const canvasElement = document.getElementById('drawing-canvas');
    const colorPicker = document.getElementById('color-picker');
    const brushSize = document.getElementById('brush-size');

    const canvas = new fabric.Canvas('drawing-canvas', {
        isDrawingMode: true
    });

    let originalImage; // 元の画像データURLを保持する変数

    function resizeCanvas() {
        const displayArea = document.getElementById('display-area');
        const width = window.innerWidth;
        const height = window.innerHeight;
        const size = Math.min(width, height) * 0.7; // 短い辺の70%を基準とする
    
        displayArea.style.width = `${size}px`;
        displayArea.style.height = `${size * 1.4}px`; // 縦横比1.4を保持
    
        canvas.setWidth(displayArea.clientWidth);
        canvas.setHeight(displayArea.clientHeight);
        canvas.renderAll();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    canvas.freeDrawingBrush.color = colorPicker.value;
    canvas.freeDrawingBrush.width = parseInt(brushSize.value, 10);

    colorPicker.addEventListener('change', (e) => {
        canvas.freeDrawingBrush.color = e.target.value;
    });

    brushSize.addEventListener('change', (e) => {
        canvas.freeDrawingBrush.width = parseInt(e.target.value, 10);
    });

    captureBtn.addEventListener('click', () => {
        canvas.clear();
        canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = e.target.result; // 画像データURLを保存
            fabric.Image.fromURL(e.target.result, function(img) {
                const aspectRatio = img.width / img.height;
                const canvasWidth = canvasElement.clientWidth;
                const imageWidth = canvasWidth * 0.8;
                const imageHeight = imageWidth / aspectRatio;
                const offsetY = canvasElement.clientHeight * 0.0815;

                img.set({
                    left: (canvasWidth - imageWidth) / 2,
                    top: offsetY,
                    scaleX: imageWidth / img.width,
                    scaleY: imageHeight / img.height
                });

                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            });
        };
        reader.readAsDataURL(file);
    });

    saveBtn.addEventListener('click', () => {
        const originalWidth = canvas.getWidth();
        const originalHeight = canvas.getHeight();

        // 高解像度用にスケールアップ
        const scaleFactor = 3;
        canvas.setWidth(originalWidth * scaleFactor);
        canvas.setHeight(originalHeight * scaleFactor);
        canvas.setZoom(scaleFactor);
        canvas.renderAll();

        // 背景色を一時的に白に設定
        canvas.setBackgroundColor('white', () => {
            // 線が描かれた状態の画像を保存
            const annotatedImage = canvas.toDataURL({ format: 'png', quality: 1.0 });

            // 元のサイズに戻す
            canvas.setWidth(originalWidth);
            canvas.setHeight(originalHeight);
            canvas.setZoom(1);
            canvas.setBackgroundColor(null, canvas.renderAll.bind(canvas));

            // 新しいタブで画像を開く
            const newTab = window.open('', '_blank');
            if (newTab) {
                newTab.document.body.innerHTML = `<div><img src="${originalImage}" alt="Original Image" style="width: auto; max-width: 100%; height: auto;"><img src="${annotatedImage}" alt="Annotated Image" style="width: auto; max-width: 100%; height: auto;"></div>`;
            } else {
                alert('Pop-up blocked. Please allow pop-ups for this site.');
            }
        });
    });
});
