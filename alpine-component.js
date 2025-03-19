// Alpine.js component definition
document.addEventListener('DOMContentLoaded', () => {
    window.Alpine.data('colorFinder', () => ({
        dropdownOpen: false,
        selectedColor: null,
        complementaryColor: null,
        nearestColor: null,
        
        get sortedColors() {
            return Object.entries(window.colors)
                .map(([name, hex]) => ({ name, hex }))
                .sort((a, b) => a.name.localeCompare(b.name));
        },
        
        getComplementaryColor(hexColor) {
            const r = parseInt(hexColor.substring(0, 2), 16);
            const g = parseInt(hexColor.substring(2, 4), 16);
            const b = parseInt(hexColor.substring(4, 6), 16);
            
            const compR = (255 - r).toString(16).padStart(2, '0');
            const compG = (255 - g).toString(16).padStart(2, '0');
            const compB = (255 - b).toString(16).padStart(2, '0');
            
            return `${compR}${compG}${compB}`;
        },
        
        colorDistance(hex1, hex2) {
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
        },
        
        findNearestColor(targetHex, excludeHex) {
            let nearest = { hex: null, name: null };
            let minDistance = Infinity;
            
            for (const color of this.sortedColors) {
                if (color.hex.toLowerCase() === excludeHex.toLowerCase()) {
                    continue;
                }
                
                const distance = this.colorDistance(targetHex, color.hex);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = color;
                }
            }
            
            return nearest;
        },
        
        selectColor(color) {
            this.selectedColor = color;
            this.complementaryColor = this.getComplementaryColor(color.hex);
            this.nearestColor = this.findNearestColor(this.complementaryColor, color.hex);
            this.dropdownOpen = false;
        },
        
        init() {
            if (this.sortedColors.length > 0) {
                this.selectColor(this.sortedColors[0]);
            }
        }
    }));
});
