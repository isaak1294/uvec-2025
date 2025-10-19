# SVG Drawing Language - Technical Specification

## Part C: Conditionals

### Overview
Conditionals in SDL control execution flow and drawing logic. They use expression-based evaluation and support nested structures.

### Syntax

**Basic If Statement:**
```
if condition {
    // Execute if condition is true
}
```

**If-Else Statement:**
```
if condition {
    // Execute if true
} else {
    // Execute if false
}
```

**If-Else-If Chain:**
```
if condition1 {
    // Execute if condition1 is true
} else if condition2 {
    // Execute if condition2 is true
} else {
    // Execute if all conditions are false
}
```

### Condition Expressions

**Comparison Operators:**
```
x == y        // Equal to
x != y        // Not equal to
x > y         // Greater than
x < y         // Less than
x >= y        // Greater than or equal
x <= y        // Less than or equal
```

**Logical Operators:**
```
condition1 and condition2     // Both must be true
condition1 or condition2      // At least one must be true
not condition                 // Negation
```

**Operator Precedence (highest to lowest):**
1. `not`
2. `>`, `<`, `>=`, `<=`, `==`, `!=`
3. `and`
4. `or`

### Examples

**Example 1: Conditional Color Selection**
```
x = 150

if x > 100 {
    color = "red"
} else {
    color = "blue"
}

draw circle at (x, 100) radius 20 fill color
```

**Example 2: Multiple Conditions**
```
value = 75

if value < 33 {
    color = "red"
} else if value < 66 {
    color = "yellow"
} else {
    color = "green"
}

draw rect at (100, 100) width 50 height 50 fill color
```

**Example 3: Logical Operators**
```
x = 150
y = 200

// Check if point is in a specific quadrant
if x > 100 and y > 100 {
    color = "purple"
} else if x > 100 or y > 100 {
    color = "orange"
} else {
    color = "gray"
}

draw circle at (x, y) radius 15 fill color
```

**Example 4: Nested Conditionals**
```
size = 60
position = 120

if size > 50 {
    if position > 100 {
        color = "#FF5733"
        strokeWidth = 3
    } else {
        color = "#3498db"
        strokeWidth = 1
    }
} else {
    color = "#95a5a6"
    strokeWidth = 1
}

draw circle at (position, 150) radius size fill color stroke "black" width strokeWidth
```

**Example 5: Conditional Visibility**
```
showCircle = true
showSquare = false

if showCircle {
    draw circle at (100, 100) radius 30 fill "blue"
}

if showSquare {
    draw rect at (200, 100) width 60 height 60 fill "red"
}

// Only the circle will be drawn
```

**Example 6: Range Checking**
```
value = 45

if value >= 0 and value <= 100 {
    // Normalize to 0-1 range
    normalized = value / 100
    
    if normalized < 0.5 {
        intensity = "light"
    } else {
        intensity = "dark"
    }
}
```

**Example 7: Pattern Selection**
```
pattern = 2

if pattern == 1 {
    // Solid fill
    fillStyle = "red"
    strokeStyle = "none"
} else if pattern == 2 {
    // Outlined
    fillStyle = "none"
    strokeStyle = "red"
} else if pattern == 3 {
    // Both
    fillStyle = "red"
    strokeStyle = "black"
} else {
    // Default
    fillStyle = "gray"
    strokeStyle = "gray"
}
```

**Example 8: Conditional Drawing Properties**
```
isHighlighted = true
x = 200
y = 200

if isHighlighted {
    radius = 40
    strokeColor = "#f39c12"
    strokeWidth = 4
} else {
    radius = 30
    strokeColor = "#95a5a6"
    strokeWidth = 1
}

draw circle at (x, y) radius radius fill "white" stroke strokeColor width strokeWidth
```

**Example 9: Complex Boolean Logic**
```
x = 150
y = 150
threshold = 100

// Draw only if within bounds
if (x > threshold and y > threshold) or (x < threshold and y < threshold) {
    draw circle at (x, y) radius 20 fill "green"
} else {
    draw circle at (x, y) radius 20 fill "red"
}
```

**Example 10: Gradient Effect with Conditionals**
```
position = 200

// Create stepped gradient effect
if position < 100 {
    opacity = "0.2"
} else if position < 200 {
    opacity = "0.4"
} else if position < 300 {
    opacity = "0.6"
} else if position < 400 {
    opacity = "0.8"
} else {
    opacity = "1.0"
}

color = "rgba(52, 152, 219, " + opacity + ")"
draw circle at (position, 100) radius 25 fill color
```

### Short-Circuit Evaluation

SDL uses short-circuit evaluation for logical operators:

```
x = 0

// Second condition not evaluated if first is false
if x > 0 and (100 / x) > 10 {
    draw circle at (100, 100) radius 20 fill "blue"
}
// No division by zero error because x > 0 is false
```

### Truthiness

Only `true` and `false` are boolean values. Numbers and strings do not have implicit truthiness:

```
x = 0

if x {              // ERROR: Expected boolean, got number
    // ...
}

// Correct:
if x != 0 {         // OK: Explicit comparison
    // ...
}
```

### Ternary Expression (Not Supported)

SDL does not support ternary operators. Use if-else statements:

```
// NOT SUPPORTED:
color = x > 100 ? "red" : "blue"

// Use instead:
if x > 100 {
    color = "red"
} else {
    color = "blue"
}
```

### Error Handling

**Missing Braces:**
```
if x > 10
    draw circle at (x, 100) radius 10 fill "red"
// ERROR: Expected '{' after condition
```

**Non-Boolean Condition:**
```
if 5 {
    // ...
}
// ERROR: Condition must be a boolean expression
```

**Invalid Comparison:**
```
if "hello" > 10 {
    // ...
}
// ERROR: Cannot compare string and number
```

---

## Preview Control

### Syntax
```
#preview on       // Enable SVG preview generation
#preview off      // Disable preview (syntax check only)
```

### Usage
```
#preview on

// Your SDL code here
x = 100
y = 100

if x > 50 {
    draw circle at (x, y) radius 30 fill "blue"
}
```

**Notes:**
- Must be the first line of the program
- Only `#preview on` or `#preview off` are valid
- Default is `on` if not specified
- When `off`, the compiler validates syntax but generates no SVG output

---

## Integration Notes

**Variable Binding + Conditionals:**
```
// Variables set values
centerX = 200
centerY = 200
threshold = 150

// Conditionals control flow
if centerX > threshold {
    color = "red"
} else {
    color = "blue"
}

// Result used in drawing
draw circle at (centerX, centerY) radius 25 fill color
```
