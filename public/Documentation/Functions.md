# Function Syntax

Functions let you group commands under a single name so you can reuse them anywhere in your program.
They make your code shorter, clearer, and easier to understand.

---

## 1. `to ___():` — Defining a Function

Use `to` to start a function definition, followed by the function name and optional parameters in parentheses.
The function body begins after the colon `:` and ends with `end`.

### **Syntax**

```
to <name>([parameters]):
    <statements>
end
```

### **Example**

```
to greet():
    print "Hello there!"
end
```

You can now call this function anywhere in your program:

```
greet()
```

**Output**

```
Hello there!
```

---

## 2. Functions with Parameters

Functions can accept one or more values (parameters).
Inside the function, these values are treated like normal variables.

### **Syntax**

```
to <name>(param1, param2, ...):
    <statements>
end
```

### **Example**

```
to draw_circle(x, y, r):
    circle at (x, y) radius r
end

draw_circle(100, 100, 40)
```

---

## 3. Returning Values

Use `give back` to return a value from a function.
This allows your function to *calculate* something and send it back to the caller.

### **Syntax**

```
to <name>(parameters):
    <statements>
    give back <value>
end
```

### **Example**

```
to area_of_circle(r):
    give back 3.1416 * r * r
end

let a be area_of_circle(10)
print a
```

**Output**

```
314.16
```

---

## 4. Default Parameters

You can give parameters default values.
If a caller omits that argument, the default is used.

### **Example**

```
to ring(x, y, r, color = "black"):
    use stroke color width 3
    circle at (x, y) radius r
end

ring(200, 100, 40)            # uses black
ring(200, 100, 40, "gold")    # overrides color
```

---

## 5. Recursion (Functions that Call Themselves)

A function can call itself to repeat a process.
This makes your language **Turing-complete**.

### **Example**

```
to countdown(n):
    if n <= 0:
        print "Blast off!"
    otherwise:
        print n
        countdown(n - 1)
    end
end

countdown(5)
```

**Output**

```
5
4
3
2
1
Blast off!
```

---

## 6. Summary

| Feature           | Syntax Example             | Description                   |
| ----------------- | -------------------------- | ----------------------------- |
| Define a function | `to greet(): ... end`      | Creates a named block of code |
| Call a function   | `greet()`                  | Executes the function         |
| Parameters        | `to add(a, b): ... end`    | Accepts inputs                |
| Return value      | `give back a + b`          | Sends a value back            |
| Default values    | `to draw(x, y=0): ... end` | Optional arguments            |
| Recursion         | `countdown(n-1)`           | Function calling itself       |

---

### **Notes**

* Function names should be short and descriptive (e.g., `draw_star`, `area_of_circle`).
* Use `give back` to return values; if omitted, the function returns nothing.
* Functions can appear anywhere in your program, but are typically defined before use for clarity.

---