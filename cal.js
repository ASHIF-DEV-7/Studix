// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon();

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
});

function updateThemeIcon() {
    const theme = html.getAttribute('data-theme');
    themeToggle.querySelector('.theme-icon').textContent = theme === 'light' ? '🌙' : '☀️';
}

// ===== NAVIGATION =====
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const sectionId = item.getAttribute('data-section');
        
        // Remove active class from all nav items and sections
        navItems.forEach(nav => nav.classList.remove('active'));
        sections.forEach(sec => sec.classList.remove('active'));
        
        // Add active class to clicked nav item and corresponding section
        item.classList.add('active');
        document.getElementById(sectionId).classList.add('active');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// ===== BASIC CALCULATOR =====
let calcDisplay = '0';
const displayElement = document.getElementById('calcDisplay');

// Calculator button listeners
document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const value = btn.getAttribute('data-value');
        const action = btn.getAttribute('data-action');
        
        if (value) {
            appendToCalc(value);
        } else if (action === 'clear') {
            clearCalc();
        } else if (action === 'backspace') {
            backspace();
        } else if (action === 'equals') {
            calculateBasic();
        }
    });
});

function appendToCalc(value) {
    if (calcDisplay === '0' && value !== '.') {
        calcDisplay = value;
    } else if (calcDisplay === 'Error') {
        calcDisplay = value;
    } else {
        calcDisplay += value;
    }
    displayElement.textContent = calcDisplay;
}

function clearCalc() {
    calcDisplay = '0';
    displayElement.textContent = calcDisplay;
}

function backspace() {
    if (calcDisplay.length > 1) {
        calcDisplay = calcDisplay.slice(0, -1);
    } else {
        calcDisplay = '0';
    }
    displayElement.textContent = calcDisplay;
}

function calculateBasic() {
    try {
        // Replace × and ÷ with * and /
        const expression = calcDisplay.replace(/×/g, '*').replace(/÷/g, '/');
        const result = eval(expression);
        calcDisplay = result.toString();
        displayElement.textContent = calcDisplay;
    } catch (error) {
        calcDisplay = 'Error';
        displayElement.textContent = calcDisplay;
    }
}

// ===== HELPER FUNCTION =====
function showResult(id, html) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = html;
        element.classList.add('show');
    }
}

function getInputValue(id) {
    const element = document.getElementById(id);
    return element ? parseFloat(element.value) : NaN;
}

function validateInputs(...values) {
    return values.every(val => !isNaN(val) && val !== null && val !== undefined);
}

// ===== REAL NUMBERS =====
function calcHCF() {
    let a = getInputValue('hcf-num1');
    let b = getInputValue('hcf-num2');
    
    if (!validateInputs(a, b)) {
        showResult('hcf-result', '<strong>❌ Please enter valid numbers</strong>');
        return;
    }
    
    const origA = a, origB = b;
    
    // Euclid's algorithm
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    
    showResult('hcf-result', `<strong>HCF of ${origA} and ${origB} = ${Math.abs(a)}</strong>`);
}

function calcLCM() {
    let a = getInputValue('lcm-num1');
    let b = getInputValue('lcm-num2');
    
    if (!validateInputs(a, b)) {
        showResult('lcm-result', '<strong>❌ Please enter valid numbers</strong>');
        return;
    }
    
    const origA = a, origB = b;
    let tempA = a, tempB = b;
    
    // Calculate HCF first
    while (tempB !== 0) {
        const temp = tempB;
        tempB = tempA % tempB;
        tempA = temp;
    }
    const hcf = Math.abs(tempA);
    const lcm = Math.abs((a * b) / hcf);
    
    showResult('lcm-result', `<strong>LCM of ${origA} and ${origB} = ${lcm}</strong><br>HCF = ${hcf}`);
}

function calcPrimeFactors() {
    let n = getInputValue('prime-num');
    
    if (!validateInputs(n) || n < 2) {
        showResult('prime-result', '<strong>❌ Please enter a valid number ≥ 2</strong>');
        return;
    }
    
    const orig = n;
    const factors = [];
    
    for (let i = 2; i <= n; i++) {
        while (n % i === 0) {
            factors.push(i);
            n /= i;
        }
    }
    
    showResult('prime-result', `<strong>Prime Factorization of ${orig}:</strong><br>${factors.join(' × ')}`);
}

function checkPrime() {
    const n = getInputValue('check-prime');
    
    if (!validateInputs(n)) {
        showResult('check-prime-result', '<strong>❌ Please enter a valid number</strong>');
        return;
    }
    
    if (n < 2) {
        showResult('check-prime-result', `<strong>${n} is NOT a prime number</strong>`);
        return;
    }
    
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
            showResult('check-prime-result', `<strong>${n} is NOT a prime number</strong>`);
            return;
        }
    }
    
    showResult('check-prime-result', `<strong>✓ ${n} is a PRIME number</strong>`);
}

// ===== POLYNOMIALS =====
function calcPolyValue() {
    const a = getInputValue('poly-a');
    const b = getInputValue('poly-b');
    const c = getInputValue('poly-c');
    const x = getInputValue('poly-x');
    
    if (!validateInputs(a, b, c, x)) {
        showResult('poly-value-result', '<strong>❌ Please enter valid numbers</strong>');
        return;
    }
    
    const result = a * x * x + b * x + c;
    showResult('poly-value-result', 
        `<strong>Value at x = ${x}:</strong><br>${a}(${x})² + ${b}(${x}) + ${c} = <strong>${result.toFixed(2)}</strong>`);
}

function calcZeroes() {
    const a = getInputValue('zero-a');
    const b = getInputValue('zero-b');
    const c = getInputValue('zero-c');
    
    if (!validateInputs(a, b, c) || a === 0) {
        showResult('zeroes-result', '<strong>❌ Please enter valid numbers (a ≠ 0)</strong>');
        return;
    }
    
    const discriminant = b * b - 4 * a * c;
    const sum = -b / a;
    const product = c / a;
    
    let html = `<strong>Discriminant (D) = ${discriminant.toFixed(2)}</strong><br><br>`;
    
    if (discriminant > 0) {
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        html += `<strong>Zero 1 (α) = ${root1.toFixed(4)}</strong><br>`;
        html += `<strong>Zero 2 (β) = ${root2.toFixed(4)}</strong><br><br>`;
        html += `Two distinct real roots`;
    } else if (discriminant === 0) {
        const root = -b / (2 * a);
        html += `<strong>Equal Zeroes: α = β = ${root.toFixed(4)}</strong><br><br>`;
        html += `Two equal real roots`;
    } else {
        html += `<strong>No real zeroes</strong><br>Complex/Imaginary roots`;
    }
    
    html += `<br><br><strong>Relationships:</strong><br>`;
    html += `Sum of zeroes (α + β) = ${sum.toFixed(4)}<br>`;
    html += `Product of zeroes (αβ) = ${product.toFixed(4)}`;
    
    showResult('zeroes-result', html);
}

function calcDivision() {
    const dividend = getInputValue('div-dividend');
    const divisor = getInputValue('div-divisor');
    
    if (!validateInputs(dividend, divisor) || divisor === 0) {
        showResult('division-result', '<strong>❌ Divisor cannot be zero</strong>');
        return;
    }
    
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;
    
    showResult('division-result', 
        `<strong>Quotient = ${quotient}</strong><br><strong>Remainder = ${remainder}</strong><br><br>` +
        `Verification: ${dividend} = ${divisor} × ${quotient} + ${remainder}`);
}

// ===== LINEAR EQUATIONS =====
function solveLinear() {
    const a1 = getInputValue('lin-a1');
    const b1 = getInputValue('lin-b1');
    const c1 = getInputValue('lin-c1');
    const a2 = getInputValue('lin-a2');
    const b2 = getInputValue('lin-b2');
    const c2 = getInputValue('lin-c2');
    
    if (!validateInputs(a1, b1, c1, a2, b2, c2)) {
        showResult('linear-result', '<strong>❌ Please enter valid numbers</strong>');
        return;
    }
    
    const determinant = a1 * b2 - a2 * b1;
    
    if (determinant === 0) {
        showResult('linear-result', '<strong>No unique solution</strong><br>Lines are parallel or coincident');
        return;
    }
    
    const x = (b1 * c2 - b2 * c1) / determinant;
    const y = (c1 * a2 - c2 * a1) / determinant;
    
    showResult('linear-result', `<strong>Solution:</strong><br>x = ${x.toFixed(4)}<br>y = ${y.toFixed(4)}`);
}

// ===== QUADRATIC EQUATIONS =====
function solveQuadratic() {
    const a = getInputValue('quad-a');
    const b = getInputValue('quad-b');
    const c = getInputValue('quad-c');
    
    if (!validateInputs(a, b, c) || a === 0) {
        showResult('quad-result', '<strong>❌ Please enter valid numbers (a ≠ 0)</strong>');
        return;
    }
    
    const discriminant = b * b - 4 * a * c;
    let html = `<strong>Discriminant (D) = ${discriminant.toFixed(4)}</strong><br><br>`;
    
    if (discriminant > 0) {
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        html += `<strong>Root 1 (x₁) = ${root1.toFixed(4)}</strong><br>`;
        html += `<strong>Root 2 (x₂) = ${root2.toFixed(4)}</strong><br><br>`;
        html += `Two distinct real roots`;
    } else if (discriminant === 0) {
        const root = -b / (2 * a);
        html += `<strong>Root (x) = ${root.toFixed(4)}</strong><br><br>Two equal real roots`;
    } else {
        html += `<strong>No real roots</strong><br>Roots are complex/imaginary`;
    }
    
    showResult('quad-result', html);
}

function factorizeQuad() {
    const a = getInputValue('fact-a');
    const b = getInputValue('fact-b');
    const c = getInputValue('fact-c');
    
    if (!validateInputs(a, b, c) || a === 0) {
        showResult('fact-result', '<strong>❌ Please enter valid numbers (a ≠ 0)</strong>');
        return;
    }
    
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant >= 0) {
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        showResult('fact-result', 
            `<strong>Factors:</strong><br>(x - ${root1.toFixed(4)})(x - ${root2.toFixed(4)})`);
    } else {
        showResult('fact-result', '<strong>Cannot be factorized</strong><br>No real roots');
    }
}

function checkNature() {
    const a = getInputValue('nature-a');
    const b = getInputValue('nature-b');
    const c = getInputValue('nature-c');
    
    if (!validateInputs(a, b, c) || a === 0) {
        showResult('nature-result', '<strong>❌ Please enter valid numbers (a ≠ 0)</strong>');
        return;
    }
    
    const discriminant = b * b - 4 * a * c;
    let nature = '';
    
    if (discriminant > 0) {
        nature = 'Two distinct real roots';
    } else if (discriminant === 0) {
        nature = 'Two equal real roots';
    } else {
        nature = 'No real roots (Complex roots)';
    }
    
    showResult('nature-result', 
        `<strong>Discriminant (D) = ${discriminant.toFixed(4)}</strong><br><br><strong>Nature:</strong> ${nature}`);
}

// ===== ARITHMETIC PROGRESSION =====
function calcNthTerm() {
    const a = getInputValue('ap-nth-a');
    const d = getInputValue('ap-nth-d');
    const n = getInputValue('ap-nth-n');
    
    if (!validateInputs(a, d, n) || n < 1) {
        showResult('ap-nth-result', '<strong>❌ Please enter valid numbers (n ≥ 1)</strong>');
        return;
    }
    
    const nthTerm = a + (n - 1) * d;
    showResult('ap-nth-result', 
        `<strong>${n}th term = ${nthTerm.toFixed(4)}</strong><br><br>Formula: aₙ = a + (n-1)d`);
}

function calcAPSum() {
    const a = getInputValue('ap-sum-a');
    const d = getInputValue('ap-sum-d');
    const n = getInputValue('ap-sum-n');
    
    if (!validateInputs(a, d, n) || n < 1) {
        showResult('ap-sum-result', '<strong>❌ Please enter valid numbers (n ≥ 1)</strong>');
        return;
    }
    
    const sum = (n / 2) * (2 * a + (n - 1) * d);
    const lastTerm = a + (n - 1) * d;
    
    showResult('ap-sum-result', 
        `<strong>Sum of ${n} terms = ${sum.toFixed(4)}</strong><br><br>` +
        `Last term = ${lastTerm.toFixed(4)}<br>Formula: Sₙ = n/2[2a + (n-1)d]`);
}

function calcCommonDiff() {
    const a = getInputValue('ap-cd-a');
    const an = getInputValue('ap-cd-an');
    const n = getInputValue('ap-cd-n');
    
    if (!validateInputs(a, an, n) || n < 2) {
        showResult('ap-cd-result', '<strong>❌ Please enter valid numbers (n ≥ 2)</strong>');
        return;
    }
    
    const d = (an - a) / (n - 1);
    showResult('ap-cd-result', 
        `<strong>Common Difference (d) = ${d.toFixed(4)}</strong><br><br>Formula: d = (aₙ - a) / (n - 1)`);
}

function calcNumTerms() {
    const a = getInputValue('ap-n-a');
    const d = getInputValue('ap-n-d');
    const l = getInputValue('ap-n-l');
    
    if (!validateInputs(a, d, l) || d === 0) {
        showResult('ap-n-result', '<strong>❌ Please enter valid numbers (d ≠ 0)</strong>');
        return;
    }
    
    const n = ((l - a) / d) + 1;
    
    if (n < 1 || !Number.isInteger(n)) {
        showResult('ap-n-result', '<strong>❌ Invalid values - check your inputs</strong>');
        return;
    }
    
    showResult('ap-n-result', 
        `<strong>Number of terms (n) = ${n}</strong><br><br>Formula: n = [(l - a) / d] + 1`);
}

// ===== TRIANGLES =====
function calcTriArea() {
    const base = getInputValue('tri-base');
    const height = getInputValue('tri-height');
    
    if (!validateInputs(base, height) || base <= 0 || height <= 0) {
        showResult('tri-area-result', '<strong>❌ Please enter valid positive numbers</strong>');
        return;
    }
    
    const area = 0.5 * base * height;
    showResult('tri-area-result', `<strong>Area of Triangle = ${area.toFixed(4)} sq units</strong>`);
}

function calcHeron() {
    const a = getInputValue('heron-a');
    const b = getInputValue('heron-b');
    const c = getInputValue('heron-c');
    
    if (!validateInputs(a, b, c) || a <= 0 || b <= 0 || c <= 0) {
        showResult('heron-result', '<strong>❌ Please enter valid positive numbers</strong>');
        return;
    }
    
    // Check triangle inequality
    if (a + b <= c || b + c <= a || c + a <= b) {
        showResult('heron-result', '<strong>❌ These sides cannot form a triangle</strong>');
        return;
    }
    
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    
    showResult('heron-result', 
        `<strong>Semi-perimeter (s) = ${s.toFixed(4)}</strong><br><strong>Area = ${area.toFixed(4)} sq units</strong>`);
}

// Pythagoras inputs handler
const pythSelect = document.getElementById('pyth-type');
if (pythSelect) {
    pythSelect.addEventListener('change', updatePythInputs);
    updatePythInputs();
}

function updatePythInputs() {
    const type = document.getElementById('pyth-type').value;
    const container = document.getElementById('pyth-inputs');
    let html = '';
    
    if (type === 'hypotenuse') {
        html = `
            <div class="input-group">
                <label class="label">Base (a)</label>
                <input type="number" class="input" id="pyth-a" placeholder="Enter base">
            </div>
            <div class="input-group">
                <label class="label">Perpendicular (b)</label>
                <input type="number" class="input" id="pyth-b" placeholder="Enter perpendicular">
            </div>
        `;
    } else if (type === 'base') {
        html = `
            <div class="input-group">
                <label class="label">Perpendicular (b)</label>
                <input type="number" class="input" id="pyth-b" placeholder="Enter perpendicular">
            </div>
            <div class="input-group">
                <label class="label">Hypotenuse (c)</label>
                <input type="number" class="input" id="pyth-c" placeholder="Enter hypotenuse">
            </div>
        `;
    } else {
        html = `
            <div class="input-group">
                <label class="label">Base (a)</label>
                <input type="number" class="input" id="pyth-a" placeholder="Enter base">
            </div>
            <div class="input-group">
                <label class="label">Hypotenuse (c)</label>
                <input type="number" class="input" id="pyth-c" placeholder="Enter hypotenuse">
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function calcPythagoras() {
    const type = document.getElementById('pyth-type').value;
    let result = '';
    
    if (type === 'hypotenuse') {
        const a = getInputValue('pyth-a');
        const b = getInputValue('pyth-b');
        
        if (!validateInputs(a, b) || a <= 0 || b <= 0) {
            showResult('pyth-result', '<strong>❌ Please enter valid positive numbers</strong>');
            return;
        }
        
        const c = Math.sqrt(a * a + b * b);
        result = `<strong>Hypotenuse (c) = ${c.toFixed(4)} units</strong>`;
    } else if (type === 'base') {
        const b = getInputValue('pyth-b');
        const c = getInputValue('pyth-c');
        
        if (!validateInputs(b, c) || b <= 0 || c <= 0 || c <= b) {
            showResult('pyth-result', '<strong>❌ Please enter valid numbers (c > b)</strong>');
            return;
        }
        
        const a = Math.sqrt(c * c - b * b);
        result = `<strong>Base (a) = ${a.toFixed(4)} units</strong>`;
    } else {
        const a = getInputValue('pyth-a');
        const c = getInputValue('pyth-c');
        
        if (!validateInputs(a, c) || a <= 0 || c <= 0 || c <= a) {
            showResult('pyth-result', '<strong>❌ Please enter valid numbers (c > a)</strong>');
            return;
        }
        
        const b = Math.sqrt(c * c - a * a);
        result = `<strong>Perpendicular (b) = ${b.toFixed(4)} units</strong>`;
    }
    
    showResult('pyth-result', result);
}

function calcPerimeter() {
    const a = getInputValue('peri-a');
    const b = getInputValue('peri-b');
    const c = getInputValue('peri-c');
    
    if (!validateInputs(a, b, c) || a <= 0 || b <= 0 || c <= 0) {
        showResult('peri-result', '<strong>❌ Please enter valid positive numbers</strong>');
        return;
    }
    
    const perimeter = a + b + c;
    showResult('peri-result', `<strong>Perimeter = ${perimeter.toFixed(4)} units</strong>`);
}

// ===== COORDINATE GEOMETRY =====
function calcDistance() {
    const x1 = getInputValue('dist-x1');
    const y1 = getInputValue('dist-y1');
    const x2 = getInputValue('dist-x2');
    const y2 = getInputValue('dist-y2');
    
    if (!validateInputs(x1, y1, x2, y2)) {
        showResult('dist-result', '<strong>❌ Please enter valid numbers</strong>');
        return;
    }
    
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    showResult('dist-result', 
        `<strong>Distance = ${distance.toFixed(4)} units</strong><br><br>` +
        `Between points (${x1}, ${y1}) and (${x2}, ${y2})`);
}

function calcSection() {
    const x1 = getInputValue('sec-x1');
    const y1 = getInputValue('sec-y1');
    const x2 = getInputValue('sec-x2');
    const y2 = getInputValue('sec-y2');
    const m = getInputValue('sec-m');
    const n = getInputValue('sec-n');
    
    if (!validateInputs(x1, y1, x2, y2, m, n) || (m + n) === 0) {
        showResult('sec-result', '<strong>❌ Please enter valid numbers (m+n ≠ 0)</strong>');
        return;
    }
    
    const x = (m * x2 + n * x1) / (m + n);
    const y = (m * y2 + n * y1) / (m + n);
    
    showResult('sec-result', 
        `<strong>Point dividing in ratio ${m}:${n}</strong><br><br>` +
        `Coordinates: (${x.toFixed(4)}, ${y.toFixed(4)})`);
}

function calcMidpoint() {
    const x1 = getInputValue('mid-x1');
    const y1 = getInputValue('mid-y1');
    const x2 = getInputValue('mid-x2');
    const y2 = getInputValue('mid-y2');
    
    if (!validateInputs(x1, y1, x2, y2)) {
        showResult('mid-result', '<strong>❌ Please enter valid numbers</strong>');
        return;
    }
    
    const x = (x1 + x2) / 2;
    const y = (y1 + y2) / 2;
    
    showResult('mid-result', `<strong>Midpoint:</strong><br>Coordinates: (${x.toFixed(4)}, ${y.toFixed(4)})`);
}

function calcTriangleArea() {
    const x1 = getInputValue('area-x1');
    const y1 = getInputValue('area-y1');
    const x2 = getInputValue('area-x2');
    const y2 = getInputValue('area-y2');
    const x3 = getInputValue('area-x3');
    const y3 = getInputValue('area-y3');
    
    if (!validateInputs(x1, y1, x2, y2, x3, y3)) {
        showResult('area-result', '<strong>❌ Please enter valid numbers</strong>');
        return;
    }
    
    const area = Math.abs(0.5 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)));
    showResult('area-result', `<strong>Area of Triangle = ${area.toFixed(4)} sq units</strong>`);
}

// ===== TRIGONOMETRY =====
function calcTrigRatios() {
    const angle = getInputValue('trig-angle');
    
    if (!validateInputs(angle)) {
        showResult('trig-ratios-result', '<strong>❌ Please enter a valid angle</strong>');
        return;
    }
    
    const radians = angle * Math.PI / 180;
    const sin = Math.sin(radians);
    const cos = Math.cos(radians);
    const tan = Math.tan(radians);
    const cosec = 1 / sin;
    const sec = 1 / cos;
    const cot = 1 / tan;
    
    showResult('trig-ratios-result', `
        <strong>For angle ${angle}°:</strong><br><br>
        sin θ = ${sin.toFixed(6)}<br>
        cos θ = ${cos.toFixed(6)}<br>
        tan θ = ${tan.toFixed(6)}<br>
        cosec θ = ${cosec.toFixed(6)}<br>
        sec θ = ${sec.toFixed(6)}<br>
        cot θ = ${cot.toFixed(6)}
    `);
}

function findAngle() {
    const type = document.getElementById('ratio-type').value;
    const value = getInputValue('ratio-value');
    
    if (!validateInputs(value)) {
        showResult('angle-result', '<strong>❌ Please enter a valid value</strong>');
        return;
    }
    
    let angle;
    
    try {
        if (type === 'sin') {
            if (value < -1 || value > 1) {
                showResult('angle-result', '<strong>❌ sin value must be between -1 and 1</strong>');
                return;
            }
            angle = Math.asin(value) * 180 / Math.PI;
        } else if (type === 'cos') {
            if (value < -1 || value > 1) {
                showResult('angle-result', '<strong>❌ cos value must be between -1 and 1</strong>');
                return;
            }
            angle = Math.acos(value) * 180 / Math.PI;
        } else {
            angle = Math.atan(value) * 180 / Math.PI;
        }
        
        showResult('angle-result', `<strong>Angle θ = ${angle.toFixed(4)}°</strong>`);
    } catch (error) {
        showResult('angle-result', '<strong>❌ Invalid value for selected ratio</strong>');
    }
}

function calcComplementary() {
    const angle = getInputValue('comp-angle');
    
    if (!validateInputs(angle)) {
        showResult('comp-result', '<strong>❌ Please enter a valid angle</strong>');
        return;
    }
    
    const complementary = 90 - angle;
    const radians = angle * Math.PI / 180;
    const compRadians = complementary * Math.PI / 180;
    
    showResult('comp-result', `
        <strong>Complementary angle = ${complementary}°</strong><br><br>
        sin(${angle}°) = ${Math.sin(radians).toFixed(6)} = cos(${complementary}°)<br>
        cos(${angle}°) = ${Math.cos(radians).toFixed(6)} = sin(${complementary}°)<br>
        tan(${angle}°) = ${Math.tan(radians).toFixed(6)} = cot(${complementary}°)
    `);
}

function verifyIdentity() {
    const sinValue = getInputValue('ident-sin');
    
    if (!validateInputs(sinValue) || sinValue < -1 || sinValue > 1) {
        showResult('ident-result', '<strong>❌ sin value must be between -1 and 1</strong>');
        return;
    }
    
    const cosValue = Math.sqrt(1 - sinValue * sinValue);
    const sum = sinValue * sinValue + cosValue * cosValue;
    
    showResult('ident-result', `
        <strong>Given: sin θ = ${sinValue}</strong><br><br>
        cos θ = ${cosValue.toFixed(6)}<br>
        sin²θ = ${(sinValue * sinValue).toFixed(6)}<br>
        cos²θ = ${(cosValue * cosValue).toFixed(6)}<br>
        sin²θ + cos²θ = ${sum.toFixed(6)}<br><br>
        <strong>✓ Identity Verified!</strong>
    `);
}

// ===== HEIGHT AND DISTANCE =====
function calcHeight() {
    const distance = getInputValue('ht-dist');
    const angle = getInputValue('ht-angle');
    
    if (!validateInputs(distance, angle) || distance <= 0 || angle <= 0 || angle >= 90) {
        showResult('ht-result', '<strong>❌ Please enter valid values (0 < angle < 90)</strong>');
        return;
    }
    
    const height = distance * Math.tan(angle * Math.PI / 180);
    showResult('ht-result', `<strong>Height = ${height.toFixed(4)} units</strong>`);
}

function calcDistFromHeight() {
    const height = getInputValue('dist-ht');
    const angle = getInputValue('dist-angle');
    
    if (!validateInputs(height, angle) || height <= 0 || angle <= 0 || angle >= 90) {
        showResult('dist-ht-result', '<strong>❌ Please enter valid values (0 < angle < 90)</strong>');
        return;
    }
    
    const distance = height / Math.tan(angle * Math.PI / 180);
    showResult('dist-ht-result', `<strong>Distance = ${distance.toFixed(4)} units</strong>`);
}

function calcAngleElev() {
    const height = getInputValue('ang-ht');
    const distance = getInputValue('ang-dist');
    
    if (!validateInputs(height, distance) || height <= 0 || distance <= 0) {
        showResult('ang-result', '<strong>❌ Please enter valid positive numbers</strong>');
        return;
    }
    
    const angle = Math.atan(height / distance) * 180 / Math.PI;
    showResult('ang-result', `<strong>Angle of Elevation = ${angle.toFixed(4)}°</strong>`);
}

function calcTwoAngles() {
    const distance = getInputValue('two-dist');
    const angle1 = getInputValue('two-angle1');
    const angle2 = getInputValue('two-angle2');
    
    if (!validateInputs(distance, angle1, angle2) || distance <= 0) {
        showResult('two-ang-result', '<strong>❌ Please enter valid numbers</strong>');
        return;
    }
    
    if (angle1 <= 0 || angle1 >= 90 || angle2 <= 0 || angle2 >= 90 || angle1 === angle2) {
        showResult('two-ang-result', '<strong>❌ Angles must be different and between 0° and 90°</strong>');
        return;
    }
    
    const tan1 = Math.tan(angle1 * Math.PI / 180);
    const tan2 = Math.tan(angle2 * Math.PI / 180);
    
    if (tan1 === tan2) {
        showResult('two-ang-result', '<strong>❌ Invalid angle combination</strong>');
        return;
    }
    
    const height = (distance * tan1 * tan2) / Math.abs(tan1 - tan2);
    showResult('two-ang-result', `<strong>Height = ${height.toFixed(4)} units</strong>`);
}

// ===== CIRCLES =====
function calcTangent() {
    const radius = getInputValue('tang-r');
    const distance = getInputValue('tang-d');
    
    if (!validateInputs(radius, distance) || radius <= 0 || distance <= radius) {
        showResult('tang-result', '<strong>❌ Distance must be greater than radius</strong>');
        return;
    }
    
    const tangent = Math.sqrt(distance * distance - radius * radius);
    showResult('tang-result', `<strong>Tangent Length = ${tangent.toFixed(4)} units</strong>`);
}

function calcChord() {
    const radius = getInputValue('chord-r');
    const distance = getInputValue('chord-d');
    
    if (!validateInputs(radius, distance) || radius <= 0 || distance < 0 || distance >= radius) {
        showResult('chord-result', '<strong>❌ Distance must be less than radius</strong>');
        return;
    }
    
    const chord = 2 * Math.sqrt(radius * radius - distance * distance);
    showResult('chord-result', `<strong>Chord Length = ${chord.toFixed(4)} units</strong>`);
}

function calcArc() {
    const radius = getInputValue('arc-r');
    const angle = getInputValue('arc-angle');
    
    if (!validateInputs(radius, angle) || radius <= 0 || angle <= 0 || angle >= 360) {
        showResult('arc-result', '<strong>❌ Please enter valid values (0 < angle < 360)</strong>');
        return;
    }
    
    const arc = (angle / 360) * 2 * Math.PI * radius;
    showResult('arc-result', `<strong>Arc Length = ${arc.toFixed(4)} units</strong>`);
}

// ===== CONSTRUCTIONS =====
function calcLineDiv() {
    const length = getInputValue('line-length');
    const m = getInputValue('line-m');
    const n = getInputValue('line-n');
    
    if (!validateInputs(length, m, n) || length <= 0 || m <= 0 || n <= 0) {
        showResult('line-div-result', '<strong>❌ Please enter valid positive numbers</strong>');
        return;
    }
    
    const point = (m * length) / (m + n);
    showResult('line-div-result', 
        `<strong>Division point at ${point.toFixed(4)} units from start</strong><br><br>Ratio ${m}:${n}`);
}

function calcSimilar() {
    const original = getInputValue('sim-orig');
    const scale = getInputValue('sim-scale');
    
    if (!validateInputs(original, scale) || original <= 0 || scale <= 0) {
        showResult('sim-result', '<strong>❌ Please enter valid positive numbers</strong>');
        return;
    }
    
    const newSide = original * scale;
    showResult('sim-result', 
        `<strong>New side = ${newSide.toFixed(4)} units</strong><br><br>Original: ${original}, Scale: ${scale}`);
}

// ===== AREAS RELATED TO CIRCLES =====
function calcCircArea() {
    const radius = getInputValue('circ-r');
    
    if (!validateInputs(radius) || radius <= 0) {
        showResult('circ-area-result', '<strong>❌ Please enter a valid positive radius</strong>');
        return;
    }
    
    const area = Math.PI * radius * radius;
    const circumference = 2 * Math.PI * radius;
    
    showResult('circ-area-result', 
        `<strong>Area = ${area.toFixed(4)} sq units</strong><br>` +
        `<strong>Circumference = ${circumference.toFixed(4)} units</strong>`);
}

function calcSector() {
    const radius = getInputValue('sect-r');
    const angle = getInputValue('sect-angle');
    
    if (!validateInputs(radius, angle) || radius <= 0 || angle <= 0 || angle >= 360) {
        showResult('sect-result', '<strong>❌ Please enter valid values (0 < angle < 360)</strong>');
        return;
    }
    
    const area = (angle / 360) * Math.PI * radius * radius;
    const arcLength = (angle / 360) * 2 * Math.PI * radius;
    
    showResult('sect-result', 
        `<strong>Sector Area = ${area.toFixed(4)} sq units</strong><br>` +
        `<strong>Arc Length = ${arcLength.toFixed(4)} units</strong>`);
}

function calcSegment() {
    const radius = getInputValue('seg-r');
    const angle = getInputValue('seg-angle');
    
    if (!validateInputs(radius, angle) || radius <= 0 || angle <= 0 || angle >= 360) {
        showResult('seg-result', '<strong>❌ Please enter valid values (0 < angle < 360)</strong>');
        return;
    }
    
    const sectorArea = (angle / 360) * Math.PI * radius * radius;
    const triangleArea = 0.5 * radius * radius * Math.sin(angle * Math.PI / 180);
    const segmentArea = sectorArea - triangleArea;
    
    showResult('seg-result', 
        `<strong>Segment Area = ${segmentArea.toFixed(4)} sq units</strong><br><br>` +
        `Sector Area = ${sectorArea.toFixed(4)}<br>Triangle Area = ${triangleArea.toFixed(4)}`);
}

function calcRing() {
    const outerRadius = getInputValue('ring-R');
    const innerRadius = getInputValue('ring-r');
    
    if (!validateInputs(outerRadius, innerRadius) || outerRadius <= 0 || innerRadius <= 0 || innerRadius >= outerRadius) {
        showResult('ring-result', '<strong>❌ Outer radius must be greater than inner radius</strong>');
        return;
    }
    
    const area = Math.PI * (outerRadius * outerRadius - innerRadius * innerRadius);
    showResult('ring-result', `<strong>Ring Area = ${area.toFixed(4)} sq units</strong>`);
}

// ===== SURFACE AREA AND VOLUME =====
function calcCube() {
    const side = getInputValue('cube-a');
    
    if (!validateInputs(side) || side <= 0) {
        showResult('cube-result', '<strong>❌ Please enter a valid positive side</strong>');
        return;
    }
    
    const volume = Math.pow(side, 3);
    const tsa = 6 * side * side;
    const lsa = 4 * side * side;
    const diagonal = side * Math.sqrt(3);
    
    showResult('cube-result', `
        <strong>Volume = ${volume.toFixed(4)} cubic units</strong><br>
        <strong>Total Surface Area = ${tsa.toFixed(4)} sq units</strong><br>
        <strong>Lateral Surface Area = ${lsa.toFixed(4)} sq units</strong><br>
        <strong>Diagonal = ${diagonal.toFixed(4)} units</strong>
    `);
}

function calcCuboid() {
    const length = getInputValue('cuboid-l');
    const breadth = getInputValue('cuboid-b');
    const height = getInputValue('cuboid-h');
    
    if (!validateInputs(length, breadth, height) || length <= 0 || breadth <= 0 || height <= 0) {
        showResult('cuboid-result', '<strong>❌ Please enter valid positive dimensions</strong>');
        return;
    }
    
    const volume = length * breadth * height;
    const tsa = 2 * (length * breadth + breadth * height + height * length);
    const lsa = 2 * height * (length + breadth);
    const diagonal = Math.sqrt(length * length + breadth * breadth + height * height);
    
    showResult('cuboid-result', `
        <strong>Volume = ${volume.toFixed(4)} cubic units</strong><br>
        <strong>Total Surface Area = ${tsa.toFixed(4)} sq units</strong><br>
        <strong>Lateral Surface Area = ${lsa.toFixed(4)} sq units</strong><br>
        <strong>Diagonal = ${diagonal.toFixed(4)} units</strong>
    `);
}

function calcCylinder() {
    const radius = getInputValue('cyl-r');
    const height = getInputValue('cyl-h');
    
    if (!validateInputs(radius, height) || radius <= 0 || height <= 0) {
        showResult('cyl-result', '<strong>❌ Please enter valid positive dimensions</strong>');
        return;
    }
    
    const volume = Math.PI * radius * radius * height;
    const csa = 2 * Math.PI * radius * height;
    const tsa = 2 * Math.PI * radius * (radius + height);
    
    showResult('cyl-result', `
        <strong>Volume = ${volume.toFixed(4)} cubic units</strong><br>
        <strong>Curved Surface Area = ${csa.toFixed(4)} sq units</strong><br>
        <strong>Total Surface Area = ${tsa.toFixed(4)} sq units</strong>
    `);
}

function calcCone() {
    const radius = getInputValue('cone-r');
    const height = getInputValue('cone-h');
    
    if (!validateInputs(radius, height) || radius <= 0 || height <= 0) {
        showResult('cone-result', '<strong>❌ Please enter valid positive dimensions</strong>');
        return;
    }
    
    const slantHeight = Math.sqrt(radius * radius + height * height);
    const volume = (1 / 3) * Math.PI * radius * radius * height;
    const csa = Math.PI * radius * slantHeight;
    const tsa = Math.PI * radius * (slantHeight + radius);
    
    showResult('cone-result', `
        <strong>Slant Height (l) = ${slantHeight.toFixed(4)} units</strong><br>
        <strong>Volume = ${volume.toFixed(4)} cubic units</strong><br>
        <strong>Curved Surface Area = ${csa.toFixed(4)} sq units</strong><br>
        <strong>Total Surface Area = ${tsa.toFixed(4)} sq units</strong>
    `);
}

function calcSphere() {
    const radius = getInputValue('sphere-r');
    
    if (!validateInputs(radius) || radius <= 0) {
        showResult('sphere-result', '<strong>❌ Please enter a valid positive radius</strong>');
        return;
    }
    
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    const surfaceArea = 4 * Math.PI * radius * radius;
    const diameter = 2 * radius;
    
    showResult('sphere-result', `
        <strong>Volume = ${volume.toFixed(4)} cubic units</strong><br>
        <strong>Surface Area = ${surfaceArea.toFixed(4)} sq units</strong><br>
        <strong>Diameter = ${diameter.toFixed(4)} units</strong>
    `);
}

function calcHemisphere() {
    const radius = getInputValue('hemi-r');
    
    if (!validateInputs(radius) || radius <= 0) {
        showResult('hemi-result', '<strong>❌ Please enter a valid positive radius</strong>');
        return;
    }
    
    const volume = (2 / 3) * Math.PI * Math.pow(radius, 3);
    const csa = 2 * Math.PI * radius * radius;
    const tsa = 3 * Math.PI * radius * radius;
    
    showResult('hemi-result', `
        <strong>Volume = ${volume.toFixed(4)} cubic units</strong><br>
        <strong>Curved Surface Area = ${csa.toFixed(4)} sq units</strong><br>
        <strong>Total Surface Area = ${tsa.toFixed(4)} sq units</strong>
    `);
}

// ===== STATISTICS =====
function parseDataArray(inputId) {
    const input = document.getElementById(inputId).value;
    const data = input.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
    return data;
}

function calcMean() {
    const data = parseDataArray('mean-data');
    
    if (data.length === 0) {
        showResult('mean-result', '<strong>❌ Please enter valid numbers</strong>');
        return;
    }
    
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / data.length;
    
    showResult('mean-result', 
        `<strong>Mean = ${mean.toFixed(4)}</strong><br><br>Sum = ${sum.toFixed(4)}<br>Count = ${data.length}`);
}

function calcMedian() {
    const data = parseDataArray('median-data');
    
    if (data.length === 0) {
        showResult('median-result', '<strong>❌ Please enter valid numbers</strong>');
        return;
    }
    
    const sorted = data.sort((a, b) => a - b);
    const n = sorted.length;
    let median;
    
    if (n % 2 === 0) {
        median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    } else {
        median = sorted[Math.floor(n / 2)];
    }
    
    showResult('median-result', 
        `<strong>Median = ${median.toFixed(4)}</strong><br><br>Sorted data: ${sorted.join(', ')}`);
}

function calcMode() {
    const data = parseDataArray('mode-data');
    
    if (data.length === 0) {
        showResult('mode-result', '<strong>❌ Please enter valid numbers</strong>');
        return;
    }
    
    const frequency = {};
    data.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
    });
    
    const maxFreq = Math.max(...Object.values(frequency));
    const modes = Object.keys(frequency).filter(key => frequency[key] === maxFreq);
    
    showResult('mode-result', 
        `<strong>Mode = ${modes.join(', ')}</strong><br><br>Frequency = ${maxFreq}`);
}

function calcRange() {
    const data = parseDataArray('range-data');
    
    if (data.length === 0) {
        showResult('range-result', '<strong>❌ Please enter valid numbers</strong>');
        return;
    }
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    showResult('range-result', 
        `<strong>Range = ${range.toFixed(4)}</strong><br><br>Maximum = ${max}<br>Minimum = ${min}`);
}

// ===== PROBABILITY =====
function calcProbability() {
    const favorable = getInputValue('prob-fav');
    const total = getInputValue('prob-total');
    
    if (!validateInputs(favorable, total) || total <= 0 || favorable < 0 || favorable > total) {
        showResult('prob-result', '<strong>❌ Please enter valid numbers (0 ≤ favorable ≤ total)</strong>');
        return;
    }
    
    const probability = favorable / total;
    const percentage = probability * 100;
    
    showResult('prob-result', 
        `<strong>P(E) = ${favorable}/${total} = ${probability.toFixed(6)}</strong><br><br>` +
        `Percentage = ${percentage.toFixed(4)}%`);
}

// Dice input handler
const diceSelect = document.getElementById('dice-event');
if (diceSelect) {
    diceSelect.addEventListener('change', updateDiceInputs);
    updateDiceInputs();
}

function updateDiceInputs() {
    const type = document.getElementById('dice-event').value;
    const container = document.getElementById('dice-input');
    let html = '';
    
    if (type === 'single' || type === 'greater' || type === 'less') {
        html = `
            <div class="input-group">
                <label class="label">Number (1-6)</label>
                <input type="number" class="input" id="dice-num" placeholder="Enter number" min="1" max="6">
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function calcDiceProbability() {
    const type = document.getElementById('dice-event').value;
    let favorable, description;
    
    if (type === 'single') {
        const num = getInputValue('dice-num');
        if (!validateInputs(num) || num < 1 || num > 6) {
            showResult('dice-result', '<strong>❌ Please enter a number between 1 and 6</strong>');
            return;
        }
        favorable = 1;
        description = `Getting ${num}`;
    } else if (type === 'even') {
        favorable = 3;
        description = 'Getting even number (2, 4, 6)';
    } else if (type === 'odd') {
        favorable = 3;
        description = 'Getting odd number (1, 3, 5)';
    } else if (type === 'greater') {
        const num = getInputValue('dice-num');
        if (!validateInputs(num) || num < 1 || num >= 6) {
            showResult('dice-result', '<strong>❌ Please enter a number between 1 and 5</strong>');
            return;
        }
        favorable = 6 - num;
        description = `Getting number > ${num}`;
    } else {
        const num = getInputValue('dice-num');
        if (!validateInputs(num) || num <= 1 || num > 6) {
            showResult('dice-result', '<strong>❌ Please enter a number between 2 and 6</strong>');
            return;
        }
        favorable = num - 1;
        description = `Getting number < ${num}`;
    }
    
    const probability = favorable / 6;
    const percentage = probability * 100;
    
    showResult('dice-result', 
        `<strong>${description}</strong><br><br>` +
        `P(E) = ${favorable}/6 = ${probability.toFixed(6)}<br>` +
        `Percentage = ${percentage.toFixed(4)}%`);
}

function calcCardProbability() {
    const type = document.getElementById('card-type').value;
    let favorable, description;
    
    switch (type) {
        case 'heart':
        case 'diamond':
        case 'club':
        case 'spade':
            favorable = 13;
            description = type.charAt(0).toUpperCase() + type.slice(1);
            break;
        case 'red':
            favorable = 26;
            description = 'Red card (Hearts + Diamonds)';
            break;
        case 'black':
            favorable = 26;
            description = 'Black card (Clubs + Spades)';
            break;
        case 'face':
            favorable = 12;
            description = 'Face card (J, Q, K)';
            break;
        case 'ace':
            favorable = 4;
            description = 'Ace';
            break;
    }
    
    const probability = favorable / 52;
    const percentage = probability * 100;
    
    showResult('card-result', 
        `<strong>${description}</strong><br><br>` +
        `P(E) = ${favorable}/52 = ${probability.toFixed(6)}<br>` +
        `Percentage = ${percentage.toFixed(4)}%`);
}

function calcComplement() {
    const prob = getInputValue('comp-prob');
    
    if (!validateInputs(prob) || prob < 0 || prob > 1) {
        showResult('comp-prob-result', '<strong>❌ Probability must be between 0 and 1</strong>');
        return;
    }
    
    const complement = 1 - prob;
    const percentage = complement * 100;
    
    showResult('comp-prob-result', 
        `<strong>P(E) = ${prob}</strong><br><strong>P(not E) = ${complement.toFixed(6)}</strong><br><br>` +
        `Percentage of not E = ${percentage.toFixed(4)}%`);
}

// ===== KEYBOARD SUPPORT FOR CALCULATOR =====
document.addEventListener('keydown', (e) => {
    if (document.getElementById('basic').classList.contains('active')) {
        if (e.key >= '0' && e.key <= '9') {
            appendToCalc(e.key);
        } else if (e.key === '.') {
            appendToCalc('.');
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            appendToCalc(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            calculateBasic();
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            backspace();
        } else if (e.key === 'Escape') {
            clearCalc();
        }
    }
});

// ===== CONSOLE MESSAGE =====
console.log('%c🎓 CBSE Class 10 Math Calculator', 'color: #1a73e8; font-size: 24px; font-weight: bold;');
console.log('%cBuilt with ❤️ for students', 'color: #5f6368; font-size: 14px;');
console.log('%cTheme: ' + (html.getAttribute('data-theme') || 'light'), 'color: #34a853; font-size: 12px;');
