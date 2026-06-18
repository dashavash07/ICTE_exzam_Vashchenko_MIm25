// Логіка обертання простору мишкою (Вісь Y)
let isDragging = false;
let previousMouseX = 0;
let currentRotationY = 35; // Початковий кут огляду

const rotator = document.getElementById('space-rotator');
const canvasArea = document.getElementById('canvas-area');

// Перемикач 2D / 3D режиму
const toggle3D = document.getElementById('toggle-3d');
const zCoords = document.querySelectorAll('.z-coord');
const zAxis = document.getElementById('axis-z');
const floorPlane = document.getElementById('floor-plane');
const gridXY = document.getElementById('grid-xy');

toggle3D.addEventListener('change', (e) => {
    const is3D = e.target.checked;
    
    // Відображення/приховування полів введення Z
    zCoords.forEach(el => el.style.display = is3D ? 'inline' : 'none');
    
    // Керування елементами 3D сцени
    zAxis.setAttribute('visible', is3D);
    floorPlane.setAttribute('visible', is3D);
    gridXY.setAttribute('visible', !is3D); // Сітка активується тільки у 2D

    if (!is3D) {
        // Переходимо у 2D: повертаємо сцену рівно до камери
        rotator.setAttribute('rotation', '0 0 0');
        currentRotationY = 0;
        // Обнуляємо Z координати
        document.getElementById('az').value = 0;
        document.getElementById('bz').value = 0;
    } else {
        // Повертаємо 3D кут огляду
        rotator.setAttribute('rotation', '0 35 0');
        currentRotationY = 35;
    }
    
    clearScene();
    document.getElementById('result-output').innerHTML = 'Оберіть дію';
});

// Управління мишкою/сенсором
canvasArea.addEventListener('mousedown', (e) => { if (e.button === 0) { isDragging = true; previousMouseX = e.clientX; } });
canvasArea.addEventListener('touchstart', (e) => { if (e.touches.length === 1) { isDragging = true; previousMouseX = e.touches[0].clientX; } });

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentRotationY += (e.clientX - previousMouseX) * 0.4; 
    rotator.setAttribute('rotation', `0 ${currentRotationY} 0`);
    previousMouseX = e.clientX;
});

window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    currentRotationY += (e.touches[0].clientX - previousMouseX) * 0.4;
    rotator.setAttribute('rotation', `0 ${currentRotationY} 0`);
    previousMouseX = e.touches[0].clientX;
});

window.addEventListener('mouseup', () => { isDragging = false; });
window.addEventListener('touchend', () => { isDragging = false; });

// Математична логіка
function getVector(prefix) {
    const is3D = toggle3D.checked;
    return {
        x: parseFloat(document.getElementById(prefix + 'x').value) || 0,
        y: parseFloat(document.getElementById(prefix + 'y').value) || 0,
        z: is3D ? (parseFloat(document.getElementById(prefix + 'z').value) || 0) : 0
    };
}

// Форматування результату залежно від режиму
function formatVector(v) {
    const is3D = toggle3D.checked;
    return is3D ? `( ${v.x} ; ${v.y} ; ${v.z} )` : `( ${v.x} ; ${v.y} )`;
}

function clearScene() {
    document.getElementById('vectors-container').innerHTML = '';
}

// Додано прапорець isProjection для особливого стилю візуалізації
function drawVector(v, color, label, isResult = false, isProjection = false) {
    const container = document.getElementById('vectors-container');
    
    const line = document.createElement('a-entity');
    const lineWidth = isResult ? 6 : (isProjection ? 4 : 3);
    line.setAttribute('line', `start: 0 0 0; end: ${v.x} ${v.y} ${v.z}; color: ${color}; width: ${lineWidth}`);
    container.appendChild(line);
    
    const tip = document.createElement('a-cone');
    tip.setAttribute('position', `${v.x} ${v.y} ${v.z}`);
    tip.setAttribute('radius-bottom', isResult ? '0.12' : (isProjection ? '0.09' : '0.08'));
    tip.setAttribute('height', isResult ? '0.4' : (isProjection ? '0.25' : '0.3'));
    tip.setAttribute('color', color);
    
    tip.addEventListener('loaded', () => {
        if (v.x === 0 && v.y === 0 && v.z === 0) return;
        const dir = new THREE.Vector3(v.x, v.y, v.z).normalize();
        const up = new THREE.Vector3(0, 1, 0); 
        tip.object3D.quaternion.setFromUnitVectors(up, dir);
    });
    
    container.appendChild(tip);

    if (label) {
        const text = document.createElement('a-text');
        text.setAttribute('value', label);
        text.setAttribute('color', color);
        // Для проекції мітку зміщуємо вниз, щоб не перекривала основний вектор
        const offsetY = isProjection ? -0.4 : 0.4;
        text.setAttribute('position', `${v.x + 0.2} ${v.y + offsetY} ${v.z + 0.2}`);
        text.setAttribute('scale', '4.5 4.5 4.5'); 
        text.setAttribute('align', 'center');
        text.setAttribute('side', 'double'); 
        container.appendChild(text);
    }
}

// Операції
document.getElementById('btn-add').addEventListener('click', () => {
    const a = getVector('a');
    const b = getVector('b');
    const c = { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
    
    document.getElementById('result-output').innerHTML = `a + b = c ${formatVector(c)}`;
        
    clearScene();
    drawVector(a, '#f1c40f', 'a');
    drawVector(b, '#9b59b6', 'b');
    drawVector(c, '#00cec9', 'c', true);
});

document.getElementById('btn-sub').addEventListener('click', () => {
    const a = getVector('a');
    const b = getVector('b');
    const c = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    
    document.getElementById('result-output').innerHTML = `a - b = c ${formatVector(c)}`;
        
    clearScene();
    drawVector(a, '#f1c40f', 'a');
    drawVector(b, '#9b59b6', 'b');
    drawVector(c, '#00cec9', 'c', true);
});

document.getElementById('btn-dot').addEventListener('click', () => {
    const a = getVector('a');
    const b = getVector('b');
    const dotProduct = (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
    
    document.getElementById('result-output').innerHTML = `a &middot; b = ${dotProduct}`;
        
    clearScene();
    drawVector(a, '#f1c40f', 'a');
    drawVector(b, '#9b59b6', 'b');

    // Геометричний зміст: проекція вектора a на вектор b
    const bMagSq = (b.x * b.x) + (b.y * b.y) + (b.z * b.z);
    
    if (bMagSq !== 0) {
        // Розрахунок координат вектора проекції
        const projScale = dotProduct / bMagSq;
        const proj = { x: b.x * projScale, y: b.y * projScale, z: b.z * projScale };
        
        // Малюємо вектор проекції (помаранчевий колір)
        drawVector(proj, '#e67e22', 'pr', false, true);
        
        // Малюємо перпендикуляр від кінця вектора 'a' до проекції (сіра лінія)
        const container = document.getElementById('vectors-container');
        const perpLine = document.createElement('a-entity');
        perpLine.setAttribute('line', `start: ${a.x} ${a.y} ${a.z}; end: ${proj.x} ${proj.y} ${proj.z}; color: #bdc3c7; width: 2`);
        container.appendChild(perpLine);
    }
});
