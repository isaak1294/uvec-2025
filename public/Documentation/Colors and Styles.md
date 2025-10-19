# Colors and Styles

You can control how shapes are filled and outlined using natural-language commands.
This includes setting fill colors, stroke colors, opacity, and even defining gradients.

---

## 1. `use fill`

Sets the color used to fill shapes such as circles, rectangles, and text.

### **Syntax**

```
use fill "color"
```

### **Notes**

* `"color"` can be any valid CSS color name (`"red"`, `"gold"`, `"cornflowerblue"`) or hex code (`"#ffcc00"`).
* Once set, the fill color remains active until changed or turned off.

### **Example**

```
use fill "tomato"
circle at (100, 100) radius 50
```

---

## 2. `use stroke`

Sets the outline color and width for shapes.

### **Syntax**

```
use stroke "color" width n
```

### **Parameters**

| Name      | Description             |
| --------- | ----------------------- |
| `"color"` | Stroke (outline) color. |
| `n`       | Line width in pixels.   |

### **Example**

```
use stroke "black" width 3
rect at (20, 20) width 160 height 100
```

---

## 3. Turning Off Fill or Stroke

You can disable fill or stroke entirely with `no`.

### **Syntax**

```
no fill
no stroke
```

### **Examples**

```
no fill
use stroke "navy" width 2
circle at (100, 100) radius 60
```

or

```
use fill "limegreen"
no stroke
rect at (50, 50) width 100 height 60
```

---

## 4. Opacity

Opacity controls how transparent a shape appears, from `0` (fully transparent) to `1` (fully opaque).

### **Syntax**

```
use fill "color" opacity n
use stroke "color" width w opacity n
```

### **Example**

```
use fill "gold" opacity 0.5
use stroke "orange" width 3 opacity 0.7
circle at (100, 100) radius 60
```

*(Opacity is optional; if not provided, the default is fully opaque.)*

---

## 5. Gradients

Gradients let you blend multiple colors smoothly.
You can define them once and then use them as fills for shapes.

### **Syntax**

```
define gradient <name> from "color1" to "color2"
use fill "url(#<name>)"
```

### **Example**

```
define gradient sunset from "orange" to "purple"
use fill "url(#sunset)"
circle at (100, 100) radius 70
```

*(Gradient definitions are added to the SVG `<defs>` section automatically.)*

---

## 6. Color Expressions

Because your language supports expressions, colors can be stored in variables or combined dynamically.

### **Examples**

```
let sky be "lightblue"
use fill sky
rect at (0, 0) width 400 height 200
```

```
let base be "rgb(100, 150, 255)"
use fill base
circle at (100, 100) radius 50
```

---

## 7. Summary

| Command                                | Description                       |
| -------------------------------------- | --------------------------------- |
| `use fill "color"`                     | Sets the shape fill color.        |
| `use stroke "color" width n`           | Sets the outline color and width. |
| `no fill / no stroke`                  | Disables fill or stroke.          |
| `opacity n`                            | Adjusts transparency.             |
| `define gradient name from "a" to "b"` | Creates a linear gradient.        |
| `use fill "url(#name)"`                | Applies a gradient fill.          |

---

### **Tips**

* Colors follow standard CSS/SVG syntax — anything valid in HTML color attributes works.
* Reuse gradients and colors by naming them and referencing them later.
* Combine with loops and variables to create complex, colorful patterns easily.

---