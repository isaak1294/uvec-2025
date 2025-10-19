# SVG Drawing Language - Technical Specification

## Part A: Variable Bindings

### Overview
Variables in SDL (SVG Drawing Language) support numeric, string, and color types with static typing inference. All variables are immutable by default unless explicitly declared mutable.

### Syntax

**Declaration & Assignment:**
```
x = 100                    // Numeric (inferred as float)
name = "circle"            // String
color = "#FF5733"          // Color (hex)
isVisible = true           // Boolean
```

**Mutable Variables:**
```
mut counter = 0            // Mutable numeric
counter = counter + 1      // Reassignment allowed
```

**Type System:**
- `Number`: Float64 (all numeric values)
- `String`: UTF-8 encoded text
- `Color`: Hex (#RRGGBB), RGB (rgb(r,g,b)), or named colors
- `Boolean`: true/false

### Scope Rules

**Global Scope:**
```
canvasWidth = 800          // Available throughout program
canvasHeight = 600
```

**Block Scope:**
```
x = 10
{
    x = 20                 // Shadows outer x
    y = 30                 // Only exists in this block
}
// x is still 10 here
// y is undefined here
```

### Operations

**Arithmetic:**
```
a = 10 + 5                 // 15
b = 10 - 5                 // 5
c = 10 * 5                 // 50
d = 10 / 5                 // 2.0
e = 10 % 3                 // 1 (modulo)
f = 2 ** 3                 // 8 (exponentiation)
```

**String Operations:**
```
greeting = "Hello" + " World"      // Concatenation
name = "Circle"
label = name + " #1"               // "Circle #1"
```

**Color Operations:**
```
primary = "#3498db"
secondary = "#e74c3c"
// Color manipulation requires built-in functions (see Part B)
```

**Comparison (returns boolean):**
```
isEqual = (x == y)
isNotEqual = (x != y)
isGreater = (x > y)
isLess = (x < y)
isGreaterOrEqual = (x >= y)
isLessOrEqual = (x <= y)
```

**Logical:**
```
result = true and false            // false
result = true or false             // true
result = not true                  // false
```

### Built-in Math Constants
```
PI = 3.14159265359
E = 2.71828182846
TAU = 6.28318530718                // 2 * PI
```

### Built-in Math Functions (Variable Assignment Context)
```
x = cos(45)                        // Cosine (degrees)
y = sin(45)                        // Sine (degrees)
z = sqrt(16)                       // Square root → 4.0
a = abs(-10)                       // Absolute value → 10
r = random()                       // Random [0, 1)
rounded = round(3.7)               // 4.0
floored = floor(3.7)               // 3.0
ceiled = ceil(3.2)                 // 4.0
minimum = min(5, 10)               // 5
maximum = max(5, 10)               // 10
```

### Color Variables
```
// Named colors (subset of SVG colors)
red = "red"
blue = "blue"
green = "green"
black = "black"
white = "white"

// Hex notation
brandColor = "#FF5733"

// RGB notation (string format)
customColor = "rgb(255, 87, 51)"

// RGBA notation (with alpha)
transparent = "rgba(255, 87, 51, 0.5)"
```

### Variable Retrieval & Interpolation
```
x = 50
y = 100

// Direct retrieval
newX = x
newY = y

// Expression evaluation
diagonal = sqrt(x ** 2 + y ** 2)

// String interpolation (for debugging/output)
message = "Point at (" + x + ", " + y + ")"
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
width = 800
height = 600
background = "#F0F0F0"
```

**Example 2: Shape Properties**
```
// Circle properties
centerX = 400
centerY = 300
radius = 50
fillColor = "#3498db"
strokeColor = "#2c3e50"
strokeWidth = 2
```

**Example 3: Calculated Positions**
```
gridSize = 50
row = 3
col = 5

// Calculate position
x = col * gridSize
y = row * gridSize

// With offset
offsetX = 10
offsetY = 10
finalX = x + offsetX
finalY = y + offsetY
```

**Example 4: Color Palette**
```
// Define color scheme
primary = "#3498db"
secondary = "#e74c3c"
accent = "#f39c12"
dark = "#2c3e50"
light = "#ecf0f1"

// Use in calculations
selectedColor = primary  // Assignment
```

**Example 5: Mathematical Calculations**
```
// Circle positioning using trigonometry
angle = 45
distance = 100
centerX = 200
centerY = 200

// Calculate point on circle
pointX = centerX + distance * cos(angle)
pointY = centerY + distance * sin(angle)
```

### Error Handling

**Undefined Variable:**
```
x = y + 10    // ERROR: 'y' is not defined
```

**Type Mismatch:**
```
x = "hello" + 5    // ERROR: Cannot add string and number
```

**Immutable Reassignment:**
```
x = 10
x = 20        // ERROR: Cannot reassign immutable variable 'x'
              // Use 'mut x = 10' for mutable variables
```

**Reserved Keyword:**
```
if = 10       // ERROR: 'if' is a reserved keyword
```
