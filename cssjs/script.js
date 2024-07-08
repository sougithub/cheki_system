document.addEventListener("DOMContentLoaded", function() {
    const captureBtn = document.getElementById('capture-btn');
    const clearBtn = document.getElementById('clear-btn');
    const sendMailBtn = document.getElementById('send-mail-btn');
    const fileInput = document.getElementById('file-input');
    const photo = document.getElementById('photo');
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');

    let isDrawing = false;
    let x = 0;
    let y = 0;

    captureBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            photo.src = e.target.result;
            setTimeout(() => {
                canvas.width = photo.clientWidth;
                canvas.height = photo.clientHeight;
            }, 100);
        };
        reader.readAsDataURL(file);
    });

    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        [x, y] = getCoordinates(e);
    }

    function draw(e) {
        e.preventDefault();
        if (!isDrawing) return;
        const [newX, newY] = getCoordinates(e);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(newX, newY);
        ctx.stroke();
        [x, y] = [newX, newY];
    }

    function stopDrawing(e) {
        e.preventDefault();
        isDrawing = false;
        ctx.beginPath();
    }

    function getCoordinates(e) {
        let rect = canvas.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
            const touch = e.touches[0];
            return [touch.clientX - rect.left, touch.clientY - rect.top];
        } else {
            return [e.clientX - rect.left, e.clientY - rect.top];
        }
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    sendMailBtn.addEventListener('click', () => {
        const dataUrl = canvas.toDataURL('image/png');
        const mailtoLink = `mailto:?subject=Photo&body=Here is the photo with drawing.%0D%0A${dataUrl}`;
        window.location.href = mailtoLink;
    });
});
