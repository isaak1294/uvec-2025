# Loop Syntax

This language provides two primary looping constructs for beginners:

1. `repeat ___ times`
    
2. `repeat ___ until ___`
    

Both use natural-language phrasing and require an explicit `end` to close the loop body.

---

## 1. `repeat ___ times`

Use this form when you know exactly how many times you want the loop to run.

### **Syntax**

```
repeat <count> times:
    <statements>
end
```

### **Notes**

- `<count>` can be a number or any expression that evaluates to a number.
    
- The loop variable `it` is automatically available inside the loop body and starts at **1**.
    

### **Example**

```
repeat 5 times:
    print "This is loop number " + it
end
```

**Output**

```
This is loop number 1
This is loop number 2
This is loop number 3
This is loop number 4
This is loop number 5
```

### **With a Custom Index Variable**

You can optionally name the counter variable:

```
repeat 3 times as i:
    circle at (i * 40, 50) radius 10
end
```

---

## 2. `repeat ___ until ___`

Use this form when you want to loop **until a condition becomes true**.

### **Syntax**

```
repeat <initialization> until <condition>:
    <statements>
end
```

### **Notes**

- The loop will continue running **while the condition is false**.
    
- You can update variables inside the loop to make the condition eventually true.
    

### **Example**

```
let x be 0

repeat x be x + 10 until x >= 100:
    print "x is now " + x
end
```

**Output**

```
x is now 10
x is now 20
x is now 30
x is now 40
x is now 50
x is now 60
x is now 70
x is now 80
x is now 90
x is now 100
```

---

## 3. Nesting Loops

You can freely nest loops of either kind:

```
repeat 3 times as row:
    repeat 3 times as col:
        rect at (row * 40, col * 40) width 30 height 30
    end
end
```

---

## Summary

|Loop Type|Example|When to Use|
|---|---|---|
|Fixed count|`repeat 5 times:`|Known number of repetitions|
|Condition-based|`repeat x be x + 1 until x > 10:`|Continue until a condition is met|

Both loop types use a colon `:` to start the block and must end with `end`.