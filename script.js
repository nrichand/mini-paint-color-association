// Vanilla JS implementation
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const colorPreview = document.getElementById('color-preview');
    const colorName = document.getElementById('color-name');
    const colorHex = document.getElementById('color-hex');
    const complementaryPreview = document.getElementById('complementary-preview');
    const complementaryHex = document.getElementById('complementary-hex');
    const nearestPreview = document.getElementById('nearest-preview');
    const nearestName = document.getElementById('nearest-name');
    const nearestHex = document.getElementById('nearest-hex');
    const secondNearestPreview = document.getElementById('second-nearest-preview');
    const secondNearestName = document.getElementById('second-nearest-name');
    const secondNearestHex = document.getElementById('second-nearest-hex');
    const selectedOption = document.querySelector('.selected-option');
    const optionsContainer = document.querySelector('.options-container');
    
    // State
    let selectedColor = null;
    let complementaryColor = null;
    let nearestColor = null;
    let secondNearestColor = null;
    let selectedPaintType = null; // Track the selected paint type filter
    
    // Functions
    function getSortedColors(typeFilter = null) {
        return Object.entries(window.colors)
            .map(([name, data]) => ({ name, hex: data.hex, types: data.types }))
            .filter(color => !typeFilter || color.types.includes(typeFilter))
            .sort((a, b) => a.name.localeCompare(b.name));
    }
    
    function getAllPaintTypes() {
        const typesSet = new Set();
        Object.values(window.colors).forEach(color => {
            color.types.forEach(type => typesSet.add(type));
        });
        return Array.from(typesSet).sort();
    }
    
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return [h, s, l];
    }
    
    function hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }
    
    function getComplementaryColor(hexColor) {
        // Parse hex to RGB
        const r = parseInt(hexColor.substring(0, 2), 16);
        const g = parseInt(hexColor.substring(2, 4), 16);
        const b = parseInt(hexColor.substring(4, 6), 16);
        
        // Convert to HSL
        const [h, s, l] = rgbToHsl(r, g, b);
        
        // Shift hue by 180 degrees (0.5 in 0-1 scale)
        const complementaryH = (h + 0.5) % 1;
        
        // Convert back to RGB
        const [compR, compG, compB] = hslToRgb(complementaryH, s, l);
        
        // Convert to hex
        const compHexR = compR.toString(16).padStart(2, '0');
        const compHexG = compG.toString(16).padStart(2, '0');
        const compHexB = compB.toString(16).padStart(2, '0');
        
        return `${compHexR}${compHexG}${compHexB}`;
    }
    
    function colorDistance(hex1, hex2) {
        const r1 = parseInt(hex1.substring(0, 2), 16);
        const g1 = parseInt(hex1.substring(2, 4), 16);
        const b1 = parseInt(hex1.substring(4, 6), 16);
        
        const r2 = parseInt(hex2.substring(0, 2), 16);
        const g2 = parseInt(hex2.substring(2, 4), 16);
        const b2 = parseInt(hex2.substring(4, 6), 16);
        
        return Math.sqrt(
            Math.pow(r1 - r2, 2) +
            Math.pow(g1 - g2, 2) +
            Math.pow(b1 - b2, 2)
        );
    }
    
    function findNearestColors(targetHex, excludeHex) {
        let colors = getSortedColors(selectedPaintType);
        let distances = [];
        
        // Calculate distance for each color and store in array
        for (const color of colors) {
            if (color.hex.toLowerCase() === excludeHex.toLowerCase()) {
                continue;
            }
            
            const distance = colorDistance(targetHex, color.hex);
            distances.push({ color, distance });
        }
        
        // Sort by distance (closest first)
        distances.sort((a, b) => a.distance - b.distance);
        
        // Return the top 2 closest colors
        return {
            first: distances.length > 0 ? distances[0].color : { hex: null, name: null, types: [] },
            second: distances.length > 1 ? distances[1].color : { hex: null, name: null, types: [] }
        };
    }
    
    function selectColor(color) {
        selectedColor = color;
        complementaryColor = getComplementaryColor(color.hex);
        
        // Find nearest colors
        const nearestColors = findNearestColors(complementaryColor, color.hex);
        nearestColor = nearestColors.first;
        secondNearestColor = nearestColors.second;
        
        // Update UI
        updateColorDisplays();
        
        // Close dropdown
        optionsContainer.classList.remove('show');
    }
    
    function updateColorDisplays() {
        // Update selected color display
        colorPreview.style.backgroundColor = `#${selectedColor.hex}`;
        colorName.textContent = selectedColor.name;
        colorHex.textContent = `#${selectedColor.hex}`;
        
        // Display paint types
        const typesList = selectedColor.types.join(', ');
        document.getElementById('paint-types').textContent = `Types: ${typesList}`;
        
        // Update complementary color display
        complementaryPreview.style.backgroundColor = `#${complementaryColor}`;
        complementaryHex.textContent = `#${complementaryColor}`;
        
        // Update first nearest color display
        nearestPreview.style.backgroundColor = `#${nearestColor.hex}`;
        nearestName.textContent = nearestColor.name;
        nearestHex.textContent = `#${nearestColor.hex}`;
        
        // Display first nearest color paint types
        if (nearestColor.types && nearestColor.types.length > 0) {
            document.getElementById('nearest-types').textContent = `Types: ${nearestColor.types.join(', ')}`;
        } else {
            document.getElementById('nearest-types').textContent = '';
        }
        
        // Update second nearest color display
        secondNearestPreview.style.backgroundColor = `#${secondNearestColor.hex}`;
        secondNearestName.textContent = secondNearestColor.name;
        secondNearestHex.textContent = `#${secondNearestColor.hex}`;
        
        // Display second nearest color paint types
        if (secondNearestColor.types && secondNearestColor.types.length > 0) {
            document.getElementById('second-nearest-types').textContent = `Types: ${secondNearestColor.types.join(', ')}`;
        } else {
            document.getElementById('second-nearest-types').textContent = '';
        }
        
        // Update dropdown selected value
        selectedOption.innerHTML = `
            <div class="color-option">
                <div class="color-preview-small" style="background-color: #${selectedColor.hex}"></div>
                <span>${selectedColor.name}</span>
                <span class="paint-type-badge">${selectedColor.types[0]}</span>
            </div>
        `;
    }
    
    // Event Listeners
    selectedOption.addEventListener('click', () => {
        optionsContainer.classList.toggle('show');
    });
    
    document.addEventListener('click', (event) => {
        const isClickInside = selectedOption.contains(event.target) || 
                              optionsContainer.contains(event.target);
        
        if (!isClickInside && optionsContainer.classList.contains('show')) {
            optionsContainer.classList.remove('show');
        }
    });
    
    // Create paint type filter menu
    function createPaintTypeFilter() {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'paint-type-filter';
        filterContainer.innerHTML = '<h3>Filter by Paint Type</h3>';
        
        // Add 'All Types' option
        const allOption = document.createElement('div');
        allOption.className = 'paint-type-option selected';
        allOption.textContent = 'All Types';
        allOption.dataset.type = '';
        allOption.addEventListener('click', () => {
            selectPaintType(null);
            document.querySelectorAll('.paint-type-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            allOption.classList.add('selected');
        });
        filterContainer.appendChild(allOption);
        
        // Add individual type options
        getAllPaintTypes().forEach(type => {
            const typeOption = document.createElement('div');
            typeOption.className = 'paint-type-option';
            typeOption.textContent = type;
            typeOption.dataset.type = type;
            typeOption.addEventListener('click', () => {
                selectPaintType(type);
                document.querySelectorAll('.paint-type-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                typeOption.classList.add('selected');
            });
            filterContainer.appendChild(typeOption);
        });
        
        // Add filter container before the dropdown
        const dropdown = document.querySelector('.custom-select-container');
        dropdown.parentNode.insertBefore(filterContainer, dropdown);
    }
    
    // Select paint type and reload options
    function selectPaintType(type) {
        selectedPaintType = type;
        populateColorOptions();
    }
    
    // Populate dropdown with color options
    function populateColorOptions() {
        const sortedColors = getSortedColors(selectedPaintType);
        optionsContainer.innerHTML = '';
        
        sortedColors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.innerHTML = `
                <div class="color-preview-small" style="background-color: #${color.hex}"></div>
                <span>${color.name}</span>
                <span class="paint-type-badge">${color.types[0]}</span>
            `;
            
            colorOption.addEventListener('click', () => {
                selectColor(color);
            });
            
            optionsContainer.appendChild(colorOption);
        });
        
        // Initialize with first color if available
        if (sortedColors.length > 0) {
            selectColor(sortedColors[0]);
        } else {
            // If no colors match the filter, display a message
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No paints found for this type';
            optionsContainer.appendChild(noResults);
        }
    }
    
    // Initialize
    createPaintTypeFilter();
    populateColorOptions();
});
