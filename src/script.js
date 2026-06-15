// Логіка обертання простору мишкою (Вісь Y)
let isDragging = false;
let previousMouseX = 0;
let currentRotationY = 35; // Початковий кут огляду

const rotator = document.getElementById('space-rotator');
const canvasArea = document.getElementById('canvas-area');

// Початок перетягування (Миша)
canvasArea.addEventListener('mousedown', (e) => {
    if (e.button === 0) { 
        isDragging = true;
        previousMouseX = e.clientX;
    }
});

// Початок перетягування (Сенсор)
canvasArea.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        previousMouseX = e.touches[0].clientX;
    }
});

// Процес обертання
window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMouseX;
    currentRotationY += deltaX * 0.4; // Швидкість обертання
    rotator.setAttribute('rotation', `0 ${currentRotationY} 0`);
    previousMouseX = e.clientX;
});

window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMouseX;
    currentRotationY += deltaX * 0.4;
    rotator.setAttribute('rotation', `0 ${currentRotationY} 0`);
    previousMouseX = e.touches[0].clientX;
});

// Кінець перетягування
window.addEventListener('mouseup', () => { isDragging = false; });
window.addEventListener('touchend', () => { isDragging = false; });


// Математична логіка
function getVector(prefix) {
    return {
        x: parseFloat(document.getElementById(prefix + 'x').value) || 0,
        y: parseFloat(document.getElementById(prefix + 'y').value) || 0,
        z: parseFloat(document.getElementById(prefix + 'z').value) || 0
    };
}

function clearScene() {
    document.getElementById('vectors-container').innerHTML = '';
}

function drawVector(v, color, label, isResult = false) {
    const container = document.getElementById('vectors-container');
    
    // Лінія вектора
    const line = document.createElement('a-entity');
    line.setAttribute('line', `start: 0 0 0; end: ${v.x} ${v.y} ${v.z}; color: ${color}; width: ${isResult ? 6 : 3}`);
    container.appendChild(line);
    
    // Стрілочка на кінці
    const tip = document.createElement('a-cone');
    tip.setAttribute('position', `${v.x} ${v.y} ${v.z}`);
    tip.setAttribute('radius-bottom', isResult ? '0.12' : '0.08');
    tip.setAttribute('height', isResult ? '0.4' : '0.3');
    tip.setAttribute('color', color);
    
    // Математичний розрахунок повороту конуса в напрямку вектора за допомогою Three.js
    tip.addEventListener('loaded', () => {
        if (v.x === 0 && v.y === 0 && v.z === 0) return;
        
        const dir = new THREE.Vector3(v.x, v.y, v.z).normalize();
        const up = new THREE.Vector3(0, 1, 0); 
        tip.object3D.quaternion.setFromUnitVectors(up, dir);
    });
    
    container.appendChild(tip);

    // Більші 3D підписи векторів
    const text = document.createElement('a-text');
    text.setAttribute('value', label);
    text.setAttribute('color', color);
    text.setAttribute('position', `${v.x + 0.2} ${v.y + 0.4} ${v.z + 0.2}`);
    text.setAttribute('scale', '4.5 4.5 4.5'); 
    text.setAttribute('align', 'center');
    text.setAttribute('side', 'double'); 
    container.appendChild(text);
}

// Додавання
document.getElementById('btn-add').addEventListener('click', () => {
    const a = getVector('a');
    const b = getVector('b');
    const c = { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
    
    document.getElementById('result-output').innerHTML = `a + b = c ( ${c.x} ; ${c.y} ; ${c.z} )`;
        
    clearScene();
    drawVector(a, '#f1c40f', 'a');
    drawVector(b, '#9b59b6', 'b');
    drawVector(c, '#00cec9', 'c', true);
});

// Віднімання
document.getElementById('btn-sub').addEventListener('click', () => {
    const a = getVector('a');
    const b = getVector('b');
    const c = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    
    document.getElementById('result-output').innerHTML = `a - b = c ( ${c.x} ; ${c.y} ; ${c.z} )`;
        
    clearScene();
    drawVector(a, '#f1c40f', 'a');
    drawVector(b, '#9b59b6', 'b');
    drawVector(c, '#00cec9', 'c', true);
});

// Скалярний добуток
document.getElementById('btn-dot').addEventListener('click', () => {
    const a = getVector('a');
    const b = getVector('b');
    const dotProduct = (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
    
    document.getElementById('result-output').innerHTML = `a &middot; b = ${dotProduct}`;
        
    clearScene();
    drawVector(a, '#f1c40f', 'a');
    drawVector(b, '#9b59b6', 'b');
});