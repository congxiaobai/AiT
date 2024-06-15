const text = `id:1
event:result
:HTTP_STATUS/200
data:{"output":{"choices":[{"message":{"content":"123","role":"assistant"},"finish_reason":"null"}]},"usage":{"total_tokens":192,"input_tokens":191,"output_tokens":1},"request_id":"55cdb54c-6ff3-95dd-b40c-69a31ef2de14"}
`

const pattern = /"content":"(.*?)","role"/g;
const jsonDataMatch =  pattern.exec(text)
console.log(jsonDataMatch[1]);
// const pattern = /data:(.*?)(?=\n|$)/s;
// const jsonDataMatch = text.match(pattern);
// console.log(jsonDataMatch);
// if (jsonDataMatch) {
//     const jsonString = jsonDataMatch[1].trim(); // 移除前导和尾随的空白字符
//     try {
//         // 将找到的字符串解析为JSON对象
//         const jsonData = JSON.parse(jsonString);

//         // 从JSON对象中提取content字段的值
//         const content = jsonData.output.choices[0].message.content;
//         console.log(content); // 输出: ```
//     } catch (error) {
//         console.error('Error parsing JSON:', error);
//     }
// } else {
//     console.log('Data not found in the text.');
// }