# SVG Drawing Language - Technical Specification

## Part A: Variable Bindings

### Overview

Variables in SDL (SVG Drawing Language) support numeric, string, and color types with static typing inference. All variables are immutable by default unless explicitly declared mutable.

### Syntax

**Declaration & Assignment:**

```
let x be 100                    // Numeric (inferred as float)
let name be "circle"            // String
let color be "#FF5733"          // Color (hex)
let isVisible be true           // Boolean
```

**Type System:**

- `Number`: Float64 (all numeric values)
- `String`: UTF-8 encoded text
- `Color`: Hex (#RRGGBB), RGB (rgb(r,g,b)), or named colors
- `Boolean`: true/false

### Operations

**Arithmetic:**

```
let a be 10 + 5                 // 15
let b be 10 - 5                 // 5
let c be 10 * 5                 // 50
let d be 10 / 5                 // 2.0
let e be 10 % 3                 // 1 (modulo)
let f be 2 ** 3                 // 8 (exponentiation)
```

**String Operations:**

```
let greeting be "Hello" + " World"      // Concatenation
let name be "Circle"
let label be name + " #1"               // "Circle #1"
```

**Color Operations:**

```
let primary be "#3498db"
let secondary be "#e74c3c"
```

**Comparison (returns boolean):**

```
let isEqual be (x == y)
let isNotEqual be (x != y)
let isGreater be (x > y)
let isLess be (x < y)
let isGreaterOrEqual be (x >= y)
let isLessOrEqual be (x <= y)
```

### Color Variables

```
// Named colors (subset of SVG colors)
let red be "red"
let blue be "blue"
let green be "green"
let black be "black"
let white be "white"

// Hex notation
let brandColor be "#FF5733"

// RGB notation (string format)
let customColor be "rgb(255, 87, 51)"

// RGBA notation (with alpha)
let transparent be "rgba(255, 87, 51, 0.5)"
```

### Reserved Keywords

```
// Cannot be used as variable names:
if, else, for, while, function, return, draw, mut, true, false, and, or, not
```

### Examples

**Example 1: Canvas Setup**

```
// Canvas configuration
let width be 800
let height be 600
let background be "#F0F0F0"
```

**Example 2: Shape Properties**

```
// Circle properties
let centerX be 400
let centerY be 300
let radius be 50
let fillColor be "#3498db"
let strokeColor be "#2c3e50"
let strokeWidth be 2
```

**Example 3: Calculated Positions**

```
let gridSize be 50
let row be 3
let col be 5

// Calculate position
let x be col * gridSize
let y be row * gridSize

// With offset
let offsetX be 10
let offsetY be 10
let finalX be x + offsetX
let finalY be y + offsetY
```

**Example 4: Color Palette**

```
// Define color scheme
let primary be "#3498db"
let secondary be "#e74c3c"
let accent be "#f39c12"
let dark be "#2c3e50"
let light be "#ecf0f1"

// Use in calculations
let selectedColor be primary  // Assignment
```
