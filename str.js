const conten = ['``', '`json\n', '[{"id', '":"_*_', '&1","text":"', '基于Rust的快速JavaScript', '打包工具"},{"id":"_*_&2","text":', '"具有与Rollup兼容的API"}]\n```'];

let total_res = []
conten.forEach(tmp => {
    for (let i = 0; i < tmp.length; i++) {
        if (tmp[i] === '{' && total_res.length === 0) {
            total_res.push('{')
            continue;
        }
        if (total_res[0] === '{'&& tmp[i] !== '}') {
            total_res.push(tmp[i]);
            continue;
        }
        if (tmp[i] === '}') {
            total_res.push('}')
            console.log('匹配到:', JSON.parse(total_res.join('')))

            total_res = [];
            continue;
        }
    }
})
