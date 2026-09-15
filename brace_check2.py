path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/lib/generateDocx.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

count = 0
for i, c in enumerate(text):
    if c == '{': count += 1
    elif c == '}': count -= 1
print(f"Final count: {count}")

stack = []
for i, c in enumerate(text):
    if c == '{':
        stack.append(i)
    elif c == '}':
        if len(stack) > 0:
            stack.pop()
        else:
            print(f"Extra closing brace at index {i}, line context: {text[i-50:i+50]}")