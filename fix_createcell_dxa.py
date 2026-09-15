import re

path = 'C:/Users/User/Desktop/H.Masoud/library-system/src/lib/generateDocx.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix createCell to output DXA instead of PERCENTAGE
pattern = r'if \(widthPercent\) cellProps\.width = \{ size: widthPercent, type: WidthType\.PERCENTAGE \};'
replacement = '''if (widthPercent) cellProps.width = { size: Math.round((widthPercent / 100) * 9000), type: WidthType.DXA };'''
content = content.replace(pattern, replacement) # oops, need to do string replace, pattern contains regex chars.

# let's just do standard string replace
content = content.replace('if (widthPercent) cellProps.width = { size: widthPercent, type: WidthType.PERCENTAGE };', 'if (widthPercent) cellProps.width = { size: Math.round((widthPercent / 100) * 9000), type: WidthType.DXA };')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated createCell to output DXA!")