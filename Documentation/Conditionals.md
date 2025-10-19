# Conditionals

Conditionals let your program make decisions — running certain blocks of code only when a condition is true.
They use natural, English-like phrasing to stay readable for beginners.

---

## 1. `if` Statements

Use an `if` statement to perform actions only when a condition is true.

### **Syntax**

```
if <condition>:
    <statements>
end
```

### **Example**

```
let x be 10

if x > 5:
    print "x is greater than five"
end
```

**Output**

```
x is greater than five
```

---

## 2. `otherwise if`

Use `otherwise if` to check another condition if the first one is false.

### **Syntax**

```
if <condition>:
    <statements>
otherwise if <condition>:
    <statements>
end
```

### **Example**

```
let x be 0

if x > 0:
    print "positive"
otherwise if x < 0:
    print "negative"
end
```

**Output**

```
(nothing printed, because both are false)
```

---

## 3. `otherwise`

Use `otherwise` to define what happens when no earlier condition is true.

### **Syntax**

```
if <condition>:
    <statements>
otherwise if <condition>:
    <statements>
otherwise:
    <statements>
end
```

### **Example**

```
let score be 85

if score >= 90:
    print "A"
otherwise if score >= 75:
    print "B"
otherwise:
    print "C or below"
end
```

**Output**

```
B
```

---

## 4. Nesting Conditionals

You can place one conditional inside another for more complex logic.

### **Example**

```
let x be 5
let y be 10

if x < y:
    if y < 20:
        print "x is smaller and y is under 20"
    otherwise:
        print "x is smaller but y is 20 or more"
    end
end
```

---

## 5. Using Conditionals in Loops

Conditionals are often used inside loops to change behavior dynamically.

### **Example**

```
repeat 6 times as i:
    if i % 2 == 0:
        use fill "gold"
    otherwise:
        use fill "tomato"
    end
    circle at (i * 40 + 20, 60) radius 15
end
```

This draws alternating gold and red circles.

---

## 6. Supported Comparison Operators

| Operator | Meaning                  |
| -------- | ------------------------ |
| `==`     | equals                   |
| `!=`     | not equals               |
| `<`      | less than                |
| `<=`     | less than or equal to    |
| `>`      | greater than             |
| `>=`     | greater than or equal to |

---

## 7. Logical Operators

| Operator | Meaning                             | Example                |
| -------- | ----------------------------------- | ---------------------- |
| `and`    | both conditions must be true        | `if x > 0 and y > 0:`  |
| `or`     | at least one condition must be true | `if x == 0 or y == 0:` |
| `not`    | reverses a condition                | `if not x == 0:`       |

---

## 8. Summary

| Keyword        | Description                                     |
| -------------- | ----------------------------------------------- |
| `if`           | Starts a conditional block.                     |
| `otherwise if` | Tests another condition if the first was false. |
| `otherwise`    | Runs only if all above conditions were false.   |
| `end`          | Ends the conditional block.                     |

---

### **Tips**

* Every `if` block must end with `end`.
* Use `:` after each condition to start its block.
* Combine with loops to make dynamic drawings (e.g., alternating colors or patterns).

---
