# Drawing Shapes

Your language can create SVG graphics by drawing simple shapes such as circles, rectangles, and lines.  
Each shape command corresponds directly to an SVG element and uses natural-language syntax.

---

## 1. `circle`

Draws a circle at a specific position with a given radius.

### **Syntax**

```
circle at (x, y) radius r
```

### **Parameters**

|Name|Description|
|---|---|
|`x`, `y`|The position of the circle’s center.|
|`r`|The radius of the circle.|

### **Example**

```
use fill "tomato"
use stroke "black" width 2
circle at (100, 80) radius 40
```

---

## 2. `rect`

Draws a rectangle at a position with a given width and height.

### **Syntax**

```
rect at (x, y) width w height h
```

### **Parameters**

|Name|Description|
|---|---|
|`x`, `y`|The position of the rectangle’s top-left corner.|
|`w`|The rectangle’s width.|
|`h`|The rectangle’s height.|

### **Example**

```
use fill "cornflowerblue"
rect at (20, 30) width 160 height 100
```

---

## 3. `line`

Draws a straight line between two points.

### **Syntax**

```
line from (x1, y1) to (x2, y2)
```

### **Parameters**

|Name|Description|
|---|---|
|`x1`, `y1`|Starting point of the line.|
|`x2`, `y2`|Ending point of the line.|

### **Example**

```
use stroke "black" width 3
line from (20, 20) to (180, 120)
```

---

## 4. `text`

Writes text at a given position.

### **Syntax**

```
text "content" at (x, y) size s
```

### **Parameters**

|Name|Description|
|---|---|
|`"content"`|The text to display (must be in quotes).|
|`x`, `y`|The position of the text’s baseline.|
|`s`|The font size (optional).|

### **Example**

```
text "Hello SVG!" at (100, 100) size 18
```

---

## 5. Setting Fill and Stroke

Before drawing shapes, you can control colors and outlines using `use` or `no`.

### **Syntax**

```
use fill "color"
use stroke "color" width n
no fill
no stroke
```

### **Examples**

```
use fill "gold"
use stroke "black" width 2
circle at (100, 100) radius 40

no fill
use stroke "red" width 3
rect at (40, 40) width 120 height 60
```

---

## 6. Starting and Finishing the SVG

Every drawing must begin with `start svg` and end with `finish svg`.

### **Syntax**

```
start svg width W height H
    <shape commands>
finish svg
```

### **Example**

```
start svg width 200 height 200
use fill "teal"
circle at (100, 100) radius 80
finish svg
```

---

## 7. Summary

|Command|Description|
|---|---|
|`circle at (x, y) radius r`|Draws a circle.|
|`rect at (x, y) width w height h`|Draws a rectangle.|
|`line from (x1, y1) to (x2, y2)`|Draws a line.|
|`text "msg" at (x, y) size s`|Writes text.|
|`use fill / stroke`|Sets color and line width.|
|`no fill / stroke`|Removes fill or outline.|
|`start svg` / `finish svg`|Begin and end a drawing.|

---